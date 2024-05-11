<template>
  <div class="d-flex justify-center align-center" :style="{ height: this.get_height() + 'px' }">
    <v-progress-circular
      :size="100"
      :width="8"
      indeterminate
    >Loading...</v-progress-circular>
  </div>
</template>

<script lang="ts">
import { defineComponent} from 'vue';

export default defineComponent({
  name: 'Loading',
  methods:{
    get_height(){
      return window.innerHeight - 100
    }
  }
})
</script>

<style scoped>
  .v-progress-circular {
    margin: 1rem;
  }

  .div_center {
    height: 500px;
  }
</style>
