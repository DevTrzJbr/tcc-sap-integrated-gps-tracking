sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
  "use strict";

  const BASE = "/ext";

  return Controller.extend("com.tcc.gpstracking.controller.Home2", {
    onInit: function () {
      const oModel = new JSONModel({ transportes: [], loading: true, error: null });
      this.getView().setModel(oModel, "home2");
      this._loadTransportes();
    },

    _loadTransportes: async function () {
      const oModel = this.getView().getModel("home2");
      try {
        const res = await fetch(`${BASE}/transportes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const lista = (data.transportes || []).map((item) => ({
          ...item,
          totalRotas: Array.isArray(item.rotas) ? item.rotas.length : 0
        }));
        oModel.setProperty("/transportes", lista);
      } catch (err) {
        oModel.setProperty("/error", err.message);
        MessageToast.show("Erro ao carregar transportes");
      } finally {
        oModel.setProperty("/loading", false);
      }
    },

    onTilePress: function (oEvent) {
      const ctx = oEvent.getSource().getBindingContext("home2");
      const transport = ctx.getObject();
      const router = this.getOwnerComponent().getRouter();
      router.navTo("RoutePage2");
      MessageToast.show(`Transporte ${transport.nome || transport.id}`);
    }
  });
});
