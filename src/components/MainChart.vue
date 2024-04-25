<template>
  <v-container class="elevation-2">
    <v-row>
      <v-col cols="9" id="vis">
      </v-col>
      <v-col cols="3">
        <v-card class="py-2" >
          <v-card-title>
            <span>Filter</span>
          </v-card-title>
          <v-card-text>
          <v-btn-toggle v-model="filterModel" shaped mandatory color="secondary">
            <v-btn depressed rounded @click="setFilter(filter)" v-for="filter in filterItems" :value="filter" flat>
              <v-icon v-if="filter==`sentiment`">mdi-human</v-icon>
              <v-icon v-else-if="filter==`none`">mdi-cancel</v-icon>
              <v-icon v-else>mdi-flag-variant</v-icon>
            </v-btn>
          </v-btn-toggle>

          </v-card-text>
          <v-card-title>
            <span>Chart</span>
          </v-card-title>
          <v-card-text>

            <v-btn-toggle v-model="chartModel" shaped mandatory color="primary">
              <v-btn depressed rounded @click="setChart(chart)" v-for="chart in chartTypes" :value="chart" flat>
                <v-icon v-if="chart!=`area`">mdi-chart-{{ chart }}</v-icon>
                <v-icon v-else>mdi-chart-areaspline</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-card-text>
          <v-card-title>
            <span>Granularity</span>
          </v-card-title>
          <v-card-text>
              <v-slider v-on:dblclick="timeModel=1"
              density="compact" class="py-8" thumb-label
              thumb-color="secondary"
              show-ticks="always" v-model="timeModel"
              :min="1" :max="31" :step="1" color="info">
              <template v-slot:append>
                <v-text-field
                v-model="timeModel"
                density="compact"
                style="width: 80px"
                type="number"
                variant="outlined"
                hide-details
                ></v-text-field>
              </template>
            </v-slider>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import vegaEmbed from 'vega-embed'
import { defineComponent, toRaw } from 'vue';
import { MainStore } from "../store/app";
import { mapStores } from 'pinia';
import carbon101 from "../models/carbon101";
import googlechartsTheme from "../models/googlecharts";

export default defineComponent({
  name: 'MainChart',
  props: {
    theme: String,
  },
  watch: {
    theme: function() { // watch it
        console.log(googlechartsTheme)
        vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
    },
    timeModel: function() {
      this.yourVlSpec.vconcat[0].encoding.x.timeUnit.step = this.timeModel
      vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
    }
  },
  data() {
    return{
      filterModel: 'sentiment',
      filterItems: ['sentiment', 'lang', 'none'],
      chartModel: 'bar',
      chartTypes: ['bar', 'area', 'line'],
      timeModel: 1,
      yourVlSpec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'A simple bar chart with embedded data.',
        data: {
          values: []
        },
        vconcat: [
          {
            width: window.innerWidth/2 - 100,
            height: window.innerHeight/2 - 50,
            mark: {type: 'bar', point: false, cornerRadiusEnd: 4, tooltip: true},
            transform: [{filter: {param: "date"}}],
            encoding: {
              x: {
                field: "created_at",
                type: "ordinal",
                axis: {title: ""},
                timeUnit: {unit: "yearmonthdate", step: this.timeModel},
              },
              y: {
                aggregate: "sum",
                field: 'value', type: 'quantitative', title: '# of Tweets',
                // stack: 'center'
              },
              order: {field: 'sentiment', type: "nominal", legend: []},
              color: {
                field: 'sentiment',
                type: "nominal",
                scale: {
                  // scheme: 'category10',
                },
                title: 'Sentiment',
              }
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
      },
    }
  },
  async created() {
    vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
  },
  methods: {
    onResize() {
      this.yourVlSpec.vconcat[0].width = window.innerWidth/2  - 100
      this.yourVlSpec.vconcat[1].width = window.innerWidth/2  - 100
      this.yourVlSpec.vconcat[0].height = window.innerHeight/2  - 50
      vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
    },
    setFilter(filter) {
      vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
      if (filter=='none'){
        this.yourVlSpec.vconcat[0].encoding.color.legend = null
      }else{
        this.yourVlSpec.vconcat[0].encoding.color.legend = []
      }
      this.yourVlSpec.vconcat[0].encoding.order.field = filter
      this.yourVlSpec.vconcat[0].encoding.color.field = filter
      this.yourVlSpec.vconcat[0].encoding.color.title = filter
    },
    setChart(chart) {
      vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
      this.yourVlSpec.vconcat[0].mark.type = chart
    },
    setInterval(time){
      vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
      this.yourVlSpec.vconcat[0].encoding.x.timeUnit.step = this.timeModel
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    await this.mainStore.get_data()
    this.yourVlSpec.data.values = this.mainStore.data


    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      vegaEmbed('#vis', toRaw(this.yourVlSpec), {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme })
    })
  },
  computed: {
    ...mapStores(MainStore),
  },
})
</script>

<style>
div.btn__content {
  padding: 0;
}

div.btn {
  min-width: 100px;
}
</style>
