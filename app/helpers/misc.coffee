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
  # Returns the DMS notation for the specified DD coordinate.
  dms: ([ lng, lat ]) ->
    lngDirection = if 0 > lng then 'W' else 'E'
    latDirection = if 0 > lat then 'S' else 'N'

    lng = Math.abs lng
    lat = Math.abs lat

    lngDegrees = parseInt lng, 10
    latDegrees = parseInt lat, 10
    lngRemainder = lng % 1 * 60
    latRemainder = lat % 1 * 60
    lngHours = parseInt lngRemainder, 10
    latHours = parseInt latRemainder, 10
    lngMinutes = parseInt lngRemainder % 1 * 60, 10
    latMinutes = parseInt latRemainder % 1 * 60, 10

    # "#{latDegrees}°#{latHours}′#{latMinutes}″#{latDirection}
    #  #{lngDegrees}°#{lngHours}′#{lngMinutes}″#{lngDirection}"

    "#{latDegrees}°#{latHours}′#{latDirection}
     #{lngDegrees}°#{lngHours}′#{lngDirection}"