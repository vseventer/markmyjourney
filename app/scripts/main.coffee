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

# Initializes the map. Invoked upon Google Maps load completion.
window.init = ->
  # Configure.
  opts =
    backgroundColor   : 0xEBDAFC
    center            : new google.maps.LatLng 40.866667, 34.566667 # Center of the earth.
    mapTypeControl    : false
    scrollwheel       : false
    streetViewControl : false
    styles            : [
      {
        elementType : 'geometry.fill',
        featureType : 'landscape',
        stylers     : [{ hue: "#2E0854" }, { lightness: -2 }, { gamma: 0.25 }]
      }
      {
        elementType : 'geometry.fill',
        featureType : 'water',
        stylers     : [ color: '#EBDAFC' ]
      }
      {
        elementType : 'geometry.fill',
        featureType : 'administrative',
        stylers     : [ visibility: 'off' ]
      }
      {
        elementType : 'geometry.stroke',
        stylers     : [ visibility: 'off' ]
      }
      {
        elementType : 'labels',
        stylers     : [ visibility: 'off' ]
      }
    ]
    zoom: 3

  # Instantiate the map.
  markers = document.querySelectorAll '[data-marker]'
  if markers[0] # Center around first marker.
    lat = markers[0].getAttribute 'data-lat'
    lng = markers[0].getAttribute 'data-lng'
    opts.center = new google.maps.LatLng lat, lng
  map = new google.maps.Map document.querySelector('.mmjy-map'), opts

  # Add markers and info windows to the map.
  infoWindow = new google.maps.InfoWindow()
  markers = for marker in markers then do (marker) ->
    # Add marker.
    lat = parseFloat marker.getAttribute 'data-lat'
    lng = parseFloat marker.getAttribute 'data-lng'
    markerObj = new google.maps.Marker
      map        : map
      position   : new google.maps.LatLng lat, lng
      title      : marker.getAttribute 'data-marker'

    # Add info window.
    google.maps.event.addListener markerObj, 'click', ->
      infoWindow.setContent marker
      infoWindow.open map, markerObj

    # Return the marker.
    markerObj

  # Open and center around first marker.
  google.maps.event.addListenerOnce map, 'tilesloaded', ->
    google.maps.event.trigger markers[0], 'click'

# Gallery.
gallery = document.querySelector '.mmjy-gallery-wrapper'
if gallery? # Initialize gallery.
  selector = # Shortcuts.
    img     : gallery.querySelector '.mmjy-photo img'
    caption : gallery.querySelector '.mmjy-photo figcaption'

  # Navigation.
  $(gallery).on 'click', '.mmjy-gallery-nav', (e) ->
    current = document.getElementById document.location.hash.substr 1
    parent  = current?.parentNode or gallery.querySelector 'li' # First photo.
    if -1 isnt e.currentTarget.className.indexOf 'mmjy-gallery-next' # Next, or first.
      target = parent.nextElementSibling or parent.parentNode.firstElementChild
    else # Previous, or last.
      target = parent.previousElementSibling or parent.parentNode.lastElementChild
    $(target.querySelector('a')).trigger 'click'

  # On click, update the photo.
  $(gallery).on 'click', 'a', (e) ->
    e.preventDefault() # Stop further processing.
    $(gallery).find('.active').removeClass 'active' # Unset.
    this.className = 'active' # Set.

    # Load the image.
    selector.img.style.opacity = 0.5 # Fade.
    img = new Image()
    img.addEventListener 'load', ->
      selector.img.style.opacity = 1 # Reset.
      selector.img.setAttribute 'src', img.src # Update the image.
    , false
    img.src = this.getAttribute 'href'

    # Update the id, description, and metadata.
    selector.caption.innerHTML = this.querySelector('.mmjy-caption').innerHTML
    history.pushState null, null, '#' + this.getAttribute 'id' # Update URI.

  # Focus on the picture defined in the hash (if any).
  focus = document.getElementById document.location.hash.substr 1
  focus?.click() # Focus.

# Lazy-load scripts.
load = (src) ->
  script = document.createElement 'script'
  script.setAttribute 'async', true
  script.setAttribute 'src', src
  document.body.appendChild script
if document.querySelector '.mmjy-map'      then load '//maps.google.com/maps/api/js?callback=init'
if document.getElementById 'disqus_thread' then load '//markmyjourney.disqus.com/embed.js'
if document.querySelector '.twitter-timeline' then load '//platform.twitter.com/widgets.js'