sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/dom/includeStylesheet",
  "sap/ui/model/json/JSONModel",
  "sap/base/Log"
], function (Controller, includeStylesheet, JSONModel, Log) {
  "use strict";

  const BASE = "/ext";

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function formatNumber(value, fractionDigits) {
    if (!Number.isFinite(value)) return "-";
    try {
      return value.toLocaleString("pt-BR", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      });
    } catch (err) {
      Log.warning("Falha ao formatar número", err);
      return value.toFixed(fractionDigits);
    }
  }

  function emptyAnalytics() {
    return {
      distanceKm: "-",
      totalMinutes: "-",
      averageSpeedKmh: "-",
      movingMinutes: "-",
      stoppedMinutes: "-"
    };
  }

  return Controller.extend("com.tcc.gpstracking.controller.Detail", {
    onInit: function () {
      this._router = this.getOwnerComponent().getRouter();
      this._router.getRoute("RouteDetail").attachPatternMatched(this._onRouteMatched, this);

      this._analyticsModel = new JSONModel(emptyAnalytics());
      this.getView().setModel(this._analyticsModel, "analytics");

      this._stopsModel = new JSONModel([]);
      this.getView().setModel(this._stopsModel, "routes");

      this._map = null;
      this._geoLayer = null;
      this._trackLive = null;
      this._vehicle = null;
      this._es = null;
      this._pts = [];

      this.getView().addEventDelegate({ onAfterRendering: this._onAfterRendering.bind(this) });
    },

    _onRouteMatched: function (oEvent) {
      const args = oEvent.getParameter("arguments");
      const transpId = decodeURIComponent(args.transpId || "");
      const oInp = this.byId("inpRota");
      if (oInp) oInp.setValue(transpId);
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
      const base = sap.ui.require.toUrl("com/tcc/gpstracking/thirdparty/leaflet");
      includeStylesheet(`${base}/leaflet.css`);
      await loadScriptOnce(`${base}/leaflet.js`);

      this._map = L.map("map").setView([-23.55052, -46.63331], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
      }).addTo(this._map);

      setTimeout(() => this._map.invalidateSize(), 0);
      window.addEventListener("resize", () => this._map.invalidateSize());
    },

    onCarregarRota: async function () {
      const rota = this.byId("inpRota").getValue().trim();
      if (!rota) {
        sap.m.MessageToast.show("Informe o nome da rota (sem .csv)");
        return;
      }

      const oList = this.byId("routeList");
      oList.setBusy(true);
      try {
        await this._ensureMap();
        await this._loadGeoJson(rota);
        await this._loadAnalytics(rota);
      } catch (err) {
        sap.m.MessageToast.show(err.message || "Erro ao carregar rota");
        Log.error("Falha ao carregar rota", err);
        this._analyticsModel.setData(emptyAnalytics());
        this._stopsModel.setData([]);
      } finally {
        oList.setBusy(false);
      }
    },

    _loadGeoJson: async function (rota) {
      if (this._geoLayer && this._map) {
        this._map.removeLayer(this._geoLayer);
        this._geoLayer = null;
      }
      if (!rota) {
        throw new Error("Nome da rota inválido");
      }
      const res = await fetch(`${BASE}/rota/${encodeURIComponent(rota)}`);
      if (!res.ok) {
        throw new Error(`GeoJSON não encontrado (HTTP ${res.status})`);
      }
      const geo = await res.json();
      this._geoLayer = L.geoJSON(geo, { style: { weight: 4 } }).addTo(this._map);
      if (this._geoLayer.getBounds && this._geoLayer.getBounds().isValid()) {
        this._map.fitBounds(this._geoLayer.getBounds(), { padding: [20, 20] });
      }
    },

    _loadAnalytics: async function (rota) {
      if (!rota) {
        throw new Error("Nome da rota inválido");
      }
      const res = await fetch(`${BASE}/analytics/${encodeURIComponent(rota)}`);
      if (!res.ok) {
        throw new Error(`Analytics não disponível (HTTP ${res.status})`);
      }
      const data = await res.json();
      const metrics = data?.metrics || {};

      this._analyticsModel.setData({
        distanceKm: formatNumber(metrics.distanceKm, 2),
        totalMinutes: formatNumber(metrics.totalMinutes, 1),
        averageSpeedKmh: formatNumber(metrics.averageSpeedKmh, 1),
        movingMinutes: formatNumber(metrics.movingMinutes, 1),
        stoppedMinutes: formatNumber(metrics.stoppedMinutes, 1)
      });

      const stopsEntries = Object.entries(metrics.stops || {});
      const stops = stopsEntries.map(([nome, tempo], idx) => ({
        id: `${idx + 1}`,
        nome,
        minutos: formatNumber(tempo?.minutes, 1),
        segundos: formatNumber(tempo?.seconds, 0)
      }));
      this._stopsModel.setData(stops);
    },

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
        Log.error("SSE", e);
        return;
      }
      this._es = es;

      es.addEventListener("message", (evt) => {
        const data = JSON.parse(evt.data);
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
        Log.warning("SSE: reconectando...");
      };
    }
  });
});
