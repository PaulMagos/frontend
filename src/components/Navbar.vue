<template>
  <v-app-bar elevation="0" :theme="this.theme">
    <v-app-bar-title><v-icon @click="this.goToHome()" color="cyan">mdi-chart-arc</v-icon></v-app-bar-title>
      <v-icon @click="$emit('toggleTheme')"> mdi-theme-light-dark </v-icon>
      <div class="px-2"></div>
      <v-btn-toggle v-model="mainV">
        <v-btn @click="this.goToV1" value='V1'>
            V1
        </v-btn>
        <v-btn @click="this.goToV2" value='V2'>
            V2 (alpha)
        </v-btn>
      </v-btn-toggle>
      <div class="px-2"></div>
      <v-btn @click="this.goToAbout" value="about">
        <v-icon>mdi-heart</v-icon>
        <span>About</span>
      </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props:{
    theme: String,
  },
  data () {
    return {
      drawer: null,
      mainV: 'V1',
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/')
    },
    goToAbout() {
      this.$router.push('/about')
    },
    goToV1() {
      this.goToHome()
    },
    goToV2() {
      this.$router.push('/V2')
    },
  },
})
</script>
