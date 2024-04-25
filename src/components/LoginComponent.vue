<template>
  <div>
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <v-text-field
        density="compact"
        placeholder="Enter Username"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
      ></v-text-field>

      <v-text-field
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = !visible"
      ></v-text-field>

      <v-card
        class="mb-12"
        color="surface-variant"
        variant="tonal"
      >
      </v-card>

      <v-btn
        class="mb-8"
        color="blue"
        size="large"
        variant="tonal"
        block
        @click="this.login"
      >
        Log In
      </v-btn>
    </v-card>
  </div>
</template>

<script lang="ts">
export default {
    data: () => ({
      visible: false,
      return:{
        account: {
          password: '',
          username: '',
        },
      }
    }),
    methods:{
      login(){
        // console.log(this.password)
      }
    }
  }
</script>
