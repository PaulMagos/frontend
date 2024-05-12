<template>
  <apexchart class="ml-2 mr-2" :width="get_width()" :height="get_height()" :options="chartOptions" :series="arrangeData()">
  </apexchart>
</template>


<script>
import { defineComponent } from "vue";
import VueApexCharts from "vue3-apexcharts";

export default defineComponent({
  name: 'TreeMap',
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

      this.data.forEach((element) => {
        new_data.push({x: element.word,y: element.frequency})
      })

      this.series[0].data = new_data
      return this.series
    },
  },
  data(){
    return{
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
