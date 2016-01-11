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
      MINIMAP_THRESHOLD_ZOOM = 4,
      MAX_ZOOM    = 8,
      POPUP_DELAY = 500; // ms.

  // Helper.
  var basename = function(path) {
    return path.split('/').pop();
  };

  // Variables.
  var arraySlice = Array.prototype.slice;

  // Tile layer helper.
  var tileLayer = function() {
    return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        detectRetina: true,
        maxZoom : 16,
        minZoom : 1
    });
    // Fallback: use MapQuest.
    // return L.tileLayer('https://otile{s}-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
    //   attribution: '© <a href="http://www.mapquest.com/">MapQuest</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   detectRetina : true,
    //   maxZoom      : MAX_ZOOM,
    //   minZoom      : MIN_ZOOM,
    //   subdomains   : '1234'
    // });
  };

  // Add ready listeners.
  document.addEventListener('ready:components', function() {
    L.Icon.Default.imagePath = '/img/'; // Configure.

    // Patch active carousel indicators outside carousel.
    $('.carousel').on('slide.bs.carousel', function(e) {
      var index = $(e.relatedTarget).index(),
          indicators = $('[data-target="#' + this.id + '"]').removeClass('active');
      indicators.filter('[data-slide-to="' + index + '"]').addClass('active');
    });

    // Initialize maps.
    var elements = document.querySelectorAll('.mmjy-map');
    arraySlice.call(elements).forEach(function(element) {
      // Configure.
      var map = L.map(element, {
        layers  : tileLayer(),
        maxZoom : MAX_ZOOM,
        minZoom : MIN_ZOOM,
        scrollWheelZoom: false
      });

      // Add event listeners.
      map.on('fullscreenchange', function() {
        map.scrollWheelZoom[map.isFullscreen() ? 'enable' : 'disable']();
      });

      // Apply GeoJSON from specified source.
      var source = element.getAttribute('data-source');
      var layer  = L.geoJson(window[source], {
        // Wrap longitude around antemeridian.
        // NOTE: `L.latLng.prototype.wrap` currently seems broken.
        coordsToLatLng: function(coords) {
          var lng = coords[0],
              lat = coords[1];
          if(lng < 0) {
            // lng = 360 + lng;
          }
          return L.latLng(lat, lng);
        },
        onEachFeature: function(feature, layer) {
          // Create popup.
          if(null != feature.properties.title) {
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
          var marker = L.marker(latLng); // Create marker.
          if(null != feature.properties.html) { // Set marker icon.
            var icon = new L.divIcon({
              className : null,
              html      : feature.properties.html,
              iconSize  : null, // @see https://github.com/Leaflet/Leaflet/issues/1390
            });
            marker.setIcon(icon);
          }
          return marker;
        },
        style: function(feature) {
          var weight = 'LineString' === feature.geometry.type ? 3 : 1;
          return { color: '#006400', weight: weight };
        }
      });

      // Validate layers.
      var bounds = layer.getBounds();
      if(!bounds.isValid()) { // No or invalid bounds.
        return map.setView([ 0, 0 ], MIN_ZOOM);
        // return element.remove();
      }

      // Prepare cluster.
      var cluster = L.markerClusterGroup({
        maxClusterRadius    : 24,
        showCoverageOnHover : false,
        spiderfyOnMaxZoom   : true
      }).addTo(map);

      // Append layers.
      layer.getLayers().forEach(function(layer) {
        // Add markers to cluster, all other layers to the map.
        var subject = layer instanceof L.Marker ? cluster : map;
        subject.addLayer(layer);
      });

      // Focus map.
      if(map.getZoom()) { // Use predefined zoom.
        map.setView(bounds.getCenter());
        bounds = map.getBounds(); // Update for minimap.
      }
      else { // Use layer bounds.
        map.fitBounds(bounds);
      }

      // Show minimap for zoomed maps focused within a 20x20 degree polygon.
      if(MINIMAP_THRESHOLD_ZOOM <= map.getZoom())
        var latDiff = Math.abs(bounds.getNorth() - bounds.getSouth()),
            lngDiff = Math.abs(bounds.getWest()  - bounds.getEast());
        if(20 > latDiff || 20 > lngDiff) {
          // Configure.
          var minimap = new L.Control.MiniMap(tileLayer(), {
            width  : 100,
            height : 100,
            zoomLevelFixed: 1
          }).addTo(map);

          // Staticize.
          minimap._miniMap.dragging.disable();
          minimap._miniMap.touchZoom.disable();
          minimap._miniMap.doubleClickZoom.disable();
          minimap._miniMap.scrollWheelZoom.disable();
        }
    });
  }, false);

  // Lazy-load scripts.
  window.addEventListener('load', function() {
    var scripts = document.querySelectorAll('script[data-src]');
    var length  = scripts.length;
    arraySlice.call(scripts).forEach(function(script) {
      // Extract target event (if any).
      var evtName = script.getAttribute('data-event');
      if(null !== evtName) { // Dispatch event.
        script.onload = function() {
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('ready:' + evtName, false, false, undefined);
          document.dispatchEvent(evt);
        };
      }

      // Set `src` attribute to load script.
      script.setAttribute('src', script.getAttribute('data-src'));
      script.removeAttribute('data-src');
    });
  }, false);
}(window, document));