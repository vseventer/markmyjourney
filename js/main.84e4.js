!function(e,t){"use strict";var o=2,r=4,a=8,i=500,n=Array.prototype.slice,s=function(e){return e.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",detectRetina:!0,maxZoom:16,minZoom:1})};t.addEventListener("ready:components",function(){var l=e.jQuery,u=e.L;u.Icon.Default.imagePath="/img",l(".carousel").on("slide.bs.carousel",function(e){var t=l('[data-target="#'+this.id+'"]').removeClass("active"),o=l(e.relatedTarget);o.attr("style",o.attr("data-style")).removeAttr("data-style"),t.filter('[data-slide-to="'+o.index()+'"]').addClass("active")});var c=t.querySelectorAll(".mmjy-map");n.call(c).forEach(function(t){var n=u.map(t,{layers:s(u),maxZoom:a,minZoom:o,scrollWheelZoom:!1});n.on("fullscreenchange",function(){n.scrollWheelZoom[n.isFullscreen()?"enable":"disable"]()});var l=t.getAttribute("data-source"),c=u.geoJson(e[l],{onEachFeature:function(e,t){if(null!=e.properties.title){t.bindPopup(e.properties.title,{closeButton:!1,minWidth:0});var o;t.on("mouseover",function(){clearTimeout(o),t.openPopup()}),t.on("mouseout",function(){o=setTimeout(function(){t.closePopup()},i)})}return e},pointToLayer:function(e,t){var o=u.marker(t);if(null!=e.properties.html){var r=new u.divIcon({className:null,html:e.properties.html,iconSize:null});o.setIcon(r)}return o},style:function(e){var t="MultiLineString"===e.geometry.type?3:1;return{color:"#006400",weight:t}}}),d=c.getBounds();if(!d.isValid())return n.setView([0,0],o);var m=u.markerClusterGroup({maxClusterRadius:24,showCoverageOnHover:!1}).addTo(n);if(c.getLayers().forEach(function(e){var t=null!==e.feature.properties.html?m:n;t.addLayer(e)}),n.getZoom()?(n.setView(d.getCenter()),d=n.getBounds()):n.fitBounds(d),r<=n.getZoom()){var p=Math.abs(d.getNorth()-d.getSouth()),v=Math.abs(d.getWest()-d.getEast());if(20>p||20>v){var g=new u.Control.MiniMap(s(u),{width:100,height:100,zoomLevelFixed:1}).addTo(n);g._miniMap.dragging.disable(),g._miniMap.touchZoom.disable(),g._miniMap.doubleClickZoom.disable(),g._miniMap.scrollWheelZoom.disable()}}})},!1),e.addEventListener("load",function(){var e=t.querySelectorAll("script[data-src]");n.call(e).forEach(function(e){var o=e.getAttribute("data-event");null!==o&&(e.onload=function(){var e=t.createEvent("CustomEvent");e.initCustomEvent("ready:"+o,!1,!1,void 0),t.dispatchEvent(e)}),e.setAttribute("src",e.getAttribute("data-src")),e.removeAttribute("data-src")})},!1)}(window,document);