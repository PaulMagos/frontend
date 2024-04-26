<template>
    <vue-word-cloud
      :style="`height: ` + (this.height - 50) + `px; width: `+ (this.width - 50) + `px; cursor: pointer;`"
      :words="get_date_formatted()"
      font-family="serif"
      spacing="0.2"
      rotation-unit="deg"
      :rotation="getRotation"
      animation-easing="linear"
      animation-overlap="10"
      font-size-ratio="0.3"
      animation-duration="2500"
      :enter-animation="{opacity: 0}"
      :leave-animation="{opacity: 0}"
    >
    </vue-word-cloud>
</template>

<script>
import { defineComponent } from 'vue';
import * as d3 from "d3";
import VueWordCloud from 'vuewordcloud';
import { MainStore } from "../store/app";
import { mapStores } from 'pinia';
import hashtags from '@/data/Tweets_hashtag_counts.json'
import words from '@/data/Tweets_word_counts.json'

export default defineComponent({
  name: 'WordCloud',
  components:{
    [VueWordCloud.name]: VueWordCloud,
  },
  props:{
    theme: String,
    data: Array,
    width: Number,
    height: Number,
    kindOfWords: String,
  },
  data(){
    return{

    }
  },
  created() {
  },
  async mounted(){
    this.svg = d3.select("#bubble_chart")
    .append('svg')
    .attr("viewBox", [0, 0, this.width, this.height])
    .append('g')
    .attr("transform", 'translate('+ this.width/2 +',' + this.height/2 + ')')
  },
  methods:{
    get_date_formatted(){
      var collapsed_data = {}
      this.data.forEach((element) => {
        const word = this.kindOfWords === 'hashtags' ? element.hashtag : element.word;
        var elem = [word, element.frequency]
        if (elem[0] in collapsed_data)
          collapsed_data[elem[0]] += elem[1]
        else
          collapsed_data[elem[0]] = elem[1]
      })

      var new_data = []
      Object.entries(collapsed_data).forEach(([key, value]) =>{
        new_data.push([key, value])
      })
      return new_data
    },

    getRotation() {
      const randomNumber = Math.random(); // Generates a random number between 0 and 1
      return randomNumber > 0.5 ? '90' : '0';
    },
  },
  computed: {
    ...mapStores(MainStore),
  },
})
</script>
