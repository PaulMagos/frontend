<template>
    <Loading v-if="loading"></Loading>
    <vue-word-cloud
      v-else
      :style="`height: ` + (this.get_height()) + `px; width: `+ (this.get_width()-10) + `px; cursor: pointer;`"
      :words="get_date_formatted()"
      font-family="serif"
      spacing="0.2"
      rotation-unit="deg"
      :rotation="getRotation"
      animation-easing="linear"
      font-size-ratio="0.4"
      animation-duration="2500"
      :color="this.theme=='darkTheme'? `white` : `black`"
      class="ml-2"
      enter-animation="bounce"
      leave-animation="bounce"
      >
    </vue-word-cloud>
</template>

<script>
import { defineComponent } from 'vue';
import * as d3 from "d3";
import VueWordCloud from 'vuewordcloud';

export default defineComponent({
  name: 'WordCloud',
  watch:{
    data: function(old_val, new_val){
      if (old_val!=undefined){
        this.loading=false
        this.get_date_formatted()
      }else{
        this.loading=true
      }
    },
  },
  components:{
    [VueWordCloud.name]: VueWordCloud,
  },
  props:{
    theme: String,
    data: Array,
    kindOfWords: String,
  },
  data(){
    return{
      loading: false,
      local_data: [],
    }
  },
  created() {
  },
  async mounted(){
  },
  methods:{
    get_width(){
      return window.innerWidth/12 * 9 -20
    },
    get_height(){
      return window.innerHeight/1.15
    },
    get_date_formatted(){
      var new_data = []

      if (!this.loading){
        this.data.forEach((element) => {
          new_data.push([element.word, element.frequency])
        })

        return this.local_data = new_data
      }
    },

    getRotation() {
      const randomNumber = Math.random(); // Generates a random number between 0 and 1
      return randomNumber > 0.5 ? '90' : '0';
    },
  },
  computed: {
  },
})
</script>
