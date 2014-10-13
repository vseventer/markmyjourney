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

# Exports.
module.exports = (assemble) ->
  # Sorts the specified array, and returns a copy of the original.
  dataSort: (array, field, block = { }) ->
    factor = if 'desc' is block.hash?.dir?.toLowerCase() then -1 else 1
    array.slice().sort (x, y) -> # Return sorted copy.
      xValue = if x.data[field]? then x.data[field] else -Infinity
      yValue = if y.data[field]? then y.data[field] else -Infinity
      order  = if xValue > yValue then 1 else -1
      order * factor

  # Returns a hierarchical representation of the archives collection.
  getArchives: (block = { }) ->
    # Get archives, and remove top-level archive page.
    collection = block.data?.collections?.archives.splice 1 # Copy by value.

    # Sort by date (descending).
    collection.sort (x, y) ->
      [ xYear, xMonth ] = x.archive.split '-', 2
      [ yYear, yMonth ] = y.archive.split '-', 2
      if xYear isnt yYear then yYear - xYear # Compare years.
      else (yMonth or Infinity) - (xMonth or Infinity) # Compare months.

    # Group by year.
    collection.reduce (prev, current) ->
      [ year, month ] = current.archive.split '-', 2
      if not month then prev.push name: year, page: current
      else
        break for value, index in prev when year is value.name # Lookup index.
        prev[index].months ?= [ ]
        prev[index].months.push name: current.archive, page: current
      prev
    , [ ]

  # Returns the specified collection.
  getCollection: (name, block = { }) ->
    block.data?.collections?[name] or 'No Such Collection'

  # Invokes the template with sliced elements from the specified array.
  withSlice: (array, begin, end, options) ->
    array.slice(begin, end).reduce (prev, current) ->
      prev += options.fn current
    , ''