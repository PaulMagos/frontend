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

const margin = {top: 20, right: 30, bottom: 50, left: 60}

function stackMax(layer) {
  return d3.max(layer, function(d) { return d[1]; });
}

function stackMin(layer) {
  return d3.min(layer, function(d) { return d[0]; });
}

export default defineComponent({
  name: 'StreamChart',
  props:{
    theme: String,
  },
  data(){
    return{
      StreamChart: null,
      loading: false,
      data: null,
      svg: null,
    }
  },
  created(){
  },
  methods:{
    get_width(){
      return window.innerWidth - margin.left - margin.right
    },
    get_height(){
      return window.innerHeight - margin.top - margin.bottom
    },
    async embed(){
      var data = toRaw(this.data)
      data.columns = Object.keys(data[0])


      const x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {return d.created_at}))
        .range([ 0, this.get_width() ]);
      this.svg.append("g")
        .attr("transform", `translate(0, ${(this.get_height())*0.8})`)
        .call(d3.axisBottom(x).tickSize(-this.get_height()*.7))
        .select(".domain").remove()

      const keys = data.columns.splice(1)

      this.svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

      // Add Y axis
      const y = d3.scaleLinear()
      .domain([-600, 600])
      .range([ this.get_height(), 0 ]);

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

      // create a tooltip
      const Tooltip = this.svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = function(event,d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
      }
      const mousemove = function(event,d,i) {
        const grp = d.key
        Tooltip.text(grp)
      }
      const mouseleave = function(event,d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
      }

      // Area generator
      const area = d3.area()
        .x(function(d) { return x(d.data.created_at); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

      // Show the areas
      this.svg
        .selectAll("mylayers")
        .data(stackedData)
        .join("path")
          .attr("class", "myArea")
          .style("fill", (d) => colorer(d.key))
          .attr("d", area)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
    },
    async updateData() {
      this.data = (await axios.get('/get_words?to_=2024-03-20&aggregate=false&pivot=true&min_frequency=10&filter_type=none')).data
      while (this.data==undefined){
          setTimeout(() => {
            this.loading = true
          }, (500));
      }
      this.data = toRaw(this.data)
      this.loading = false
      this.embed()
    },
    onResize() {
      this.svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("viewBox", [0, 0, this.get_width(),  this.get_height()])
      .append("g")
        .attr("transform",
              `translate(${margin.left}, ${margin.top})`);
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.$nextTick(() => {
      this.svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("viewBox", [0, 0, this.get_width(),  this.get_height()])
      .append("g")
        .attr("transform",
              `translate(${margin.left}, ${margin.top})`);
      window.addEventListener('resize', this.onResize)
      this.updateData()
    })
  },
})
</script>
