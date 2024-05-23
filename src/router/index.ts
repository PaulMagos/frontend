import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../components/MainWrapper.vue'
import HomeViewV2 from '../components/MainWrapperV2.vue'
import AboutUs from '../components/AboutUs.vue'

const routes = [
  { path: '/', component: HomeView, meta: {transition: 'slide-left'}},
  { path: '/V2', component: HomeViewV2, meta: {transition: 'slide-left'}},
  { path: '/about', component: AboutUs, meta: {transition: 'slide-right'} },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
