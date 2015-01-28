###
 # The MIT License (MIT)
 #
 # Copyright (c) 2015 Mark van Seventer
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

# Imports.
fs       = require 'fs'
glob     = require 'glob'
gutil    = require 'gulp-util'
jsYaml   = require 'js-yaml'
path     = require 'path'
through2 = require 'through2'

# Configure.
photos = { }

# Exports the Assemble middleware.
module.exports = (assemble) ->
  # Build the photos collection for the specified page.
  middleware = (params, next) ->
    # Log.
    assemble.log.debug('\t[middleware]: ', 'assemble-middleware-photos', params.event);
    assemble.log.debug('\t[params]:', params);

    # For each page, obtain its photos.
    for src, page of assemble.pages
      # Match photos from source directory.
      dirname = path.dirname src
      mdFile  = path.join dirname, page.data.basename, 'metadata.yml'
      pattern = path.join dirname, page.data.basename, '**/*.+(gif|jpg|png)'
      files   = glob pattern, nocase: true, nosort: true, sync: true

      # Determine photo target directory.
      dirname  = path.dirname page.dest
      target   = path.join dirname, path.basename page.dest, path.extname page.dest

      # Add photos to target mapping (`src` -> `dest`).
      for file in files
        subdirectory = if 't' is path.basename path.dirname file then 't' else '.'
        photos[file] = path.join target, subdirectory, path.basename file

      # Add photo metadata to page.
      if fs.existsSync mdFile
        page.data.photos = jsYaml.safeLoad fs.readFileSync mdFile, encoding: 'utf-8'

    # Log.
    assemble.log.debug('\t[middleware]: ', 'assemble-middleware-photos', photos);

    next() # Continue.

  # Hook into Assemble.
  middleware.event = 'assemble:before:render'

  # Return the middleware.
  'assemble-middleware-photos': middleware

# Exports the Gulp stream.
module.exports.stream = ->
  # Pass-through transform, act on flush.
  through2 objectMode: true, null, (callback) ->
    # Append the photos on flush.
    for src, dest of photos
      this.push new gutil.File path: dest, contents: fs.readFileSync src

    callback() # Continue.