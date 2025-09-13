sap.ui.define([
  "sap/ui/dom/includeStylesheet"
], function (includeStylesheet) {
  "use strict";

  // caminho base do Leaflet no seu app (terceiro)
  const LEAFLET_BASE = sap.ui.require.toUrl("com/tcc/gpstracking/thirdparty/leaflet");

  // Evita carregar o script 2x
  let _leafletLoading = null;
  function loadLeafletOnce() {
    if (window.L) return Promise.resolve(); // já carregado
    if (_leafletLoading) return _leafletLoading;

    includeStylesheet(`${LEAFLET_BASE}/leaflet.css`);
    _leafletLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `${LEAFLET_BASE}/leaflet.js`;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
    return _leafletLoading;
  }

  /** Cria um mapa Leaflet num container (ex.: 'map' ou 'map2') */
  async function createMap(containerId, options = {}) {
    await loadLeafletOnce();
    const {
      center = [-23.55052, -46.63331],
      zoom = 12,
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileOptions = { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
    } = options;

    const map = L.map(containerId);
    L.tileLayer(tileUrl, tileOptions).addTo(map);
    map.setView(center, zoom);

    // util pra responsividade
    setTimeout(() => map.invalidateSize(), 0);
    window.addEventListener("resize", () => map.invalidateSize());

    return map;
  }

  /** Adiciona um GeoJSON (retorna camada) */
  function addGeoJSON(map, geojson, style = { weight: 4 }) {
    const layer = L.geoJSON(geojson, { style }).addTo(map);
    if (layer.getBounds && layer.getBounds().isValid()) {
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    }
    return layer;
  }

  /** Começa replay SSE de pontos (CSV->stream). Retorna um handle com stop() */
  function startSSETrack(map, url) {
    const pts = [];
    let track = null;
    let vehicle = null;
    const es = new EventSource(url);

    const onMessage = (evt) => {
      const data = JSON.parse(evt.data); // {lat, lon, ...}
      const latlng = [data.lat, data.lon];
      pts.push(latlng);

      if (!track) {
        track = L.polyline(pts, { weight: 5 }).addTo(map);
      } else {
        track.addLatLng(latlng);
      }
      if (!vehicle) {
        vehicle = L.marker(latlng, { title: "Veículo" }).addTo(map);
      } else {
        vehicle.setLatLng(latlng);
      }
    };

    const onDone = () => { es.close(); };

    es.addEventListener("message", onMessage);
    es.addEventListener("done", onDone);
    es.onerror = () => { /* reconexão automática padrão */ };

    return {
      stop: () => { try { es.close(); } catch (_) {} },
      getPolyline: () => track,
      getMarker:   () => vehicle
    };
  }

  /** Remove camada com segurança */
  function removeLayer(map, layer) {
    if (map && layer && map.removeLayer) {
      try { map.removeLayer(layer); } catch (_) {}
    }
  }

  /** Destroi o mapa (limpa listeners) */
  function destroyMap(map) {
    if (!map) return;
    try { map.remove(); } catch (_) {}
  }

  return {
    loadLeafletOnce,
    createMap,
    addGeoJSON,
    startSSETrack,
    removeLayer,
    destroyMap
  };
});
