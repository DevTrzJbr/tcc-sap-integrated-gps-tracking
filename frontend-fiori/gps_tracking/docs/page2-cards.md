# Page2 – Cards e Métricas

Este documento resume a configuração atual da tela Page2 na aplicação UI5 (`com.tcc.gpstracking`) para exibir os dados da rota com Integration Cards e tiles de métricas.

## 1. Estrutura do fragmento

Arquivo: `app/gps_tracking/webapp/view/fragments/page2/DetailMain.fragment.xml`

- Usa `sap.m.ScrollContainer` para evitar que o conteúdo seja cortado.
- `VBox` com `visible="{= !!${page2>/selectedRoute} }"` garante que os cards só aparecem quando uma rota é escolhida.
- `VBox id="headerCardHost"` é o placeholder onde o controller insere o Integration Card do cabeçalho.
- `HBox` com `items="{metricsTiles>/items}"` renderiza múltiplos `GenericTile` (uma tile por métrica) usando o modelo `metricsTiles`.

## 2. Controller – `Page2.controller.js`

### Modelos iniciais
```js
this._analyticsModel = new JSONModel(emptyAnalytics());
this.getView().setModel(this._analyticsModel, "analytics");

this._metricsTilesModel = new JSONModel({ items: [] });
this.getView().setModel(this._metricsTilesModel, "metricsTiles");
```

### Card de cabeçalho
- Criado dinamicamente em `_ensureHeaderCard()` com `sap/ui/integration/widgets/Card`.
- Manifest: `app/gps_tracking/webapp/cards/header-info.card.json`.
- Parâmetros formatados por `buildHeaderCardParams(route)` e aplicados via `_setHeaderParameters()` + `card.setParameters(...)`.

### Tiles de métricas
- Função `buildMetricsTiles(metrics, hasRoute)` retorna um array de objetos `{ title, subtitle, value, unit, valueColor }`.
- Modelo `metricsTiles` recebe `{ items: [...] }`; o `HBox` do fragmento consome esse modelo automaticamente.

### Atualização geral
```js
_updateVisuals() {
  this._ensureHeaderCard();
  const route = this.getView().getModel("page2").getProperty("/selectedRoute");
  const metrics = this._analyticsModel.getData() || emptyAnalytics();

  this._setHeaderParameters(buildHeaderCardParams(route));
  this._metricsTilesModel.setData({ items: buildMetricsTiles(metrics, Boolean(route)) });
}
```

- Chamado no `onInit`, após selecionar uma rota (`onRoutePress`) e quando `_loadAnalytics` conclui.

## 3. Manifest do card de cabeçalho

Arquivo: `app/gps_tracking/webapp/cards/header-info.card.json`

```json
{
  "_version": "1.16.0",
  "sap.app": { "type": "card" },
  "sap.card": {
    "type": "Object",
    "configuration": {
      "parameters": {
        "titulo": { "value": "Selecione uma rota" },
        "descricao": { "value": "Escolha um transporte para visualizar detalhes." },
        "transporte": { "value": "-" },
        "codigo": { "value": "-" }
      }
    },
    "header": {
      "title": "{{parameters.titulo}}",
      "subTitle": "{{parameters.descricao}}"
    },
    "content": {
      "groups": [
        {
          "title": "Transporte",
          "items": [
            { "label": "Nome", "value": "{{parameters.transporte}}" },
            { "label": "Código", "value": "{{parameters.codigo}}" }
          ]
        }
      ]
    }
  }
}
```

## 4. Como adicionar novas métricas (tiles)

1. Edite `buildMetricsTiles` no controller e adicione objetos ao array.
2. Defina `title`, `subtitle`, `value`, `unit`, `valueColor`.
3. O `HBox` do fragmento renderiza automaticamente os novos tiles.

## 5. Observações gerais

- UI5 carregado via `https://ui5.sap.com` (1.120.x). Propriedades mais recentes foram substituídas por alternativas compatíveis (`noDataText` em vez de `emptyIndicatorText`).
- O tamanho dos cards é definido ao criar o `Card` no controller (`height: "15rem"`). Ajuste lá conforme necessário.
- Ao destruir a view (`onExit`), o controller chama `destroy()` no card para evitar leaks.

Essa documentação deve ajudar a lembrar onde ajustar cartas, manifestos e lógica de métricas na Page2.
