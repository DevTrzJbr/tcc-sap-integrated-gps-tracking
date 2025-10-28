sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/core/mvc/Controller",
  "sap/ui/Device",
  "sap/base/Log",
  "sap/ui/model/json/JSONModel",
  "com/tcc/gpstracking/util/MapHelper",
  "sap/ui/integration/widgets/Card"
], function (MessageToast, MessageBox, Controller, Device, Log, JSONModel, MapHelper, Card) {
  "use strict";

  const BASE = "/ext";

  function toProxyUrl(endpoint) {
    if (!endpoint) return null;
    const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleaned = normalized.startsWith('/api/') ? normalized.slice(4) : normalized;
    return `${BASE}${cleaned}`;
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

  function buildHeaderCardParams(route) {
    if (!route) {
      return {
        titulo: "Selecione uma rota",
        descricao: "Escolha um transporte para visualizar detalhes.",
        transporte: "-",
        codigo: "-"
      };
    }

    return {
      titulo: route.titulo || route.id || "Rota",
      descricao: route.descricao || "",
      transporte: route.transportName || "-",
      codigo: route.transportCodigo || "-"
    };
  }

  function buildMetricsTiles(metrics, hasRoute) {
    const source = metrics || emptyAnalytics();
    const formatValue = (val) => (hasRoute ? val ?? "-" : "-");
    return [
      {
        title: "Distância",
        subtitle: hasRoute ? "km" : "",
        value: formatValue(source.distanceKm),
        unit: hasRoute ? "km" : "",
        valueColor: "Good",
        icon: "sap-icon://journey-change",
      },
      {
        title: "Tempo Total",
        subtitle: hasRoute ? "min" : "",
        value: formatValue(source.totalMinutes),
        unit: hasRoute ? "min" : "",
        valueColor: "Neutral",
        icon: "sap-icon://time-entry-request",
      },
      {
        title: "Velocidade Média",
        subtitle: hasRoute ? "km/h" : "",
        value: formatValue(source.averageSpeedKmh),
        unit: hasRoute ? "km/h" : "",
        valueColor: "Good",
        icon: "sap-icon://accelerated",
      },
      {
        title: "Tempo em Movimento",
        subtitle: hasRoute ? "min" : "",
        value: formatValue(source.movingMinutes),
        unit: hasRoute ? "min" : "",
        valueColor: "Neutral",
        icon: "sap-icon://performance",
      },
      {
        title: "Tempo Parado",
        subtitle: hasRoute ? "min" : "",
        value: formatValue(source.stoppedMinutes),
        unit: hasRoute ? "min" : "",
        valueColor: "Error",
        icon: "sap-icon://busy",
      },
    ];
  }

  return Controller.extend("com.tcc.gpstracking.controller.Page2", {
    onInit: function () {
      this._map = null;
      this._geoLayer = null;
      this._headerCard = null;
      this._metricsTilesModel = new JSONModel({ items: [] });

      const oState = new JSONModel({
        selectedTransport: null,
        selectedRoute: null,
        loadingGeo: false,
        loadingAnalytics: false
      });
      this.getView().setModel(oState, "page2");

      this._analyticsModel = new JSONModel(emptyAnalytics());
      this.getView().setModel(this._analyticsModel, "analytics");
      this.getView().setModel(this._metricsTilesModel, "metricsTiles");

      Device.orientation.attachHandler(this.onOrientationChange, this);

      this._ensureHeaderCard();
      this._updateVisuals();
    },

    onExit: function () {
      Device.orientation.detachHandler(this.onOrientationChange, this);
      MapHelper.destroyMap(this._map);
      this._map = null;
      this._geoLayer = null;
      if (this._headerCard) {
        this._headerCard.destroy();
        this._headerCard = null;
      }
    },

    getSplitAppObj: function () {
      const result = this.byId("SplitAppDemo");
      if (!result) Log.info("SplitApp object can't be found");
      return result;
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("RouteHome2");
    },

    onPressMasterBack: function () {
      this.getSplitAppObj().backMaster();
    },

    onPressDetailBack: function () {
      this.getSplitAppObj().backDetail();
    },

    onOrientationChange: function (mParams) {
      const sMsg = `Orientation now is: ${mParams.landscape ? "Landscape" : "Portrait"}`;
      MessageToast.show(sMsg, { duration: 2000 });
    },

    onTransportPress: function (oEvent) {
      const oItem = oEvent.getParameter("listItem");
      const oCtx = oItem.getBindingContext("transportes");
      if (!oCtx) return;

      const transport = oCtx.getObject();
      const oState = this.getView().getModel("page2");
      oState.setProperty("/selectedTransport", {
        id: transport?.id,
        nome: transport?.nome,
        codigo: transport?.codigo
      });
      oState.setProperty("/selectedRoute", null);

      this._analyticsModel.setData(emptyAnalytics());
      if (this._geoLayer && this._map) {
        MapHelper.removeLayer(this._map, this._geoLayer);
        this._geoLayer = null;
      }
      this._updateVisuals();

      const oMaster2 = this.byId("master2");
      oMaster2.bindElement({ path: oCtx.getPath(), model: "transportes" });

      this.getSplitAppObj().toMaster(this.createId("master2"));
    },

    onRoutePress: async function (oEvent) {
      const oItem = oEvent.getParameter("listItem");
      const oCtx = oItem.getBindingContext("transportes");
      if (!oCtx) return;

      const route = oCtx.getObject();
      if (!route?.disponivel) {
        MessageToast.show("Arquivos da rota não disponíveis");
        return;
      }

      const oState = this.getView().getModel("page2");
      const transport = oState.getProperty("/selectedTransport") || {};

      oState.setProperty("/selectedRoute", {
        ...route,
        transportName: transport.nome,
        transportCodigo: transport.codigo,
        arquivoCsv: route?.arquivos?.csv || "-",
        arquivoGeojson: route?.arquivos?.geojson || "-"
      });

      this._analyticsModel.setData(emptyAnalytics());

      this.getSplitAppObj().toDetail(this.createId("detailDetail"));

      this._updateVisuals();

      const oDetailPage = this.byId("detailDetail");
      const setBusy = (flag) => {
        if (oDetailPage?.setBusy) {
          oDetailPage.setBusy(flag);
        } else {
          Log.warning("detailDetail page não encontrado para definir busy state");
          this.getView().setBusy(flag);
        }
      };

      setBusy(true);
      try {
        await this._ensureMap();
        await Promise.all([
          this._loadGeo(route),
          this._loadAnalytics(route)
        ]);
      } catch (err) {
        Log.error("Falha ao carregar rota", err);
        MessageBox.error(err.message || "Erro ao carregar informações da rota.");
      } finally {
        setBusy(false);
      }
    },

    _ensureMap: async function () {
      if (!this._map) {
        this._map = await MapHelper.createMap("map", { center: [-20.33, -40.29], zoom: 11 });
      } else {
        setTimeout(() => this._map.invalidateSize(), 0);
      }
    },

    _loadGeo: async function (route) {
      const oState = this.getView().getModel("page2");
      oState.setProperty("/loadingGeo", true);
      try {
        const endpoint = toProxyUrl(route?.endpoints?.geojson);
        if (!endpoint) {
          MessageToast.show("GeoJSON não configurado para esta rota.");
          if (this._geoLayer && this._map) {
            MapHelper.removeLayer(this._map, this._geoLayer);
            this._geoLayer = null;
          }
          return;
        }
        const res = await fetch(endpoint);
        if (!res.ok) {
          if (res.status === 404) {
            MessageToast.show("GeoJSON não encontrado para esta rota.");
            if (this._geoLayer && this._map) {
              MapHelper.removeLayer(this._map, this._geoLayer);
              this._geoLayer = null;
            }
            return;
          }
          throw new Error(`GeoJSON não encontrado (HTTP ${res.status})`);
        }
        const geo = await res.json();
        if (this._geoLayer && this._map) {
          MapHelper.removeLayer(this._map, this._geoLayer);
        }
        this._geoLayer = MapHelper.addGeoJSON(this._map, geo);
      } finally {
        oState.setProperty("/loadingGeo", false);
      }
    },

    _ensureHeaderCard: function () {
      const headerHost = this.byId("headerCardHost");
      if (headerHost && !this._headerCard) {
        this._headerCard = new Card({
          width: "100%",
          height: "15rem",
          manifest: sap.ui.require.toUrl("com/tcc/gpstracking/cards/header-info.card.json")
        });
        headerHost.addItem(this._headerCard);
        this._headerCard.refresh();
      }
      return Boolean(this._headerCard);
    },

    _setHeaderParameters: function (params) {
      if (!this._headerCard || !this._headerCard.setParameters) return;
      this._headerCard.setParameters(params);
      this._headerCard.refresh();
    },

    _updateVisuals: function () {
      this._ensureHeaderCard();

      const route = this.getView().getModel("page2").getProperty("/selectedRoute");
      const metrics = this._analyticsModel.getData() || emptyAnalytics();
      const hasRoute = Boolean(route);

      this._setHeaderParameters(buildHeaderCardParams(route));
      this._metricsTilesModel.setData({ items: buildMetricsTiles(metrics, hasRoute) });
    },

    _loadAnalytics: async function (route) {
      const oState = this.getView().getModel("page2");
      oState.setProperty("/loadingAnalytics", true);
      try {
        const endpoint = toProxyUrl(route?.endpoints?.analytics);
        if (!endpoint) {
          throw new Error("Endpoint de analytics não configurado para a rota");
        }
        const res = await fetch(endpoint);
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
      } finally {
        oState.setProperty("/loadingAnalytics", false);
        this._updateVisuals();
      }
    }
  });
});
