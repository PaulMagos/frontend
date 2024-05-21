<template>
    <Loading v-if="this.loading"></Loading>
    <v-container v-else id="my_dataviz">
    </v-container>
</template>

<script lang="ts">
import Loading from './Loading.vue'
import { defineComponent, toRaw } from 'vue'
import axios from 'axios'
import * as d3 from "d3";

function stackMax(layer) {
  return d3.max(layer, function(d) {
    return d3.max(d, (r) => {
      return r[1]
    })
  });
}

function stackMin(layer) {
  return d3.min(layer, function(d) {
    return d3.min(d, (r) => {
      return r[0]
    })
  });
}

export default defineComponent({
  name: 'StreamChart',
  props:{
    theme: String,
    data: Array,
    aggredated_data: Array,
    lang: String,
    kindOfWords: String,
    loading: Boolean,
  },
  watch:{
    data: function(old_val, new_val){
      if (old_val!=undefined){
        this.calculateFreq()
        this.embed()
      }
    },
  },
  data(){
    return{
      svg: null,
      total_frequencies: {},
    }
  },
  created(){
  },
  methods:{
    get_width(){
      return window.innerWidth/1.5
    },
    get_height(){
      return window.innerHeight
    },
    calculateFreq(){
      this.aggredated_data.forEach(element => {
        this.total_frequencies[element.word] = element.frequency
      });
    },
    async embed(){
      var data = toRaw(this.data)
      data.columns = Object.keys(data[0])

      const x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {return d.created_at}))
        .range([ 30, this.get_width() -20 ]);

      var g = this.svg.select("g").empty()? this.svg.append('g') : this.svg.select('g')

      g
      .transition().duration(200)
      .attr("transform", `translate(0, ${(this.get_height()*0.7)})`)
      .call(d3.axisBottom(x).tickSize(-this.get_height()*.7))
      .transition().duration(1)
      .select(".domain").remove()

      const keys = data.columns.splice(1)

      this.svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

      // color palette
      const colorer = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemePaired);
      //stack the data?
      const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderNone)
        .keys(keys)
        (toRaw(data))

      const max = stackMax(stackedData)
      const min = stackMin(stackedData)
            // Add Y axis
      const y = d3.scaleLinear()
      .domain([min, max])
      .range([ this.get_height() - 300, 0 ]);

      const theme = this.theme

      const freq = this.total_frequencies

      const tooltip = d3.select("#my_dataviz")
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
        d3.selectAll(".myArea")
        .transition()
        .duration(500)
        .style("opacity", .5)
        d3.select(this)
          .transition()
          .duration(1000)
          .style("stroke", (theme == 'darkTheme')? "white" : "black")
          .style("opacity", 1)
        tooltip
          .transition()
          .duration(1000)
        tooltip
          .style("opacity", 100)
          .html(d.key + '<br>' + 'Frequency: ' + freq[d.key] + ' ' )
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
        d3.selectAll(".myArea").transition()
          .duration(200).style("opacity", 1).style("stroke", "none")
      }

      tooltip.on("mouseover", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      })

      // Area generator
      const area = d3.area()
        .x(function(d) { return x(d.data.created_at); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

      // Show the areas
      this.svg.selectAll('mylayers')
        .data(stackedData, (d) => {d.key})
          .join(
            function(enter){
              d3.selectAll('path')
                .transition().duration(500)
                .style('opacity', 0)
                .remove()
              return enter.append('path')
                          .style('opacity', 0)
                          .transition().duration(500)
                          .style('opacity', 1)
                          .attr('class', 'myArea')
                          .style('fill', (d) => colorer(d.key))
                          .attr("d", area)
              },
          )
          .on("mouseover", showTooltip)
          .on("mousemove", moveTooltip)
          .on("mouseleave", hideTooltip)

    },
    onResize() {
      d3.select("#my_dataviz")
      .select("svg")
      .remove()
      this.svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("viewBox", [0, 0, this.get_width(),  this.get_height()])
      .append("g")
        .attr("transform",
              `translate(0, 0)`);
      this.embed()
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.calculateFreq()
    this.svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("viewBox", [0, 0, this.get_width(),  this.get_height()])
    .append("g")
      .attr("transform",
            `translate(0, 0)`);
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.embed()
    })
  },
})
</script>
