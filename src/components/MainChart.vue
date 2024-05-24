<template>
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
                @click="modal = false; this.syncMyData()"
              >
              </v-btn>
          </v-card-title>
          <v-divider class="mb-4"></v-divider>
          <WordChartWrapper :theme="this.theme" :days="this.days"></WordChartWrapper>
        </v-card>
      </v-dialog>
      <!--  VEGA LITE CHART -->
      <div>
        <v-row>
          <v-col>
            <h1>Tweets downloaded in total: <span>{{ total_tweets }}</span></h1>
            <p>These are all the tweets related to Lampedusa from <b>{{ first_day }}</b> to <b>{{ last_day }}</b></p>
          </v-col>
        </v-row>
        <v-row>
          <div id="vis" cols="10">
          </div>
        </v-row>
      </div>
      <!-- MENU OPTIONS -->
      <v-bottom-navigation
        location="bottom"
        drawer="true"
        order="1"
        elevation="8"
        grow
        >
        <v-card elevation="0" class="px-2">
            <v-card-subtitle class="d-flex justify-center">
              <span>Split</span>
            </v-card-subtitle>
          <v-btn-toggle v-model="filterModel.value" shaped mandatory color="secondary">
            <v-btn style="height: 35px;" depressed rounded v-for="filter in filterModel.filterItems" :value="filter" flat>
              <v-icon>{{ filterModel.filterButtonIcons[filter] }}</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >{{ filterModel.filterButtonTooltip[filter] }}</v-tooltip>
            </v-btn>
          </v-btn-toggle>
        </v-card>
        <v-card elevation="0" class="px-2">
            <v-card-subtitle class="d-flex justify-center">
              <span>Chart Type</span>
            </v-card-subtitle>
            <v-btn-toggle v-model="chartModel.value" shaped mandatory color="primary">
              <v-btn style="height: 35px;" depressed rounded @click="setChart(chart)" v-for="chart in chartModel.chartTypes" :value="chart" flat>
                <v-icon >{{chartModel.chartButtonIcons[chart]}}</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >{{ chart[0].toUpperCase() + chart.slice(1) }}</v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-card>
          <v-card elevation="0" class="px-2">
            <v-card-subtitle class="d-flex justify-center">
              <span>Granularity</span>
            </v-card-subtitle>
            <v-btn-toggle v-model="timeModel.value" shaped mandatory color="success">
              <v-btn style="height: 35px;" v-for="elem in timeModel.timeItems"  depressed rounded :value='elem' flat>
                <span>{{elem[0].toUpperCase()}}</span>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >{{ elem[0].toUpperCase() + elem.slice(1) }}</v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-card>
      </v-bottom-navigation>
</template>


<script>
import vegaEmbed, { vegaLite } from 'vega-embed'
import { defineComponent, toRaw } from 'vue';
import carbon101 from "@/models/carbon101";
import googlechartsTheme from "@/models/googlecharts";
import axios from 'axios';
import vegaModel from "@/models/vegaModel"
export default defineComponent({
  name: 'MainChart',
  props: {
    theme: String,
  },
  watch: {
    theme: function() { // watch it
        this.embed()
    },
    'timeModel.value': async function() {
      await this.syncMyData()
    },
    'filterModel.value': async function() {
      if (this.filterModel.value=='none'){
        this.yourVlSpec.mark.cursor = 'pointer'
        this.yourVlSpec.encoding.color.legend = null
      }else{
        this.yourVlSpec.encoding.color.legend = []
        this.yourVlSpec.mark.cursor = ''
      }
      this.yourVlSpec.encoding.order.field = this.filterModel.value
      this.yourVlSpec.encoding.color.field = this.filterModel.value
      this.yourVlSpec.encoding.color.title = this.filterModel.value
      await this.syncMyData()
    }
  },
  data() {
    return{
      filterModel: {
        value: 'none',
        filterItems: ['none', 'sentiment', 'lang'],
        filterButtonIcons: {'none': 'mdi-cancel', 'sentiment': 'mdi-human', 'lang': 'mdi-flag-variant'},
        filterButtonTooltip: {'none': 'None', 'sentiment': 'Sentiment', 'lang': 'Language'}
      },
      chartModel: {
        value: 'bar',
        chartTypes: ['bar', 'area'],
        chartButtonIcons: {'bar': 'mdi-chart-bar', 'area': 'mdi-chart-areaspline', 'line': 'mdi-chart-line'}
      },
      timeModel: {
        value: 'week',
        timeItems: ['day', 'week', 'month']
      },
      days: [],
      total_tweets: 0,
      first_day: 0,
      last_day: 0,
      modal: false,
      data: null,
      loading: false,
      yourVlSpec: vegaModel,
      embeddedModel: null,
    }
  },
  async created() {
    this.syncMyData()
  },
  methods: {
    embed(){
      let time = this.timeModel.value == 'day'? 1: this.timeModel.value=='week'? 7:31
      this.embeddedModel = vegaEmbed('#vis',
                toRaw(this.yourVlSpec),
                {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme, renderer: "svg"}
              ).then(result => {
                    result.view.addEventListener('click', (event, item) => {
                      if (item!=null && item.datum!=null){
                        var clicked = Object.keys(item.datum).map(function(key) {
                          return item.datum[key];
                        })
                        if (clicked.length>1 &&
                            this.chartModel.value=='bar' &&
                            this.filterModel.value=='none' &&
                            item.mark.marktype!='path' &&
                            item.description.startsWith('created_at')
                          ){
                          let currentDate = toRaw(clicked[0]);
                          if (this.timeModel.value=='month'){
                            time = currentDate.getDate();
                          }
                          this.days = []
                          for (let i = 0; i < time; i++) {
                            this.days.push(new Date(currentDate.getTime()));
                            currentDate.setDate(currentDate.getDate() - 1);
                          }
                          this.days = this.days.slice().reverse()
                          this.modal = true
                        }
                        }
                      }
                    );
                }).catch(console.warn);
    },
    onResize() {
      // this.yourVlSpec.encoding.color.value = this.theme=='darkTheme'? 'white' : 'black'
      this.yourVlSpec.width = window.innerWidth/1.25 - 100
      this.yourVlSpec.height = window.innerHeight/1.8 - 60
      this.embed()
    },
    setChart(chart) {
      this.yourVlSpec.mark.type = chart
      this.embed()
    },
    async syncMyData() {
      let type = this.filterModel.value == 'sentiment'? 'all': ''
      let lang = this.filterModel.value == 'lang'? 'all' : ''
      this.data = (await axios.get(`/get_tweets?group=${this.timeModel.value}&type=${type}&lang=${lang}`)).data
      while (this.data==undefined){
          setTimeout(() => {
            this.loading=true
          }, (500));
      }
      this.loading=false
      this.yourVlSpec.data.values=this.data
      this.embed()
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.$nextTick(async () => {
      window.addEventListener('resize', this.onResize)
      await this.syncMyData()
      this.total_tweets = (this.data.map(elem => elem.value)).reduce((partialSum, a) => partialSum + a, 0)
      this.last_day = this.data.map(elem=> elem.created_at).reduce((max, a) => max<a? a:max, 0)
      this.first_day = this.data.map(elem=> elem.created_at).reduce((min, a) => min>a? a:min, this.last_day)
      this.first_day = new Date(this.first_day).toDateString()
      this.last_day = new Date(this.last_day).toDateString()
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
