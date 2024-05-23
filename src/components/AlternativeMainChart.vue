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
          <v-card>
            <v-card-title>
               <h3>Tweets downloaded in total: <span>{{ total_tweets }}</span></h3>
            </v-card-title>
            <v-card-subtitle>These are all the tweets related to Lampedus from <b>{{ first_day }}</b> to <b>{{ last_day }}</b></v-card-subtitle>
          </v-card>
          <v-col>
            <v-row>
              <div id="visV2"></div>
            </v-row>
            <v-row>
              <div id="slider-range"></div>
            </v-row>
          </v-col>
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
import { defineComponent, toRaw} from 'vue';
import * as d3 from "d3";
import axios from 'axios';
import { sliderBottom, sliderTop} from 'd3-simple-slider';

var margin = {top: 10, right: 30, bottom: 90, left: 40}
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
        chartTypes: ['bar', 'area', 'line'],
        chartButtonIcons: {'bar': 'mdi-chart-bar', 'area': 'mdi-chart-areaspline', 'line': 'mdi-chart-line'}
      },
      timeModel: {
        value: 'week',
        timeItems: ['day', 'week', 'month']
      },
      days: [],
      modal: false,
      data: null,
      total_tweets: 0,
      first_day: 1000000000000,
      last_day: 0,
      val: null,
      svg: null,
      gRange: null,
      loading: false,
      embeddedModel: null,
    }
  },
  async created() {
  },
  methods: {
    get_width(){
      return window.innerWidth
    },
    get_height(){
      return window.innerHeight/1.5
    },
    embed(data_){
      var data = this.data
      if (data_!=undefined){
        data = data_
      }
      const theme = this.theme
      const filter = this.filterModel.value
      var openModal = this.openModal
      const langDomain = data.map(e => e.lang)
      const SentimentColors = {'positive': '#377eb8', 'negative': '#e41a1c', 'neutral': '#4daf4a'}
      var color = function(d) {
        if (filter=='none')
          return theme=='darkTheme'? 'white' : '#008afa'
        else if(filter=='sentiment'){
          return SentimentColors[d.sentiment]
        }else if(filter=='lang'){
          const colors = d3.scaleOrdinal(d3.schemeAccent)
          .domain(langDomain)
          .unknown("#ccc");
          return colors(d.lang)
        }
      }

      const x = d3.scaleBand()
      .domain(data.map(d => d.created_at))
      .range([ margin.left, this.get_width()-margin.right*7])
        .padding(0.2).round(true)

      var axis = d3.axisBottom(x).tickFormat(d3.timeFormat('%B %d')).tickValues(x.domain().filter(function(d,i){ return !(i%2)}));
      if (this.timeModel.value=='month'){
        axis = d3.axisBottom(x).tickFormat(d3.timeFormat('%Y %B'))
      }else if (this.timeModel.value=='day'){
        axis = d3.axisBottom(x).tickFormat(d3.timeFormat('%m-%d')).tickValues(x.domain().filter(function(d,i){ return !(i%6)}));
      }

      if(this.svg.select(".myXAxis").empty()){
        this.svg.append("g")
          .attr('class', 'myXAxis')
          .attr("transform", `translate(0, ${this.get_height()-margin.bottom})`)
          .call(axis)
      }else{
        this.svg.select(".myXAxis")
          .transition()
          .duration(500)
          .attr("transform", `translate(0, ${this.get_height()-margin.bottom})`)
          .call(axis)
      }

      if(this.gRange.select(".myXAxis").empty()){
        this.gRange.append("g")
          .attr('class', 'myXAxis')
          .attr("transform", `translate(0, 0)`)
          .call(axis)
      }else{
        this.gRange.select(".myXAxis")
          .transition()
          .duration(500)
          .attr("transform", `translate(0, 0)`)
          .call(axis)
      }

      var max = 0
      data.forEach(elem => {
        if (max<elem.end){
          max = elem.end
        }
      })
      const y = d3.scaleLinear()
        .domain([0, max])
        .range([ this.get_height()-margin.bottom, 0]);
      const yBrush = d3.scaleLinear()
        .domain([0, max])
        .range([ 90, 0]);

      if(this.svg.select(".myYaxis").empty()){
        this.svg.append("g")
          .attr('class', 'myYaxis')
          .call(d3.axisLeft(y));
      }else{
        this.svg.select(".myYaxis")
          .transition()
          .duration(500)
          .call(d3.axisLeft(y))
      }

      if(this.gRange.select(".myYaxis").empty()){
        this.gRange.append("g")
          .attr('class', 'myYaxis')
          .call(d3.axisLeft(yBrush));
      }else{
        this.gRange.select(".myYaxis")
          .transition()
          .duration(500)
          .call(d3.axisLeft(yBrush))
      }


      const height = this.get_height()-margin.bottom
      function enterAnim(enter, x, y){
        enter
          .append('rect')
          .transition()
          .duration(500)
            .attr("x", d => x(d.created_at))
            .attr("y", d => y(0))
            .attr("width", 0)
            .attr("height", d => height - y(0))
            .attr("fill", d => color(d))
          .transition()
          .duration(500)
            .style('opacity', 100)
            .attr("x", d => x(d.created_at))
            .attr("y", d => y(d.end))
            .attr("width", x.bandwidth())
            .attr("height", d => y(d.start) - y(d.end))
            .delay(function(d,i){return(i*5)})
            .attr("fill", d => color(d))
        enter.selectAll('rect')
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
        if (filter == 'none'){
            enter.selectAll('rect')
                .on("click", (event, d) => openModal(d))
        }
      }

      function updateAnim(svg, x, y){
        svg
          .transition()
          .duration(500)
            .style('opacity', 100)
            .attr("x", d => x(d.created_at))
            .attr("y", d => y(d.end))
            .attr("width", x.bandwidth())
            .attr("height", d => y(d.start) - y(d.end))
            .delay(function(d,i){return(i*5)})
            .attr("fill", d => color(d))
        svg.selectAll('rect')
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
        if (filter == 'none'){
          svg.selectAll('rect')
              .on("click", (event, d) => openModal(d))
        }
      }

      function removeAnim(exit, x, y){
        exit
          .transition().duration(800)
          .attr("y", d => y(0))
          .attr("height", d => height - y(0))
          .style('opacity', 0).remove()
      }



      const tooltip = d3.select("#visV2")
        .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background-color", "#16202b")
          .style("border-radius", "10px")
          .style("border", "solid")
          .style("border-color", 'white')
          .style("padding", "10px")
          .style("color", "white")


      // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
      const showTooltip = function(event, d) {
          d3.selectAll("rect")
          .transition()
          .duration(500)
          .style("opacity", .5)
          d3.select(this)
            .transition()
            .duration(500)
            .style("stroke", (theme == 'darkTheme')? "white" : "#14202B")
            .style("opacity", 1)
          tooltip
            .transition()
            .duration(1000)
          var text = 'Tweets: ' + d.value + ' '
          if (filter == 'sentiment'){
            text = text + '<br>' + 'Sentiment: ' + d.sentiment
          }
          if (filter == 'lang'){
            text = text + '<br>' + 'Language: ' + d.lang
          }
          tooltip
            .style("opacity", 100)
            .html(text)
            .style("left", (event.x) + "px")
            .style("top", (event.y) + "px")
      }
      const moveTooltip = function(event, d) {
          tooltip
            .style("left", (event.x) + "px")
            .style("top", (event.y) + "px")
      }
      const hideTooltip = function(event, d) {
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
          d3.selectAll("rect").transition()
            .duration(200).style("opacity", 1).style("stroke", "none")
      }

      this.svg
        .selectAll('rect')
        .data(data, d => d.created_at)
        .join(
          enter => enterAnim(enter, x, y),
          update => updateAnim(update, x, y),
          exit => removeAnim(exit, x, y)
        )

      this.gRange.selectAll("rect")
      .datum(data, d => d.created_at)
      .join(
        enter => enterAnim(enter, x, yBrush),
        update => updateAnim(update, x, yBrush),
        exit => removeAnim(exit, x, yBrush),
      )

      // this.gRange
      //   .append("g")
      //   .attr("class", "brush")
      //   .call(d3.brushX().on("brush", console.log('brush')));
    },
    openModal(d){
        let currentDate = new Date(d.created_at);
        let time = this.timeModel.value == 'day'? 1: this.timeModel.value=='week'? 7 : 31
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
    },
    onResize() {
      d3.select("#visV2").select('svg')
        .attr("width", this.get_width())
        .attr("height", this.get_height());
      d3.select('#slider-range')
        .select('svg')
        .attr('width', this.get_width())
        .attr("height", 100);
      this.embed()
    },
    setChart() {
      this.embed()
    },
    async syncMyData() {
      let type = this.filterModel.value == 'sentiment'? 'all': ''
      let lang = this.filterModel.value == 'lang'? 'all' : ''
      this.data = (await axios.get(`/get_tweets?group=${this.timeModel.value}&type=${type}&lang=${lang}&pivot=true`)).data
      while (this.data==undefined){
          setTimeout(() => {
            this.loading=true
          }, (500));
      }
      this.loading=false
      this.embed()
    },
    initialize(){
      this.svg = d3.select("#visV2")
        .append("svg")
          .attr("width", this.get_width())
          .attr("height", this.get_height())
        .append("g")
          .attr("transform", `translate(100, 0)`);
      this.gRange = d3
        .select('#slider-range')
        .append('svg')
        .attr('width', this.get_width())
        .attr('height', 100).append('g')
        .attr('transform', 'translate(90, 0)');

    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.initialize()
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
