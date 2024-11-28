<template>
  <q-page padding>
    <h1>Meal Planner</h1>

    <q-input v-model="newMealName" label="Meal Name" />
    <q-input v-model="newMealCalories" label="Calories" type="number" />
    <q-select
      v-model="newMealCategory"
      :options="mealCategories"
      label="Meal Category"
    />
    <q-btn @click="addNewMeal" label="Add Meal" color="primary" />

    <q-list>
      <q-item v-for="meal in mealStore.meals" :key="meal.id" clickable>
        <q-item-section>
          <div>
            {{ meal.name }} - {{ meal.calories }} kcal ({{ meal.category }})
          </div>
        </q-item-section>
        <q-item-section side>
          <q-btn
            @click="removeMeal(meal.id)"
            icon="delete"
            color="negative"
            flat
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMealStore } from 'src/stores/mealStore';

const mealStore = useMealStore();

const newMealName = ref('');
const newMealCalories = ref<number | null>(null);
const newMealCategory = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
  'breakfast'
);
const mealCategories = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const addNewMeal = () => {
  if (newMealName.value && newMealCalories.value !== null) {
    const newMeal = {
      id: Date.now(), // Use current timestamp as a unique ID
      name: newMealName.value,
      calories: newMealCalories.value,
      ingredients: [],
      category: newMealCategory.value,
    };
    mealStore.addMeal(newMeal);
    newMealName.value = '';
    newMealCalories.value = null;
    newMealCategory.value = 'breakfast';
  }
};

const removeMeal = (mealId: number) => {
  mealStore.removeMeal(mealId);
};
</script>
