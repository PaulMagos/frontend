<template>
    <v-card :theme="theme" elevation="0">
      <!-- <MainChart ref="main_chart" :theme="theme"></MainChart> -->
      <TestChart :theme="theme"></TestChart>
      <!-- <TEst :theme="theme"></TEst> -->
    </v-card>
</template>

<script lang="js">
import TestChart from './TestChart.vue'
import TEst from './TEst.vue'
import { defineComponent } from 'vue';

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
