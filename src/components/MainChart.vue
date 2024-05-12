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
      <div id="vis">
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
          <v-btn-toggle v-model="filterModel" shaped mandatory color="secondary">
            <!-- <v-btn style="height: 35px;" depressed rounded @click="setFilter(filter)" v-for="filter in filterItems" :value="filter" flat> -->
            <v-btn style="height: 35px;" depressed rounded v-for="filter in filterItems" :value="filter" flat>
              <v-icon v-if="filter==`sentiment`">mdi-human</v-icon>
              <v-icon v-else-if="filter==`none`">mdi-cancel</v-icon>
              <v-icon v-else>mdi-flag-variant</v-icon>
                <v-tooltip v-if="filter==`sentiment`"
                  activator="parent"
                  location="bottom"
                >Sentiment</v-tooltip>
                <v-tooltip v-if="filter==`none`"
                  activator="parent"
                  location="bottom"
                >None</v-tooltip>
                <v-tooltip v-if="filter==`lang`"
                  activator="parent"
                  location="bottom"
                >Language</v-tooltip>
            </v-btn>
          </v-btn-toggle>
        </v-card>
        <v-card elevation="0" class="px-2">
            <v-card-subtitle class="d-flex justify-center">
              <span>Chart Type</span>
            </v-card-subtitle>
            <v-btn-toggle v-model="chartModel" shaped mandatory color="primary">
              <v-btn style="height: 35px;" depressed rounded @click="setChart(chart)" v-for="chart in chartTypes" :value="chart" flat>
                <v-icon v-if="chart!=`area`">mdi-chart-{{ chart }}</v-icon>
                <v-icon v-else>mdi-chart-areaspline</v-icon>
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
            <v-btn-toggle v-model="timeModel" shaped mandatory color="success">
              <v-btn style="height: 35px;"  depressed rounded value='day' flat>
                <span>D</span>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >Day</v-tooltip>
              </v-btn>
              <v-btn style="height: 35px;"  depressed rounded value='week' flat>
                <span>W</span>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >Week</v-tooltip>
              </v-btn>
              <v-btn style="height: 35px;"  depressed rounded value='month' flat>
                <span>M</span>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >Month</v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-card>
      </v-bottom-navigation>
</template>


<script>
import vegaEmbed from 'vega-embed'
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
    timeModel: async function() {
      await this.syncMyData()
    },
    filterModel: async function() {
      if (this.filterModel=='none'){
        this.yourVlSpec.encoding.color.legend = null
      }else{
        this.yourVlSpec.encoding.color.legend = []
      }
      this.yourVlSpec.encoding.order.field = this.filterModel
      this.yourVlSpec.encoding.color.field = this.filterModel
      this.yourVlSpec.encoding.color.title = this.filterModel
      await this.syncMyData()
    }
  },
  data() {
    return{
      filterModel: 'none',
      filterItems: ['none', 'sentiment', 'lang'],
      chartModel: 'bar',
      chartTypes: ['bar', 'area', 'line'],
      timeModel: 'week',
      days: [],
      modal: false,
      data: null,
      yourVlSpec: vegaModel,
    }
  },
  async created() {
    this.syncMyData()
  },
  methods: {
    embed(){
      let time = this.timeModel == 'day'? 1: this.timeModel=='week'? 7:31
      vegaEmbed('#vis',
                toRaw(this.yourVlSpec),
                {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme }
              ).then(result => {
                    result.view.addEventListener('click', (event, item) => {
                      if (item!=null && item.datum!=null){
                        var clicked = Object.keys(item.datum).map(function(key) {
                          return item.datum[key];
                        })
                        if (clicked.length>1 &&
                            this.chartModel=='bar' &&
                            this.filterModel=='none' &&
                            item.mark.marktype!='path' &&
                            item.description.startsWith('created_at')
                          ){
                          let currentDate = toRaw(clicked[0]);
                          if (this.timeModel=='month'){
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
                    });
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
      let type = this.filterModel == 'sentiment'? 'all': ''
      let lang = this.filterModel == 'lang'? 'all' : ''
      this.data = (await axios.get(`/get_tweets?group=${this.timeModel}&type=${type}&lang=${lang}`)).data
      while (this.data==undefined){
          setTimeout(() => {
          }, (500));
      }
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
