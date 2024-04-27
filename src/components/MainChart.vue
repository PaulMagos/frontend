<template>
  <v-container class="elevation-2">
    <v-row>
      <!-- DIALOG -->
      <v-dialog
          ref="menu"
          :close-on-content-click="false"
          v-model="modal"
          fullscreen
      >
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
              <div class="text-h4 text-medium-emphasis">
                WordCloud
              </div>
              <v-btn
                flat
                color="error"
                icon="mdi-close-circle-outline"
                variant="text"
                @click="modal = false"
              >
              </v-btn>
          </v-card-title>
          <v-divider class="mb-4"></v-divider>
          <WordChartWrapper :theme="this.theme" :days="this.days"></WordChartWrapper>
        </v-card>
      </v-dialog>
      <!--  VEGA LITE CHART -->
      <v-col cols="9" id="vis">
      </v-col>
      <!-- MENU OPTIONS -->
      <v-col cols="3">
        <v-card class="py-2" >
          <v-card-title>
            <span>Split</span>
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
import carbon101 from "@/models/carbon101";
import googlechartsTheme from "@/models/googlecharts";
import tweets from "@/data/all_tweets_with_sentiment.json"
import vegaModel from "@/models/vegaModel"
export default defineComponent({
  name: 'MainChart',
  props: {
    theme: String,
  },
  watch: {
    theme: function() { // watch it
        console.log(googlechartsTheme)
        this.embed()
    },
    timeModel: function() {
      this.yourVlSpec.vconcat[0].encoding.x.timeUnit.step = this.timeModel
      this.embed()
    }
  },
  data() {
    return{
      filterModel: 'none',
      filterItems: ['none', 'sentiment', 'lang'],
      chartModel: 'bar',
      chartTypes: ['bar', 'area', 'line'],
      timeModel: 1,
      days: [],
      modal: false,
      data: tweets,
      yourVlSpec: vegaModel,
    }
  },
  async created() {
    this.embed()
    this.setFilter(this.filterModel)
  },
  methods: {
    embed(){
      vegaEmbed('#vis',
                toRaw(this.yourVlSpec),
                {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme }
              ).then(result => {
                    result.view.addEventListener('click', (event, item) => {
                      if (item!=null){
                        var clicked = Object.keys(item.datum).map(function(key) {
                          return item.datum[key];
                        })
                        if (clicked.length>1 &&
                            this.chartModel=='bar' &&
                            this.filterModel=='none' &&
                            item.mark.marktype!='path' &&
                            item.description.startsWith('created_at')
                          ){
                          let currentDate = clicked[0];
                          this.days = []
                          for (let i = 0; i < this.timeModel; i++) {
                            this.days.push(new Date(currentDate.getTime()));
                            currentDate.setDate(currentDate.getDate() + 1);
                          }
                          this.modal = true
                        }
                        }
                    });
                }).catch(console.warn);
    },

    parseData(min = 15){
      var new_data = [];
      this.data.forEach(element1 => {
        if (element1.lang != 'all'){
          if (element1.total < min){
            var pos = new_data.findIndex((element) => element.lang == 'other' && element.created_at == element1.created_at && element.sentiment=='positive')
            var neg = new_data.findIndex((element) => element.lang == 'other' && element.created_at == element1.created_at && element.sentiment=='negative')
            var neutral = new_data.findIndex((element) => element.lang == 'other' && element.created_at == element1.created_at && element.sentiment=='neutral')
            if (pos == -1){
              new_data.push({created_at: element1.created_at, sentiment: 'positive', lang: 'other', value: element1.positive})
            }else{
              new_data[pos] = {created_at: element1.created_at, sentiment: 'positive', lang: 'other', value: element1.positive + new_data[pos].value}
            }
            if (neg == -1){
              new_data.push({created_at: element1.created_at, sentiment: 'negative', lang: 'other', value: element1.negative})
            }else{
              new_data[neg] = {created_at: element1.created_at, sentiment: 'negative', lang: 'other', value: element1.negative + new_data[neg].value}
            }
            if (neutral == -1){
              new_data.push({created_at: element1.created_at, sentiment: 'neutral', lang: 'other', value: element1.neutral})
            }else{
              new_data[neutral] = {created_at: element1.created_at, sentiment: 'neutral', lang: 'other', value: element1.neutral + new_data[neutral].value}
            }
          }else{
            new_data.push({created_at: element1.created_at, sentiment: 'negative', lang: element1.lang, value: element1.negative})
            new_data.push({created_at: element1.created_at, sentiment: 'neutral', lang: element1.lang, value: element1.neutral})
            new_data.push({created_at: element1.created_at, sentiment: 'positive', lang: element1.lang, value: element1.positive})
          }
        }
      });
      new_data = new_data.sort(function(first, second) {
        return (first.created_at - second.created_at) - (first.value - second.value);
      });
      this.yourVlSpec.data.values = new_data
    },
    onResize() {
      this.yourVlSpec.vconcat[0].width = window.innerWidth/2  - 100
      this.yourVlSpec.vconcat[1].width = window.innerWidth/2  - 100
      this.yourVlSpec.vconcat[0].height = window.innerHeight/2  - 50
      this.embed()
    },
    setFilter(filter) {
      this.embed()
      if (filter=='none'){
        this.yourVlSpec.vconcat[0].encoding.color.condition.legend = null
      }else{
        this.yourVlSpec.vconcat[0].encoding.color.condition.legend = []
      }
      this.yourVlSpec.vconcat[0].encoding.order.field = filter
      this.yourVlSpec.vconcat[0].encoding.color.condition.field = filter
      this.yourVlSpec.vconcat[0].encoding.color.title = filter
    },
    setChart(chart) {
      this.embed()
      this.yourVlSpec.vconcat[0].mark.type = chart
    },
    setInterval(time){
      this.embed()
      this.yourVlSpec.vconcat[0].encoding.x.timeUnit.step = this.timeModel
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.parseData()


    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.embed()
    })
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
