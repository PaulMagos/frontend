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
    async get_hashtags_freq(){
      this.data = hashtags as hashtags_freq[]
      var new_data = [] as hashtags_freq[];
      this.data = this.data.filter((element) => {
        var created_at = new Date(element.created_at)
        if (created_at > new Date('2024-01-01') && created_at < new Date('2024-01-9')){
          return element
        }
      })
      console.log(new_data)
      return this.data
    },
}
})
