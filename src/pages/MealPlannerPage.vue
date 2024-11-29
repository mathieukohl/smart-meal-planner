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
    <q-btn
      @click="isEditing ? updateMeal() : addNewMeal()"
      :label="isEditing ? 'Update Meal' : 'Add Meal'"
      color="primary"
    />

    <q-select
      v-model="selectedCategory"
      :options="['all', ...mealCategories]"
      label="Filter by Category"
      @update:model-value="filterMeals"
    />

    <q-list>
      <q-item v-for="meal in filteredMeals" :key="meal.id" clickable>
        <q-item-section>
          <div>
            {{ meal.name }} - {{ meal.calories }} kcal ({{ meal.category }})
          </div>
        </q-item-section>
        <q-item-section side>
          <q-btn @click="editMeal(meal)" icon="edit" color="primary" flat />
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
import { ref, computed } from 'vue';
import { useMealStore } from 'src/stores/mealStore';
import { Meal } from 'src/models/Meal';

const mealStore = useMealStore();

const newMealName = ref('');
const newMealCalories = ref<number | null>(null);
const newMealCategory = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
  'breakfast'
);
const mealCategories = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const isEditing = ref(false);
const currentMealId = ref<number | null>(null);
const selectedCategory = ref<
  'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'
>('all');

const addNewMeal = () => {
  if (newMealName.value && newMealCalories.value !== null) {
    const newMeal: Meal = {
      id: Date.now(),
      name: newMealName.value,
      calories: newMealCalories.value,
      ingredients: [],
      category: newMealCategory.value,
    };
    mealStore.addMeal(newMeal);
    resetForm();
  }
};

const editMeal = (meal: Meal) => {
  isEditing.value = true;
  currentMealId.value = meal.id;
  newMealName.value = meal.name;
  newMealCalories.value = meal.calories;
  newMealCategory.value = meal.category;
};

const updateMeal = () => {
  if (
    currentMealId.value !== null &&
    newMealName.value &&
    newMealCalories.value !== null
  ) {
    const updatedMeal: Meal = {
      id: currentMealId.value,
      name: newMealName.value,
      calories: newMealCalories.value,
      ingredients: [],
      category: newMealCategory.value,
    };
    mealStore.updateMeal(updatedMeal);
    resetForm();
  }
};

const removeMeal = (mealId: number) => {
  mealStore.removeMeal(mealId);
};

const resetForm = () => {
  newMealName.value = '';
  newMealCalories.value = null;
  newMealCategory.value = 'breakfast';
  isEditing.value = false;
  currentMealId.value = null;
};

// Filtering logic
const filteredMeals = computed(() => {
  if (selectedCategory.value === 'all') {
    return mealStore.meals;
  }
  return mealStore.meals.filter(
    (meal) => meal.category === selectedCategory.value
  );
});
</script>
