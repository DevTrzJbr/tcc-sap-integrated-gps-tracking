sap.ui.define([
  "sap/ui/core/UIComponent",
  "com/tcc/gpstracking/model/models",
  "sap/ui/model/json/JSONModel",
  "sap/base/Log"
], function (UIComponent, models, JSONModel, Log) {
  "use strict";

  const TRANSPORTES_URL = "/ext/transportes";

  return UIComponent.extend("com.tcc.gpstracking.Component", {
    metadata: {
      manifest: "json",
      interfaces: [
        "sap.ui.core.IAsyncContentCreation"
      ]
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(models.createDeviceModel(), "device");

      const oTransportesModel = new JSONModel({
        loading: true,
        error: null,
        transportes: []
      });
      this.setModel(oTransportesModel, "transportes");

      fetch(TRANSPORTES_URL)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Falha ao carregar transportes (HTTP ${res.status})`);
          }
          return res.json();
        })
        .then((payload) => {
          const lista = Array.isArray(payload?.transportes) ? payload.transportes : [];
          oTransportesModel.setProperty("/transportes", lista);
        })
        .catch((err) => {
          Log.error("Não foi possível obter catálogo de transportes", err);
          oTransportesModel.setProperty("/error", err.message || String(err));
        })
        .finally(() => {
          oTransportesModel.setProperty("/loading", false);
        });

      this.getRouter().initialize();
    }
  });
});
