<template>
  <!-- <v-card :theme="this.theme"> -->
    <!-- <v-card-title> -->
    <!-- </v-card-title> -->
    <!-- <v-container class="elevation-4"> -->
      <v-card :theme="theme" elevation="0">
      <!-- <MainChart :theme="this.theme"></MainChart> -->
        <BubbleChart :days="[new Date(`2024-01-06`), new Date(`2024-01-21`)]"></BubbleChart>
        <!-- <WordCloud :days="[new Date(`2024-01-06`), new Date(`2024-01-20`)]"></WordCloud> -->
        <!-- <TestChart></TestChart> -->
    <!-- </v-container> -->
      </v-card>
</template>

<script lang="js">
import BubbleChart from './BubbleChart.vue';
import MainChart from './MainChart.vue'
import TestChart from './TestChart.vue'
import { defineComponent } from 'vue';
import WordCloud from './WordCloud.vue';

export default defineComponent({
  name: 'MainWrapper',
  props: {
    theme: String
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
