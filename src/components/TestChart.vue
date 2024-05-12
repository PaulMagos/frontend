<template>
    <Loading v-if="this.loading"></Loading>
    <v-container v-else id="vegaBubble">
    </v-container>
</template>

<script>
import Loading from './Loading.vue'
import { defineComponent, toRaw } from 'vue'
import vegaBubble from "@/models/vegaBubble"
import vegaEmbed from 'vega-embed'
import carbon101 from "@/models/carbon101";
import googlechartsTheme from "@/models/googlecharts";
import axios from 'axios'

export default defineComponent({
  name: 'vegaBubbleChart',
  props:{
    theme: String,
  },
  data(){
    return{
      vegaChart: vegaBubble,
      loading: true,
      data: null,
    }
  },
  created(){
    this.updateData()
  },
  methods:{
    embed(){
      console.log(this.vegaChart)
      vegaEmbed('#vegaBubble',
            toRaw(this.vegaChart),
            {"actions": false, config: this.theme=='darkTheme'? carbon101 : googlechartsTheme }
          ).then(result => {
                result.view.addEventListener('click', (event, item) => { });
          }).catch(console.warn);
    },
    async updateData() {
      this.data = (await axios.get('/get_words?aggregate=false')).data
      while (this.data==undefined){
          setTimeout(() => {
            this.loading = true
          }, (500));
      }
      this.loading = false
      this.vegaChart.data.values = this.data
      this.embed()
    },
    onResize() {
      this.vegaChart.width = window.innerWidth/1.25 - 100
      this.vegaChart.height = window.innerHeight/1.8 - 60
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
