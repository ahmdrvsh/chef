import { Ingredient } from './initialData';
import ingredientsDataJson from '../../public/sofreh_ingredients_database.json';

export const INGREDIENT_CATEGORIES = [
  'سبزیجات و صیفی‌جات',
  'گوشت قرمز و ماکیان',
  'ماهی و مأکولات دریایی',
  'حبوبات و غلات',
  'برنج، نان و آرد',
  'لبنیات و تخم‌مرغ',
  'ادویه‌جات و چاشنی‌ها',
  'روغن، سس و رب',
  'مغزها و خشکبار',
  'میوه‌جات و مرکبات',
  'کنسروجات و ترشیجات',
  'مربا، عسل و شیرین‌کننده‌ها',
  'نوشیدنی‌ها و دم‌نوش‌ها',
  'شیرینی و لوازم قنادی',
  'سایر و تنقلات'
];

export const INITIAL_INGREDIENTS: Ingredient[] = ingredientsDataJson as Ingredient[];
