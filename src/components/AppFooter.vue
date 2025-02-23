<template>
  <v-footer app :theme="theme" class="d-flex flex-column">
    <div class="d-flex w-100 align-center px-4">
      <a style="text-decoration:none; color: inherit" href="https://github.com/PaulMagos">
        Made with <v-icon color="red">mdi-heart</v-icon> by Paul Magos
      </a>
      <v-spacer></v-spacer>

      <!-- University Logo -->
      <v-img
        class="university-logo_"
        :class="{ 'dark-mode-logo_': theme === 'lightTheme' }"
        style="
          max-width: 150px;
        "
        src="../assets/unipi-logo-new.png"
        alt="University of Pisa Logo"
      />
    </div>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppFooter',
  props: {
    theme: String,
  },
});
</script>

<style>
.university-logo_ {
  transition: filter 0.3s ease-in-out;
  max-height: 10;
}

.dark-mode-logo_ {
  filter: invert(1);
  max-height: 10;
}
</style>
