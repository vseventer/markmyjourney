###
 # The MIT License (MIT)
 #
 # Copyright (c) 2014 Mark van Seventer
 #
 # Permission is hereby granted, free of charge, to any person obtaining a copy
 # of this software and associated documentation files (the "Software"), to deal
 # in the Software without restriction, including without limitation the rights
 # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 # copies of the Software, and to permit persons to whom the Software is
 # furnished to do so, subject to the following conditions:
 #
 # The above copyright notice and this permission notice shall be included in
 # all copies or substantial portions of the Software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 # THE SOFTWARE.
###

# Environment.
PORT       = process.env.PORT or 8888
STAGING    = 'staging'    is process.env.NODE_ENV
PRODUCTION = 'production' is process.env.NODE_ENV

# Imports.
_str        = require 'underscore.string'
bowerFiles  = require 'main-bower-files'
config      = require './config.json'
fs          = require 'fs'
glob        = require 'glob'
gulp        = require 'gulp'
path        = require 'path'
photoStream = require('./lib/assemble-middleware-photos').stream
plugins     = require('gulp-load-plugins')()
request     = require 'request'
runSequence = require 'run-sequence'
util        = require 'util'
wiredep     = require('wiredep').stream

# Configure.
paths =
  gulp     : 'Gulpfile.coffee'
  json     : [ '*rc', '*.json' ]

  app      : './app'
  extras   : [ 'app/*', '!app/*.html', '!app/*.md' ] # All top-level non-pages.
  coffee   : 'app/scripts/*.coffee'
  helpers  : 'app/helpers/*.coffee'
  images   : 'app/images/**'
  layouts  : 'app/partials/'
  less     : 'app/styles/*.less'
  partials : 'app/partials/*.html'
  posts    : 'app/blog/*.md'
  views    : [ 'app/*.md', 'app/*.html', 'app/partials/*.html' ]

  tmp      : './.tmp'
  dist     : './dist'
  fonts    : 'dist/fonts'
  html     : 'dist/**/*.html'

# Helper method to optimize slugs for pagination.
slugify = (value, slugify = true) ->
  dirname   = if slugify then _str.slugify value else value
  filename  = 'index'
  filename += "-#{this.num}" if 1 < this.num # Append page number if not the first page.
  path.join dirname, filename

# Task definitions.

# The clean task.
gulp.task 'clean', ->
  gulp.src [ paths.tmp, paths.dist ], read: false
      .pipe plugins.rimraf()

# The wiredep task.
gulp.task 'wiredep', ->
  gulp.src paths.less, base: paths.app
      .pipe wiredep devDependencies: true
      .pipe gulp.dest paths.app
  gulp.src paths.views, base: paths.app
      .pipe wiredep devDependencies: true, exclude: [ 'bootstrap', 'jquery' ], ignorePath: '../'
      .pipe gulp.dest paths.app

# The lint tasks.
gulp.task 'coffeelint', ->
  gulp.src [ paths.coffee, paths.gulp ]
      .pipe plugins.coffeelint '.coffeelintrc'
      .pipe plugins.coffeelint.reporter()
gulp.task 'htmlhint', ->
  gulp.src paths.views
      .pipe plugins.htmlhint '.htmlhintrc'
      .pipe plugins.htmlhint.reporter()
gulp.task 'jsonlint', ->
  gulp.src paths.json
      .pipe plugins.jsonlint()
      .pipe plugins.jsonlint.reporter()

# The asset tasks.
gulp.task 'assemble', ->
  opts =
    assemblerc  : '.assemblerc.yml'
    assets      : paths.dist
    data        : config: config, slugify: slugify
    helpers     : paths.helpers
    middleware  : [ 'assemble-middleware-drafts', 'assemble-middleware-permalinks', './lib/*' ]
    layoutdir   : paths.layouts
    layout      : 'post.html'
    partials    : paths.partials
    permalinks  : structure: 'blog/:slug:ext'
  gulp.src paths.posts
      .pipe plugins.plumber()
      .pipe plugins.assemble opts
      .pipe photoStream()
      .pipe gulp.dest paths.dist

gulp.task 'coffee', ->
  gulp.src paths.coffee, base: paths.app
      .pipe plugins.coffee()
      .pipe gulp.dest paths.tmp
gulp.task 'less', ->
  gulp.src paths.less, base: paths.app
      .pipe plugins.less()
      .pipe gulp.dest paths.tmp
gulp.task 'views', [ 'assemble', 'coffee', 'less', ], ->
  assets      = plugins.useref.assets searchPath: [ paths.tmp, paths.app ]
  assetFilter = plugins.filter if STAGING or PRODUCTION then '**/*' else '!'
  cssFilter   = plugins.filter '**/*.css'
  htmlFilter  = plugins.filter '**/*.html'
  viewsFilter = plugins.filter if STAGING or PRODUCTION then '**/*' else '!'
  gulp.src paths.html
      .pipe plugins.plumber()
      .pipe assets # Extract assets.
      .pipe assetFilter # Start asset processing (staging and production only).
      .pipe cssFilter # Start CSS processing.
      .pipe plugins.autoprefixer 'last 1 version'
      .pipe plugins.uncss ignore: [ /\.in/, /\.mmjy/, /\.open/ ], html: glob paths.html, sync: true
      .pipe plugins.csso()
      .pipe cssFilter.restore() # End CSS processing.
      .pipe plugins.if '**/*.js', plugins.uglify preserveComments: 'some' # JS processing.
      .pipe plugins.rev()
      .pipe assetFilter.restore() # End asset processing.
      .pipe assets.restore()
      .pipe plugins.useref()
      .pipe viewsFilter # Start views processing (staging and production only).
      .pipe plugins.revReplace()
      .pipe htmlFilter # Start HTML processing.
      .pipe plugins.if PRODUCTION, plugins.cdnAbsolutePath cdn: config.assets # Assets and images.
      .pipe plugins.if PRODUCTION, plugins.cdnAbsolutePath cdn: config.url, exts: [ 'html' ]
      .pipe plugins.minifyHtml()
      .pipe htmlFilter.restore() # End HTML processing.
      .pipe viewsFilter.restore() # End views processing.
      .pipe gulp.dest paths.dist
      .pipe plugins.size title: 'views'
gulp.task 'extras', ->
  gulp.src paths.extras, dot: true
      .pipe plugins.size title: 'extras'
      .pipe gulp.dest paths.dist
gulp.task 'fonts', ->
  gulp.src bowerFiles includeDev: true
      .pipe plugins.filter '*.{eot,svg,ttf,woff}'
      .pipe plugins.size title: 'fonts'
      .pipe gulp.dest paths.fonts
gulp.task 'images', [ 'map' ], ->
  opts = interlaced: true, optimizationLevel: 7, progressive: true
  gulp.src paths.images, base: paths.app
      .pipe plugins.if STAGING or PRODUCTION, plugins.cache plugins.imagemin opts
      .pipe plugins.size title: 'images'
      .pipe gulp.dest paths.dist
gulp.task 'map', (cb) ->
  return cb()
  src    = util.format config.staticMap, config.location.coord.lat, config.location.coord.lng
  stream = request src # Request the image.
  stream.pipe fs.createWriteStream path.join path.dirname(paths.images), 'current-location.png'
  stream.on 'error', (err) -> cb() # Ignore errors to avoid breaking the buildchain.
  stream.on 'end', cb

# The watch tasks.
gulp.task 'webserver', [ 'default' ], ->
  gulp.src paths.dist
      .pipe plugins.webserver livereload: true, open: true, port: PORT
gulp.task 'watch', [ 'webserver' ], ->
  # Re-lint.
  coffee = [ paths.gulp, paths.coffee ]
  gulp.watch coffee,      [ 'coffeelint' ]
  gulp.watch paths.views, [ 'htmlhint'   ]
  gulp.watch paths.json,  [ 'jsonlint'   ]

  # Re-build.
  assets = [ paths.coffee, paths.less, paths.posts, paths.views ]
  gulp.watch 'bower.json', [ 'wiredep', 'fonts' ]
  gulp.watch assets,       [ 'views'  ]
  gulp.watch paths.extras, [ 'extras' ]
  gulp.watch paths.images, [ 'images' ]

# The deploy tasks. The deployment is performed through a shell script.
gulp.task 'tag', ->
  gulp.src 'package.json'
      .pipe plugins.tagVersion()

# Composite tasks.
gulp.task 'lint',    [ 'coffeelint', 'htmlhint', 'jsonlint' ]
gulp.task 'build',   [ 'lint', 'views', 'extras', 'fonts', 'images' ]
gulp.task 'default', [ 'clean', 'wiredep' ], (cb) -> runSequence 'build', cb