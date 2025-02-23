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

const dev = process.env.NODE_ENV !== "production";
axios.defaults.withCredentials = false;
axios.defaults.baseURL = dev ? 'https://x-research-backend.vercel.app/' ?? "http://127.0.0.1:8000" : 'https://x-research-backend.vercel.app' ?? "https://unipi.it/";

const app = createApp(App)

registerPlugins(app)
app.mount('#app')
