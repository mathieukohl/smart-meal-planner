<template>
  <q-page padding>
    <h1>Meal Planner</h1>

    <q-input
      v-model="newMealName"
      label="Meal Name"
      :rules="[(val) => !!val || 'Meal name is required']"
      lazy-rules
    />
    <q-input
      v-model="newMealCalories"
      label="Calories"
      type="number"
      :rules="[(val) => val > 0 || 'Calories must be greater than 0']"
      lazy-rules
    />

    <q-select
      v-model="newMealCategory"
      :options="mealCategories"
      label="Meal Category"
    />

    <div>
      <q-input v-model="newIngredient" label="Add Ingredient" />
      <q-btn @click="addIngredient" label="Add Ingredient" color="primary" />
      <q-list>
        <q-item v-for="(ingredient, index) in newIngredients" :key="index">
          <q-item-section>{{ ingredient }}</q-item-section>
          <q-item-section side>
            <q-btn
              @click="removeIngredient(index)"
              icon="delete"
              color="negative"
              flat
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-btn
      @click="isEditing ? updateMeal() : addNewMeal()"
      :label="isEditing ? 'Update Meal' : 'Add Meal'"
      color="primary"
    />

    <q-select
      v-model="selectedCategory"
      :options="['all', ...mealCategories]"
      label="Filter by Category"
    />

    <q-list>
      <q-item v-for="meal in filteredMeals" :key="meal.id" clickable>
        <q-item-section>
          <div>
            {{ meal.name }} - {{ meal.calories }} kcal ({{ meal.category }})
          </div>
          <div v-if="meal.ingredients.length > 0">
            Ingredients: {{ meal.ingredients.join(', ') }}
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

    <div>
      <h2 class="text-h5">Total Calories: {{ totalCalories }}</h2>
    </div>
    <div>
      <h2 class="text-h5">Calorie Distribution by Meal Category</h2>
      <CalorieChart />
    </div>
    <div>
      <h2>Meal Suggestions</h2>
      <q-btn
        @click="fetchMealSuggestions"
        label="Get Meal Suggestions"
        color="secondary"
      />
      <q-spinner v-if="isLoading" color="secondary" size="lg" />
      <q-list v-if="!isLoading && suggestedMeals.length > 0">
        <q-item v-for="meal in suggestedMeals" :key="meal.idMeal">
          <q-item-section>
            <div>{{ meal.strMeal }}</div>
          </q-item-section>
          <q-item-section side>
            <img
              :src="meal.strMealThumb"
              alt="meal image"
              width="50"
              height="50"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMealStore } from 'src/stores/mealStore';
import { Meal } from 'src/models/Meal';
import CalorieChart from 'src/components/CalorieChart.vue';
import { getMealSuggestions } from 'src/services/mealService';
import { useQuasar } from 'quasar';
const $q = useQuasar();

const isLoading = ref(false);
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

// Ingredient management
const newIngredients = ref<string[]>([]);
const newIngredient = ref<string>('');

const addIngredient = () => {
  if (newIngredient.value.trim() !== '') {
    newIngredients.value.push(newIngredient.value.trim());
    newIngredient.value = '';
  }
};

const removeIngredient = (index: number) => {
  newIngredients.value.splice(index, 1);
};

// Adding and updating meals
const addNewMeal = () => {
  if (newMealName.value && newMealCalories.value !== null) {
    const newMeal: Meal = {
      id: Date.now(),
      name: newMealName.value,
      calories: newMealCalories.value,
      ingredients: [...newIngredients.value],
      category: newMealCategory.value,
    };
    mealStore.addMeal(newMeal);
    resetForm();
    $q.notify({ type: 'positive', message: 'Meal added successfully!' });
  }
};

const editMeal = (meal: Meal) => {
  isEditing.value = true;
  currentMealId.value = meal.id;
  newMealName.value = meal.name;
  newMealCalories.value = meal.calories;
  newMealCategory.value = meal.category;
  newIngredients.value = [...meal.ingredients];
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
      ingredients: [...newIngredients.value],
      category: newMealCategory.value,
    };
    mealStore.updateMeal(updatedMeal);
    resetForm();
    $q.notify({ type: 'positive', message: 'Meal updated successfully!' });
  }
};

const removeMeal = (mealId: number) => {
  mealStore.removeMeal(mealId);
  $q.notify({ type: 'warning', message: 'Meal removed!' });
};

const resetForm = () => {
  newMealName.value = '';
  newMealCalories.value = null;
  newMealCategory.value = 'breakfast';
  newIngredients.value = [];
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

// Total calories calculation
const totalCalories = computed(() => {
  return filteredMeals.value.reduce((total, meal) => {
    return total + (meal.calories ?? 0);
  }, 0);
});

const suggestedMeals = ref<
  { idMeal: string; strMeal: string; strMealThumb: string }[]
>([]);

const fetchMealSuggestions = async () => {
  isLoading.value = true;
  suggestedMeals.value = await getMealSuggestions();
  isLoading.value = false;
};
</script>
