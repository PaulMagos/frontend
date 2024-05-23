<template>
    <Loading v-if="this.loading"></Loading>
    <v-container v-else id="my_dataviz">
    </v-container>
</template>

<script lang="ts">
import Loading from './Loading.vue'
import { defineComponent, toRaw } from 'vue'
import * as d3 from "d3";



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
      console.log(new_val, new_val[0])
      if (new_val!=undefined){
        this.calculateFreq()
        this.embed()
      }
    },
  },
  data(){
    return{
      svg: null,
      total_frequencies: {},
      paths: null,
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
      const keys = data.columns.splice(1)
      const theme = this.theme
      const freq = this.total_frequencies

      const stack_data = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderNone)
        .keys(keys)
        (toRaw(data))

      function stackMax(layer) {
        return d3.max(layer, function(d) {
          return d3.max(d, (r) => {
            return r[1]
          })
        });
      }

      const max = stackMax(stack_data)

      const x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {return d.created_at}))
        .range([ 0, this.get_width()-20 ]);
            // Add Y axis
      const y = d3.scaleLinear()
        .domain([-max, max])
        .range([ this.get_height()*0.7, 0]);

      const z = d3.interpolateCool;
      // Area generator
      var area = d3.area()
        .x(function(d) {return x(d.data.created_at);})
        .y0(function(d) {return y(d[0]);})
        .y1(function(d) {return y(d[1]);})


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
        d3.selectAll("path")
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
        d3.selectAll("path").transition()
          .duration(200).style("opacity", 1).style("stroke", "none")
      }

      tooltip.on("mouseover", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      })

      function enterFunc(enter){
        enter.append('path')
          .style('opacity', 0)
          .call(g =>
            g.transition().duration(1500)
              .style('opacity', 1)
          )
          .call(g =>
            g
            .attr("d", area)
            .attr("fill", () => z(Math.random()))
          )
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
      }
      function updateFunc(update){
        update
          .call(g =>
            g
            .transition().duration(1500)
            .attr("d", area)
            .attr("fill", () => z(Math.random()))
          )
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
      }
      function exitFunc(exit){
        exit
          .call(g =>
          {
            g.transition().duration(1000)
                .style('opacity', 0)
              .remove()
            }
          )
      }
      this.path = this.svg.selectAll("path")
        .data(stack_data)
        .join(
          enter => enterFunc(enter),
          update => updateFunc(update),
          exit => exitFunc(exit)
        )


        var g = this.svg.select("g").empty()? this.svg.append('g') : this.svg.select('g')

        g
        .transition().duration(1000)
        .attr("transform", `translate(0, ${(this.get_height()*0.7)})`)
        .call(d3.axisBottom(x).tickSize(-this.get_height()*.7))
        .transition().duration(1)
        .select(".domain").remove()

        this.svg.selectAll(".tick line").attr("stroke", "#b8b8b8")
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
  mounted() {
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
