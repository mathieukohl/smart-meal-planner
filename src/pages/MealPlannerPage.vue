<template>
  <q-page padding>
    <h1 class="text-h5">Meal Planner</h1>

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
      <div class="q-mt-md">
        <q-btn
          @click="addIngredient"
          label="Add Ingredient"
          color="primary"
          class="q-mr-md"
        />
        <q-btn
          @click="isEditing ? updateMeal() : addNewMeal()"
          :label="isEditing ? 'Update Meal' : 'Add Meal'"
          color="primary"
        />
      </div>
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

    <div>
      <h2 class="text-h5">Meal list :</h2>
    </div>
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
      <h2 class="text-h5">Meal Suggestions</h2>
      <q-btn
        @click="fetchMealSuggestions"
        label="Get a Random Meal Suggestions"
        color="secondary"
      />
      <q-spinner v-if="isLoading" color="secondary" size="lg" />

      <q-list v-if="!isLoading && suggestedMeals.length > 0">
        <q-item
          v-for="meal in suggestedMeals"
          :key="meal.idMeal"
          class="q-my-md col-4"
        >
          <div class="meal-info q-mr-md">
            <img :src="meal.strMealThumb" alt="meal image" class="meal-image" />
            <div class="meal-text">
              <div class="meal-title">{{ meal.strMeal }}</div>
              <q-btn
                @click="fetchMealDetails(meal.idMeal)"
                :label="
                  expandedMealId === meal.idMeal ? 'Close details' : 'Details'
                "
                color="primary"
                flat
                class="details-btn"
              />
            </div>
          </div>

          <!-- Meal Details Section -->
          <div
            v-if="expandedMealId === meal.idMeal && selectedMealDetails"
            class="q-my-md col-10"
          >
            <q-card class="q-pa-md meal-details-card">
              <q-card-section>
                <h3>{{ selectedMealDetails.strMeal }}</h3>
                <p>
                  <strong>Category:</strong>
                  {{ selectedMealDetails.strCategory }}
                </p>
                <p>
                  <strong>Instructions:</strong>
                  {{ selectedMealDetails.strInstructions }}
                </p>
                <p><strong>Ingredients:</strong></p>
                <ul>
                  <li v-for="ingredient in mealIngredients" :key="ingredient">
                    {{ ingredient }}
                  </li>
                </ul>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  @click="addSuggestedMealToList"
                  label="Add to Meal List"
                  color="positive"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMealStore } from 'src/stores/mealStore';
import { Meal } from 'src/models/Meal';
import CalorieChart from 'src/components/CalorieChart.vue';
import {
  getMealSuggestions,
  getMealDetails,
  getMealCategories,
} from 'src/services/mealService';
import { useQuasar } from 'quasar';
const $q = useQuasar();

const isLoading = ref(false);
const mealStore = useMealStore();

const newMealName = ref('');
const newMealCalories = ref<number | null>(null);
const newMealCategory = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
  'breakfast'
);
const mealCategories = ref<string[]>([]);
const isEditing = ref(false);
const currentMealId = ref<number | null>(null);
const selectedCategory = ref<string | 'all'>('all');

// Fetch meal categories from TheMealDB on component mount
const fetchMealCategories = async () => {
  mealCategories.value = await getMealCategories();
};

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
    return total + (Number(meal.calories) || 0);
  }, 0);
});

const suggestedMeals = ref<
  { idMeal: string; strMeal: string; strMealThumb: string }[]
>([]);
const selectedMealDetails = ref<any>(null);
const mealIngredients = ref<string[]>([]);
const expandedMealId = ref<string | null>(null);

const fetchMealSuggestions = async () => {
  isLoading.value = true;
  suggestedMeals.value = await getMealSuggestions();
  isLoading.value = false;
};

const fetchMealDetails = async (mealId: string) => {
  if (expandedMealId.value === mealId) {
    // Collapse if clicked again
    expandedMealId.value = null;
    selectedMealDetails.value = null;
    mealIngredients.value = [];
    return;
  }

  expandedMealId.value = mealId;
  selectedMealDetails.value = await getMealDetails(mealId);
  console.log('expandedMealId.value', selectedMealDetails.value);

  if (selectedMealDetails.value) {
    // Extract ingredients from the meal details
    mealIngredients.value = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = selectedMealDetails.value[`strIngredient${i}`];
      const measure = selectedMealDetails.value[`strMeasure${i}`];
      if (ingredient) {
        mealIngredients.value.push(`${measure.trim()} ${ingredient.trim()}`);
      }
    }
  }
};

const addSuggestedMealToList = () => {
  if (selectedMealDetails.value) {
    // Use the category from the selected meal details
    const newMeal: Meal = {
      id: Date.now(),
      name: selectedMealDetails.value.strMeal,
      calories: 200, // Placeholder: Consider an estimation or user input for calories
      ingredients: [...mealIngredients.value],
      category: selectedMealDetails.value.strCategory, // Use the category from meal details
    };
    mealStore.addMeal(newMeal);
    $q.notify({ type: 'positive', message: 'Meal added successfully!' });
    expandedMealId.value = null; // Collapse details after adding
  }
};

onMounted(() => {
  fetchMealCategories();
});
</script>

<style scoped>
.meal-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.meal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meal-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.meal-details-card {
  margin-top: 16px;
}
</style>
