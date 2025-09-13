sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Fragment, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.tcc.gpstracking.controller.Home", {
        onInit() {
            this.oRouter = this.getOwnerComponent().getRouter();
        },
        onPress: async function () {

            // cria/abre o Dialog
            if (!this._oCreateDialog) {
                this._oCreateDialog = await Fragment.load({
                    name: "com.tcc.gpstracking.view.fragments.CreateTransporte",
                    controller: this
                });
                this.getView().addDependent(this._oCreateDialog);
            }
            // model do formulário (reset a cada abertura)
            const oFormModel = new JSONModel({ placa: "", marca: "", modelo: "" });
            this._oCreateDialog.setModel(oFormModel, "form");
            this._oCreateDialog.open();
        },

        onPressDetail: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");           // ColumnListItem
            const oCtx  = oItem.getBindingContext();                 // contexto do modelo default (OData v4)
            // ajuste o nome do campo abaixo para a sua chave real (ex.: "ID" ou "placa")
            const id = oCtx.getProperty("ID"); 
            if (!id) {
                sap.m.MessageToast.show("ID do transporte não encontrado.");
                return;
            }
            this.oRouter.navTo("RouteDetail", { transpId: encodeURIComponent(id) });
        },

        onPressPage: function (oEvent) {
            // const oItem = oEvent.getParameter("listItem");           // ColumnListItem
            // const oCtx  = oItem.getBindingContext();                 // contexto do modelo default (OData v4)
            // ajuste o nome do campo abaixo para a sua chave real (ex.: "ID" ou "placa")
            // const id = oCtx.getProperty("ID"); 
            // if (!id) {
            //     sap.m.MessageToast.show("ID do transporte não encontrado.");
            //     return;
            // }
            this.oRouter.navTo("RoutePage2" 
                                // { transpId: encodeURIComponent(id) }
                            );
        },

        onSaveCreate: async function () {
            const data = this._oCreateDialog.getModel("form").getData();

            data.placa = (data.placa || "").toUpperCase().trim();
            // >>> OData V4 (CAP padrão no BAS usa muito v4)
            try {
                const oTable = this.byId("idProductsTable");
                const oListBinding = oTable.getBinding("items"); // binding de /Transporte
                const oCreated = oListBinding.create({
                    placa: data.placa,
                    marca: data.marca,
                    modelo: data.modelo
                });

                await oCreated.created(); // espera POST concluir
                MessageToast.show("Transporte criado com sucesso!");
                this._oCreateDialog.close();
            } catch (e) {
                MessageBox.error(e.message || "Erro ao criar transporte.");
            }
        },
        onCancelCreate: function () {
            this._oCreateDialog.close();
        }

    });
});