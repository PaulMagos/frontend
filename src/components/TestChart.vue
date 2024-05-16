<template>
    <Loading v-if="this.loading"></Loading>
    <v-container v-else id="StreamChart">
    </v-container>
</template>

<script>
import Loading from './Loading.vue'
import { defineComponent, toRaw } from 'vue'
import carbon101 from "@/models/carbon101";
import googlechartsTheme from "@/models/googlecharts";
import axios from 'axios'
import * as d3 from "d3";

const margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;



export default defineComponent({
  name: 'StreamChart',
  props:{
    theme: String,
  },
  data(){
    return{
      StreamChart: null,
      loading: true,
      data: null,
      svg: null,
    }
  },
  created(){
    this.svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            `translate(${margin.left}, ${margin.top})`);
    this.updateData()
  },
  methods:{
    embed(){
      const x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.created_at; }))
        .range([ 0, width ]);
      this.svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5));

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([-100000, 100000])
        .range([ height, 0 ]);
      this.svg.append("g")
        .call(d3.axisLeft(y));
    },
    async updateData() {
      this.data = (await axios.get('/get_words?aggregate=false')).data
      while (this.data==undefined){
          setTimeout(() => {
            this.loading = true
          }, (500));
      }
      this.loading = false
      this.embed()
    },
    onResize() {
      this.updateData()
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.updateData()
    })
  },
})
</script>
