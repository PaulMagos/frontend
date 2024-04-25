/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import App from './App.vue'
import axios from 'axios'
import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'

axios.defaults.withCredentials = true;
axios.defaults.baseURL = './';

const app = createApp(App)

registerPlugins(app)
app.mount('#app')
