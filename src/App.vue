<template>
    <v-app :theme="isDark? 'darkTheme' : 'lightTheme'" class="d-flex justify-center align-center">
      <Navbar elevation="2" @toggleTheme="toggleDark()" :theme="isDark? 'darkTheme' : 'lightTheme'" />
      <v-main :theme="isDark? 'darkTheme' : 'lightTheme'">
          <RouterView  @toggleTheme="toggleDark()" v-slot="{ Component }" :theme="isDark? 'darkTheme' : 'lightTheme'" class="d-flex py-8 justify-center align-center">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
      </v-main>
      <AppFooter :theme="isDark? 'darkTheme' : 'lightTheme'"/>
      </v-app>
    </template>

<script setup lang="ts">
import { useDate } from 'vuetify'
import { RouterView } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
