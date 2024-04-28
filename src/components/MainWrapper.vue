<template>
    <v-card :theme="theme" elevation="0">
      <MainChart ref="main_chart" :theme="theme"></MainChart>
    </v-card>
</template>

<script lang="js">
import MainChart from './MainChart.vue'
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
