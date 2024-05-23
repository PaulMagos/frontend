<template>
  <div  class="py-10">
  <v-row class="py-10 ml-4 mr-4">
    <v-card
    id='mycard'
    class="mx-auto"
    :max-width="width"
    subtitle="AI Student"
    >
    <template v-slot:prepend>
        <v-img
        class="align-end text-white profile-picture"
        :src="image"
        width="100"
        height="100"
        cover
        ></v-img>
    </template>
    <template v-slot:title>
      <h1 class="font-weight-black">{{ name }}</h1>
    </template>
    <template v-slot:subtitle>
      <h1 class="font-weight-black">AI Student</h1>
    </template>

    <v-card-text class="pt-4" elevation="10">
      {{description}}
    </v-card-text>
    <v-card-actions>
      <v-btn :href='mail'>
        Send an Email
        <v-icon>mdi-send</v-icon>
      </v-btn>
      <div class="px-2"></div>
      <v-divider></v-divider>
      <v-btn :href="linkedin" target="_blank">
        <v-icon>mdi-linkedin</v-icon>
        Linkedin
      </v-btn>
      <v-btn :href="github" target="_blank">
        <v-icon>mdi-github</v-icon>
        Github
      </v-btn>
    </v-card-actions>
  </v-card>
</v-row>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AboutUs',
  props: {
    theme: String,
  },
  method:{
    get_width(){
      return this.width
    },
    onResize(){
      this.width = window.innerWidth/1.2
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.$nextTick(async () => {
      window.addEventListener('resize', this.onResize)
    })
  },
  data() {
    return {
      mail: 'mailto:paulmagos@icloud.com',
      width: window.innerWidth/1.2,
      image: 'https://media.licdn.com/dms/image/D4D03AQG_IIKN8X4eWA/profile-displayphoto-shrink_800_800/0/1709633416720?e=1720051200&v=beta&t=0IKD3ciO4x0rZ-qM_REna1uRHwZqY8-1nz1pWyMeV2Y', // Replace with your profile picture URL
      name: 'Paul Magos', // Replace with your name
      linkedin: 'https://www.linkedin.com/in/paulmagos/',
      short_bio: 'Research Fellow & Master\'s Student in Computer Science - Artificial Intelligence',
      github: 'https://github.com/PaulMagos',
      description:
        'As a Student of Artificial Intelligence at Università di Pisa, I delve into projects at the intersection of cutting-edge technologies and impactful research. Leveraging my skills in software engineering, data analysis, and machine learning, I craft innovative solutions and develop robust web platforms to disseminate research findings effectively. My academic journey has equipped me with a comprehensive understanding of AI domains, including natural language processing, computer vision, deep learning, and reinforcement learning. I am driven by a fervent desire to continuously expand my knowledge and embrace emerging technologies to propel my research endeavors forward. Collaborate with me to explore the transformative potential of AI in addressing real-world challenges.',
    };
  },
})
</script>


<style>
.profile-picture {
  width: 200px;
  height: 200px;
  border-radius: 5%;
  margin-bottom: 15px;
}
</style>
