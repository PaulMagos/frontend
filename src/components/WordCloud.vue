<template>
<v-container class="elevation-4">
  <v-row>
    <vue-word-cloud
      :style="`height: ` + (this.get_height() - 50) + `px; width: `+ (this.get_width() - 50) + `px; cursor: pointer;`"
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
    days: Array,
  },
  data(){
    return{
      menu: false,
      langModel: 'Italian',
      langItems: [],
      daysModel: [this.days[0], this.days[1]],
      daysModelStr: null,
      kindOfWords: 'words',
      min_day: this.days[0],
      max_day: this.days[1],
      svg: null,
      data: words,
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
    this.svg = d3.select("#bubble_chart")
    .append('svg')
    .attr("viewBox", [0, 0, this.get_width(), this.get_height()])
    .append('g')
    .attr("transform", 'translate('+ this.get_width()/2 +',' + this.get_height()/2 + ')')
    this.filter_data(this.data, 5)
    this.getSettedDays()
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

    // Munction to filter data based on threshold of frequency
    filter_data(data, min_frequency=5, min_day = this.daysModel[0], max_day = this.daysModel[this.daysModel.length-1], lang=this.langModel){
      this.data = data.filter((element) => {
      var created_at = new Date(element.created_at)
      if (created_at > this.max_day){
        this.max_day = created_at
      }
      if (created_at >= min_day && created_at <= max_day){
        if (element.frequency >= min_frequency){
          if (element.lang == lang)
            return element
        }
      }
      if (!this.langItems.includes(element.lang)){
        this.langItems.push(element.lang)
      }
      })
    },

    // Function to modify the data that are visualized
    // The filter_data(frequency) function is used to set which data to filter based on the frequency
    // The minMax() is called to recalculate the radius of the bubbles based on the max and min frequencies
    // of the new data
    modifyWords(){
      switch(this.kindOfWords){
        case 'words':
          if (this.data != words){
            this.filter_data(words, 5)
          }
          break;
        case 'hashtags':
          if (this.data != hashtags){
            this.filter_data(hashtags, 2)
          }
          break;
          // Images words
          case 'images':
            if (this.data != images){
              this.filter_data(images, 2)
            }
            break;
          }
    },
  },
  computed: {
    ...mapStores(MainStore),
  },
})
</script>
