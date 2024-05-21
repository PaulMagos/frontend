<template>
  <div>
    <v-row>
      <v-col cols="9">
          <BubbleChart :bubbleMode='this.chart.bubbleMode' :theme='this.theme' :kindOfWords="wordsModel.source" ref="BubbleChart" :data="this.data" v-if="chart.chartType=='bubble'"></BubbleChart>
        <Transition>
          <WordCloud :theme="this.theme" :kindOfWords="wordsModel.source" :data="this.data" v-if="chart.chartType=='wordcloud'"></WordCloud>
        </Transition>
        <TreeMap :theme="this.theme" :kindOfWords="wordsModel.source" :data="this.data" v-if="chart.chartType=='treemap'"></TreeMap>
        <Transition>
          <StreamChart :theme="this.theme" :kindOfWords="wordsModel.source" :data="this.streamdata" :aggredated_data="this.data" v-if="chart.chartType=='stream'"></StreamChart>
        </Transition>
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
              v-model="daysModel.days_as_String"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="activatorProps"
            ></v-text-field>
          </template>
          <template v-slot:default="{ isActive }">
                <v-card>
                  <v-date-picker
                      v-model="this.daysModel.local_days"
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
                    @click="menu = false; daysModel.old_date_confirmed = false"
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
          :items="langModel.langItems"
          v-model="this.langModel.language"
        ></v-select>
      </v-row>
      <v-row>
        <v-btn-toggle mandatory v-model="chart.chartType">
          <v-btn @click="runAnimation(i)" v-for="el, i in chart.chartTypes" :value="el">
            <v-icon size="x-large">{{chart.chartIcon[i]}} {{ chart.animation[i] }}</v-icon>
            <v-tooltip
                  activator="parent"
                  location="bottom"
            >{{ el[0].toUpperCase() + el.slice(1) }}</v-tooltip>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row v-if="chart.chartType=='bubble'">
        <v-btn-toggle mandatory v-model="chart.bubbleMode.mode">
          <v-btn @click="$refs.BubbleChart.resetCenter()" :value=0>
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn @click="$refs.BubbleChart.splitByFrequency(chart.bubbleMode.min_frequency, color=chart.bubbleMode.color)" :value=1>
            <v-icon>mdi-vector-combine</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-row v-if="chart.bubbleMode.mode==1">
        <v-col>
          <v-color-picker
          v-model="chart.bubbleMode.color"
          hide-inputs
          :swatches="swatchesModel.swatches"
          hide-canvas
          show-swatches
          ></v-color-picker>
        </v-col>
        <v-col>
          <v-number-input
          control-variant="split"
          :min="-1"
          :model-value="chart.bubbleMode.min_frequency"
        ></v-number-input>
        </v-col>
      </v-row>
      <v-row>
          <v-btn-toggle mandatory :color="wordsModel.buttonColors[wordsModel.source]" v-model="wordsModel.source">
            <v-btn v-for='elem in wordsModel.wordsTypes' :value="elem" :disabled="wordsModel.disabled[elem]">
              <v-icon :color="wordsModel.source!=elem? wordsModel.buttonColors[elem]:''" size="x-large">{{wordsModel.wordsIcons[elem]}}</v-icon>
              <v-tooltip
                  activator="parent"
                  location="bottom"
              >{{ elem[0].toUpperCase() + elem.slice(1) }}</v-tooltip>
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
import StreamChart from './StreamChart.vue';
export default defineComponent({
  name: 'WordChartWrapper',
  props: {
    theme: String,
    days: Array,
  },
  watch:{
    theme: function(old_val, new_val){
      if(new_val!=old_val){
        const tmp = this.swatchesModel.swatches[3]
        this.swatchesModel.swatches[3] = this.swatchesModel.themedSwatch
        this.swatchesModel.themedSwatch = tmp
      }
    },
    'wordsModel.source': function (old_value, new_val){
          if (old_value != new_val){
            this.data=undefined
            this.syncMyWords()
          }
    },
    'langModel.language': function (old_value, new_val){
          if (old_value != new_val){
            this.syncMyWords()
          }
    },
    'daysModel.old_date_confirmed': function (old_value, new_val){
          if (old_value != new_val){
            this.syncMyWords()
            this.daysModel.old_date_confirmed=true
          }
    },
  },
  data(){
    return{
      // Chart model which for the current chart setting and possble charts that we can select
      chart: {
        chartType: 'bubble',
        chartTypes: ['bubble', 'treemap', 'wordcloud', 'stream'],
        chartIcon: ['mdi-chart-bubble', 'mdi-file-tree', 'mdi-weather-cloudy', 'mdi-view-stream'],
        animation: ['', '', '', ''],
        bubbleMode: {color: '#FFA700', min_frequency: 5, mode: 0},
      },
      // Language filter model which contains all the informations for changing the source language
      langModel: {
        language: 'Italian',
        langItems: [],
      },
      // Timeline filter model which contains all the informations for changing the days from which we want to see the words frequency
      daysModel: {
        local_days: this.days,
        days_as_String: null,
        min_day: this.days[0],
        max_day: this.days[this.days.length-1],
        old_date_confirmed: true,
      },
      // Words model which contains all the informations for changing the source of the words and frequencies, and also buttons information (e.g. colors)
      wordsModel: {
        source: 'words',
        wordsTypes: ['words', 'hashtags', 'images', 'videos'],
        wordsIcons: {'words': 'mdi-file-word-box-outline', 'hashtags': 'mdi-pound-box-outline', 'images': 'mdi-image-outline', 'videos': 'mdi-video-outline'},
        disabled: {'words': false, 'hashtags': false, 'images': false, 'videos': false},
        buttonColors: {'words': 'secondary', 'hashtags': 'info', 'images': 'success', 'videos': 'error'}
      },

      // Colors for slitted bubble chart
      swatchesModel:{
        swatches: [
          ['#FF0000'],
          ['#FFA700'],
          ['#0087F6'],
          ['#14202B'],
        ],
      },
      filter_min: 0,
      filter_type: 'tf_idf',
      // Menu
      menu: false,
      data: null,
      streamdata: null,
      min_frequency: -1,
      simulation: null,
    }
  },
  async created() {
    if (this.theme=='darkTheme'){
      this.swatchesModel.swatches.splice(3, 1)
    }
    await this.syncMyWords()
  },
  async mounted(){

    // await this.syncMyWords()
  },
  methods: {
    runAnimation(value){
      this.chart.animation[value] = 'mdi-spin'
      setTimeout(() => {
          this.chart.animation[value] = ''
        }, 2000);
    },

    async syncMyWords(){
      this.check_presence()
      this.getSettedDays()
      const source = this.wordsModel.source
      const min_day = this.format_date(this.daysModel.local_days[0])
      const max_day = this.format_date(this.daysModel.local_days[this.daysModel.local_days.length-1] || this.daysModel.local_days[0])
      this.data = (await axios.get(`/get_words?source=${source}&from_=${min_day}&to_=${max_day}&lang=${this.langModel.language}`)).data
      this.streamdata = (await axios.get(`/get_words?source=${source}&from_=${min_day}&to_=${max_day}&lang=${this.langModel.language}&aggregate=false&pivot=true`)).data
      var langs = (await axios.get(`/get_langs_words?source=${source}`)).data


      if (this.data!=undefined && this.data.length==0){
        this.wordsModel.source='words'
      }

      // if (this.chart.chartType=='bubble'){
      //   this.$refs.BubbleChart.get_date_formatted(this.data)
      // }

      while (langs==undefined){
        setTimeout(() => {
        }, (500));
      }

      this.langModel.langItems=langs
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
      var min_day = this.format_date(this.daysModel.local_days[0])
      var max_day = this.format_date(this.daysModel.local_days[this.daysModel.local_days.length-1] || this.daysModel.local_days[0])

      this.wordsModel.wordsTypes.forEach(async (elem) => {
        const source = elem
        var res = (await axios.get(`/check_words_presence?source=${source}&from_=${min_day}&to_=${max_day}&lang=${this.langModel.language}`)).data

        while (res==undefined){
          setTimeout(() => {
          }, (100));
        }

        this.wordsModel.disabled[source] = !res
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

    getSettedDays(){
      var len = this.daysModel.local_days.length
      if (len == 1){
        this.daysModel.local_days[1] = this.daysModel.local_days[0]
      }
      if (this.daysModel.local_days[0].getTime() == this.daysModel.local_days[1].getTime()){
        this.daysModel.days_as_String = this.daysModel.local_days[0].getFullYear() + '.'  + ((this.daysModel.local_days[0].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel.local_days[0].getMonth() + 1) + '.' + this.daysModel.local_days[0].getDate()
      }else{
        this.daysModel.days_as_String = this.daysModel.local_days[0].getFullYear() + '.'  + ((this.daysModel.local_days[0].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel.local_days[0].getMonth() + 1) + '.' + this.daysModel.local_days[0].getDate() +
        ' ~ ' + this.daysModel.local_days[len-1].getFullYear() + '.'  + ((this.daysModel.local_days[len-1].getMonth() + 1) > 9 ? '' : '0') + (this.daysModel.local_days[len-1].getMonth() + 1) + '.' + this.daysModel.local_days[len-1].getDate()
      }
    },
  },
})

</script>

<style lang="scss" scoped>
  .v-btn.active .v-icon {
    transform: rotate(-180deg);
  }
.v-enter-active{
  transition: opacity 4s ease;
}
.v-leave-active,

.v-enter-from{
  opacity: 0;
}
.v-leave-to {
  opacity: 0;
}
</style>
