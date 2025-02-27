var vegaModel = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description: 'A simple bar chart with embedded data.',
  data: {
    name: 'table',
    values: []
  },
    width: window.innerWidth/1.25 - 100,
    height: window.innerHeight/1.8 - 60,
    mark: {
      type: 'bar',
      // point: false,
      cornerRadiusEnd: 4,
      tooltip: true,
      stroke: "black",
      cursor: "pointer"
    },
    selection: {
      series: {
        type: "multi",
        toggle: true,
        encodings: ["color"],
        on: "dbclick",
        bind: "legend",
      },
      highlight: {
        type: 'point',
        on: 'pointerover'
      }
    },
    encoding: {
      tooltip: [
        {field: "value", type: "quantitative", title: 'Tweets'},
        {field: "sentiment", type: "nominal", title: 'Sentiment'},
        {field: "lang", type: "nominal", title: 'Language'}
      ],
      x: {
        field: "created_at",
        type: "ordinal",
        scale: {},
        axis: {title: "Date"},
        timeUnit: {unit: "yearmonthdate", step: 1},
      },
      y: {
        aggregate: "sum",
        field: 'value', type: 'quantitative', title: '# of Tweets',
      },
      opacity: {
        condition: {selection: "series", value: 1},
        value: 0.1
      },
      order: {
        field: 'sentiment',
        scale: {
          domain: [
            'negative',
            'positive',
            'neutral',
          ]
        },
        legend: []
      },
      strokeWidth: {
        condition: [
          {
            param: "highlight",
            empty: false,
            value: 4
          }
        ],
        value: 0
      },
      color: {
        legend: null,
        scale:{

        },
        field: "sentiment",
        type: "nominal",
        title: 'Sentiment',
      },
    }
}

export default vegaModel;
