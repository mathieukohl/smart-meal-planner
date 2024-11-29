<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { computed } from 'vue';
import { useMealStore } from 'src/stores/mealStore';

// Register the Chart.js components we need
Chart.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

const mealStore = useMealStore();

const chartData = computed(() => {
  const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
  const calories = categories.map((category) => {
    return mealStore.meals
      .filter((meal) => meal.category === category)
      .reduce((total, meal) => total + meal.calories, 0);
  });

  return {
    labels: categories,
    datasets: [
      {
        label: 'Calories per Category',
        data: calories,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<style scoped>
div {
  height: 400px;
}
</style>
