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
  },
  data(){
    return{
      menu: false,
      combined: 'true',
      svg: null,
      data: this.data,
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
      radiusScale = d3.scaleSqrt().domain([min, max]).range([10, max*3])
    },

    get_date_formatted(){
      var collapsed_data = {}
      this.data.forEach((element) => {
        const word = this.kindOfWords === 'hashtags' ? element.hashtag : element.word;
        var elem = [word, element.frequency, element.lang, element.created_at]
        if (elem[0] in collapsed_data)
          collapsed_data[elem[0]]['frequency'] += elem[1]
        else
          collapsed_data[elem[0]] = {}
          collapsed_data[elem[0]]['frequency'] = elem[1]
          collapsed_data[elem[0]]['lang'] = elem[2]
          collapsed_data[elem[0]]['created_at'] = elem[3]
      })

      var new_data = []
      Object.entries(collapsed_data).forEach(([key, value]) =>{
        new_data.push({word: key, lang: value.lang, frequency: value.frequency, created_at: value.created_at})
      })
      this.data = new_data
      this.minMax()
      this.ready(new_data)
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
      var tooltip = this.svg.selectAll(".tooltips")
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

      setTimeout(() => {
          this.get_date_formatted()
          this.combined = 'true'
          this.combinedFunc()
      }, 520)
    },


    // Function to plot data
    ready(datapoints){
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
  .bubbles {
    stroke-width: 2px;
    stroke: white;
  }
  .bubbles:hover {
    stroke: black;
  }

  .texts:hover{
  }
</style>
