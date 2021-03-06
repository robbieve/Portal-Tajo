require('mapbox.js'); // <-- auto-attaches to window.L
require('leaflet-draw');
require('leaflet-contextmenu');

require('leaflet/dist/leaflet.css');
require('leaflet-draw/dist/leaflet.draw.css');
require('leaflet-contextmenu/dist/leaflet.contextmenu.css');

import { isMwa } from 'configs';
import { MAPBOX_KEY } from 'utils/constants';

export function createMapboxMap(domNode, view, noLayersControl) {
  let theMap = null;
  window.L.mapbox.accessToken = MAPBOX_KEY;
  theMap = window.L.mapbox.map(domNode,
    null,  // some mestiriouse argument...
    {
      contextmenu: true,
      contextmenuWidth: 140,
    },
  );
  theMap.setView(view.center, view.zoom);

  const tilesOSM = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  });

  let layers = {};
  if (isMwa) {
    const overlayLayer = window.L.tileLayer.wms(
    'http://gisonline.mwa.co.th:2558/arcgis/services/wmsservice/MapServer/WMSServer',
      {
        format: 'image/png',
        transparent: true,
        layers: '32,38,39,44,47,48',
        zIndex: '500',
      }).setOpacity(0.5).addTo(theMap);
    layers = { MWA: overlayLayer };
  }
  if (!noLayersControl) {
    window.L.control.layers({
      // StreetsDef: window.L.mapbox.tileLayer('mapbox.streets'),
      Streets: tilesOSM.addTo(theMap),
      Satelite: window.L.mapbox.tileLayer('mapbox.streets-satellite'),
      // Emerald: window.L.mapbox.tileLayer('mapbox.emerald'),
      // Run: window.L.mapbox.tileLayer('mapbox.run-bike-hike'),
      // Light: window.L.mapbox.tileLayer('mapbox.light'),
      // Dark: window.L.mapbox.tileLayer('mapbox.dark'),
      // Wheat: window.L.mapbox.tileLayer('mapbox.wheatpaste'),
      // Basic: window.L.mapbox.tileLayer('mapbox.streets-basic'),
      Outdoors: window.L.mapbox.tileLayer('mapbox.outdoors'),
      // Pencil: window.L.mapbox.tileLayer('mapbox.pencil'),
    },
    layers,
    { position: 'topleft' }).addTo(theMap);
  } else {
    tilesOSM.addTo(theMap);
  }
  // do this to resize map on div
  window.setTimeout(
   ((map => () => {
     map.invalidateSize(true);
   })(theMap)),
    500);
  return theMap;
}

export function hideLayer(containerLayer, layer, doHide) {
  if (containerLayer === null || layer === null) {
    return;
  }
  if (doHide) {
    if (containerLayer.hasLayer(layer)) {
      containerLayer.removeLayer(layer);
    }
  } else if (!containerLayer.hasLayer(layer)) {
    containerLayer.addLayer(layer);
  }
}

//--------------------------------------------------------------------
//  GEO helpers
// TODO: better use MapBox utilites?
//
const EarthR = 6378.137; // Radius of earth in KM
// 6371?
//
// http://stackoverflow.com/questions/2637023/how-to-calculate-the-latlng-of-a-point-a-certain-distance-away-from-another
const _toRad = nbr => (nbr * Math.PI / 180);
const _toDeg = nbr => (nbr * 180 / Math.PI);
export function latLngMoveTo(startLatLng, _brng, _dist) {
  const dist = _dist / EarthR;
  const brng = _toRad(_brng);

  const lat1 = _toRad(startLatLng.lat);
  const lon1 = _toRad(startLatLng.lng);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                                Math.cos(lat1),
                                Math.cos(dist) - Math.sin(lat1) *
                                Math.sin(lat2));

  if (isNaN(lat2) || isNaN(lon2)) return startLatLng;

  return window.L.latLng(_toDeg(lat2), _toDeg(lon2));
}

// some theory here:
// http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
// http://www.movable-type.co.uk/scripts/latlong.html
export function haversineDist(latLngA, latLngB) {  // generally used geo measurement function
  const dLat = _toRad(latLngB.lat - latLngA.lat);
  const dLon = _toRad(latLngB.lng - latLngA.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(_toRad(latLngA.lat)) * Math.cos(_toRad(latLngB.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = EarthR * c;
  return d * 1000; // meters
}
