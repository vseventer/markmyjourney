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

# Imports.
path = require 'path'

# Exports.
module.exports = (assemble) ->
  Handlebars = assemble.Handlebars # Extract.

  # Returns the continents' abbreviation.
  cover: (context = { }) ->
    relatedPages = context.data['related-pages']
    for relatedPage in context.data['related-pages'] when relatedPage.data.geography?
      for geography in relatedPage.data.geography # Loop through locations.
        if geography.continent.name is context.data.continent # Continent found, return its code.
          return geography.continent.code.toLowerCase()

  # Renders the photo template with the specified photo.
  photo: (filename, context = { }) ->
    photo      = _photo for _photo in context.data.photos when _photo.src is filename
    photo.path = path.join 'blog', context.data.slug, photo.src
    template = Handlebars.compile Handlebars.partials.photo
    new Handlebars.SafeString template photo

  # Renders a list of countries with the provided continent.
  withCountries: (context, options) ->
    title = context.title # Continent name.

    # Gather list of countries from this continent.
    countries = { }
    for post in context.collections.pages[0]?.pages when post.data.geography?
      for geography in post.data.geography when geography.continent.name is title
        countries[geography.country.code] = geography.country.name

    # Reduce to array.
    countries = Object.keys(countries).map (code) -> code: code, name: countries[code]
    countries.sort (x, y) -> if x.name < y.name then -1 else 1 # Sort by name.

    # render the template.
    countries.reduce (prev, current) ->
      prev += options.fn current
    , ''