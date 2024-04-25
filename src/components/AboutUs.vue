<template>
  <v-card :theme="this.theme" elevation="0">
    <div class="py-10"></div>
    <v-card-title>
        About Us
    </v-card-title>
    <v-card-actions>
        CIAO
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AboutUs',
  props: {
    theme: String,
  }
})
</script>
