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
moment.defaultFormat = 'YYYY-MM-DD[T]HH:mm:ssZ'; // Retain timezone.

// Local modules.
var metadata = require('../uploads/metadata.json');

// Configure.
var images = process.argv.slice(2);
if(0 === images.length) {
  console.error('No input files.');
  process.exit(1); // Failure.
}

// Helper to format DMS to DD.
var dmsToDd = function(dms, direction) {
  var dd     = dms[0] + dms[1] / 60 + dms[2] / 3600,
      factor = 'N' === direction || 'E' === direction ? 1 : -1;
  return Math.round(dd * factor * 100) / 100;
};

// Extract EXIF from images.
var res = images.map(function(image) {
  try {
    var buffer    = fs.readFileSync(image),
        exifStart = buffer.toString('ascii').indexOf('Exif\0')
    return exifReader(buffer.slice(exifStart));
  }
  catch(err) {
    console.error(err);
    process.exit(1); // Failure.
  }
});

// Extract fields from EXIF.
res = res.map(function(data, index) {
  var d    = moment.parseZone(data.exif.DateTimeOriginal), // Retain timezone.
      name = path.basename(images[index]);

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
  return {
    type: 'Feature',
    properties: {
      src  : name,
      date : d.format(),
      description: metadata[name] || null
    },
    geometry: geometry
  };
});

// Format as collection.
res = {
  type: 'FeatureCollection',
  features: res
};

// Print the resulting GeoJSON object.
console.log(JSON.stringify(res, null, 2));