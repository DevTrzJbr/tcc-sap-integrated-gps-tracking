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
      s.crossOrigin = "";
      s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  return Controller.extend("com.tcc.gpstracking.controller.Detail", {
    onInit: function () {
      // Models de exemplo
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

      // ➜ Delegate no nível da VIEW (evita undefined do controle no onInit)
      this.getView().addEventDelegate({
        onAfterRendering: this._onAfterRendering.bind(this)
      });
    },

    _onAfterRendering: function () {
      // só inicializa uma vez
      if (this._leaflet) {
        setTimeout(() => this._leaflet.invalidateSize(), 0);
        return;
      }
      // garante que o HTML foi renderizado
      const oHtml = this.byId("leafletHtml");
      if (!oHtml) return; // view ainda não criou o controle (raro)

      this._ensureMap();
    },

    _ensureMap: async function () {
      // CSS + script do Leaflet
      includeStylesheet("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
      await loadScriptOnce("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

      // cria o mapa no <div id="map">
      this._leaflet = L.map("map").setView([-23.55052, -46.63331], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this._leaflet);

      // desenha rotas
      const aRoutes = this.getView().getModel("routes").getData();
      const aAll = [];
      aRoutes.forEach(r => {
        L.polyline(r.coords, { weight: 4 }).addTo(this._leaflet)
          .bindTooltip(`${r.id} — ${r.km} km`);
        aAll.push(...r.coords);
      });
      if (aAll.length) this._leaflet.fitBounds(aAll, { padding: [20, 20] });

      // corrige tamanho
      setTimeout(() => this._leaflet.invalidateSize(), 0);
      window.addEventListener("resize", () => this._leaflet.invalidateSize());
    }
  });
});
