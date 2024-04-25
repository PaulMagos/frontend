<template>
  <v-app>
    <v-container>
      <v-date-picker v-model="this.myDate" multiple="range"></v-date-picker>
    </v-container>
    <p>Selected date: {{ myDate }}</p>
  </v-app>
</template>

<script>
  import { defineComponent } from 'vue'

  export default defineComponent({
    data(){
      return{
        myDate: [new Date('2024-01-01'), new Date('2024-01-10')]
      }
    }
  })
</script>
