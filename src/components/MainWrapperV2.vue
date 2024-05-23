<template>
    <v-card :theme="theme" elevation="0">
      <AlternativeMainChart ref="main_chart" :theme="theme"></AlternativeMainChart>
    </v-card>
</template>

<script lang="js">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainWrapperV2',
  props: {
    theme: String,
  },
  created(){
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
