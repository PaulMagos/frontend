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
      var collapsed_data = {}
      this.data.forEach((element) => {
        const word = this.kindOfWords === 'hashtags' ? element.hashtag : element.word;
        var elem = [word, element.frequency]
        if (elem[0] in collapsed_data)
          collapsed_data[elem[0]] += elem[1]
        else
          collapsed_data[elem[0]] = elem[1]
      })

      var new_data = []
      Object.entries(collapsed_data).forEach(([key, value]) =>{
        new_data.push({x: key,y: value})
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
            chart: {
              height: 350,
              type: 'treemap',
              toolbar: {
                show: false
              },
              offsetY: -10,
            },
            theme: {
              mode: this.theme=='darkTheme'? 'dark' : 'light',
              palette: 'palette7',
            }
          },
    }
  }
})

</script>
