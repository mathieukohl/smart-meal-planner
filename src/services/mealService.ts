import axios from 'axios';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const getSeafoodMealSuggestions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/filter.php?c=Seafood`);
    return response.data.meals;
  } catch (error) {
    console.error('Error fetching meal suggestions:', error);
    return [];
  }
};

export const getMealSuggestions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/random.php`);
    return response.data.meals;
  } catch (error) {
    console.error('Error fetching meal suggestions:', error);
    return [];
  }
};

export const getMealDetails = async (mealId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lookup.php?i=${mealId}`);
    return response.data.meals[0];
  } catch (error) {
    console.error('Error fetching meal details:', error);
    return null;
  }
};
