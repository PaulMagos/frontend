<template>
  <v-app-bar :theme="this.theme">
    <v-app-bar-title><v-icon @click="this.goToHome()" color="cyan">mdi-chart-arc</v-icon></v-app-bar-title>
      <v-icon @click="$emit('toggleTheme')" value="about"> mdi-theme-light-dark </v-icon>
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
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/')
    },
    goToAbout() {
      this.$router.push('/about')
    },
  },
})
</script>
