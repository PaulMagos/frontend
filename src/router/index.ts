import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../components/MainWrapper.vue'
import AboutUs from '../components/AboutUs.vue'

const routes = [
  { path: '/', component: HomeView, meta: {transition: 'slide-left'}},
  { path: '/about', component: AboutUs, meta: {transition: 'slide-right'} },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
