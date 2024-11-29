import axios from 'axios';

const API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood';

export const getMealSuggestions = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.meals;
  } catch (error) {
    console.error('Error fetching meal suggestions:', error);
    return [];
  }
};
