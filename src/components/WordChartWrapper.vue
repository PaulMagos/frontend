<template>
<v-container class="elevation-4">
  <v-row>
    <v-col cols="9">
      <BubbleChart :theme='this.theme' ref="BubbleChart" :data="this.data" v-if="chartType=='bubble'"></BubbleChart>
      <WordCloud :theme="this.theme" :kindOfWords="kindOfWords" :width="this.get_width()" :height="this.get_height()" :data="this.data" v-else v-if="chartType=='wordcloud'"></WordCloud>
      <TreeMap :theme="this.theme" :kindOfWords="kindOfWords" :width="this.get_width()" :height="this.get_height()" :data="this.data" v-if="chartType=='treemap'"></TreeMap>
    </v-col>
    <v-col cols="3">
      <v-row>
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
                    @click="this.getSettedDays(); menu = false; this.filter_data(kindOfWords); $refs.BubbleChart.reset_datapoints()"
                    >
                    <v-icon size="large">mdi-calendar-check</v-icon>
                  </v-btn>
                </v-card-actions>
                </v-card>
          </template>
        </v-menu>
      </v-row>
      <v-row class="py-0">
        <v-btn-toggle mandatory v-model="chartType">
          <v-btn @click="runAnimation(0)" value="bubble">
            <v-icon size="x-large">mdi-chart-bubble {{ animation[0] }}</v-icon>
          </v-btn>
          <v-btn @click="runAnimation(1)" value="treemap">
            <v-icon size="x-large">mdi-file-tree {{ animation[1] }}</v-icon>
          </v-btn>
          <v-btn @click="runAnimation(2)" value="wordcloud">
            <v-icon size="x-large">mdi-weather-cloudy {{ animation[2] }}</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row v-if="chartType=='bubble'" class="py-2">
        <v-btn-toggle mandatory v-model="combined">
          <v-btn @click="$refs.BubbleChart.combined = 'true'; $refs.BubbleChart.combinedFunc()" value="true">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn @click="$refs.BubbleChart.combined = 'false'; $refs.BubbleChart.combinedFunc()" value="false">
            <v-icon>mdi-vector-combine</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row class="py-4">
          <v-btn-toggle mandatory :color="getWordsTypeColor()" v-model="kindOfWords">
            <v-btn @click="this.filter_data('words'); $refs.BubbleChart.reset_datapoints()" value="words">
              <v-icon :color="getWordsTypeColor('words')" size="x-large">mdi-file-word-box-outline</v-icon>
            </v-btn>
            <v-btn @click="this.filter_data('hashtags'); $refs.BubbleChart.reset_datapoints()"  value="hashtags">
              <v-icon :color="getWordsTypeColor('hashtags')" size="x-large">mdi-pound-box-outline</v-icon>
            </v-btn>
            <v-btn value="images">
              <v-icon :color="getWordsTypeColor('images')" size="x-large">mdi-image-outline</v-icon>
            </v-btn>
            <v-btn value="videos">
              <v-icon :color="getWordsTypeColor('videos')" size="x-large">mdi-video-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-row>
    </v-col>
  </v-row>
  </v-container>
</template>



<script>
import { defineComponent, toRaw } from 'vue';
import hashtags from '@/data/Tweets_hashtag_counts.json'
import words from '@/data/Tweets_word_counts.json'
import BubbleChart from './BubbleChart.vue';
import WordCloud from './WordCloud.vue';
import { treemap } from 'd3';

export default defineComponent({
  name: 'WordChartWrapper',
  props: {
    theme: String,
    days: Array,
    adapter: Object,
  },
  data(){
    return{
      chartType: 'wordcloud',
      menu: false,
      daysModelStr: null,
      langModel: 'Italian',
      langItems: [],
      filter_min: 5,
      daysModel: [this.days[0], this.days[1]],
      daysModelStr: null,
      kindOfWords: 'words',
      min_day: this.days[0],
      max_day: this.days[1],
      data: words,
      animation: ['', '', ''],
      combined: 'true',
      simulation: null,
    }
  },
  created() {
    this.filter_data('words', 10)
  },
  mounted(){
    // this.filter_data(this.data)
    this.getSettedDays()
  },
  methods: {

    runAnimation(value){
      this.animation[value] = 'mdi-spin'
      setTimeout(() => {
          this.animation[value] = ''
        }, 2000);
    },

    get_width(){
      return window.innerWidth/1.8
    },
    get_height(){
      return window.innerHeight/1.5
    },

    // Function to filter data based on threshold of frequency
    filter_data(data_, min_frequency=this.filter_min, min_day = this.daysModel[0], max_day = (this.daysModel[this.daysModel.length-1] || this.daysModel[0]), lang=this.langModel){
      switch(data_){
        case 'words':
          this.data = toRaw(words);
          this.filter_min = 5
          break;
        case 'hashtags':
          this.data = toRaw(hashtags);
          this.filter_min = 2
          break;
        }
      min_frequency = this.filter_min
      this.data = this.data.filter((element) => {
        var created_at = new Date(element.created_at)
        if (created_at.getTime() > this.max_day.getTime()){
          this.max_day = created_at
        }
        if (this.checkDateGreater(created_at, min_day) && this.checkDateLess(created_at, max_day)){
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

    checkDateLess(a, b){
      if (a.getFullYear() < b.getFullYear()){
        return true
      }else if(a.getFullYear() == b.getFullYear()){
        if (a.getMonth() < b.getMonth()){
          return true
        }else if (a.getMonth() == b.getMonth()){
          if (a.getDate() <= b.getDate()){
            return true
          }else return false
        }else return false
      }else return false
    },

    checkDateGreater(a, b){
      if (a.getFullYear() > b.getFullYear()){
        return true
      }else if(a.getFullYear() == b.getFullYear()){
        if (a.getMonth() > b.getMonth()){
          return true
        }else if (a.getMonth() == b.getMonth()){
          if (a.getDate() >= b.getDate()){
            return true
          }else return false
        }else return false
      }else return false
    },

    getWordsTypeColor(value){
      if (value){
        if (value == this.kindOfWords){
            return ''
        }
        switch(value){
          case 'words':
            return 'secondary'
          case 'hashtags':
            return 'info'
          case 'images':
            return 'success'
          case 'videos':
            return 'error'
        }
      }else{
        switch(this.kindOfWords){
          case 'words':
            return 'secondary'
          case 'hashtags':
            return 'info'
          case 'images':
            return 'success'
          case 'videos':
            return 'error'
        }
      }
    },

    getSettedDays(){
      var len = this.daysModel.length
      if (len == 1){
        this.daysModel[1] = this.daysModel[0]
      }
      if (this.daysModel[0].getTime() == this.daysModel[1].getTime()){
        this.daysModelStr = this.daysModel[0].getFullYear() + '.'  + ((this.daysModel[0].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel[0].getMonth() + 1) + '.' + this.daysModel[0].getDate()
      }else{
        this.daysModelStr = this.daysModel[0].getFullYear() + '.'  + ((this.daysModel[0].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel[0].getMonth() + 1) + '.' + this.daysModel[0].getDate() +
        ' ~ ' + this.daysModel[len-1].getFullYear() + '.'  + ((this.daysModel[len-1].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel[len-1].getMonth() + 1) + '.' + this.daysModel[len-1].getDate()
      }
    },
  },
})

</script>

<style lang="scss" scoped>
  .v-btn.active .v-icon {
    transform: rotate(-180deg);
  }
</style>
