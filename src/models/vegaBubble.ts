var vegaBubble = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description: "A bubble plot showing the correlation between health and income for 187 countries in the world (modified from an example in Lisa Charlotte Rost's blog post 'One Chart, Twelve Charting Libraries' --http://lisacharlotterost.github.io/2016/05/17/one-chart-code/).",
  width: window.innerWidth/1.25 - 100,
  height: window.innerHeight/1.8 - 60,
  data: {
    values: [],
  },
  transform:[
    {
      type: "aggregate",

      fields: ["created_at", "created_at"],

      ops: ["min", "max"],

      as: ["min_created_at", "max_created_at"]
    }
  ],
  params: [
    {
      name: "view",
      select: "interval",
      bind: "scales"
    },
    {
      name: 'timeline',
      select: {type: "interval", encodings: ["x"]},
      bind: {input: 'range', min: 'min_created_at', max: 'max_created_at'},
    }
  ],
  mark: "circle",
  encoding: {
    y: {
      field: "frequency",
      type: "quantitative",
    },
    x: {
      field: "created_at",
      type: "temporal",
      scale: {"domain": {param: "timeline"}},
    },
    size: {field: "frequency", type: "quantitative"},
    // color: {value: "#000"}
  }
}

export default vegaBubble;



