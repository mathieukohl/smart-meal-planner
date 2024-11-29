<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <!-- Drawer Toggle Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="toggleLeftDrawer"
          aria-label="Toggle Left Drawer"
        />
        <q-toolbar-title>Smart Meal Planner</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Left Drawer -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple tag="router-link" to="/">
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item clickable v-ripple tag="router-link" to="/meal-planner">
          <q-item-section>Meal Planner</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content Area -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Set drawer to be closed by default
const leftDrawerOpen = ref(false);

// Method to toggle the left drawer open/close state
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
