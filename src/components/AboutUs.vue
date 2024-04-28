<template>
  <v-card :theme="this.theme" elevation="0">
    <div class="py-10"></div>
    <v-card-title>
        About Us
    </v-card-title>
      <v-img
        class="align-end text-white profile-picture"
        :src="image"
        cover
      >
      <v-card-title>{{ name }}</v-card-title>
      </v-img>
      <p>{{ description }}</p>

    <ul class="social-links">
       <li><a :href="linkedin" target="_blank"><i class="fa fa-linkedin" aria-hidden="true"></i> LinkedIn</a></li>
       <li><a :href="github" target="_blank"><i class="fa fa-github" aria-hidden="true"></i> Github</a></li>
     </ul>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AboutUs',
  props: {
    theme: String,
  },
  data() {
    return {
      image: 'https://media.licdn.com/dms/image/D4D03AQG_IIKN8X4eWA/profile-displayphoto-shrink_800_800/0/1709633416720?e=1720051200&v=beta&t=0IKD3ciO4x0rZ-qM_REna1uRHwZqY8-1nz1pWyMeV2Y', // Replace with your profile picture URL
      name: 'Paul Magos', // Replace with your name
      linkedin: 'https://www.linkedin.com/in/paulmagos/',
      short_bio: 'Research Fellow & Master\'s Student in Computer Science - Artificial Intelligence',
      github: 'https://github.com/PaulMagos',
      description:
        'As a Research Fellow at Università di Pisa, I delve into projects at the intersection of cutting-edge technologies and impactful research. My expertise spans tweet retrieval, text/sentiment analysis, image tagging, and video transcription. Leveraging my skills in software engineering, data analysis, and machine learning, I craft innovative solutions and develop robust web platforms to disseminate research findings effectively. In pursuit of academic excellence, I am concurrently pursuing a Master\'s degree in Computer Science - Artificial Intelligence at Università di Pisa. This academic journey has equipped me with a comprehensive understanding of AI domains, including natural language processing, computer vision, deep learning, and reinforcement learning. I am driven by a fervent desire to continuously expand my knowledge and embrace emerging technologies to propel my research endeavors forward. With a profound commitment to leveraging AI for societal benefit, I am dedicated to advancing the frontiers of artificial intelligence and fostering its ethical applications. Collaborate with me to explore the transformative potential of AI in addressing real-world challenges.',
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

.social-links {
  list-style: none;
  margin-top: 20px;
}

.social-links li {
  display: inline-block;
  margin-right: 10px;
}

.social-links a {
  text-decoration: none;
  color: #337ab7;
}

.social-links i {
  font-size: 18px;
  margin-right: 5px;
}
</style>
