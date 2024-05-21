<template>
  <Loading v-if="loading"></Loading>
  <apexchart v-else class="ml-2 mr-2" :width="get_width()" :height="get_height()" :options="chartOptions" :series="this.series">
  </apexchart>
</template>


<script>
import { defineComponent } from "vue";
import VueApexCharts from "vue3-apexcharts";

export default defineComponent({
  name: 'TreeMap',
  watch:{
    data: function(old_val, new_val){
      if (old_val!=undefined){
        this.loading=false
        this.arrangeData()
      }else{
        this.loading=true
      }
    },
  },
  created(){
    this.arrangeData()
  },
  components:{
    apexchart: VueApexCharts
  },
  props:{
    theme: String,
    data: Array,
    kindOfWords: String,
  },
  methods:{
    get_width(){
      return window.innerWidth/12*9 -20
    },
    get_height(){
      return window.innerHeight/1.15
    },
    arrangeData(){
      var new_data = []

      if (!this.loading){
        this.data.forEach((element) => {
          new_data.push({x: element.word,y: element.frequency})
        })

        this.series[0].data = new_data
      }
    },
  },
  data(){
    return{
      loading: false,
      series: [
            {
              data: []
            }
          ],
          chartOptions: {
            legend: {
              show: false
            },
            tooltip: {
              followCursor: true,
              style:{
                fontSize: "16px",
              },
            },
            dataLabels:{
              style:{
                fontSize: "18px",
              },
            },
            chart: {
              height: 350,
              type: 'treemap',
              toolbar: {
                show: false
              },
              offsetY: -10,
              background: this.theme=='darkTheme'? 'dark' : 'light',
            },
            theme: {
              mode: this.theme=='darkTheme'? 'dark' : 'light',
              // palette: 'palette1',
            }
          },
    }
  }
})

</script>
