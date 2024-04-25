<template>
<v-container class="elevation-4">
  <v-row>
    <v-col id="bubble_chart" cols="9">
    </v-col>
    <v-col cols="3">
      <v-menu
        ref="menu"
        :close-on-content-click="false"
        v-model="menu"
      >
        <template v-slot:activator="{ props: activatorProps }">
          <v-text-field
            v-model="daysModelStr"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="activatorProps"
          ></v-text-field>
        </template>
        <template v-slot:default="{ isActive }">
              <v-card>
                <v-date-picker
                    v-model="this.daysModel"
                    show-adjacent-months
                    no-title
                    hide-header
                    multiple="range"
                    color="primary"
                    scrollable
                    >
                  </v-date-picker>
                  <v-card-actions>

                    <v-btn
                    class="px-4"
                    color="error"
                    flat
                    @click="menu = false"
                    >
                    <v-icon size="large">mdi-calendar-remove</v-icon>
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                  class="px-4"
                  color="success"
                  flat
                  @click="this.getSettedDays(); menu = false; this.modifyWords()"
                  >
                  <v-icon size="large">mdi-calendar-check</v-icon>
                </v-btn>
              </v-card-actions>
              </v-card>
        </template>
      </v-menu>
      <v-row class="py-2">

      </v-row>
      <v-row class="py-2">
        <v-btn-toggle mandatory v-model="combined">
          <v-btn @click="combinedFunc" value="true">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn @click="combinedFunc" value="false">
            <v-icon>mdi-vector-combine</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row class="py-2">
        <v-btn-toggle mandatory  v-model="kindOfWords">
          <v-btn @click="modifyWords" value="words">
            <v-icon color="secondary" size="x-large">mdi-file-word-box-outline</v-icon>
          </v-btn>
          <v-btn @click="modifyWords" value="hashtags">
            <v-icon color="info" size="x-large">mdi-pound-box-outline</v-icon>
          </v-btn>
          <v-btn @click="modifyWords" value="images">
            <v-icon color="success" size="x-large">mdi-image-outline</v-icon>
          </v-btn>
          <v-btn @click="modifyWords" value="videos">
            <v-icon color="error" size="x-large">mdi-video-outline</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
    </v-col>
  </v-row>
</v-container>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import * as d3 from "d3";
import { MainStore } from "../store/app";
import { mapStores } from 'pinia';
import hashtags from '@/data/Tweets_hashtag_counts.json'
import words from '@/data/Tweets_word_counts.json'

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
    days: Array,
  },
  data(){
    return{
      menu: false,
      langModel: 'English',
      langItems: [],
      daysModel: [this.days[0], this.days[1]],
      daysModelStr: null,
      kindOfWords: 'words',
      min_day: this.days[0],
      max_day: this.days[1],
      combined: 'true',
      svg: null,
      data: words,
      simulation: null,
    }
  },
  created() {
    if (this.daysModel[0].getDate() == this.daysModel[1].getDate()
                && this.daysModel[0].getYear() == this.daysModel[1].getYear()
                && this.daysModel[0].getMonth() == this.daysModel[1].getMonth()){
      this.daysModel = [this.daysModel[0]]
    };
  },
  async mounted(){
    this.minMax()
    this.svg = d3.select("#bubble_chart")
    .append('svg')
    .attr("viewBox", [0, 0, this.get_width(), this.get_height()])
    .append('g')
    .attr("transform", 'translate('+ this.get_width()/2 +',' + this.get_height()/2 + ')')
    this.filter_data()
    this.getSettedDays()
    this.ready(this.data)
  },
  methods:{
    getSettedDays(){
      var len = this.daysModel.length
      if (len>1){
        this.daysModelStr = this.daysModel[0].getFullYear() + '.'  + ((this.daysModel[0].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel[0].getMonth() + 1) + '.' + this.daysModel[0].getDate() +
         ' ~ ' + this.daysModel[len-1].getFullYear() + '.'  + ((this.daysModel[len-1].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel[len-1].getMonth() + 1) + '.' + this.daysModel[len-1].getDate()
      }else{
        this.daysModelStr = this.daysModel[0].getFullYear() + '.'  + ((this.daysModel[0].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel[0].getMonth() + 1) + '.' + this.daysModel[0].getDate()
      }
    },

    get_width(){
      return window.innerWidth/1.8
    },
    get_height(){
      return window.innerHeight/1.5
    },

    // Munction to filter data based on threshold of frequency
    filter_data(min_frequency=15, min_day = this.daysModel[0], max_day = this.daysModel[this.daysModel.length-1]){
      this.data = this.data.filter((element) => {
      var created_at = new Date(element.created_at)
      if (created_at > this.max_day){
        this.max_day = created_at
      }
      if (created_at >= min_day && created_at <= max_day){
        if (element.frequency >= min_frequency){
          return element
        }
      }
      if (!this.langItems.includes(element.lang)){
        this.langItems.push(element.lang)
      }
    })
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

    // Function to modify the data that are visualized
    // The filter_data(frequency) function is used to set which data to filter based on the frequency
    // The minMax() is called to recalculate the radius of the bubbles based on the max and min frequencies
    // of the new data
    modifyWords(){
      switch(this.kindOfWords){
        case 'words':
          if (this.data != words){
            this.reset_datapoints()
            this.data = words
            this.filter_data(20)
            this.minMax()
          }else{
            this.combinedFunc(this.combined)
          }
          break;
        case 'hashtags':
          if (this.data != hashtags){
            this.reset_datapoints()
            this.data = hashtags
            this.filter_data(2)
            this.minMax()
          }else{
            this.combinedFunc(this.combined)
          }
          break;
          // Images words
          case 'images':
            if (this.data != images){
              this.reset_datapoints()
              this.data = images
              this.filter_data(2)
              this.minMax()
            }else{
              this.combinedFunc(this.combined)
            }
            break;
          }
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
        console.log("Starting")
        this.simulation.force('x', separatedForceX).alphaTarget(100).restart()
        setTimeout(() => {
          this.simulation.force('x', separatedForceX).alphaTarget(-20).restart()
        }, 100);
        setTimeout(() => {
          this.simulation.force('x', separatedForceX).alphaTarget(0).restart()
          console.log("Done")
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
      }

    }
  },
  computed: {
    ...mapStores(MainStore),
  },
})
</script>
