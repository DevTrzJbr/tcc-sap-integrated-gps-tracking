# Page2 – Cards e Métricas

Este documento descreve como a tela Page2 (app UI5 `com.tcc.gpstracking`) monta o cabeçalho da rota e os cartões de métricas usando **Integration Cards** e **sap.m.GenericTile**.

## Visão geral

1. **Card do cabeçalho** – instanciado dinamicamente no controller; mostra título, descrição, nome e código do transporte selecionado.
2. **Cards de métricas** – renderizados como vários `GenericTile` lado a lado, alimentados por um `JSONModel` com os valores calculados no backend.
3. **Scroll** – o fragmento do detalhe (`DetailMain.fragment.xml`) usa `sap.m.ScrollContainer` para exibir o mapa, o card do cabeçalho e os tiles de métricas sem corte na tela.

## Componentes principais

### Fragmento `DetailMain.fragment.xml`

```xml
<ScrollContainer height="100%" horizontal="false" vertical="true">
  <VBox class="sapUiSmallMargin" visible="{= !!${page2>/selectedRoute} }">
    <VBox id="headerCardHost" class="sapUiMediumMarginBottom" width="100%" />
    <HBox class="sapUiMediumMarginBottom" wrap="Wrap" items="{metricsTiles>/items}">
      <items>
        <GenericTile ...>
          <tileContent>
            <TileContent unit="{metricsTiles>unit}">
              <content>
                <NumericContent value="{metricsTiles>value}" ... />
              </content>
            </TileContent>
          </tileContent>
        </GenericTile>
      </items>
    </HBox>
  </VBox>
</ScrollContainer>
```

- `headerCardHost`: placeholder para o Integration Card de cabeçalho.
- `metricsTiles` model: usado pelo `HBox` para repetir os tiles de métricas.

### Controller `Page2.controller.js`

1. **Modelos:**
   ```js
   this._analyticsModel = new JSONModel(emptyAnalytics());
   this.getView().setModel(this._analyticsModel, "analytics");
   this._metricsTilesModel = new JSONModel({ items: [] });
   this.getView().setModel(this._metricsTilesModel, "metricsTiles");
   ```
2. **Card de cabeçalho:**
   ```js
   _ensureHeaderCard() {
     const host = this.byId("headerCardHost");
     if (host && !this._headerCard) {
       this._headerCard = new Card({
         width: "100%",
         height: "15rem",
         manifest: sap.ui.require.toUrl("com/tcc.gpstracking/cards/header-info.card.json")
       });
       host.addItem(this._headerCard);
       this._headerCard.refresh();
     }
   }
   _setHeaderParameters(params) {
     this._headerCard.setParameters(params);
     this._headerCard.refresh();
   }
   ```
3. **Tiles de métricas:**
   ```js
   function buildMetricsTiles(metrics, hasRoute) {
     return [ { title: "Distância", value: metrics.distanceKm, ... }, ... ];
   }

   this._metricsTilesModel.setData({
     items: buildMetricsTiles(metrics, Boolean(route))
   });
   ```
4. **Atualização geral:**
   ```js
   _updateVisuals() {
     this._ensureHeaderCard();
     const route = this.getView().getModel("page2").getProperty("/selectedRoute");
     const metrics = this._analyticsModel.getData() || emptyAnalytics();

     this._setHeaderParameters(buildHeaderCardParams(route));
     this._metricsTilesModel.setData({ items: buildMetricsTiles(metrics, Boolean(route)) });
   }
   ```

### Manifests de cards

- `cards/header-info.card.json` – Integration Card do tipo `Object`; usa `configuration.parameters` (`titulo`, `descricao`, `transporte`, `codigo`).
- Não existe mais `metrics.card.json`; os valores são renderizados via tiles.

## Como adicionar novos tiles de métricas

1. Edite `buildMetricsTiles` no controller.
2. Adicione um novo objeto ao array com `title`, `subtitle`, `value`, `unit`, `valueColor`.
3. O `HBox` no fragmento renderiza automaticamente os tiles adicionais.

## Notas

- Versão UI5 adotada: `https://ui5.sap.com` (1.120.x). Propriedades mais novas (`emptyIndicatorText`) foram substituídas por `noDataText`.
- A altura efetiva dos cards é controlada no controller (`height: "15rem"` etc.). Ajuste ali caso precise.
- Sempre que uma nova rota é selecionada ou as métricas retornam do backend (`_loadAnalytics`), `_updateVisuals()` reavalia cabeçalho e tiles.

