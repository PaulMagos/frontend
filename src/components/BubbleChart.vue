<template>
  <div id="bubble_chart" class="ml-2">
  </div>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import * as d3 from "d3";

var radiusScale = null
var normalForceX = d3.forceX(0).strength(0.005)
var normalForceY = d3.forceY(0).strength(0.005)

var separatedForceX = d3.forceX(function(d) {
  if (d.frequency > 5){
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
    lang: String,
    kindOfWords: String,
    loading: Boolean,
  },
  data(){
    return{
      menu: false,
      combined: 'true',
      svg: null,
      simulation: null,
    }
  },
  created() {
  },
  async mounted(){
    this.svg = d3.select("#bubble_chart")
    .append('svg')
    .attr("viewBox", [0, 0, this.get_width(), this.get_height()])
    .append('g')
    .attr("transform", 'translate('+ this.get_width()/2 +',' + this.get_height()/2 + ')')
    this.get_date_formatted()
  },
  methods:{
    get_width(){
      return window.innerWidth/1.5
    },
    get_height(){
      return window.innerHeight/1.25
    },


    // Function which loops over all the data and finds the maximum and minimun frequency of the words
    // then creates a scaler to scale the bubbles in the chart based on the min and max
    get_date_formatted(){
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
      radiusScale = d3.scaleSqrt().domain([min, max]).range([min, 70])
      this.ready(this.data)
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
      var bubbles = this.svg.selectAll(".bubbles")
      var texts = this.svg.selectAll(".texts")
      var tooltip = d3.select('#bubble_chart').selectAll(".tooltip")
      // Fade out and remove any existing circles
      bubbles
        .transition() // Apply transition for fade-out effect
        .duration(500) // Set the duration of transition
        .attr("r", 0)
        .style("opacity", 0) // Fade out by reducing opacity to 0
        .remove();
      texts
        .transition() // Apply transition for fade-out effect
        .duration(500) // Set the duration of transition
        .style("opacity", 0) // Fade out by reducing opacity to 0
        .remove();

      tooltip
        .transition() // Apply transition for fade-out effect
        .duration(500) // Set the duration of transition
        .style("opacity", 0) // Fade out by reducing opacity to 0
        .remove();

      setTimeout(() => {
          this.get_date_formatted()
          this.combined = 'true'
          this.combinedFunc()
      }, 520)
    },


    // Function to plot data
    ready(datapoints){

      // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#bubble_chart")
      .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#16202b")
        .style("border-radius", "5px")
        .style("border", "solid")
        .style("border-color", 'white')
        .style("padding", "10px")
        .style("color", "white")

      // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
      const showTooltip = function(event, d) {
        tooltip
          .transition()
          .duration(200)
        tooltip
          .style("opacity", 50)
          .html(d.word + '<br>' + 'Frequency: ' + d.frequency)
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
      }

      // Select the artist in the svg
      var bubbles = this.svg.selectAll(null)
      // Set the data
      .data(datapoints, function(d) { return(d); })
      // Add a circle with a certain color and radius based on the data frequency
      .join('circle')
        .attr('class', 'bubbles')
        .attr('r', function(d){
          return radiusScale(d.frequency)
        })
        .attr('fill', d3.scaleOrdinal(d3.schemeCategory10).domain(datapoints))
          // -3- Trigger the functions
      .on("mouseover", showTooltip )
      .on("mousemove", moveTooltip )
      .on("mouseleave", hideTooltip )

      var texts = this.svg.selectAll(null)
        .data(datapoints, function(d) {return(d)})
        .enter()
        .append('text')
        .attr('class', 'texts')
        .text((d) => {
          if(d.frequency>1)
          return d.word
        })
        .style('fill', 'white')


      // Create simulation with forces which center the bubbles to the center
      this.simulation = d3.forceSimulation()
        .force('x', normalForceX)
        .force('y', normalForceY)
        .force('collide', d3.forceCollide(function(d){
              return radiusScale(d.frequency) + 2
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
          return d.x
        })
        .attr("y", function(d){
          return d.y + radiusScale(d.frequency)/10
        })
        .attr('font-size', function(d) {
          var ip = radiusScale(d.frequency)/3
          return ip
        })
        .attr('text-anchor', 'middle')
      }

    }
  },
})
</script>

<style>
.bubbles:hover {
    stroke-width: 2px;
    stroke: white;
  }
</style>
