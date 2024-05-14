<template>
    <Loading v-if="this.loading"></Loading>
    <v-container v-else id="StreamChart">
    </v-container>
</template>

<script>
import Loading from './Loading.vue'
import { defineComponent, toRaw } from 'vue'
import carbon101 from "@/models/carbon101";
import googlechartsTheme from "@/models/googlecharts";
import axios from 'axios'
import * as d3 from "d3";

export default defineComponent({
  name: 'StreamChart',
  props:{
    theme: String,
  },
  data(){
    return{
      StreamChart: null,
      loading: true,
      data: null,
    }
  },
  created(){
    this.updateData()
  },
  methods:{
    embed(){
    },
    async updateData() {
      this.data = (await axios.get('/get_words?aggregate=false')).data
      while (this.data==undefined){
          setTimeout(() => {
            this.loading = true
          }, (500));
      }
      this.loading = false
      this.embed()
    },
    onResize() {
      this.embed()
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.embed()
    })
  },
})
</script>
