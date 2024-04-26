import { defineStore } from "pinia";
import axios from "axios";
import { perLanguageData } from "../models/perLanguageData";
import { hashtags_freq } from "../models/hastagsfrequency";
import hashtags from '../data/Tweets_hashtag_counts.json'
export const MainStore = defineStore("main", {
  state: () => ({
    debug: false,
    data: [] as perLanguageData[],
    hashtags_freq: [],
  }),
  getters: {


  },
  actions: {
    parseData(min = 15){
      console.log(this.data)
      var new_data = [];
      this.data.forEach(element1 => {
        if (element1.lang != 'all'){
          if (element1.total < min){
            var pos = new_data.findIndex((element) => element.lang == 'other' && element.created_at == element1.created_at && element.sentiment=='positive')
            var neg = new_data.findIndex((element) => element.lang == 'other' && element.created_at == element1.created_at && element.sentiment=='negative')
            var neutral = new_data.findIndex((element) => element.lang == 'other' && element.created_at == element1.created_at && element.sentiment=='neutral')
            if (pos == -1){
              new_data.push({created_at: element1.created_at, sentiment: 'positive', lang: 'other', value: element1.positive})
            }else{
              new_data[pos] = {created_at: element1.created_at, sentiment: 'positive', lang: 'other', value: element1.positive + new_data[pos].value}
            }
            if (neg == -1){
              new_data.push({created_at: element1.created_at, sentiment: 'negative', lang: 'other', value: element1.negative})
            }else{
              new_data[neg] = {created_at: element1.created_at, sentiment: 'negative', lang: 'other', value: element1.negative + new_data[neg].value}
            }
            if (neutral == -1){
              new_data.push({created_at: element1.created_at, sentiment: 'neutral', lang: 'other', value: element1.neutral})
            }else{
              new_data[neutral] = {created_at: element1.created_at, sentiment: 'neutral', lang: 'other', value: element1.neutral + new_data[neutral].value}
            }
          }else{
            new_data.push({created_at: element1.created_at, sentiment: 'negative', lang: element1.lang, value: element1.negative})
            new_data.push({created_at: element1.created_at, sentiment: 'neutral', lang: element1.lang, value: element1.neutral})
            new_data.push({created_at: element1.created_at, sentiment: 'positive', lang: element1.lang, value: element1.positive})
          }
        }
      });
      new_data = new_data.sort(function(first, second) {
        return (first.created_at - second.created_at) - (first.value - second.value);
      });
      this.yourVlSpec.data.values = new_data
    },
    async get_hashtags_freq(){
      this.data = hashtags as hashtags_freq[]
      var new_data = [] as hashtags_freq[];
      // this.data.forEach((element) => {
      //   var created_at = new Date(element.created_at)
      //   if (created_at > new Date('2024-01-01') && created_at < new Date('2024-01-31')){
      //     new_data.push(element)
      //   }
      //   }
      // )
      this.data = this.data.filter((element) => {
        var created_at = new Date(element.created_at)
        if (created_at > new Date('2024-01-01') && created_at < new Date('2024-01-9')){
          return element
        }
      })
      console.log(new_data)
      // this.data = new_data
      return this.data
    },
}
})
