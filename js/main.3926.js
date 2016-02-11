!function(e,t){"use strict";var o=2,r=4,a=8,i=500,n=Array.prototype.slice,s=function(){return L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",detectRetina:!0,maxZoom:16,minZoom:1})};t.addEventListener("ready:components",function(){L.Icon.Default.imagePath="/img",$(".carousel").on("slide.bs.carousel",function(e){var t=$('[data-target="#'+this.id+'"]').removeClass("active"),o=$(e.relatedTarget);o.attr("style",o.attr("data-style")).removeAttr("data-style"),t.filter('[data-slide-to="'+o.index()+'"]').addClass("active")});var l=t.querySelectorAll(".mmjy-map");n.call(l).forEach(function(t){var n=L.map(t,{layers:s(),maxZoom:a,minZoom:o,scrollWheelZoom:!1});n.on("fullscreenchange",function(){n.scrollWheelZoom[n.isFullscreen()?"enable":"disable"]()});var l=t.getAttribute("data-source"),u=L.geoJson(e[l],{onEachFeature:function(e,t){if(null!=e.properties.title){t.bindPopup(e.properties.title,{closeButton:!1,minWidth:0});var o;t.on("mouseover",function(){clearTimeout(o),t.openPopup()}),t.on("mouseout",function(){o=setTimeout(function(){t.closePopup()},i)})}return e},pointToLayer:function(e,t){var o=L.marker(t);if(null!=e.properties.html){var r=new L.divIcon({className:null,html:e.properties.html,iconSize:null});o.setIcon(r)}return o},style:function(e){var t="MultiLineString"===e.geometry.type?3:1;return{color:"#006400",weight:t}}}),c=u.getBounds();if(!c.isValid())return n.setView([0,0],o);var d=L.markerClusterGroup({maxClusterRadius:24,showCoverageOnHover:!1,spiderfyOnMaxZoom:!0}).addTo(n);if(u.getLayers().forEach(function(e){var t=null!==e.feature.properties.html?d:n;t.addLayer(e)}),n.getZoom()?(n.setView(c.getCenter()),c=n.getBounds()):n.fitBounds(c),r<=n.getZoom())var m=Math.abs(c.getNorth()-c.getSouth()),p=Math.abs(c.getWest()-c.getEast());if(20>m||20>p){var v=new L.Control.MiniMap(s(),{width:100,height:100,zoomLevelFixed:1}).addTo(n);v._miniMap.dragging.disable(),v._miniMap.touchZoom.disable(),v._miniMap.doubleClickZoom.disable(),v._miniMap.scrollWheelZoom.disable()}})},!1),e.addEventListener("load",function(){{var e=t.querySelectorAll("script[data-src]");e.length}n.call(e).forEach(function(e){var o=e.getAttribute("data-event");null!==o&&(e.onload=function(){var e=t.createEvent("CustomEvent");e.initCustomEvent("ready:"+o,!1,!1,void 0),t.dispatchEvent(e)}),e.setAttribute("src",e.getAttribute("data-src")),e.removeAttribute("data-src")})},!1)}(window,document);