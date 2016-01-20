#!/usr/bin/env node
/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mark van Seventer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Strict mode.
'use strict';

// Standard lib.
var fs   = require('fs'),
    path = require('path');

// Package modules.
var exifReader = require('exif-reader'),
    moment     = require('moment');
moment.defaultFormat = 'YYYY-MM-DD[T]HH:mm:ss'; // Omit timezone.

// Configure.
var images = process.argv.slice(2),
    source = path.join(__dirname, '../data/uploads.json');
if(0 === images.length) {
  console.error('No input files.');
  process.exit(1); // Failure.
}

// Initialize source.
var data = fs.existsSync(source) ? require(source) : {
  type: 'FeatureCollection',
  features: [ ]
};

// Helper to format DMS to DD.
var dmsToDd = function(dms, direction) {
  var dd     = dms[0] + dms[1] / 60 + dms[2] / 3600,
      factor = 'N' === direction || 'E' === direction ? 1 : -1;
  return Math.round(dd * factor * 100) / 100;
};

// Obtain list of current images.
var current = data.features.map(function(feature) {
  return feature.properties.src;
});

// Run.
var result = images.filter(function(image) {
  // Remove images already listed.
  var basename = path.basename(image);
  return -1 === current.indexOf(basename);
}).map(function(image) {
  // Extract EXIF from image.
  try {
    var buffer    = fs.readFileSync(image),
        exifStart = buffer.toString('ascii').indexOf('Exif\0'),
        data      = exifReader(buffer.slice(exifStart));
    data.name = image; // Append name to result.
    return data;
  }
  catch(err) {
    console.warn('%s: %s', image, err); // Print error.
    return { name: image }; // Append name to result.
  }
}).map(function(data, index) {
  // Format date.
  var d = null;
  if(null != data.exif && null != data.exif.DateTimeOriginal) {
    d = moment(data.exif.DateTimeOriginal).format(); // Retain timezone.
  }

  // Format geometry.
  var geometry = null;
  if(null != data.gps && null != data.gps.GPSLongitude && !isNaN(data.gps.GPSLongitude[0])) {
    geometry = {
      type: 'Point',
      coordinates: [
        dmsToDd(data.gps.GPSLongitude, data.gps.GPSLongitudeRef),
        dmsToDd(data.gps.GPSLatitude,  data.gps.GPSLatitudeRef)
      ]
    }
  }

  // Return the feature.
  var orientation = null != data.image ? data.image.Orientation : 1;
  return {
    type: 'Feature',
    properties: {
      src  : path.basename(data.name),
      date : d,
      description : null,
      orientation : 4 >= orientation ? 'landscape' : 'portrait'
    },
    geometry: geometry
  }
});

// Append and sort.
data.features.push.apply(data.features, result);
data.features.sort(function(x, y) {
  return x.properties.src < y.properties.src ? -1 : 1;
});

// Print the resulting GeoJSON object.
var output = JSON.stringify(data, null, 2);
fs.writeFile(source, output, function() {
  console.log('Written %d records to %s.', data.features.length, source);
});