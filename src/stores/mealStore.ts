import { defineStore } from 'pinia';
import { Meal } from 'src/models/Meal';

export const useMealStore = defineStore('meal', {
  state: () => ({
    meals: [] as Meal[],
  }),
  actions: {
    addMeal(meal: Meal) {
      this.meals.push(meal);
    },
    removeMeal(mealId: number) {
      this.meals = this.meals.filter((meal) => meal.id !== mealId);
    },
    updateMeal(updatedMeal: Meal) {
      const index = this.meals.findIndex((meal) => meal.id === updatedMeal.id);
      if (index !== -1) {
        this.meals[index] = updatedMeal;
      }
    },
  },
});
