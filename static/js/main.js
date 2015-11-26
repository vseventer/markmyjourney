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

  // Constants.
  var MIN_ZOOM    = 2,
      MAX_ZOOM    = 6,
      POPUP_DELAY = 500; // ms.

  // Variables.
  var arraySlice = Array.prototype.slice;

  // Add ready listeners.
  document.addEventListener('ready', function() {
    L.Icon.Default.imagePath = '/img/'; // Configure.

    // Initialize maps.
    var elements = document.querySelectorAll('.mmjy-map');
    arraySlice.call(elements).forEach(function(element) {
      // Configure.
      var map = L.map(element, {
        fullscreenControl : true,
        scrollWheelZoom   : false
      });

      // Add tile layer.
      var EsriWorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom : MAX_ZOOM,
        minZoom : MIN_ZOOM
      });
      EsriWorldTopoMap.addTo(map);

      // Fallback: use MapQuest.
      // var MapQuestOpenOSM = new L.tileLayer('https://otile{s}-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
      //   attribution: '© <a href="http://www.mapquest.com/">MapQuest</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      //   maxZoom    : MAX_ZOOM,
      //   minZoom    : MIN_ZOOM,
      //   subdomains : '1234'
      // });
      // MapQuestOpenOSM.addTo(map); // Show.

      // Apply GeoJSON.
      var layer = L.geoJson(window.geojson, {
        coordsToLatLng: function(coords) {
          return coords; // Required to format as [ lat, lng ].
        },
        onEachFeature: function(feature, layer) {
          // Create popup.
          if(feature.properties.hasOwnProperty('title')) {
            layer.bindPopup(feature.properties.title, { closeButton: false, minWidth: 0 });

            // Add event listeners.
            var timeout;
            layer.on('mouseover', function() {
              clearTimeout(timeout); // Reset.
              layer.openPopup();
            });
            layer.on('mouseout', function() {
              timeout = setTimeout(function() {
                layer.closePopup();
              }, POPUP_DELAY);
            });
          }
          return feature;
        },
        pointToLayer: function(feature, latLng) {
          // Create icon and marker.
          var icon = new L.divIcon({
            className : null,
            html      : feature.properties.html,
            iconSize  : null, // @see https://github.com/Leaflet/Leaflet/issues/1390
          });
          return L.marker(latLng, { icon: icon });
        }
      });

      // Display.
      if(layer.getLayers().length) {
        var cluster = L.markerClusterGroup({
          disableClusteringAtZoom : MAX_ZOOM,
          maxClusterRadius        : 24,
          showCoverageOnHover     : false,
          spiderfyOnMaxZoom       : false
        }).addLayer(layer);
        map.fitBounds(cluster.getBounds()); // Focus map.
        cluster.addTo(map); // Show.
      }
      else { // Show empty map.
        map.setView([ 0, 0 ], MIN_ZOOM);
      }
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