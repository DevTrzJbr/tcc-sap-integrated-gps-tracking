sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/dom/includeStylesheet",
  "sap/ui/model/json/JSONModel"
], function (Controller, includeStylesheet, JSONModel) {
  "use strict";

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // 🔁 mude para "/ext" se você colocou um proxy no CAP (server.js)
  const BASE = "/ext";

  return Controller.extend("com.tcc.gpstracking.controller.Detail", {
    onInit: function () {
      // ouvir a rota de detalhe e capturar o parâmetro {transpId}
      this._router = this.getOwnerComponent().getRouter();
      this._router.getRoute("RouteDetail").attachPatternMatched(this._onRouteMatched, this);

      // Models de exemplo (mantidos)
      const oData = {
        analytics: { totalRotas: 3, distanciaTotalKm: 128.3, tempoTotalH: 5.6, custoTotal: "2.450,00" },
        routes: [
          { id: "Rota-001", from: "CD", to: "Cliente A", km: 45.2, coords: [[-23.55052,-46.63331],[-23.56705,-46.64803],[-23.58562,-46.66992]] },
          { id: "Rota-002", from: "CD", to: "Cliente B", km: 60.1, coords: [[-23.55052,-46.63331],[-23.50188,-46.62000]] },
          { id: "Rota-003", from: "Cliente B", to: "Cliente C", km: 23.0, coords: [[-23.50188,-46.62000],[-23.48000,-46.59000]] }
        ]
      };
      this.getView().setModel(new JSONModel(oData.analytics), "analytics");
      this.getView().setModel(new JSONModel(oData.routes), "routes");

      this._map = null;
      this._geoLayer = null;   // rota estática (GeoJSON)
      this._trackLive = null;  // trilha “percorrida” (SSE)
      this._vehicle = null;    // marcador do “carro”
      this._es = null;         // EventSource
      this._pts = [];

      this.getView().addEventDelegate({ onAfterRendering: this._onAfterRendering.bind(this) });
    },
    
    _onRouteMatched: function (oEvent) {
      const args = oEvent.getParameter("arguments");
      const transpId = decodeURIComponent(args.transpId || "");
      // joga o ID no input para o usuário ver/editar, se quiser:
      const oInp = this.byId("inpRota");
      if (oInp) oInp.setValue(transpId);
      // (opcional) já carrega a rota automaticamente ao entrar:
      if (transpId) { this.onCarregarRota(); }
    },

    _onAfterRendering: function () {
      if (this._map) {
        setTimeout(() => this._map.invalidateSize(), 0);
        return;
      }
      const oHtml = this.byId("leafletHtml");
      if (!oHtml) return;
      this._ensureMap();
    },

    _ensureMap: async function () {
      // 📦 Carrega Leaflet local (sem CDN)
      const base = sap.ui.require.toUrl("com/tcc/gpstracking/thirdparty/leaflet");
      includeStylesheet(base + "/leaflet.css");
      await loadScriptOnce(base + "/leaflet.js");

      // cria o mapa no <div id="map">
      this._map = L.map("map").setView([-23.55052, -46.63331], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(this._map);

      // desenha as rotas de exemplo (mantido do seu código)
      const aRoutes = this.getView().getModel("routes").getData();
      const aAll = [];
      aRoutes.forEach(r => {
        L.polyline(r.coords, { weight: 4 }).addTo(this._map)
          .bindTooltip(`${r.id} — ${r.km} km`);
        aAll.push(...r.coords);
      });
      if (aAll.length) this._map.fitBounds(aAll, { padding: [20, 20] });

      setTimeout(() => this._map.invalidateSize(), 0);
      window.addEventListener("resize", () => this._map.invalidateSize());
    },

    // ============== GeoJSON estático da rota planejada ==============
    onCarregarRota: async function () {
      try {
        const rota = this.byId("inpRota").getValue().trim();
        if (!rota) { sap.m.MessageToast.show("Informe o nome da rota (sem .csv)"); return; }

        if (this._geoLayer) { this._map.removeLayer(this._geoLayer); this._geoLayer = null; }

        const res = await fetch(`${BASE}/rota/${encodeURIComponent(rota)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geo = await res.json();

        this._geoLayer = L.geoJSON(geo, { style: { weight: 4 } }).addTo(this._map);
        if (this._geoLayer.getBounds && this._geoLayer.getBounds().isValid()) {
          this._map.fitBounds(this._geoLayer.getBounds(), { padding: [20,20] });
        }
      } catch (err) {
        sap.m.MessageToast.show("Erro ao carregar GeoJSON");
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },

    // ============== Replay em tempo real via SSE ==============
    onStop: function () {
      if (this._es) { this._es.close(); this._es = null; }
      if (this._trackLive) { this._map.removeLayer(this._trackLive); this._trackLive = null; }
      if (this._vehicle) { this._map.removeLayer(this._vehicle); this._vehicle = null; }
      this._pts = [];
    },

    onPlay: function () {
      this.onStop();
      const rota = this.byId("inpRota").getValue().trim();
      if (!rota) { sap.m.MessageToast.show("Informe a rota"); return; }

      const url = `${BASE}/stream/${encodeURIComponent(rota)}?speed=8&minMs=300`;
      let es;
      try {
        es = new EventSource(url);
      } catch (e) {
        sap.m.MessageToast.show("Falha ao abrir stream");
        // eslint-disable-next-line no-console
        console.error(e);
        return;
      }
      this._es = es;

      es.addEventListener("message", (evt) => {
        const data = JSON.parse(evt.data); // {lat, lon, idx, ts, nome, ...}
        const latlng = [data.lat, data.lon];
        this._pts.push(latlng);

        if (!this._trackLive) {
          this._trackLive = L.polyline(this._pts, { weight: 5 }).addTo(this._map);
        } else {
          this._trackLive.addLatLng(latlng);
        }

        if (!this._vehicle) {
          this._vehicle = L.marker(latlng, { title: "Veículo" }).addTo(this._map);
        } else {
          this._vehicle.setLatLng(latlng);
        }
      });

      es.addEventListener("done", () => {
        es.close();
        this._es = null;
        sap.m.MessageToast.show("Fim do replay");
      });

      es.onerror = () => {
        // Reconexão automática padrão do EventSource
        // eslint-disable-next-line no-console
        console.warn("SSE: erro/reconexão…");
      };
    }
  });
});
