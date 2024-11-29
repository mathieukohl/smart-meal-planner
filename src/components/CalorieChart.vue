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
import { computed, ref, onMounted } from 'vue';
import { useMealStore } from 'src/stores/mealStore';
import { getMealCategories } from 'src/services/mealService';

// Register the Chart.js components we need
Chart.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

const mealStore = useMealStore();

// Reactive reference for meal categories fetched from TheMealDB
const mealCategories = ref<string[]>([]);

// Fetch meal categories from TheMealDB on component mount
const fetchMealCategories = async () => {
  mealCategories.value = await getMealCategories();
};

// Call fetchMealCategories when the component is mounted
onMounted(() => {
  fetchMealCategories();
});

// Computed property for the chart data
const chartData = computed(() => {
  // Use the meal categories from TheMealDB instead of hard-coded values
  const categories = mealCategories.value;

  // Calculate calories per category
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
