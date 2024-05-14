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
      data_local: null,
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
    get_date_formatted(data_){
      var min = Infinity
      var max = -Infinity
      if (data_==undefined){
        this.data_local = this.data
      }else{
        this.data_local = data_
      }
      this.data_local.forEach(element => {
        if (element.frequency < min){
          min = element.frequency
        }
        if (element.frequency > max){
          max = element.frequency
        }
      });
      radiusScale = d3.scaleSqrt().domain([min, max]).range([20, 80])
      this.ready(this.data_local)
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
          .duration(1000)
        tooltip
          .style("opacity", 100)
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
      const theme = this.theme

      this.simulation = d3.forceSimulation()
          .force('x', normalForceX)
          .force('y', normalForceY)

          .force('collide', d3.forceCollide(function(d){
                return radiusScale(d.frequency) + 2
          }))



      // Select the artist in the svg
      var bubbles = this.svg.selectAll('g')
        // Set the data
        .data(datapoints, (d) => d.word)
        // Add a circle with a certain color and radius based on the data frequency
        .join(
          enter => enterRects(enter),
          update => updateRects(update),
          exit => exitRects(exit)
        )

      function enterRects(enter) {
        enter.append('g')
          .style('opacity', 0)
          .call(g => g
            .transition().duration(1000)
              .style('opacity', 1)
          )
          .call(g =>
            g.append('circle')
            .attr('class', 'bubbles')
            .attr('r', function(d){
              return radiusScale(d.frequency)
            })
            .attr('fill', theme=='darkTheme'? 'white' : '#008afa')
          )
          .call(g =>
            g.append('text')
            .attr('class', 'texts')
            .text((d) => {
              if(d.frequency>2)
              return d.word
            })
            .style('fill', theme=='darkTheme'? 'black' : 'white')
            .attr('text-anchor', 'middle')
          )
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
        }


        this.simulation.nodes(datapoints)
            .on('tick', ticked)

        function ticked(){
          const bbls = d3.selectAll('.bubbles')
          const txts = d3.selectAll('.texts')
          bbls
          .attr("cx", function(d){
            return d.x
          })
          .attr("cy", function(d){
            return d.y
          })

          txts
          .attr("x", function(d){
            return d.x
          })
          .attr("y", function(d){
            return d.y + radiusScale(d.frequency)/10
          })
          .attr('text-anchor', 'middle')
        }


      function updateRects(update) {
        update
          .call(g => g
            .transition().duration(2000)
          )
          .call(g => g.select('text')
            .transition().duration(2000)
            .text((d) => {
              if(d.frequency>2)
              return d.word
            })
            .style('fill', theme=='darkTheme'? 'black' : 'white')
            .attr('text-anchor', 'middle')
          )
          .call(g => g.select('circle')
            .transition().duration(2000)
            .attr('r', function(d){
              return radiusScale(d.frequency)
            })
            .attr('fill', theme=='darkTheme'? 'white' : '#008afa')
          )
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
      }

      function exitRects(exit) {
        exit
          .call(g =>
          {
            g.select('circle').transition().duration(1500).attr('r', 0)
            g.transition().duration(2000)
                .style('opacity', 0)
              .remove()
            }
          )
      }





      // // Create simulation with forces which center the bubbles to the center
      // this.simulation = d3.forceSimulation()
      //   .force('x', normalForceX)
      //   .force('y', normalForceY)
      //   .force('collide', d3.forceCollide(function(d){
      //         return radiusScale(d.frequency) + 2
      //   }))

      // // Set the tick of the simulation
      // this.simulation.nodes(datapoints, d => d.word)
      // .on('tick', ticked)

      // function ticked(){
      //   bubbles
      //   .attr("cx", function(d){
      //     return d.x
      //   })
      //   .attr("cy", function(d){
      //     return d.y
      //   })
      // }

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
