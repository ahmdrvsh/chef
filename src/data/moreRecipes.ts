import { Recipe } from './initialData';

export const ADDITIONAL_RECIPES: Recipe[] = [
  {
    id: 'r15',
    title: 'خورشت فسنجان مجلسی با مرغ و گردو',
    description: 'خورشت اصیل ایرانی با گردوی چرخ‌شده، رب انار ملس و تکه‌های مرغ زعفرانی جاافتاده',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 30,
    cookTime: 180,
    servings: 5,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 185,
    ingredients: [
      { name: 'گردو', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'مرغ (سینه یا ران)', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'رب انار', amount: 4, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'شکر', amount: 2, unit: 'قاشق غذاخوری', type: 'اختیاری' },
      { name: 'زعفران دم‌کرده', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: '۱. گردو را دو بار چرخ کنید و با آب یخ بپزید تا روغن آن کاملاً آزاد شود.\n۲. افزودن چند قالب یخ در فواصل پخت باعث شوک حرارتی و رو آمدن روغن گردو می‌شود.',
    instructions: [
      'پیاز رنده‌شده را تفت دهید و گردوی چرخ‌شده را به آن اضافه کنید و چند دقیقه تفت دهید.',
      '۳ لیوان آب سرد یا یخ اضافه کرده و بگذارید روی حرارت ملایم ۲ ساعت بجوشد تا روغن بیندازد.',
      'مرغ‌ها را جداگانه با زعفران و نمک سرخ کنید.',
      'رب انار و مرغ سرخ‌شده را به خورشت اضافه کرده و بگذارید ۱ ساعت دیگر جا بیفتد.'
    ]
  },
  {
    id: 'r16',
    title: 'کباب کوبیده زعفرانی خانگی',
    description: 'کباب کوبیده سنتی و آبدار با مخلوط گوشت گوسفند و گوساله و پیاز آب‌گرفته',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 40,
    cookTime: 20,
    servings: 4,
    difficulty: 'سخت',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 210,
    ingredients: [
      { name: 'گوشت گوسفندی', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'گوشت گوساله', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'پیاز', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'زعفران دم‌کرده', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'گوجه فرنگی', amount: 4, unit: 'عدد', type: 'افزودنی' }
    ],
    tips: 'آب پیاز را کاملاً بگیرید و مایه کباب را حداقل نیم ساعت خوب ورز دهید. مایه را ۲ ساعت در یخچال استراحت دهید تا از سیخ نریزد.',
    instructions: [
      'پیازها را رنده کرده و آب آن‌ها را با پارچه کاملاً بگیرید.',
      'گوشت چرخ‌کرده، پیاز، زعفران، نمک و فلفل سیاه را مخلوط کرده و ۱۰ دقیقه ورز دهید.',
      'مایه کباب را ۲ ساعت در یخچال بگذارید.',
      'گوشت را به سیخ کشیده و روی منقل ذغال یا تابه چدنی کباب کنید.'
    ]
  },
  {
    id: 'r17',
    title: 'ته چین مرغ و بادمجان زعفرانی',
    description: 'ته‌چین طلایی و برشته با مایه ماست و زعفران، مرغ ریش‌ریش و بادمجان سرخ‌شده',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 30,
    cookTime: 75,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 155,
    ingredients: [
      { name: 'برنج', amount: 3, unit: 'پیمانه', type: 'اصلی' },
      { name: 'فیله مرغ', amount: 350, unit: 'گرم', type: 'اصلی' },
      { name: 'بادمجان', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'ماست چکیده', amount: 1.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'زعفران دم‌کرده', amount: 4, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'زرشک', amount: 0.5, unit: 'پیمانه', type: 'اختیاری' }
    ],
    tips: 'از ماست چکیده ترش‌نداشته و زرده تخم‌مرغ استفاده کنید تا ته چین بوی زهم نگیرد و انسجام عالی پیدا کند.',
    instructions: [
      'مرغ را با پیاز بپزید و ریش‌ریش کنید. بادمجان‌ها را سرخ کنید.',
      'زرده‌های تخم مرغ، ماست چکیده، زعفران و روغن را هم بزنید.',
      'برنج آبکش‌شده را با مایه ماست مخلوط کرده، لایه لایه با مرغ و بادمجان در قابلمه بریزید و دم کنید.'
    ]
  },
  {
    id: 'r18',
    title: 'باقالی پلو با گردن گوسفندی',
    description: 'چلو شوید با باقلا تازه و گردن گوسفندی نرم و زعفرانی مجلسی',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 25,
    cookTime: 180,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 198,
    ingredients: [
      { name: 'برنج', amount: 4, unit: 'پیمانه', type: 'اصلی' },
      { name: 'گوشت گردن گوسفندی', amount: 700, unit: 'گرم', type: 'اصلی' },
      { name: 'باقلا سبز', amount: 2, unit: 'پیمانه', type: 'اصلی' },
      { name: 'شوید تازه یا خشک', amount: 1.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سیر', amount: 4, unit: 'حبه', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 5, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'گوشت گردن را با پیاز، سیر و زعفران فراوان روی حرارت بسیار ملایم بدون آب زیاد بپزید تا با آب خودش نرم شود.',
    instructions: [
      'پیاز و سیر را تفت داده، گوشت گردن و زردچوبه را اضافه کرده و با ۲ لیوان آب بپزید.',
      'برنج و باقلا را آبکش کنید، شويد را لابه‌لا اضافه کرده و دم بگذارید.',
      'در انتها کره و زعفران روی برنج بریزید و با گوشت گردن سرو کنید.'
    ]
  },
  {
    id: 'r19',
    title: 'قلیه ماهی جنوبی با تمر هندی',
    description: 'خورشت تند و ترش اصیل خوزستانی با ماهی شیر یا سنگسر، سبزی قلیه و تمر هندی',
    category: 'غذاهای محلی و سنتی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 25,
    cookTime: 50,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 132,
    ingredients: [
      { name: 'ماهی (شیر یا سنگسر)', amount: 600, unit: 'گرم', type: 'اصلی' },
      { name: 'سبزی قلیه (گشنیز و شنبلیله)', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'تمر هندی', amount: 1, unit: 'بسته', type: 'اصلی' },
      { name: 'سیر', amount: 8, unit: 'حبه', type: 'اصلی' },
      { name: 'پیاز', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'فلفل قرمز', amount: 1, unit: 'قاشق چای‌خوری', type: 'افزودنی' }
    ],
    tips: 'مقدار شنبلیله نباید زیاد باشد زیرا خورشت را تلخ می‌کند. تمر هندی را در آب گرم حل کرده و صاف کنید.',
    instructions: [
      'سیر و پیاز را تفت دهید، سبزی قلیه سرخ‌شده را بیفزایید.',
      'عصاره تمر هندی و فلفل قرمز را اضافه کرده و بگذارید جا بیفتد.',
      'تکه‌های ماهی را سرخ کرده و ۲۰ دقیقه آخر پخت درون خورشت قرار دهید.'
    ]
  },
  {
    id: 'r20',
    title: 'کوفته تبریزی اصیل',
    description: 'کوفته بزرگ و معطر آذربایجانی پرشده با آلو، گردو، پیازداغ و تخم‌مرغ آب‌پز',
    category: 'غذاهای محلی و سنتی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 45,
    cookTime: 90,
    servings: 4,
    difficulty: 'سخت',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 165,
    ingredients: [
      { name: 'گوشت چرخ‌کرده', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'لپه', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'برنج', amount: 0.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'سبزی کوفته', amount: 200, unit: 'گرم', type: 'اصلی' },
      { name: 'گردو و آلو بخارا', amount: 100, unit: 'گرم', type: 'افزودنی' },
      { name: 'رب گوجه فرنگی', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'لپه و برنج را نیم‌پز کرده و با گوشت خوب بکوبید یا ورز دهید تا کوفته هنگام پخت وا نرود.',
    instructions: [
      'گوشت، لپه کوبیده، برنج نیم‌پز، سبزی و تخم‌مرغ را ورز دهید.',
      'گلوله‌های بزرگ ساخته، وسط آن آلو، گردو و تخم‌مرغ بگذارید.',
      'کوفته‌ها را در سس رب و پیازداغ جوشان انداخته و با حرارت ملایم بپزید.'
    ]
  },
  {
    id: 'r21',
    title: 'خورش خلال کرمانشاهی',
    description: 'خورشت مجلسی کرمانشاه با گوشت گوسفندی خردشده، خلال بادام فراوان، زرشک سیاه و زرشک سرخ',
    category: 'غذاهای محلی و سنتی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 30,
    cookTime: 120,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 140,
    ingredients: [
      { name: 'گوشت گوسفندی', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'خلال بادام', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'زرشک سیاه', amount: 0.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 4, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'گلاب', amount: 2, unit: 'قاشق غذاخوری', type: 'اختیاری' }
    ],
    tips: 'خلال بادام را از ۱ ساعت قبل در گلاب و زعفران خیس کنید تا معطر و شفاف شود.',
    instructions: [
      'گوشت‌های قیمه‌ای کوچک را با پیاز تفت داده و بپزید.',
      'خلال بادام خیس‌خورده، رب و زعفران را اضافه کنید.',
      'در نیم ساعت آخر پخت زرشک سیاه و لیمو عمانی را بیفزایید تا جا بیفتد.'
    ]
  },
  {
    id: 'r22',
    title: 'خورشت اناربیج گیلانی',
    description: 'خورشت ترش و خوش‌عطر شمالی با سبزی محلی، گردوی ساییده، رب انار و گوشت قلقلی',
    category: 'غذاهای محلی و سنتی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 30,
    cookTime: 120,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 118,
    ingredients: [
      { name: 'گوشت چرخ‌کرده', amount: 350, unit: 'گرم', type: 'اصلی' },
      { name: 'گردو', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'سبزی اناربیج (جعفری، گشنیز، نعناع، خالواش)', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'رب انار ترش', amount: 3, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' }
    ],
    tips: 'اگر سبزی خالواش در دسترس نیست از نعناع و چوچاق یا سبزی معطر شمالی استفاده کنید.',
    instructions: [
      'گردوی چرخ‌شده را با آب بپزید تا روغن بیندازد.',
      'سبزی سرخ‌شده و رب انار را اضافه کنید.',
      'گوشت چرخ‌کرده را با پیاز قلقلی کرده، سرخ کنید و در خورشت جاافتاده بگذارید.'
    ]
  },
  {
    id: 'r23',
    title: 'کلم پلو شیرازی با گوشت قلقلی',
    description: 'کلم پلوی عطرآگین با کلم قمری یا کلم برگ خردشده، سبزی مخصوص، ترخون و گوشت قلقلی',
    category: 'غذاهای محلی و سنتی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 35,
    cookTime: 60,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 152,
    ingredients: [
      { name: 'برنج', amount: 4, unit: 'پیمانه', type: 'اصلی' },
      { name: 'کلم قمری یا کلم برگ', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'گوشت چرخ‌کرده', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'سبزی کلم‌پلو (ریحان، ترخون، شوید، تره)', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'آبغوره', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'کلم‌ها را خلالی نازک خرد کرده و با آبغوره و زردچوبه تفت دهید تا بوی کلم گرفته شده و لذیذ شود.',
    instructions: [
      'کلم‌ها را با آبغوره و ادویه تفت دهید.',
      'گوشت را قلقلی و سرخ کنید.',
      'برنج آبکش‌شده را با سبزی معطر و کلم تفت‌داده لایه لایه در قابلمه ریخته و دم کنید.'
    ]
  },
  {
    id: 'r24',
    title: 'لوبیا پلو شیرازی با گوشت تکه‌ای',
    description: 'لوبیا پلوی لذیذ و سرخ‌رنگ با لوبیا سبز تازه، گوشت قیمه‌ای، رب و دارچین فراوان',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 25,
    cookTime: 60,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 175,
    ingredients: [
      { name: 'برنج', amount: 4, unit: 'پیمانه', type: 'اصلی' },
      { name: 'لوبیا سبز', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'گوشت گوسفندی یا تکه‌ای', amount: 350, unit: 'گرم', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 3, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'پودر دارچین', amount: 1, unit: 'قاشق چای‌خوری', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'برای عطر بی‌نظیر، هنگام دم کردن برنج حتماً دارچین و زعفران روی لایه‌ها بپاشید.',
    instructions: [
      'گوشت و پیاز را سرخ کرده، لوبیا سبز خردشده و رب را اضافه کنید و بپزید.',
      'برنج را آبکش کرده و مایه لوبیا پلو را لا‌به‌لای آن بریزید و دم کنید.'
    ]
  },
  {
    id: 'r25',
    title: 'آلبالو پلو با مرغ و خلال پسته',
    description: 'پلوی خوش‌رنگ و ملس با آلبالوی تازه یا مربایی، مرغ حلزونی زعفرانی و خلال پسته و بادام',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 30,
    cookTime: 50,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 130,
    ingredients: [
      { name: 'برنج', amount: 4, unit: 'پیمانه', type: 'اصلی' },
      { name: 'آلبالو هسته‌گرفته', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'فیله مرغ', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'شکر', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'زعفران دم‌کرده', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'خلال پسته و بادام', amount: 50, unit: 'گرم', type: 'اختیاری' }
    ],
    tips: 'آلبالوها را با شکر ۱۰ دقیقه بجوشانید، شهد آن را صاف کرده و موقع سرو روی برنج زعفرانی بریزید.',
    instructions: [
      'آلبالو و شکر را بجوشانید و آلبالوها را جدا کنید.',
      'مرغ‌ها را با زعفران سرخ کنید.',
      'برنج را آبکش کرده و لایه لایه با آلبالو دم کنید.'
    ]
  },
  {
    id: 'r26',
    title: 'حلیم گندم سنتی با گوشت بوقلمون',
    description: 'حلیم کش‌دار و مقوی با گندم پوست‌کنده، گوشت بوقلمون یا گوسفند، دارچین و کنجد',
    category: 'غذای ایرانی',
    mealType: 'صبحانه',
    diet: 'پرپروتئین',
    prepTime: 30,
    cookTime: 240,
    servings: 6,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 160,
    ingredients: [
      { name: 'گندم پوست کنده', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'گوشت بوقلمون یا گوسفند', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'کره یا روغن حیوانی', amount: 50, unit: 'گرم', type: 'افزودنی' },
      { name: 'پودر دارچین و شکر', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'گندم را کاملاً بپزید و میکس کنید. گوشت را له یا کوبیده کرده و مرتب هم بزنید تا حلیم کش بیاید.',
    instructions: [
      'گندم خیس‌خورده را با آب فراوان کاملاً بپزید و صاف کنید.',
      'گوشت پخته شده را ریش‌ریش و کوبیده به گندم اضافه کنید.',
      'روی حرارت ملایم هم بزنید تا جا بیفتد و با دارچین و کره سرو کنید.'
    ]
  },
  {
    id: 'r27',
    title: 'کشک بادمجان مجلسی با گردو',
    description: 'پیش‌غذای لذیذ ایرانی با بادمجان سرخ‌شده یا کبابی، کشک غلیظ، سیرداغ، نعناع‌داغ و گردو',
    category: 'پیش‌غذا و سالاد',
    mealType: 'شام',
    diet: 'گیاه‌خواری',
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 205,
    ingredients: [
      { name: 'بادمجان', amount: 6, unit: 'عدد', type: 'اصلی' },
      { name: 'کشک', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'سیر', amount: 5, unit: 'حبه', type: 'اصلی' },
      { name: 'گردو خرد شده', amount: 0.5, unit: 'پیمانه', type: 'افزودنی' },
      { name: 'نعناع خشک', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'کمی نعناع داغ و سیرداغ را داخل بادمجان‌های کوبیده شده مخلوط کنید تا عطر آن عالی شود.',
    instructions: [
      'بادمجان‌ها را سرخ یا کباب کرده و له کنید.',
      'پیازداغ، سیرداغ و نعناع‌داغ را آماده کنید.',
      'بادمجان‌ها را با کشک و گردو مخلوط کرده و بپزید تا به روغن بیفتد.'
    ]
  },
  {
    id: 'r28',
    title: 'آبگوشت دیزی سنتی با دنبه',
    description: 'دیزی اصیل ایرانی با گوشت گوسفندی با استخوان، دنبه، نخود و لوبیا، سیب‌زمینی و گوجه',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 25,
    cookTime: 210,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 190,
    ingredients: [
      { name: 'گوشت گوسفندی با استخوان', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'دنبه گوسفندی', amount: 100, unit: 'گرم', type: 'اصلی' },
      { name: 'نخود و لوبیا سفید', amount: 1.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سیب زمینی', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'گوجه فرنگی', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'لیمو عمانی', amount: 2, unit: 'عدد', type: 'اختیاری' }
    ],
    tips: 'دنبه پخته شده را در انتهای پخت با پیاز بکوبید و دوباره به آبگوشت بیفزایید تا لعاب و طعم فوق‌العاده بگیرد.',
    instructions: [
      'گوشت، نخود، لوبیا و پیاز را با آب در دیزی یا قابلمه بپزید.',
      'سیب‌زمینی، گوجه و رب را ۱ ساعت آخر اضافه کنید.',
      'آب آن را برای تیلیت جدا کرده و بقیه مواد را بکوبید.'
    ]
  },
  {
    id: 'r29',
    title: 'جوجه کباب تابه ای زعفرانی',
    description: 'جوجه کباب نرم و آبدار خانگی مریـنِیت‌شده با ماست، زعفران، آبلیمو و پیاز',
    category: 'غذای ایرانی',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 165,
    ingredients: [
      { name: 'سینه یا فیله مرغ', amount: 600, unit: 'گرم', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'ماست', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 4, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'آبلیمو', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'کره', amount: 30, unit: 'گرم', type: 'افزودنی' }
    ],
    tips: 'مرغ‌ها را حداقل ۲ ساعت در مواد مرینیت بگذارید و موقع سرخ کردن حرارت را ملایم کنید تا مغزپخت شوند.',
    instructions: [
      'مرغ‌های خردشده را با پیاز خلالی، ماست، زعفران، آبلیمو و ادویه مزه‌دار کنید.',
      'تکه‌های مرغ را به سیخ چوبی بکشید.',
      'در تابه با کره و کمی روغن سرخ کنید تا طلایی و آبدار شوند.'
    ]
  },
  {
    id: 'r30',
    title: 'استانبولی پلو با گوجه و سیب‌زمینی',
    description: 'غذاهای سریع و لذیذ خانگی با پوره گوجه فرنگی، سیب‌زمینی نگینی و برنج کته',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'گیاه‌خواری',
    prepTime: 15,
    cookTime: 40,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop',
    rating: 4.7,
    likes: 120,
    ingredients: [
      { name: 'برنج', amount: 3, unit: 'پیمانه', type: 'اصلی' },
      { name: 'گوجه فرنگی', amount: 5, unit: 'عدد', type: 'اصلی' },
      { name: 'سیب زمینی', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'پیاز', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 1, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'کره', amount: 30, unit: 'گرم', type: 'افزودنی' }
    ],
    tips: 'استفاده از کره و گوجه فرنگی رنده‌شده تازه عطر فوق‌العاده‌ای به استانبولی پلو می‌دهد.',
    instructions: [
      'پیاز و سیب‌زمینی نگینی را تفت دهید.',
      'گوجه رنده‌شده و رب را افزوده و بگذارید آب آن کشیده شود.',
      'برنج و آب را اضافه کرده و به‌صورت کته دم کنید.'
    ]
  },
  {
    id: 'r31',
    title: 'عدس پلو با کشمش و گوشت چرخ‌کرده',
    description: 'عدس پلوی مقوی با گوشت چرخ‌کرده زعفرانی، کشمش پلویی، خرما و پیازداغ',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 50,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 140,
    ingredients: [
      { name: 'برنج', amount: 3, unit: 'پیمانه', type: 'اصلی' },
      { name: 'عدس', amount: 1.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'گوشت چرخ‌کرده', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'کشمش پلویی', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'زعفران دم‌کرده', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'خرما', amount: 8, unit: 'عدد', type: 'اختیاری' }
    ],
    tips: 'عدس را بیش از حد نپزید تا موقع دم کشیدن له نشود. کشمش را با کره و زعفران خیلی کوتاه تفت دهید.',
    instructions: [
      'عدس را بپزید. گوشت چرخ‌کرده را با پیاز و دارچین تفت دهید.',
      'برنج و عدس را مخلوط کرده و دم کنید.',
      'موقع سرو با گوشت، کشمش تفت‌داده و زعفران تزئین کنید.'
    ]
  },
  {
    id: 'r32',
    title: 'باقلاقاتوق رشتی با سیر و شوید',
    description: 'خورشت سریع و گیاهی شمال ایران با پاچ‌باقلا (باقلا رشتی)، شوید تازه، سیر و تخم‌مرغ',
    category: 'غذاهای محلی و سنتی',
    mealType: 'شام',
    diet: 'گیاه‌خواری',
    prepTime: 15,
    cookTime: 25,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 135,
    ingredients: [
      { name: 'پاچ باقلا یا باقلا کشاورزی', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'شوید تازه یا خشک', amount: 3, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'سیر', amount: 5, unit: 'حبه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'کره یا روغن', amount: 30, unit: 'گرم', type: 'افزودنی' }
    ],
    tips: 'تخم‌مرغ‌ها را بعد از شکستن درون خورشت هم نزنید تا به‌صورت درسته بپزند.',
    instructions: [
      'سیر رنده‌شده را با کره و زردچوبه تفت دهید.',
      'باقلا و شوید را اضافه کرده و ۲ لیوان آب جوش بریزید تا باقلا بپزد.',
      'تخم‌مرغ‌ها را روی خورشت بشکنید تا عسلی پخته شوند.'
    ]
  },
  {
    id: 'r33',
    title: 'حلیم بادمجان اصفهانی کش‌دار',
    description: 'حلیم بادمجان کش‌دار با گوشت گردن گوسفند، بادمجان سرخ‌شده، کشک غلیظ و گردو',
    category: 'غذاهای محلی و سنتی',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 30,
    cookTime: 90,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 110,
    ingredients: [
      { name: 'بادمجان', amount: 1, unit: 'کیلوگرم', type: 'اصلی' },
      { name: 'گوشت گردن گوسفندی', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'عدس یا برنج', amount: 0.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'کشک', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سیر و پیازداغ', amount: 0.5, unit: 'پیمانه', type: 'افزودنی' },
      { name: 'گردو', amount: 50, unit: 'گرم', type: 'افزودنی' }
    ],
    tips: 'کوبیدن گوشت با گوشت‌کوب دستی (نه میکس کردن برقی) باعث کش آمدن فوق‌العاده حلیم بادمجان می‌شود.',
    instructions: [
      'گوشت و برنج/عدس را بپزید. بادمجان‌ها را سرخ کرده و بکوبید.',
      'گوشت کوبیده را به بادمجان و برنج اضافه کرده و هم بزنید.',
      'کشک را بیفزایید و با سیرداغ و گردو تزئین کنید.'
    ]
  },
  {
    id: 'r34',
    title: 'شامی پوک قزوینی / لپه‌ای',
    description: 'شامی ترد و پوک سنتی با گوشت گوسفند، لپه پخته، تخم‌مرغ و زعفران',
    category: 'غذاهای محلی و سنتی',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 30,
    cookTime: 30,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 95,
    ingredients: [
      { name: 'گوشت گوسفندی پخته', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'لپه پخته', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'پیاز', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'زعفران دم‌کرده', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'گوشت و لپه پخته را با هم بکوبید و وسط شامی‌ها سوراخ ایجاد کنید تا موقع سرخ شدن پوک شود.',
    instructions: [
      'گوشت پخته و لپه را له یا چرخ کنید.',
      'پیاز رنده‌شده، تخم‌مرغ و ادویه‌ها را مخلوط کرده و ورز دهید.',
      'به شکل گرد فرم داده، وسط آن سوراخ ایجاد کنید و در روغن داغ سرخ کنید.'
    ]
  },
  {
    id: 'r35',
    title: 'تاس کباب گوشت و به',
    description: 'خوراک لذیذ و سنتی با لایه‌های گوشت، به، سیب‌زمینی، هویج، پیاز و گوجه فرنگی',
    category: 'غذاهای محلی و سنتی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 25,
    cookTime: 100,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.7,
    likes: 88,
    ingredients: [
      { name: 'گوشت تکه‌ای گوسفند', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'به', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'سیب زمینی', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'هویج', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'پیاز', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'آبوغوره یا گرد لیمو', amount: 2, unit: 'قاشق غذاخوری', type: 'اختیاری' }
    ],
    tips: 'مواد را به شکل حلقه‌ای خرد کنید و لایه لایه درون قابلمه بچینید.',
    instructions: [
      'کف قابلمه پیاز حلقه شده بچینید، سپس گوشت، هویج، به و سیب‌زمینی را لایه لایه بگذارید.',
      'رب گوجه، آبغوره و ۲ لیوان آب را مخلوط کرده روی مواد بریزید.',
      'با حرارت ملایم اجازه دهید کامل بپزد و جا بیفتد.'
    ]
  },
  {
    id: 'r36',
    title: 'آش شله قلمکار مجلسی',
    description: 'آش کش‌دار و معطر با گوشت گوسفندی، حبوبات متنوع، سبزی آشی و پیازداغ فراوان',
    category: 'سوپ، آش و خوراک',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 40,
    cookTime: 240,
    servings: 8,
    difficulty: 'سخت',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 170,
    ingredients: [
      { name: 'گوشت گوسفندی', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'نخود و عدس و لوبیا چیتی', amount: 2, unit: 'پیمانه', type: 'اصلی' },
      { name: 'برنج و گندم', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سبزی آشی', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'پیازداغ فراوان', amount: 1, unit: 'پیمانه', type: 'افزودنی' }
    ],
    tips: 'مرتب هم زدن آش و کوبیدن گوشت پخته شده راز کش‌دار شدن شله قلمکار است.',
    instructions: [
      'حبوبات را بپزید. گوشت را جداگانه پخته و ریش‌ریش کنید.',
      'برنج و گندم را بپزید تا له شود. سبزی، حبوبات و گوشت کوبیده را اضافه کنید.',
      'مرتب هم بزنید تا آش کاملاً جا افتاده و کش‌دار شود.'
    ]
  },
  {
    id: 'r37',
    title: 'آش دوغ اردبیل با سبزی تازه',
    description: 'آش سفید و خنک آذربایجان با دوغ محلی، نخود، برنج، سبزی تازه و گوشت قلقلی',
    category: 'سوپ، آش و خوراک',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 45,
    servings: 5,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 180,
    ingredients: [
      { name: 'دوغ محلی غلیظ', amount: 2, unit: 'لیتر', type: 'اصلی' },
      { name: 'برنج', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'نخود پخته', amount: 1.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'سبزی آش دوغ (تره، گشنیز، برگ ثوم/سیر)', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'سیر رنده‌شده', amount: 5, unit: 'حبه', type: 'افزودنی' }
    ],
    tips: 'تخم‌مرغ را با برنج و دوغ قبل از جوش آمدن مرتب هم بزنید تا دوغ بریدگی پیدا نکند.',
    instructions: [
      'دوغ، برنج و تخم‌مرغ را مخلوط کرده و تا زمان جوش آمدن مدام در یک جهت هم بزنید.',
      'نخود پخته و سبزی خردشده را بیفزایید.',
      'سیر رنده‌شده و در صورت تمایل گوشت قلقلی را اضافه کنید تا پخته شود.'
    ]
  },
  {
    id: 'r38',
    title: 'سوپ جو پرک با شیر و خامه',
    description: 'سوپ جوی رستورانی با جو پرک، شیر، خامه، قارچ، عصاره مرغ و هویج رنده‌شده',
    category: 'سوپ، آش و خوراک',
    mealType: 'پیش‌غذا',
    diet: 'معمولی',
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 145,
    ingredients: [
      { name: 'جو پرک', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'شیر', amount: 3, unit: 'لیوان', type: 'اصلی' },
      { name: 'قارچ', amount: 150, unit: 'گرم', type: 'اصلی' },
      { name: 'هویج', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'خامه', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'کره', amount: 20, unit: 'گرم', type: 'افزودنی' }
    ],
    tips: 'شیر را ولرم اضافه کنید تا نبُرد و خامه را در آخرین مرحله پس از خاموش کردن شعله حل نمایید.',
    instructions: [
      'جو پرک و هویج رنده‌شده را با عصاره مرغ یا آب بپزید.',
      'قارچ‌های تفت‌داده با کره و شیر گرم را اضافه کنید.',
      'پس از غلیظ شدن حرارت را خاموش کرده و خامه را اضافه کنید.'
    ]
  },
  {
    id: 'r39',
    title: 'سوپ قارچ و تره فرنگی غلیظ',
    description: 'سوپ مخملی فرانسوی با تره‌فرنگی، قارچ، کره، آرد و شیر',
    category: 'سوپ، آش و خوراک',
    mealType: 'پیش‌غذا',
    diet: 'گیاه‌خواری',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.7,
    likes: 92,
    ingredients: [
      { name: 'تره فرنگی', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'قارچ', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'آرد سفید', amount: 2, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'شیر', amount: 2, unit: 'لیوان', type: 'اصلی' },
      { name: 'کره', amount: 30, unit: 'گرم', type: 'افزودنی' }
    ],
    tips: 'مخلوط کردن سوپ با گوشتکوب برقی بافت بسیار یکدست و لوکسی ایجاد می‌کند.',
    instructions: [
      'تره‌فرنگی و قارچ را با کره تفت دهید.',
      'آرد را اضافه کرده و ۱ دقیقه تفت دهید، سپس شیر و عصاره سبزیجات را اضافه کنید.',
      'بپزید و در انتهای کار میکس کنید.'
    ]
  },
  {
    id: 'r40',
    title: 'خوراک لوبیا چیتی با قارچ و گلپر',
    description: 'خوراک گرم و لذیذ لوبیا چیتی با سس گوجه، قارچ، سیر و گلپر معطر',
    category: 'سوپ، آش و خوراک',
    mealType: 'شام',
    diet: 'گیاه‌خواری',
    prepTime: 15,
    cookTime: 90,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 125,
    ingredients: [
      { name: 'لوبیا چیتی', amount: 2, unit: 'پیمانه', type: 'اصلی' },
      { name: 'قارچ', amount: 200, unit: 'گرم', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'پودر گلپر و آبلیمو', amount: 1, unit: 'قاشق چای‌خوری', type: 'افزودنی' }
    ],
    tips: 'سیب‌زمینی رنده‌شده کوچک درون خوراک لعاب عالی بوجود می‌آورد.',
    instructions: [
      'لوبیا خیس‌خورده را با پیازداغ بپزید.',
      'رب و قارچ تفت‌داده را بیفزایید.',
      'در انتهای پخت گلپر و آبلیمو بزنید.'
    ]
  },
  {
    id: 'r41',
    title: 'خوراک زبان گوساله با سس قارچ',
    description: 'خوراک مجلسی و نرم زبان گوساله با سس قارچ غلیظ و سیر',
    category: 'سوپ، آش و خوراک',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 25,
    cookTime: 180,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 115,
    ingredients: [
      { name: 'زبان گوساله', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'قارچ', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'پیاز و سیر', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'خامه یا سس بشامل', amount: 0.5, unit: 'پیمانه', type: 'افزودنی' }
    ],
    tips: 'پوست سفید زبان را حتماً بلافاصله پس از پختن و تا داغ است بکنید.',
    instructions: [
      'زبان را با پیاز، سیر و برگ غار کاملاً بپزید و پوست آن را بکنید.',
      'زبان را برش داده و با سس قارچ و خامه سرو نمایید.'
    ]
  },
  {
    id: 'r42',
    title: 'همبرگر دستی خانگی با پنیر گودا',
    description: 'برگر آبدار دست‌ساز با گوشت خالص گوساله، ادویه مخصوص، پنیر گودا و نان مک‌دونالدی',
    category: 'فست‌فود',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 15,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 220,
    ingredients: [
      { name: 'گوشت چرخ‌کرده گوساله', amount: 450, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر گودا ورقه‌ای', amount: 3, unit: 'ورقه', type: 'اصلی' },
      { name: 'پیاز', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'نان همبرگر', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'کاهو، گوجه و خیارشور', amount: 1, unit: 'بسته', type: 'افزودنی' }
    ],
    tips: 'گوشت برگر را زیاد ورز ندهید تا بافت آن فشرده و سفت نشود.',
    instructions: [
      'گوشت و پیاز رنده‌شده آب‌گرفته را با نمک و فلفل سیاه مخلوط کنید.',
      'گوشت‌ها را چانه زده و روی تابه چدنی داغ کباب کنید.',
      'در ۱ دقیقه آخر پنیر را روی گوشت بگذارید تا آب شود و در نان بچینید.'
    ]
  },
  {
    id: 'r43',
    title: 'ساندویچ سوسیس بندری تند',
    description: 'ساندویچ بندری نوستالژیک و تند با سوسیس خانگی، پیاز زیاد، سیب‌زمینی و رب گوجه',
    category: 'فست‌فود',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 15,
    cookTime: 20,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 195,
    ingredients: [
      { name: 'سوسیس آلمانی یا شکاری', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'پیاز', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'سیب زمینی', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 2, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'فلفل قرمز تند', amount: 1, unit: 'قاشق چای‌خوری', type: 'افزودنی' }
    ],
    tips: 'پیازها را خلالی خرد کرده و سرخ کنید تا کاراملی شوند. سوسیس بندری اصیل پیاز فراوان دارد.',
    instructions: [
      'سیب‌زمینی را مکعبی سرخ کنید.',
      'پیازها را سبک کرده، سوسیس مورب خردشده را اضافه کنید.',
      'رب و فلفل قرمز را بیفزایید، سیب‌زمینی را مخلوط کرده و با نان باگت سرو کنید.'
    ]
  },
  {
    id: 'r44',
    title: 'اسنک مرغ و قارچ پنیری',
    description: 'اسنک مثلثی ترد با ساندویچ‌ساز پرشده از فیله مرغ، قارچ، فلفل دلمه‌ای و پنیر پیتزا',
    category: 'فست‌فود',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'معمولی',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 160,
    ingredients: [
      { name: 'نان تست', amount: 8, unit: 'عدد', type: 'اصلی' },
      { name: 'فیله مرغ پخته', amount: 150, unit: 'گرم', type: 'اصلی' },
      { name: 'قارچ', amount: 100, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر پیتزا', amount: 100, unit: 'گرم', type: 'اصلی' },
      { name: 'فلفل دلمه‌ای', amount: 0.5, unit: 'عدد', type: 'افزودنی' }
    ],
    tips: 'روی نان‌های تست کمی کره بمالید تا موقع پرس شدن طلایی و ترد شوند.',
    instructions: [
      'قارچ و مرغ را تفت دهید.',
      'روی نان تست مایه مرغ، فلفل دلمه‌ای و پنیر بگذارید.',
      'نان دوم را بگذارید و در اسنک‌ساز ۷ دقیقه پرس کنید.'
    ]
  },
  {
    id: 'r45',
    title: 'چیزبرگر دوبل خانگی',
    description: 'چیزبرگر دو طبقه لذیذ با دو لایه گوشت کباب‌شده و دو لایه پنیر گودا',
    category: 'فست‌فود',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 180,
    ingredients: [
      { name: 'گوشت چرخ‌کرده', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر گودا', amount: 4, unit: 'ورقه', type: 'اصلی' },
      { name: 'نان همبرگر', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'سس مخصوص برگر', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'نان همبرگر را قبل از چیدن مواد روی تابه با کره تست کنید.',
    instructions: [
      'دو عدد پتی برگر بسازید و سرخ کنید.',
      'روی هر پتی پنیر بگذارید و دو طبقه روی هم نان بچینید.'
    ]
  },
  {
    id: 'r46',
    title: 'پیتزا پپرونی تند ایتالیایی',
    description: 'پیتزای پپرونی کلاسیک با اسلایس‌های پپرونی، پنیر موزارلا و سس گوجه فرنگی ریحان',
    category: 'فست‌فود',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 175,
    ingredients: [
      { name: 'خمیر پیتزا', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'پپرونی', amount: 150, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر پیتزا', amount: 200, unit: 'گرم', type: 'اصلی' },
      { name: 'سس گوجه فرنگی', amount: 3, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'پودر آویشن', amount: 1, unit: 'قاشق چای‌خوری', type: 'افزودنی' }
    ],
    tips: 'فر را حتماً از قبل با دمای ۲۲۰ درجه کاملاً داغ کنید.',
    instructions: [
      'سس را روی خمیر بمالید و آویشن بپاشید.',
      'نیم از پنیر را ریخته، اسلایس‌های پپرونی را چیده و مابقی پنیر را بریزید.',
      'در فر داغ ۱۵ دقیقه بپزید.'
    ]
  },
  {
    id: 'r47',
    title: 'ناگت مرغ خانگی و ترد',
    description: 'ناگت مرغ سوخاری و ترد بدون مواد نگهدارنده با پودر سوخاری و پنیر پیتزا',
    category: 'فست‌فود',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 25,
    cookTime: 15,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 140,
    ingredients: [
      { name: 'سینه مرغ خام', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'پودر سوخاری', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'پنیر پیتزا یا پارمزان', amount: 50, unit: 'گرم', type: 'افزودنی' },
      { name: 'سیر', amount: 2, unit: 'حبه', type: 'افزودنی' }
    ],
    tips: 'گوشت مرغ چرخ‌شده را ۳۰ دقیقه در فریزر بگذارید تا قالب‌زدن آن راحت شود.',
    instructions: [
      'مرغ، سیر، پنیر و ادویه را میکس کنید.',
      'قالب زده، ابتدا در آرد، سپس تخم‌مرغ و بعد پودر سوخاری بزنید.',
      'در روغن داغ سرخ یا در فر بپزید.'
    ]
  },
  {
    id: 'r48',
    title: 'سالاد شیرازی اصیل با آبغوره',
    description: 'سالاد سنتی و باطراوت ایرانی با خیار، گوجه فرنگی، پیاز، نعناع خشک و آبغوره',
    category: 'پیش‌غذا و سالاد',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'وگن (کاملاً گیاهی)',
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 180,
    ingredients: [
      { name: 'خیار', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'گوجه فرنگی', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'پیاز بنفش', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'آبغوره', amount: 4, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'نعناع خشک', amount: 1, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'خیار و گوجه را کاملاً ریز و نگینی یکدست خرد کنید.',
    instructions: [
      'خیار، گوجه و پیاز را ریز نگینی کنید.',
      'آبغوره، نمک، فلفل و نعناع خشک را بیفزایید و خنک سرو کنید.'
    ]
  },
  {
    id: 'r49',
    title: 'سالاد اندونزی با کلم‌پیچ و ذرت',
    description: 'سالاد مجلسی و ترد با کلم سفید و بنفش، هویج، ذرت، نخودفرنگی و سس مایونز',
    category: 'پیش‌غذا و سالاد',
    mealType: 'پیش‌غذا',
    diet: 'گیاه‌خواری',
    prepTime: 20,
    cookTime: 0,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 130,
    ingredients: [
      { name: 'کلم سفید و بنفش', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'هویج', amount: 1, unit: 'عدد', type: 'اصلی' },
      { name: 'ذرت شیرین', amount: 0.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'کشمش یا کالباس', amount: 50, unit: 'گرم', type: 'اختیاری' },
      { name: 'سس مایونز و ماست', amount: 4, unit: 'قاشق غذاخوری', type: 'اصلی' }
    ],
    tips: 'کلم‌ها را نوار باریک رشته‌ای خرد کنید و سالاد را ۲ ساعت در یخچال بگذارید تا سس جذب شود.',
    instructions: [
      'کلم‌ها و هویج را باریک رشته کنید.',
      'ذرت و نخودفرنگی را مخلوط کرده و با سس ترکیبی بپوشانید.'
    ]
  },
  {
    id: 'r50',
    title: 'سالاد ماکارونی پنیری',
    description: 'سالاد ماکارونی محبوب با پاستا فرمی، خیارشور، کالباس/مرغ، ذرت و سس مایونز',
    category: 'پیش‌غذا و سالاد',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 12,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 160,
    ingredients: [
      { name: 'پاستا فرمی', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'خیارشور', amount: 150, unit: 'گرم', type: 'اصلی' },
      { name: 'ژامبون یا مرغ پخته', amount: 150, unit: 'گرم', type: 'اصلی' },
      { name: 'ذرت و نخودفرنگی', amount: 1, unit: 'پیمانه', type: 'افزودنی' },
      { name: 'سس مایونز', amount: 4, unit: 'قاشق غذاخوری', type: 'اصلی' }
    ],
    tips: 'پاستا را ۱ دقیقه بیشتر از زمان معمول بجوشانید تا نرم شود و سس را خوب جذب کند.',
    instructions: [
      'پاستا را جوشانده و آبکش کنید.',
      'خیارشور و مرغ/ژامبون خردشده را بیفزایید.',
      'با سس مایونز و آبلیمو مخلوط کرده و سرد سرو نمایید.'
    ]
  },
  {
    id: 'r51',
    title: 'بورانی بادمجان و سیر',
    description: 'پیش‌غذای لذیذ گیلانی با بادمجان کبابی، ماست چکیده و سیر رنده‌شده',
    category: 'پیش‌غذا و سالاد',
    mealType: 'پیش‌غذا',
    diet: 'گیاه‌خواری',
    prepTime: 15,
    cookTime: 20,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 105,
    ingredients: [
      { name: 'بادمجان', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'ماست چکیده', amount: 1.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سیر', amount: 3, unit: 'حبه', type: 'اصلی' }
    ],
    tips: 'کباب کردن بادمجان روی منقل عطر دودی بی‌نظیری به بورانی می‌دهد.',
    instructions: [
      'بادمجان‌ها را کباب کرده، پوست کنده و ساطوری کنید.',
      'با ماست چکیده، سیر رنده‌شده و نمک مخلوط کنید.'
    ]
  },
  {
    id: 'r52',
    title: 'نان سیر خانگی با پنیر پارمزان',
    description: 'نان سیر ترد با نان باگت یا تست، سیر رنده‌شده، کره، جعفری و پنیر پارمزان',
    category: 'پیش‌غذا و سالاد',
    mealType: 'پیش‌غذا',
    diet: 'گیاه‌خواری',
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 140,
    ingredients: [
      { name: 'نان باگت یا تست', amount: 1, unit: 'بسته', type: 'اصلی' },
      { name: 'سیر', amount: 4, unit: 'حبه', type: 'اصلی' },
      { name: 'کره', amount: 50, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر پارمزان یا موزارلا', amount: 100, unit: 'گرم', type: 'افزودنی' },
      { name: 'جعفری خردشده', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'کره را به دمای محیط برسانید و با سیر پوره شده مخلوط کنید.',
    instructions: [
      'کره نرم، سیر و جعفری را روی نان‌ها بمالید.',
      'پنیر بریزید و در فر ۲۰۰ درجه ۸ دقیقه گریل کنید.'
    ]
  },
  {
    id: 'r53',
    title: 'بیف استروگانف با سس خامه',
    description: 'غذای معروف روسی با فیله گوساله نواری، قارچ، خامه و سیب‌زمینی خلالی برشته',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 25,
    servings: 3,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 185,
    ingredients: [
      { name: 'فیله گوساله', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'قارچ', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'خامه', amount: 1, unit: 'بسته', type: 'اصلی' },
      { name: 'شیر', amount: 0.5, unit: 'پیمانه', type: 'افزودنی' },
      { name: 'سیب زمینی خلالی بسیار باریک', amount: 2, unit: 'عدد', type: 'افزودنی' }
    ],
    tips: 'گوشت را نواری بسیار باریک خرد کنید و روی حرارت بسیار بالا تفت دهید تا آب نیندازد.',
    instructions: [
      'گوشت‌های نواری را با پیاز تفت داده تا بپزند.',
      'قارچ‌های اسلایس‌شده را تفت دهید و اضافه کنید.',
      'شیر و خامه را بیفزایید و موقع سرو با چیپس سیب‌زمینی خلیلی تزئین کنید.'
    ]
  },
  {
    id: 'r54',
    title: 'لازانیا گوشت و قارچ با سس بشامل',
    description: 'لازانیای ایتالیایی طبقاتی با مایه گوشت چرخ‌کرده، قارچ، سس بشامل و پنیر مطهر',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 35,
    cookTime: 40,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 210,
    ingredients: [
      { name: 'ورقه لازانیا', amount: 1, unit: 'بسته', type: 'اصلی' },
      { name: 'گوشت چرخ‌کرده', amount: 350, unit: 'گرم', type: 'اصلی' },
      { name: 'قارچ', amount: 200, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر پیتزا', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'سس بشامل (شیر، کره، آرد)', amount: 1.5, unit: 'پیمانه', type: 'اصلی' }
    ],
    tips: 'کف ظرف پیرکس حتماً یک لایه سس بشامل بریزید تا ورقه‌های لازانیا خشک نشوند.',
    instructions: [
      'مایه گوشت و قارچ را بپزید. سس بشامل بسازید.',
      'کف ظرف سس بریزید، ورقه لازانیا، مایه گوشت، سس بشامل و پنیر بگذارید.',
      'طبقات را تکرار کنید و ۳5 دقیقه در فر ۱۸۰ درجه بپزید.'
    ]
  },
  {
    id: 'r55',
    title: 'تاکو مرغ مکزیکی با سس آووکادو',
    description: 'تاکوی ترد مکزیکی با مرغ ادویه‌زده، ذرت، لوبیا قرمز، سس گواکاموله و پنیر',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 15,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 120,
    ingredients: [
      { name: 'نان نان تورتیلا یا تاکو', amount: 6, unit: 'عدد', type: 'اصلی' },
      { name: 'فیله مرغ', amount: 300, unit: 'گرم', type: 'اصلی' },
      { name: 'آووکادو یا گوجه فرنگی', amount: 1, unit: 'عدد', type: 'افزودنی' },
      { name: 'ذرت و لوبیا', amount: 0.5, unit: 'پیمانه', type: 'افزودنی' }
    ],
    tips: 'از ادویه تاكو (پاپریکا، زیره، پودر سیر و فلفل قرمز) برای مرغ استفاده کنید.',
    instructions: [
      'مرغ را مکعبی خرد کرده و با ادویه‌ها تفت دهید.',
      'نان‌های تورتیلا را گرم کرده، مرغ، ذرت، گوجه و آووکادو چیده و سرو کنید.'
    ]
  },
  {
    id: 'r56',
    title: 'نودل سبزیجات و مرغ کنجدی',
    description: 'نودل آسیایی سریع با فیله مرغ، فلفل دلمه‌ای، هویج، سویا سس و روغن کنجد',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'کم‌کالری / رژیمی',
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop',
    rating: 4.7,
    likes: 135,
    ingredients: [
      { name: 'نودل', amount: 2, unit: 'بسته', type: 'اصلی' },
      { name: 'فیله مرغ', amount: 200, unit: 'گرم', type: 'اصلی' },
      { name: 'فلفل دلمه‌ای و هویج', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سویا سس', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'سبزیجات را با حرارت زیاد تفت دهید تا ترد بمانند.',
    instructions: [
      'نودل را ۳ دقیقه بجوشانید.',
      'مرغ و سبزیجات رشته‌ای را در وک تفت دهید، سویا سس و نودل را اضافه کنید.'
    ]
  },
  {
    id: 'r57',
    title: 'گراتن سیب‌زمینی و مرغ پنیری',
    description: 'گراتن فرانسوی خوشمزه با اسلایس‌های سیب‌زمینی پخته، مرغ، سس سفید و پنیر طلایی',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 110,
    ingredients: [
      { name: 'سیب زمینی', amount: 4, unit: 'عدد', type: 'اصلی' },
      { name: 'فیله مرغ', amount: 250, unit: 'گرم', type: 'اصلی' },
      { name: 'پنیر پیتزا', amount: 150, unit: 'گرم', type: 'اصلی' },
      { name: 'خامه یا سس بشامل', amount: 1, unit: 'پیمانه', type: 'اصلی' }
    ],
    tips: 'سیب‌زمینی‌ها را ابتدا نیم‌پز کنید تا گراتن سریع‌تر بپزد.',
    instructions: [
      'سیب‌زمینی ورقه شده و مرغ تفت‌داده را در ظرف پیرکس بچینید.',
      'سس سفید بریزید، با پنیر بپوشانید و نیم ساعت در فر بپزید.'
    ]
  },
  {
    id: 'r58',
    title: 'شاورما مرغ مدیترانه‌ای',
    description: 'ساندویچ شاورما با مرغ مرینیت‌شده در ادویه‌جات عربی، نان پیتا و سس سیر ثوم',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 15,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 150,
    ingredients: [
      { name: 'سینه مرغ', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'نان پیتا یا مدیترانه‌ای', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'سیر', amount: 6, unit: 'حبه', type: 'اصلی' },
      { name: 'خیارشور و گوجه', amount: 1, unit: 'پیمانه', type: 'افزودنی' }
    ],
    tips: 'سس سیر (ثوم) را با روغن زیتون، سیر و سفیده تخم‌مرغ یا ماست چکیده بسازید.',
    instructions: [
      'مرغ را با ادویه‌جات تفت دهید.',
      'سس سیر را روی نان بمالید، مرغ و خیارشور بگذارید و رول کنید.'
    ]
  },
  {
    id: 'r59',
    title: 'فرنی نشاسته با گلاب و دارچین',
    description: 'دسر سبک و سنتی با شیر، نشاسته یا آرد برنج، گلاب و تزئین پودر دارچین و پسته',
    category: 'دسر و شیرینی',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'کم‌کالری / رژیمی',
    prepTime: 5,
    cookTime: 15,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 105,
    ingredients: [
      { name: 'شیر', amount: 2, unit: 'لیوان', type: 'اصلی' },
      { name: 'نشاسته یا آرد برنج', amount: 2, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'شکر', amount: 3, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'گلاب', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'نشاسته را ابتدا در شیر سرد حل کنید تا گلوله نشود.',
    instructions: [
      'نشاسته، شکر و شیر سرد را مخلوط کرده و روی حرارت هم بزنید تا غلیظ شود.',
      'گلاب را بیفزایید و در پیاله‌ها بریزید.'
    ]
  },
  {
    id: 'r60',
    title: 'حلوای زعفرانی مجلسی',
    description: 'حلوای آرد گندم نرم و کش‌دار با شهد زعفران، گلاب و هل',
    category: 'دسر و شیرینی',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'معمولی',
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 140,
    ingredients: [
      { name: 'آرد گندم', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'شکر', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'روغن و کره', amount: 0.75, unit: 'پیمانه', type: 'اصلی' },
      { name: 'زعفران دم‌کرده', amount: 4, unit: 'قاشق غذاخوری', type: 'اصلی' },
      { name: 'گلاب', amount: 0.5, unit: 'پیمانه', type: 'افزودنی' }
    ],
    tips: 'تفت دادن آرد با حرارت ملایم و صبر زیاد راز خوش‌رنگ شدن حلواست.',
    instructions: [
      'آرد را بو داده تا بوی خامی آن گرفته شود.',
      'روغن را بیفزایید. شهد داغ زعفران و گلاب را اضافه کرده و گهواره کنید.'
    ]
  },
  {
    id: 'r61',
    title: 'کیک شکلاتی خیس بی‌بی',
    description: 'کیک شکلاتی بافت‌دار و مرطوب با سس شکلات تلخ و گاناش خامه',
    category: 'دسر و شیرینی',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 40,
    servings: 6,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 215,
    ingredients: [
      { name: 'آرد سفید', amount: 2, unit: 'پیمانه', type: 'اصلی' },
      { name: 'پودر کاکائو', amount: 0.5, unit: 'پیمانه', type: 'اصلی' },
      { name: 'تخم مرغ', amount: 3, unit: 'عدد', type: 'اصلی' },
      { name: 'شیر', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'سس شکلات', amount: 1, unit: 'پیمانه', type: 'اصلی' }
    ],
    tips: 'سس شکلاتی داغ را روی کیک داغ سوراخ‌شده بریزید تا کامل جذب شود.',
    instructions: [
      'مواد خیس و خشک را مخلوط کرده و در فر ۱۸۰ درجه بپزید.',
      'پس از پخت روی کیک سوراخ زده و سس شکلات بریزید.'
    ]
  },
  {
    id: 'r62',
    title: 'معجون مخصوص مغزها و موز',
    description: 'معجون انرژی‌زا با شیر، موز، گردو، پسته، عسل، خرما و خامه',
    category: 'نوشیدنی',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'پرپروتئین',
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 175,
    ingredients: [
      { name: 'شیر', amount: 2, unit: 'لیوان', type: 'اصلی' },
      { name: 'موز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'مغز گردو و پسته', amount: 50, unit: 'گرم', type: 'اصلی' },
      { name: 'عسل', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'خرما', amount: 4, unit: 'عدد', type: 'افزودنی' }
    ],
    tips: 'موزها را از قبل در فریزر منجمد کنید تا معجون غلیظ و بستنی‌مانند شود.',
    instructions: [
      'همه مواد را در مخلوط‌کن بریزید و ۲ دقیقه میکس کنید تا یکدست شود.'
    ]
  },
  {
    id: 'r63',
    title: 'موهیتو نعناع و لیموی تازه',
    description: 'نوشیدنی خنک تابستانی با لیموترش تازه، برگ نعناع، یخ و آب گازدار',
    category: 'نوشیدنی',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'وگن (کاملاً گیاهی)',
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 140,
    ingredients: [
      { name: 'لیمو ترش', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'نعناع تازه', amount: 1, unit: 'دسته', type: 'اصلی' },
      { name: 'آب گازدار یا سودا', amount: 2, unit: 'لیوان', type: 'اصلی' },
      { name: 'عسل یا شکر', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'نعناع و لیمو را با گوشتکوب در لیوان بکوبید تا عطر روغن لیمو و نعناع خارج شود.',
    instructions: [
      'لیمو و نعناع را بکوبید، یخ فراوان و آب گازدار اضافه کنید.'
    ]
  },
  {
    id: 'r64',
    title: 'مربای به معطر با هل و گلاب',
    description: 'مربای به خوش‌رنگ و قرمز با شهد غلیظ، هل سبز و گلاب',
    category: 'ترشی و مربا',
    mealType: 'صبحانه',
    diet: 'گیاه‌خواری',
    prepTime: 20,
    cookTime: 120,
    servings: 8,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 110,
    ingredients: [
      { name: 'به تازه', amount: 1, unit: 'کیلوگرم', type: 'اصلی' },
      { name: 'شکر', amount: 1, unit: 'کیلوگرم', type: 'اصلی' },
      { name: 'هل سبز', amount: 5, unit: 'عدد', type: 'افزودنی' },
      { name: 'آبلیمو', amount: 1, unit: 'قاشق غذاخوری', type: 'افزودنی' }
    ],
    tips: 'دمکنی روی قابلمه بگذارید و با حرارت بسیار کم ۲ ساعت بپزید تا رنگ مربا یاقوتی قرمز شود.',
    instructions: [
      'به را نگینی یا خلالی خرد کنید.',
      'با شکر و آب روی حرارت ملایم با دمکنی بپزید تا سرخ و یاقوتی شود.'
    ]
  }
];
