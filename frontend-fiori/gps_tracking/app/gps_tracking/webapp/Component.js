sap.ui.define([
  "sap/ui/core/UIComponent",
  "com/tcc/gpstracking/model/models"
], function (UIComponent, models) {
  "use strict";

  return UIComponent.extend("com.tcc.gpstracking.Component", {
    metadata: {
      manifest: "json",
      interfaces: [
        "sap.ui.core.IAsyncContentCreation" // nome correto
      ]
    },

    init: function () {
      // chama o init da superclasse
      UIComponent.prototype.init.apply(this, arguments);

      // modelo de device (caso seu models.js forneça)
      this.setModel(models.createDeviceModel(), "device");

      // habilita o roteamento
      this.getRouter().initialize();
    }
  });
});
