<template>
  <v-row id="bubble_chart">
  </v-row>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import * as d3 from "d3";
import { MainStore } from "../store/app";
import { mapStores } from 'pinia';

var k = window.innerHeight/1.5 / window.innerWidth/1.8

var radiusScale = null
var normalForceX = d3.forceX(0).strength(0.005)
var normalForceY = d3.forceY(0).strength(0.005)

var separatedForceX = d3.forceX(function(d) {
  if (d.frequency > 10){
    return window.innerWidth/8
  }else{
    return -window.innerWidth/8
  }
}).strength(0.005)

export default defineComponent({
  name: 'BubbleChart',
  props:{
    theme: String,
    data: Array,
  },
  data(){
    return{
      menu: false,
      langModel: 'English',
      langItems: [],
      combined: 'true',
      svg: null,
      simulation: null,
    }
  },
  created() {
  },
  async mounted(){
    this.minMax()
    this.svg = d3.select("#bubble_chart")
    .append('svg')
    .attr("viewBox", [0, 0, this.get_width(), this.get_height()])
    .append('g')
    .attr("transform", 'translate('+ this.get_width()/2 +',' + this.get_height()/2 + ')')
    this.ready(this.data)
  },
  methods:{
    get_width(){
      return window.innerWidth/1.8
    },
    get_height(){
      return window.innerHeight/1.5
    },


    // Function which loops over all the data and finds the maximum and minimun frequency of the words
    // then creates a scaler to scale the bubbles in the chart based on the min and max
    minMax(){
      var min = Infinity
      var max = -Infinity
      this.data.forEach(element => {
        if (element.frequency < min){
          min = element.frequency
        }
        if (element.frequency > max){
          max = element.frequency
        }
      });
      radiusScale = d3.scaleSqrt().domain([min, max]).range([1, 50])
    },

    // Function to separate the bubbles based on a condition
    combinedFunc(){
      // If all together push all in the middle,
      // initially really fast and then stop the inertia after 60 millisec
      if (this.combined == 'true'){
        this.simulation.force('x', normalForceX).alphaTarget(100).restart()
        setTimeout(() => {
          this.simulation.force('x', normalForceX).alphaTarget(-20).restart()
        }, 100);
        setTimeout(() => {
          this.simulation.force('x', normalForceX).alphaTarget(0).restart()
        }, 200);
      // If splitted push on the left and the right base on the condition,
      // initially really fast and then stop the inertia after 60 millisec
      }else{
        this.simulation.force('x', separatedForceX).alphaTarget(100).restart()
        setTimeout(() => {
          this.simulation.force('x', separatedForceX).alphaTarget(-20).restart()
        }, 100);
        setTimeout(() => {
          this.simulation.force('x', separatedForceX).alphaTarget(0).restart()
        }, 200);
      }
    },


    // Function to change the data in the 'chart'
    reset_datapoints(){
      var bubbles = this.svg.selectAll(".artist")
      // Fade out and remove any existing circles
      bubbles
        .transition() // Apply transition for fade-out effect
        .duration(500) // Set the duration of transition
        .attr("r", 0)
        .style("opacity", 0) // Fade out by reducing opacity to 0
        .remove(); // Remove the elements after transition completes
      setTimeout(() => {
        this.ready(this.data)
        if (this.combined == 'false'){ // Reset the combination mode to start each data visualization from the combined
          this.combined = 'true'
        }
        this.combinedFunc()
      }, 520)
    },


    // Function to plot data
    ready(datapoints){
      // Select the artist in the svg
      var bubbles = this.svg.selectAll(".artist")
      // Set the data
      .data(datapoints, function(d) { return(d); })
      .enter()
      // Add a circle with a certain color and radius based on the data frequency
      .append('circle')
      .attr('class', 'artist')
      .attr('r', function(d){
        return radiusScale(d.frequency)
      })
      .attr('fill', d3.scaleOrdinal(d3.schemeCategory10).domain(datapoints))

      var texts = this.svg.selectAll(null)
        .data(datapoints, function(d) {return(d)})
        .enter()
        .append('text')
        .text(d => d.word)
        .style('fill', 'white')

      // Create simulation with forces which center the bubbles to the center
      this.simulation = d3.forceSimulation()
        .force('x', normalForceX)
        .force('y', normalForceY)
        .force('collide', d3.forceCollide(function(d){
              return radiusScale(d.frequency) + 5
        }))

      // Set the tick of the simulation
      this.simulation.nodes(datapoints)
      .on('tick', ticked)

      function ticked(){
        bubbles
        .attr("cx", function(d){
          return d.x
        })
        .attr("cy", function(d){
          return d.y
        })

        texts
        .attr("x", function(d){
          return d.x - radiusScale(d.frequency) + 6
        })
        .attr("y", function(d){
          return d.y + radiusScale(d.frequency)/12
        })
        .attr('font-size', function(d) {
          return radiusScale(d.frequency)/3
        })
      }

    }
  },
  computed: {
    ...mapStores(MainStore),
  },
})
</script>
