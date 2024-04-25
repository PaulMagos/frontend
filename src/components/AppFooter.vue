<template>
  <v-footer elevation="16" :theme="this.theme" height="35%" class="d-flex flex-column" app>
    <div class="d-flex w-100 align-center px-4">
    <p>
      <a  style="text-decoration:none; color: inherit" href="https://github.com/PaulMagos">Made with <v-icon color="red">mdi-heart</v-icon> by Paul Magos</a>
    </p>
    </div>

    <div
      class="text-caption text-disabled px-4"
      style="position: absolute; right: 16px;"
    >
      &copy; 2024 <span class="d-none d-sm-inline-block">Paul Magos</span>
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
      theme: this.theme
    }
  },
  methods: {
    getTheme(){
      return this.theme? 'dark' : 'ligh'
    }

  }
})
</script>

<style>
</style>
