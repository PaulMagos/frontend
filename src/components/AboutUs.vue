<template>
  <div class="py-10">
    <v-row class="py-10 ml-4 mr-4">
      <v-card id="mycard" class="mx-auto" :max-width="width" elevation="10">
        <v-row align="center">
          <!-- Profile Image (Left) -->
          <v-col cols="12" md="3" class="d-flex justify-center">
            <v-img
              class="profile-picture"
              :src="image"
              cover
              max-width="250"
              max-height="250"
            />
          </v-col>

          <!-- Name and Description (Right) -->
          <v-col cols="12" md="9">
            <v-card-title>
              <h1 class="font-weight-black" style="margin-left: 20px;">{{ name }}</h1>
            </v-card-title>
            <v-card-subtitle class="font-weight-bold" style="margin-left: 20px;">
              AI Graduate
            </v-card-subtitle>
            <v-card-text class="pt-4" style="margin-left: 20px;">
              {{ description }}
            </v-card-text>
          </v-col>
        </v-row>

        <!-- University Logo and Project Description -->
        <v-row align="center" style="margin-left:10px">
          <v-col cols="12" md="9">
            <v-card-text class="pt-4">
              <p>
                This website was developed as part of the TOM (Traces Of Movements) PRA project funded by the University of Pisa.
              </p>
              <p>
                The main objective of TOM is to offer an articulate and multifocal reading of the complex relationships woven in connection with migration, starting from the tangible, intangible and digital traces and their positioning in space and time through collaboration between different disciplines:
              </p>
              <div class="indented-list">
                <ul>
                  <li>Archaeology</li>
                  <li>Cultural Anthropology</li>
                  <li>Contemporary History</li>
                  <li>Information Technology</li>
                  <li>Visual Communication</li>
                </ul>
              </div>
              <p>
                For more information:
                <a href="https://www.mappalab.eu/en/tom-traces-of-movements/" target="_blank">TOM Project</a>
                | <a href="https://www.unipi.it/" target="_blank">University of Pisa</a>
              </p>
            </v-card-text>
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-center">
            <v-img
              class="university-logo"
              :class="{ 'dark-mode-logo': theme === 'lightTheme' }"
              src="../assets/unipi-logo.png"
              alt="University of Pisa Logo"
              width="150"
            />
          </v-col>
        </v-row>

        <!-- Contact Buttons -->
        <v-card-actions>
          <v-btn :href="mail">
            Send an Email
            <v-icon>mdi-send</v-icon>
          </v-btn>
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
  methods: {
    get_width() {
      return this.width;
    },
    onResize() {
      this.width = window.innerWidth / 1.2;
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  async mounted() {
    this.$nextTick(async () => {
      window.addEventListener('resize', this.onResize);
    });
  },
  data() {
    return {
      mail: 'mailto:paulmagos@icloud.com',
      width: window.innerWidth / 1.2,
      image: 'https://media.licdn.com/dms/image/v2/D4D03AQHmKvnUAhQmTg/profile-displayphoto-shrink_800_800/B4DZOq8_pbHoAg-/0/1733739937309?e=1746057600&v=beta&t=f5xJlf9pcVpVLCUIbC-t7gS1VYF3Yo4hCGVnQFzvt3s',
      name: 'Paul Magos',
      linkedin: 'https://www.linkedin.com/in/paulmagos/',
      short_bio: "Research Fellow & Master's Student in Computer Science - Artificial Intelligence",
      github: 'https://github.com/PaulMagos',
      description:
        'As a Student of Artificial Intelligence at Università di Pisa, I delve into projects at the intersection of cutting-edge technologies and impactful research. Leveraging my skills in software engineering, data analysis, and machine learning, I craft innovative solutions and develop robust web platforms to disseminate research findings effectively. My academic journey has equipped me with a comprehensive understanding of AI domains, including natural language processing, computer vision, deep learning, and reinforcement learning. I am driven by a fervent desire to continuously expand my knowledge and embrace emerging technologies to propel my research endeavors forward. Collaborate with me to explore the transformative potential of AI in addressing real-world challenges.',
    };
  },
});
</script>

<style>
.profile-picture {
  border-radius: 5%;
  transition: transform 0.3s ease-in-out;
  margin-left: 20px;
  margin-top: 20px;
}

.profile-picture:hover {
  transform: scale(1.05);
}

.university-logo {
  transition: filter 0.3s ease-in-out;
  margin-right: 40px;
  margin-left: 20px;
}

.dark-mode-logo {
  filter: invert(1);
  margin-right: 40px;
  margin-left: 20px;
}

.indented-list {
  margin-left: 20px;
}

</style>
