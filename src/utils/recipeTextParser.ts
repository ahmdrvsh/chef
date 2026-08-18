import { Recipe, RecipeIngredient, CATEGORIES } from '../data/initialData';

export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632));
}

const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

export interface ParseResult {
  recipes: Omit<Recipe, 'id'>[];
  errors: string[];
}

export function parseRecipesFromText(rawText: string): ParseResult {
  const errors: string[] = [];
  const recipes: Omit<Recipe, 'id'>[] = [];

  const trimmedText = rawText.trim();
  if (!trimmedText) {
    return { recipes: [], errors: ['فایل یا متن وارد شده خالی است.'] };
  }

  // 1. Try parsing JSON directly
  if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmedText);
      const list = Array.isArray(parsed) ? parsed : [parsed];

      list.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;
        const title = String(item.title || item.name || item.caption || `دستور پخت ${index + 1}`).trim();
        const category = CATEGORIES.includes(item.category) ? item.category : (item.category || 'غذاهای سنتی');
        
        const ingredients: RecipeIngredient[] = Array.isArray(item.ingredients)
          ? item.ingredients.map((ing: any) => ({
              name: String(ing.name || ing.title || ing).trim(),
              amount: ing.amount !== undefined ? (typeof ing.amount === 'number' ? ing.amount : parseFloat(toEnglishDigits(String(ing.amount))) || 1) : 1,
              unit: String(ing.unit || 'عدد').trim(),
              type: (['اصلی', 'افزودنی', 'اختیاری'].includes(ing.type) ? ing.type : 'اصلی') as any
            }))
          : [];

        const instructions: string[] = Array.isArray(item.instructions)
          ? item.instructions.map((ins: any) => String(ins).trim()).filter(Boolean)
          : (typeof item.instructions === 'string' ? item.instructions.split('\n').map(s => s.trim()).filter(Boolean) : []);

        const itemCats: string[] = Array.isArray(item.categories)
          ? item.categories
          : (typeof item.category === 'string' ? item.category.split(/[،,-]/).map(s => s.trim()).filter(Boolean) : ['غذاهای محلی و سنتی']);

        const itemDiets: string[] = Array.isArray(item.diets)
          ? item.diets
          : (typeof item.diet === 'string' ? item.diet.split(/[،,-]/).map(s => s.trim()).filter(Boolean) : ['معمولی']);

        recipes.push({
          title,
          description: String(item.description || item.summary || title),
          category: itemCats[0] || 'غذاهای محلی و سنتی',
          categories: itemCats,
          prepTime: Number(toEnglishDigits(String(item.prepTime || 20))) || 20,
          cookTime: Number(toEnglishDigits(String(item.cookTime || 40))) || 40,
          servings: Number(toEnglishDigits(String(item.servings || 4))) || 4,
          difficulty: (['آسان', 'متوسط', 'سخت'].includes(item.difficulty) ? item.difficulty : 'متوسط') as any,
          mealType: Array.isArray(item.mealTypes) && item.mealTypes.length > 0 ? item.mealTypes[0] : (item.mealType || 'ناهار'),
          mealTypes: Array.isArray(item.mealTypes) ? item.mealTypes : [item.mealType || 'ناهار', 'شام'],
          diet: itemDiets[0] || 'معمولی',
          diets: itemDiets,
          image: String(item.image || item.imageUrl || DEFAULT_RECIPE_IMAGE),
          ingredients,
          instructions,
          tips: item.tips ? String(item.tips) : undefined,
          videoUrl: item.videoUrl ? String(item.videoUrl) : undefined,
          status: 'published',
          submittedAt: new Date().toISOString().split('T')[0]
        });
      });

      if (recipes.length > 0) {
        return { recipes, errors };
      }
    } catch (jsonErr) {
      // Not JSON, fallback to line-by-line block text parsing
    }
  }

  // 2. Plain Text Block Parsing
  // Split by === or --- delimiter or "دستور پخت:" / "=== RECIPE ==="
  let blocks = trimmedText.split(/(?:^|\n)\s*(?:===|---|=== RECIPE ===|=== دستور پخت ===)\s*(?:\n|$)/gi);

  // If splitting produced single block but it contains multiple "عنوان:" or "نام غذا:", split by title line
  if (blocks.length <= 1) {
    const titleMatches = trimmedText.match(/(?:^|\n)\s*(?:عنوان|نام غذا|title)\s*:/gi);
    if (titleMatches && titleMatches.length > 1) {
      blocks = trimmedText.split(/(?=(?:^|\n)\s*(?:عنوان|نام غذا|title)\s*:)/gi);
    }
  }

  blocks.forEach((block, idx) => {
    const cleanBlock = block.trim();
    if (!cleanBlock) return;

    let title = '';
    let categories: string[] = ['غذاهای محلی و سنتی'];
    let prepTime = 20;
    let cookTime = 40;
    let servings = 4;
    let difficulty: 'آسان' | 'متوسط' | 'سخت' = 'متوسط';
    let mealTypes: string[] = ['ناهار', 'شام'];
    let diets: string[] = ['معمولی'];
    let image = DEFAULT_RECIPE_IMAGE;
    let description = '';
    let tips = '';
    let videoUrl = '';
    const ingredients: RecipeIngredient[] = [];
    const instructions: string[] = [];

    type Section = 'header' | 'ingredients' | 'instructions';
    let currentSection: Section = 'header';

    const lines = cleanBlock.split('\n');

    lines.forEach(line => {
      const rawLine = line.trim();
      if (!rawLine) return;

      const normLine = toEnglishDigits(rawLine);

      // Section switches
      if (/^(?:مواد اولیه|مواد لازم|ingredients)\s*:/i.test(normLine)) {
        currentSection = 'ingredients';
        return;
      }
      if (/^(?:دستور پخت|طرز تهیه|مراحل پخت|instructions)\s*:/i.test(normLine)) {
        currentSection = 'instructions';
        return;
      }

      if (currentSection === 'header') {
        // Key-Value matches
        if (/^(?:عنوان|نام غذا|title)\s*:/i.test(normLine)) {
          title = rawLine.replace(/^(?:عنوان|نام غذا|title)\s*:\s*/i, '').trim();
        } else if (/^(?:دسته|دسته‌بندی|دسته‌بندی‌ها|گروه|category|categories)\s*:/i.test(normLine)) {
          const catVal = rawLine.replace(/^(?:دسته|دسته‌بندی|دسته‌بندی‌ها|گروه|category|categories)\s*:\s*/i, '').trim();
          if (catVal) {
            const splitCats = catVal.split(/[،,-|/]/).map(s => s.trim()).filter(Boolean);
            if (splitCats.length > 0) categories = splitCats;
          }
        } else if (/^(?:زمان آماده‌سازی|زمان آماده سازی|prepTime)\s*:/i.test(normLine)) {
          const val = normLine.replace(/^(?:زمان آماده‌سازی|زمان آماده سازی|prepTime)\s*:\s*/i, '').trim();
          const num = parseInt(val.replace(/\D/g, ''), 10);
          if (!isNaN(num)) prepTime = num;
        } else if (/^(?:زمان پخت|cookTime)\s*:/i.test(normLine)) {
          const val = normLine.replace(/^(?:زمان پخت|cookTime)\s*:\s*/i, '').trim();
          const num = parseInt(val.replace(/\D/g, ''), 10);
          if (!isNaN(num)) cookTime = num;
        } else if (/^(?:تعداد نفرات|تعداد|servings)\s*:/i.test(normLine)) {
          const val = normLine.replace(/^(?:تعداد نفرات|تعداد|servings)\s*:\s*/i, '').trim();
          const num = parseInt(val.replace(/\D/g, ''), 10);
          if (!isNaN(num)) servings = num;
        } else if (/^(?:سطح دشواری|سختی|دشواری|difficulty)\s*:/i.test(normLine)) {
          const val = rawLine.replace(/^(?:سطح دشواری|سختی|دشواری|difficulty)\s*:\s*/i, '').trim();
          if (['آسان', 'متوسط', 'سخت'].includes(val)) {
            difficulty = val as any;
          }
        } else if (/^(?:وعده|وعده‌ها|وعده ها|mealTypes|mealType)\s*:/i.test(normLine)) {
          const val = rawLine.replace(/^(?:وعده|وعده‌ها|وعده ها|mealTypes|mealType)\s*:\s*/i, '').trim();
          const parts = val.split(/[،,-]/).map(s => s.trim()).filter(Boolean);
          if (parts.length > 0) mealTypes = parts;
        } else if (/^(?:نوع رژیم|رژیم|رژیم‌ها|diet|diets)\s*:/i.test(normLine)) {
          const dietVal = rawLine.replace(/^(?:نوع رژیم|رژیم|رژیم‌ها|diet|diets)\s*:\s*/i, '').trim();
          if (dietVal) {
            const splitDiets = dietVal.split(/[،,-|/]/).map(s => s.trim()).filter(Boolean);
            if (splitDiets.length > 0) diets = splitDiets;
          }
        } else if (/^(?:عکس|تصویر|image|imageUrl)\s*:/i.test(normLine)) {
          const imgVal = rawLine.replace(/^(?:عکس|تصویر|image|imageUrl)\s*:\s*/i, '').trim();
          if (imgVal.startsWith('http')) image = imgVal;
        } else if (/^(?:ویدیو|لینک ویدیو|فیلم|videoUrl)\s*:/i.test(normLine)) {
          videoUrl = rawLine.replace(/^(?:ویدیو|لینک ویدیو|فیلم|videoUrl)\s*:\s*/i, '').trim();
        } else if (/^(?:توضیحات|شرح|description)\s*:/i.test(normLine)) {
          description = rawLine.replace(/^(?:توضیحات|شرح|description)\s*:\s*/i, '').trim();
        } else if (/^(?:نکات|فوت و فن|tips)\s*:/i.test(normLine)) {
          tips = rawLine.replace(/^(?:نکات|فوت و فن|tips)\s*:\s*/i, '').trim();
        } else if (!title && rawLine.length > 2 && !rawLine.includes(':')) {
          // If first line has no colon, treat as title
          title = rawLine;
        }
      } else if (currentSection === 'ingredients') {
        // Parse ingredient line: e.g. "- سبزی قرمه: ۴۰۰ گرم (اصلی)" or "- گوشت 400 گرم"
        let cleanIngLine = rawLine.replace(/^[-*•\d+\.]+\s*/, '').trim();
        if (!cleanIngLine) return;

        let ingType: 'اصلی' | 'افزودنی' | 'اختیاری' = 'اصلی';
        if (cleanIngLine.includes('(افزودنی)')) {
          ingType = 'افزودنی';
          cleanIngLine = cleanIngLine.replace('(افزودنی)', '').trim();
        } else if (cleanIngLine.includes('(اختیاری)')) {
          ingType = 'اختیاری';
          cleanIngLine = cleanIngLine.replace('(اختیاری)', '').trim();
        } else if (cleanIngLine.includes('(اصلی)')) {
          ingType = 'اصلی';
          cleanIngLine = cleanIngLine.replace('(اصلی)', '').trim();
        }

        let ingName = cleanIngLine;
        let ingAmount: number | string = 1;
        let ingUnit = 'عدد';

        if (cleanIngLine.includes(':')) {
          const parts = cleanIngLine.split(':');
          ingName = parts[0].trim();
          const rightPart = parts.slice(1).join(':').trim();
          
          // extract numbers from rightPart
          const digits = toEnglishDigits(rightPart);
          const numMatch = digits.match(/[\d\.]+/);
          if (numMatch) {
            ingAmount = parseFloat(numMatch[0]) || 1;
            ingUnit = rightPart.replace(numMatch[0], '').replace(/[۰-۹0-9]/g, '').trim() || 'عدد';
          } else {
            ingAmount = rightPart;
            ingUnit = '';
          }
        } else {
          // No colon, try to extract digits from middle/end e.g. "سبزی قرمه 400 گرم"
          const digits = toEnglishDigits(cleanIngLine);
          const numMatch = digits.match(/[\d\.]+/);
          if (numMatch) {
            const numIndex = digits.indexOf(numMatch[0]);
            ingName = cleanIngLine.substring(0, numIndex).trim();
            const remainder = cleanIngLine.substring(numIndex).trim();
            ingAmount = parseFloat(numMatch[0]) || 1;
            ingUnit = remainder.replace(numMatch[0], '').replace(/[۰-۹0-9]/g, '').trim() || 'گرم';
          }
        }

        if (ingName) {
          ingredients.push({
            name: ingName,
            amount: ingAmount,
            unit: ingUnit || 'عدد',
            type: ingType
          });
        }
      } else if (currentSection === 'instructions') {
        // Parse instruction step: e.g. "۱. پیاز را تفت دهید"
        const cleanStep = rawLine.replace(/^[۰-۹0-9]+[\.\-\)]\s*/, '').replace(/^[-*•]\s*/, '').trim();
        if (cleanStep) {
          instructions.push(cleanStep);
        }
      }
    });

    if (!title) {
      errors.push(`بلوک شماره ${idx + 1}: عنوان دستور پخت پیدا نشد.`);
      return;
    }

    if (!description) {
      description = title;
    }

    recipes.push({
      title,
      description,
      category: categories[0] || 'غذاهای محلی و سنتی',
      categories,
      prepTime,
      cookTime,
      servings,
      difficulty,
      mealType: mealTypes[0] || 'ناهار',
      mealTypes,
      diet: diets[0] || 'معمولی',
      diets,
      image,
      ingredients,
      instructions,
      tips: tips || undefined,
      videoUrl: videoUrl || undefined,
      status: 'published',
      submittedAt: new Date().toISOString().split('T')[0]
    });
  });

  if (recipes.length === 0 && errors.length === 0) {
    errors.push('هیچ دستور پخت معتبری در متن پردازش نشد. لطفاً از فرمت راهنما استفاده کنید.');
  }

  return { recipes, errors };
}

export const SAMPLE_RECIPE_TXT = `===
عنوان: قرمه سبزی اصیل
دسته‌بندی: غذای ایرانی، غذاهای محلی و سنتی
زمان آماده‌سازی: ۳۰
زمان پخت: ۱۸۰
تعداد نفرات: ۴
سطح دشواری: متوسط
وعده‌ها: ناهار، شام
نوع رژیم: معمولی، کم‌کالری / رژیمی
عکس: https://images.unsplash.com/photo-1546069901-ba9599a7e63c
ویدیو: https://www.aparat.com/v/example123
توضیحات: قرمه سبزی جا افتاده و خوش‌عطر با سبزی تازه و لیمو عمانی.
نکات: سبزی را خوب با شعله ملایم سرخ کنید تا تیره شود اما نسوزد.
مواد اولیه:
- سبزی قرمه: ۴۰۰ گرم (اصلی)
- گوشت گوسفندی: ۴۰۰ گرم (اصلی)
- لوبیا قرمز: ۱ پیمانه (اصلی)
- لیمو عمانی: ۴ عدد (افزودنی)
- پیاز: ۱ عدد (اصلی)
- نمک و زردچوبه: ۱ قاشق چای‌خوری (اختیاری)
دستور پخت:
۱. پیاز را نگینی خرد کرده و با گوشت گوسفندی تفت دهید تا تغییر رنگ دهد.
۲. زردچوبه و فلفل سیاه را اضافه کرده و سپس سبزی سرخ شده و لوبیا قرمز را بیفزایید.
۳. ۴ لیوان آب جوش بریزید و درب قابلمه را بگذارید تا به مدت ۳ ساعت بپزد.
۴. در نیم ساعت پایانی پخت، لیمو عمانی‌های سوراخ شده و نمک را اضافه کنید تا جا بیفتد.
===
===
عنوان: کشک بادمجان خانگی
دسته‌بندی: غذاهای محلی و سنتی، پیش‌غذا و سالاد
زمان آماده‌سازی: ۲۰
زمان پخت: ۴۵
تعداد نفرات: ۳
سطح دشواری: آسان
وعده‌ها: ناهار، شام، میان‌وعده / عصرانه
نوع رژیم: گیاه‌خواری
عکس: https://images.unsplash.com/photo-1540420773420-3366772f4999
ویدیو: https://www.aparat.com/v/kashk_bademjan
توضیحات: کشک بادمجان برشته با نعناداغ و پیازداغ مجلسی.
نکات: بادمجان‌ها را پس از پوست کندن نیم ساعت در آب‌نمک بگذارید تا تلخی آن گرفته شود.
مواد اولیه:
- بادمجان: ۴ عدد (اصلی)
- کشک: ۱ پیمانه (اصلی)
- پیاز: ۲ عدد (اصلی)
- سیر: ۴ حبه (افزودنی)
- نعناع خشک: ۲ قاشق غذاخوری (افزودنی)
- مغز گردو: ۵۰ گرم (اختیاری)
دستور پخت:
۱. بادمجان‌ها را سرخ کرده و یا کبابی کنید، سپس کاملاً له کنید.
۲. پیاز و سیر خرد شده را تفت دهید و نعناداغ را آماده کنید.
۳. بادمجان‌های له شده را همراه با نصف کشک و پیازداغ مخلوط کرده و ۱۰ دقیقه تفت دهید.
۴. کشک بادمجان را در ظرف کشیده و با مابقی کشک، گردو و نعناداغ تزیین کنید.
===`;
