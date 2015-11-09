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
(function(window, document) {
  // Strict mode.
  'use strict';

  // Variables.
  var arraySlice = Array.prototype.slice;

  // Add ready listeners.
  document.addEventListener('ready', function() {
    L.Icon.Default.imagePath = '/img/'; // Configure.

    // Initialize maps.
    var elements = document.querySelectorAll('.mmjy-map');
    arraySlice.call(elements).forEach(function(element) {
      var markers = element.querySelectorAll('div');
      arraySlice.call(markers).forEach(function(marker) {
        marker.parentNode.removeChild(marker);
      });

      // Configure.
      var map = L.map(element, {
        center : [ 0, 0 ],
        scrollWheelZoom: false,
        zoom   : 2
      });

      // Add tile layer.
      var EsriWorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom : 4,
        minZoom : 2,
      });
      EsriWorldTopoMap.addTo(map);

      // Fallback: use MapQuest.
      // var MapQuestOpenOSM = new L.tileLayer('https://otile{s}-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
      //   attribution: '© <a href="http://www.mapquest.com/">MapQuest</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      //   maxZoom    : 4,
      //   minZoom    : 2,
      //   subdomains : '1234'
      // });
      // MapQuestOpenOSM.addTo(map); // Show.

      // Add markers.
      arraySlice.call(markers).forEach(function(marker) {
        var coord  = JSON.parse(marker.getAttribute('data-l-coord')),
            href   = marker.getAttribute('data-l-href'),
            icon   = marker.getAttribute('data-l-icon'),
            label  = marker.getAttribute('data-l-label'),
            myIcon = L.divIcon({
              className  : 'icon-flags icon-flags-' + icon,
              iconSize   : 24,
              iconAnchor : [ 12, 12 ]
            })
            marker = L.marker(coord, { icon: myIcon, title: label });

        // Add event listener.
        marker.on('click', function() {
          console.log(arguments);
          debugger;
          return
          document.location.href = href;
        });
        marker.addTo(map); // Show.
      });
    });
  }, false);

  // Lazy-load scripts.
  window.addEventListener('load', function() {
    var scripts = document.querySelectorAll('script[data-src]');
    var length  = scripts.length;
    arraySlice.call(scripts).forEach(function(script) {
      script.onload = function() {
        length -= 1; // Update counter.
        if(0 === length) {
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('ready', false, false, undefined);
          document.dispatchEvent(evt);
        }
      };
      script.setAttribute('src', script.getAttribute('data-src'));
      script.removeAttribute('data-src');
    });
  }, false);
}(window, document));