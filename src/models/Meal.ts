export interface Meal {
  id: number;
  name: string;
  calories: number;
  ingredients: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
