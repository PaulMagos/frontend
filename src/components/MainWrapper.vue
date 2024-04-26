<template>
      <v-card :theme="theme" elevation="0">
        <MainChart :theme="theme"></MainChart>
        <!-- <WordChartWrapper :theme="this.theme" :adapter="adapter" :days="[new Date(`2024-01-06`), new Date(`2024-01-06`)]"></WordChartWrapper> -->
      </v-card>
</template>

<script lang="js">
import MainChart from './MainChart.vue'
import { defineComponent } from 'vue';
import WordChartWrapper from './WordChartWrapper.vue';

export default defineComponent({
  name: 'MainWrapper',
  props: {
    theme: String,
    adapter: Object,
  },
  data(){
    return{
      theme: this.theme
    }
  },
  methods:{
    windowHeight(){
      return window.innerHeight
    },
  },
})
</script>
