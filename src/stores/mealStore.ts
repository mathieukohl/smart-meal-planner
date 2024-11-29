import { defineStore } from 'pinia';
import { Meal } from 'src/models/Meal';

export const useMealStore = defineStore('meal', {
  state: () => ({
    meals: JSON.parse(localStorage.getItem('meals') || '[]') as Meal[],
  }),
  actions: {
    addMeal(meal: Meal) {
      this.meals.push(meal);
      this.saveMealsToLocalStorage();
    },
    removeMeal(mealId: number) {
      this.meals = this.meals.filter((meal) => meal.id !== mealId);
      this.saveMealsToLocalStorage();
    },
    updateMeal(updatedMeal: Meal) {
      const index = this.meals.findIndex((meal) => meal.id === updatedMeal.id);
      if (index !== -1) {
        this.meals[index] = updatedMeal;
        this.saveMealsToLocalStorage();
      }
    },
    saveMealsToLocalStorage() {
      localStorage.setItem('meals', JSON.stringify(this.meals));
    },
  },
});
