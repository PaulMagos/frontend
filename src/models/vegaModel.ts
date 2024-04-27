var vegaModel = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description: 'A simple bar chart with embedded data.',
  data: {
    values: []
  },
  vconcat: [
    {
      width: window.innerWidth/2 - 100,
      height: window.innerHeight/2 - 50,
      mark: {
        type: 'bar',
        point: false,
        cornerRadiusEnd: 4,
        tooltip: true,
      },
      selection: {
        series: {
          type: "multi",
          toggle: true,
          encodings: ["color"],
          on: "dbclick",
          bind: "legend",
        },
        paintbrush: {
          type: "point",
          on: "pointerover",
        }
      },
      transform: [{filter: {param: "date"}}],
      encoding: {
        x: {
          field: "created_at",
          type: "ordinal",
          axis: {title: ""},
          timeUnit: {unit: "yearmonthdate", step: 1},
        },
        y: {
          aggregate: "sum",
          field: 'value', type: 'quantitative', title: '# of Tweets',
        },
        opacity: {
          condition: {selection: "series", value: 1},
          value: 0.2
        },
        order: {field: 'sentiment', type: "nominal", legend: []},
        color: {
          // field: 'sentiment',
          // type: "nominal",
          condition:{
            field: "sentiment", type: "nominal",
            param: 'paintbrush',
          },
          value: 'grey',
          // scale: {
            // scheme: 'category10',
          // },
          title: 'Sentiment',
        },
      }
    },
    {
      width: window.innerWidth/2 - 100,
      height: 60,
      encoding: {x: {field: "created_at", type: "temporal"}},
      layer: [
        {
          mark:  {type: "bar", cornerRadiusEnd: 4},
          encoding: {
            y: {field: "value", type: "quantitative"},
            color: {field: "sentiment", type: "nominal", legend: null}
          }
        },
        {
          params: [
            {
              name: "index",
              select: {
                type:"point",
                encodings: ["x"],
                on: "pointermove",
                nearest: true
              }
            }
          ],
          mark: {type: "point"},
          encoding: {
            y: {field: "value", type: "quantitative"},
            opacity: {value: 0}
          }
        },
        {
          transform: [{filter: {and: ["index.created_at", {param: "index"}]}}],
          mark: "rule",
          encoding:{
            color: {field: "created_at", type: "temporal", legend: null}
          }
        },
        {
          transform: [{filter: {and: ["index.created_at", {param: "index"}]}}],
          mark: "text",
          encoding: {
            y: {value: 10},
            text: {field: "created_at", type: "temporal", legend: null},
            color: {field: "created_at", type: "nominal", legend: null}
          }
        },
        {
            mark: {type: "bar", cornerRadiusEnd: 4},
            params: [
              {name: "date", select: {type: "interval", encodings: ["x"]}}
            ],
            encoding: {
              x: {field: "created_at", type: "temporal", title: 'Date', legend: null,},
              y: {
                aggregate: "sum", field: 'value',
                type: "quantitative",
                axis: {tickCount: 3, grid: false, title: 'Timeline Filter'}, legend: null
              },
            },
          },
          {
            transform: [{filter: {param: "date"}}],
            mark: {type: "bar", cornerRadiusEnd: 4},
            encoding: {
              x: {field: "created_at", type: "temporal", title: 'Date', legend: null,},
              y: {
                aggregate: "sum", field: 'value',
                type: "quantitative",
                axis: {tickCount: 3, grid: false, title: 'Timeline Filter'}, legend: null
              },
              color: {value: "orange", legend: null}
            }
          }
        ],
        config: {text: {align: "right", dx: -5, dy: 5}}
    }
  ],
  config: {},
}

export default vegaModel;
