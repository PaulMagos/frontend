<template>
  <div>
    <v-row>
      <v-col v-if="this.loading" cols="9">
        <Loading></Loading>
      </v-col>
      <v-col v-else cols="9">
        <BubbleChart :loading="this.loading" :theme='this.theme' :kindOfWords="kindOfWords" ref="BubbleChart" :data="this.data" v-if="chartType=='bubble'"></BubbleChart>
        <WordCloud :loading="this.loading" :theme="this.theme" :kindOfWords="kindOfWords" :data="this.data" v-if="chartType=='wordcloud'"></WordCloud>
        <TreeMap :loading="this.loading" :theme="this.theme" :kindOfWords="kindOfWords" :data="this.data" v-if="chartType=='treemap'"></TreeMap>
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
                    @click="menu = false; this.syncMyWords();"
                    >
                    <v-icon size="large">mdi-calendar-check</v-icon>
                  </v-btn>
                </v-card-actions>
                </v-card>
          </template>
        </v-menu>
      </v-row>
      <v-row>
        <v-select
          label="Language"
          :items="langItems"
          v-model="this.langModel"
        ></v-select>
      </v-row>
      <v-row>
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
      <v-row v-if="chartType=='bubble'">
        <v-btn-toggle mandatory v-model="combined">
          <v-btn @click="$refs.BubbleChart.combined = 'true'; $refs.BubbleChart.combinedFunc()" value="true">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn @click="$refs.BubbleChart.combined = 'false'; $refs.BubbleChart.combinedFunc()" value="false">
            <v-icon>mdi-vector-combine</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row>
          <v-btn-toggle mandatory :color="getWordsTypeColor()" v-model="kindOfWords">
            <v-btn :disabled="disabled_b['words']" value="words">
              <v-icon :color="getWordsTypeColor('words')" size="x-large">mdi-file-word-box-outline</v-icon>
            </v-btn>
            <v-btn :disabled="disabled_b['hashtags']" value="hashtags">
              <v-icon :color="getWordsTypeColor('hashtags')" size="x-large">mdi-pound-box-outline</v-icon>
            </v-btn>
            <v-btn :disabled="disabled_b['images']" value="images">
              <v-icon :color="getWordsTypeColor('images')" size="x-large">mdi-image-outline</v-icon>
            </v-btn>
            <v-btn :disabled="disabled_b['videos']" value="videos">
              <v-icon :color="getWordsTypeColor('videos')" size="x-large">mdi-video-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-row>
    </v-col>
  </v-row>
</div>
</template>



<script>
import { defineComponent, ref, toRaw } from 'vue';
import axios from 'axios'
import BubbleChart from './BubbleChart.vue';
import WordCloud from './WordCloud.vue';
import moment from 'moment'
import Loading from './Loading.vue'
export default defineComponent({
  name: 'WordChartWrapper',
  props: {
    theme: String,
    days: Array,
  },
  watch:{
    kindOfWords: function() {
      this.syncMyWords(false)
    },
    langModel: function() {
      this.syncMyWords(false)
    },
  },
  data(){
    return{
      chartType: 'bubble',
      menu: false,
      langModel: 'Italian',
      langItems: [],
      filter_min: 0,
      daysModel: this.days,
      daysModelStr: null,
      kindOfWords: 'words',
      wordsTypes: ['words', 'hashtags', 'images', 'videos'],
      min_day: this.days[0],
      max_day: this.days[this.days.length-1],
      loading: true,
      data: null,
      animation: ['', '', ''],
      disabled_b: {},
      combined: 'true',
      simulation: null,
    }
  },
  async created() {
    await this.syncMyWords()
  },
  async mounted(){
    // await this.syncMyWords()
  },
  methods: {
    runAnimation(value){
      this.animation[value] = 'mdi-spin'
      setTimeout(() => {
          this.animation[value] = ''
        }, 2000);
    },

    async syncMyWords(loading=true){
      this.check_presence()
      this.getSettedDays()
      this.loading = loading
      const source = this.kindOfWords
      var min_day = this.format_date(this.daysModel[0])
      var max_day = this.format_date(this.daysModel[this.daysModel.length-1] || this.daysModel[0])
      var data = (await axios.get(`/get_words?source=${source}&from_=${min_day}&to_=${max_day}&lang=${this.langModel}`)).data
      var langs = (await axios.get(`/get_langs_words?source=${source}`)).data

      this.data = undefined
      while (data==undefined){
        setTimeout(() => {
          this.loading = true
        }, (500));
      }

      if (!data.length>0){
        this.kindOfWords='words'
      }
      this.data = data
      if (loading==false && this.chartType=='bubble' && data.length>0){
        this.$refs.BubbleChart.reset_datapoints()
      }

      while (langs==undefined){
        setTimeout(() => {
          this.loading = true
        }, (500));
      }

      this.langItems=langs
      this.loading=false
    },

    format_date(value){
         if (value) {
           return moment(String(value)).format('YYYY-MM-DD')
          }
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

    check_presence(){
      var min_day = this.format_date(this.daysModel[0])
      var max_day = this.format_date(this.daysModel[this.daysModel.length-1] || this.daysModel[0])

      this.wordsTypes.forEach(async (elem) => {
        const source = elem
        var res = (await axios.get(`/check_words_presence?source=${source}&from_=${min_day}&to_=${max_day}&lang=${this.langModel}`)).data

        while (res==undefined){
          setTimeout(() => {
          }, (100));
        }

        this.disabled_b[source] = !res
      })
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
