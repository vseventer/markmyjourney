/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Mark van Seventer
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

// NOTE: This configuration is merged with any CLI flags.

// Package modules.
var webpack = require('webpack');

// Exports.
module.exports = {
  // Source.
  entry: [
    'jquery/src/attributes/attr',
    'jquery/src/attributes/classes',
    'jquery/src/data',
    'jquery/src/event/trigger',
    'jquery/src/exports/global',
    'jquery/src/traversing',

    'bootstrap/js/src/carousel',
    'bootstrap/js/src/collapse',
    'bootstrap/js/src/dropdown',

    'leaflet',
    'leaflet-geodesic/Leaflet.Geodesic.js',
    'leaflet.markercluster/dist/leaflet.markercluster-src',
    'leaflet-minimap/src/Control.MiniMap.js'
  ],

  // Compile Bootstrap ES6 to vanilla JavaScript.
  module: {
    loaders: [{
      test   : /bootstrap/,
      loader : 'babel-loader',
      query  : { presets: [ 'es2015' ] }
    }]
  },

  // jQuery patches.
  plugins: [
    // Patch required for `jquery/src/exports/global` (jQuery v3.1).
    new webpack.DefinePlugin({ noGlobal: false }),
    new webpack.ProvidePlugin({ jQuery: 'jquery/src/core' }),

    // Use native selector over sizzle.
    new webpack.NormalModuleReplacementPlugin(/selector$/, 'jquery/src/selector-native')
  ]
};