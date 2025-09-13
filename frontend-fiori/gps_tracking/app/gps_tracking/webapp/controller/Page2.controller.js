sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
  	"com/tcc/gpstracking/util/MapHelper"
], function (MessageToast, Controller, Device, Log, JSONModel, MapHelper) {
	"use strict";

	return Controller.extend("com.tcc.gpstracking.controller.Page2", {

		onInit: function () {
			// Modelo com transportes e suas rotas
			const data = {
				transports: [
					{
						id: "T1", name: "Transporte 1", routes: [
							{ code: "R1", name: "Rota 1" },
							{ code: "R2", name: "Rota 2" }
						]
					},
					{
						id: "T2", name: "Transporte 2", routes: [
							{ code: "R2", name: "Rota 2" },
							{ code: "R3", name: "Rota 3" }
						]
					},
					{
						id: "T3", name: "Transporte 3", routes: [
							{ code: "R1", name: "Rota 1" },
							{ code: "R3", name: "Rota 3" },
							{ code: "R4", name: "Rota 4" }
						]
					}
				],
				selectedRoute: null
			};
			this.getView().setModel(new JSONModel(data), "page2");

			Device.orientation.attachHandler(this.onOrientationChange, this);
		},

		onExit: function () {
			Device.orientation.detachHandler(this.onOrientationChange, this);
		},

		getSplitAppObj: function () {
			const result = this.byId("SplitAppDemo");
			if (!result) Log.info("SplitApp object can't be found");
			return result;
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("RouteHome");
		},

		onPressMasterBack: function () {
			this.getSplitAppObj().backMaster();
		},

		onPressDetailBack: function () {
			this.getSplitAppObj().backDetail();
		},

		onOrientationChange: function (mParams) {
			const sMsg = "Orientation now is: " + (mParams.landscape ? "Landscape" : "Portrait");
			MessageToast.show(sMsg, { duration: 2000 });
		},

		// === Handlers dinâmicos ===

		// 1) Usuário tocou em um transporte no Master → abre Master2 com as rotas desse transporte
		onTransportPress: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oCtx = oItem.getBindingContext("page2"); // contexto do transporte selecionado

			// Faz element binding no Master2 para este transporte (rotas ficam acessíveis por path relativo 'routes')
			const oMaster2 = this.byId("master2");
			oMaster2.bindElement({ path: oCtx.getPath(), model: "page2" });

			// navega para a segunda master page
			this.getSplitAppObj().toMaster(this.createId("master2"));
		},

		// 2) Usuário tocou em uma rota → guarda rota selecionada e abre o detailDetail
		onRoutePress: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oCtx = oItem.getBindingContext("page2");
			const route = oCtx.getObject();

			// guarda a rota p/ o cabeçalho:
			const m = this.getView().getModel("page2");
			m.setProperty("/selectedRoute", route);

			// navega para o detailDetail:
			this.getSplitAppObj().toDetail(this.createId("detailDetail"));

			// cria o mapa (uma vez) no div 'map' do fragment
			setTimeout(async () => {
				if (!this._mapP2) {
					this._mapP2 = await MapHelper.createMap("map", { center: [-20.33, -40.29], zoom: 12 });
				} else {
					setTimeout(() => this._mapP2.invalidateSize(), 0);
				}
			}, 0);
		}
	});
});
