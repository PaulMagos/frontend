<template>
  <Loading v-if="loading"></Loading>
  <div v-else id="bubble_chart" class="ml-2">
  </div>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import * as d3 from "d3";

var radiusScale = null
var normalForceX = d3.forceX(0).strength(0.005)
var normalForceY = d3.forceY(0).strength(0.005)
var normal_collide = d3.forceCollide(function(d){
                return radiusScale(d.frequency) + 2
          })


export default defineComponent({
  name: 'BubbleChart',
  watch:{
    data: function(old_val, new_val){
      if (old_val!=undefined){
        this.get_date_formatted()
      }
    },
    'bubbleMode.color': function(old_val, new_val) {
      if (new_val!=old_val && this.bubbleMode.mode==1){
        this.recolor()
      }
    },
    'bubbleMode.min_frequency': function(old_val, new_val) {
      if (new_val!=old_val && this.bubbleMode.mode==1){
        this.splitByFrequency()
      }
    }
  },
  props:{
    theme: String,
    data: Array,
    lang: String,
    bubbleMode: Object,
    kindOfWords: String,
    loading: Boolean,
  },
  data(){
    return{
      menu: false,
      data_local: null,
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
    this.simulation = d3.forceSimulation()
          .force('x', normalForceX)
          .force('y', normalForceY)
          .force('collide', normal_collide)
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
        data_ = this.data
      }
      if (data_!=undefined){
        data_.forEach(element => {
          if (element.frequency < min){
            min = element.frequency
          }
          if (element.frequency > max){
            max = element.frequency
          }
        });
        radiusScale = d3.scaleSqrt().domain([min, max]).range([20, 80])
        this.simulation.nodes(data_)
              .on('tick', this.ticked)
        data_.forEach(elem => {
          if (this.data_local != null){
            this.data_local.forEach(elem2 => {
              if (elem.word == elem2.word){
                elem.x = elem2.x
                elem.y = elem2.y
                elem.vx = elem2.vx
                elem.vy = elem2.vy
              }
            })
          }
        })
        this.data_local = data_
        this.simulation.alpha(1).restart()
        this.ready(data_)
        setTimeout(() => {
          if (this.bubbleMode.mode==1){
            this.splitByFrequency(this.bubbleMode.min_frequency, this.bubbleMode.color)
          }
        }, 500)
      }
    },

    resetCenter(){
      this.simulation.force('x', normalForceX).alphaTarget(100).restart()
        setTimeout(() => {
          this.simulation.force('x', normalForceX).alphaTarget(-20).restart()
        }, 100);
        setTimeout(() => {
          this.simulation.force('x', normalForceX).alphaTarget(0).restart()
        }, 200);

      this.svg.selectAll('.bubbles')
      .transition().duration(1000)
      .attr('fill', this.theme=='darkTheme'? 'white' : '#008afa')
    },

    splitByFrequency(){
      var separatedForceX = d3.forceX((d) => {
        if (d.frequency > this.bubbleMode.min_frequency){
          return window.innerWidth/8
        }else{
          return -window.innerWidth/8
        }
      }).strength(0.005)

      this.simulation.force('x', separatedForceX).alphaTarget(100).restart()
      setTimeout(() => {
        this.simulation.force('x', separatedForceX).alphaTarget(-20).restart()
      }, 100);
      setTimeout(() => {
        this.simulation.force('x', separatedForceX).alphaTarget(0).restart()
      }, 200);

      this.recolor()
    },

    recolor(){
      this.svg.selectAll('.bubbles')
      .transition().duration(200)
      .attr('fill', (d) => {
          return d.frequency<=this.bubbleMode.min_frequency? this.theme=='darkTheme'? 'white' : '#008afa': this.bubbleMode.color
      })
      this.svg.selectAll('.texts')
      .transition().duration(200)
      .attr('fill', (d) => {
          return d.frequency<=this.bubbleMode.min_frequency? this.theme=='darkTheme'? 'white' : '#008afa': this.bubbleMode.color
      })
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
        .style("border-radius", "10px")
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

      tooltip.on("mouseover", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      })

      const bubbleMode = this.bubbleMode


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
            .transition().duration(600)
              .style('opacity', 1)
          )
          .call(g =>
            g.append('circle')
            .attr('class', 'bubbles')
            .attr('r', function(d){
              return radiusScale(d.frequency)
            })
            // .attr('fill', theme=='darkTheme'? 'white' : '#008afa')
            .attr('fill', (d) => {
              return bubbleMode.mode==1? d.frequency<=bubbleMode.min_frequency? theme=='darkTheme'? 'white' : '#008afa': bubbleMode.color : theme=='darkTheme'? 'white' : '#008afa'
            })
          )
          .call(g =>
            g.append('text')
            .attr('class', 'texts')
            .text((d) => {
              if(d.frequency>1)
              return d.word
            })
            .transition().duration(600)
            .attr('font-size', function(d) {
              return radiusScale(d.frequency)/3.5
            })
            .style('fill', theme=='darkTheme'? 'black' : 'white')
            .attr('text-anchor', 'middle')

          )
          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
        }


      function updateRects(update) {
        update
          .call(g => g.select('circle')
            .transition().duration(600)
            .attr('r', function(d){
              return radiusScale(d.frequency)
            }).attr('fill', (d) => {
              return bubbleMode.mode==1? d.frequency<=bubbleMode.min_frequency? theme=='darkTheme'? 'white' : '#008afa': bubbleMode.color : theme=='darkTheme'? 'white' : '#008afa'
            })
          )
          .call(g => g.select('text')
            .transition().duration(600)
            .text((d) => {
              if(d.frequency>1)
              return d.word
            })
            .attr('font-size', function(d) {
              return radiusScale(d.frequency)/3.5
            })
            .style('fill', theme=='darkTheme'? 'black' : 'white')
            .attr('text-anchor', 'middle')
          )

          .on("mouseover", showTooltip )
          .on("mousemove", moveTooltip )
          .on("mouseleave", hideTooltip )
      }

      function exitRects(exit) {
        exit
          .call(g =>
          {
            g.select('circle').transition().duration(500).attr('r', 0)
            g.select('text').transition().duration(500).attr('font-size', 0)
            g.transition().duration(500)
                .style('opacity', 0)
              .remove()
            }
          )
      }
    },
    ticked(){
          const bbls = d3.selectAll('.bubbles')
          const txts = d3.selectAll('.texts')
          bbls
          .attr("cx", function(d){
            return d.cx? d.cx: d.x
          })
          .attr("cy", function(d){
            return d.cy? d.cy: d.y
          })

          txts
          .attr("x", function(d){
            return d.cx? d.cx: d.x
          })
          .attr("y", function(d){
            return d.cy? d.cy: d.y + radiusScale(d.frequency)/10
          })
          .attr('text-anchor', 'middle')
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
