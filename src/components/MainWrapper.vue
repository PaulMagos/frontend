<template>
    <v-card :theme="theme" elevation="0">
      <!-- <MainChart ref="main_chart" :theme="theme"></MainChart> -->
      <AlternativeMainChart ref="main_chart" :theme="theme"></AlternativeMainChart>
      <!-- <WordChartWrapper></WordChartWrapper> -->
    </v-card>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import WordChartWrapper from './WordChartWrapper.vue';
import AlternativeMainChart from './AlternativeMainChart.vue';

export default defineComponent({
  name: 'MainWrapper',
  props: {
    theme: String,
  },
  data(){
    return{
    }
  },
  methods:{
    windowHeight(){
      return window.innerHeight
    },
  },
})
</script>
