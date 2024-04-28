<template>
  <v-footer app :theme="this.theme" class="d-flex flex-column">
    <div class="d-flex w-100 align-center px-4">

    <a  style="text-decoration:none; color: inherit" href="https://github.com/PaulMagos">Made with <v-icon color="red">mdi-heart</v-icon> by Paul Magos</a>
    <v-spacer></v-spacer>
    <span class="d-none d-sm-inline-block"> &copy; 2024  Paul Magos</span>
    </div>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppFooter',
  props:{
    theme: String,
  },
  data(){
    return {
      currtheme: this.theme
    }
  },
  methods: {
    getTheme(){
      return this.currtheme? 'dark' : 'ligh'
    }

  }
})
</script>

<style>
</style>
