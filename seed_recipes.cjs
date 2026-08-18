const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), '.data.json');
let db = { users: [], recipes: [], comments: [], favorites: [], fridgeItems: [] };
if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

const recipesData = [
  {
    title: 'زرشک پلو با مرغ', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'مرغ', quantity: '4', unit: 'تکه' }, { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'زرشک', quantity: '1', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'زعفران دم‌کرده', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'رب گوجه فرنگی', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. مرغ را با پیاز و ادویه بپزید.\n۲. زرشک را با کمی شکر و زعفران تفت دهید.\n۳. برنج را دم کنید و هنگام سرو با زرشک تزیین کنید.',
    tags: ['مجلسی', 'پرطرفدار', 'ایرانی']
  },
  {
    title: 'خورشت قرمه سبزی', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت گوسفندی', quantity: '400', unit: 'گرم' }, { name: 'سبزی قرمه', quantity: '500', unit: 'گرم' }, { name: 'لوبیا قرمز', quantity: '1', unit: 'پیمانه' }, { name: 'لیمو عمانی', quantity: '3', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' } ],
    instructions: '۱. پیاز را خرد کرده و با گوشت تفت دهید.\n۲. لوبیا خیس‌خورده را اضافه کنید.\n۳. سبزی سرخ شده و لیمو را افزوده، بگذارید جا بیفتد.',
    tags: ['مجلسی', 'سنتی', 'ایرانی']
  },
  {
    title: 'قیمه نثار', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت گوسفندی', quantity: '300', unit: 'گرم' }, { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'خلال بادام', quantity: '1/2', unit: 'پیمانه' }, { name: 'خلال پسته', quantity: '1/2', unit: 'پیمانه' }, { name: 'زرشک', quantity: '1', unit: 'پیمانه' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. گوشت را با پیاز و رب بپزید تا غلیظ شود.\n۲. خلال‌ها و زرشک را تفت دهید.\n۳. برنج را دم کرده و با مواد روی آن را بپوشانید.',
    tags: ['مجلسی', 'قزوین', 'ایرانی']
  },
  {
    title: 'کشک بادمجان', mealTypes: ['پیش‌غذا', 'شام', 'ناهار'],
    ingredients: [ { name: 'بادمجان', quantity: '5', unit: 'عدد' }, { name: 'کشک', quantity: '1', unit: 'پیمانه' }, { name: 'پیاز داغ', quantity: '4', unit: 'قاشق غذاخوری' }, { name: 'نعنا داغ', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'سیر داغ', quantity: '1', unit: 'قاشق غذاخوری' }, { name: 'مغز گردو', quantity: '1/2', unit: 'پیمانه' } ],
    instructions: '۱. بادمجان‌ها را سرخ کرده و بکوبید.\n۲. با پیاز، سیر، نعنا داغ و کشک مخلوط کنید.\n۳. بگذارید روی حرارت کم تا جا بیفتد.',
    tags: ['سنتی', 'گیاهی', 'ایرانی']
  },
  {
    title: 'میرزاقاسمی', mealTypes: ['پیش‌غذا', 'شام', 'ناهار'],
    ingredients: [ { name: 'بادمجان', quantity: '4', unit: 'عدد' }, { name: 'گوجه فرنگی', quantity: '3', unit: 'عدد' }, { name: 'سیر', quantity: '4', unit: 'حبه' }, { name: 'تخم مرغ', quantity: '2', unit: 'عدد' }, { name: 'روغن', quantity: '4', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. بادمجان‌ها را کباب کرده و ساطوری کنید.\n۲. گوجه‌ها را رنده و با بادمجان و سیر سرخ شده مخلوط کنید.\n۳. تخم مرغ را اضافه کرده و هم بزنید تا بپزد.',
    tags: ['سنتی', 'گیلانی', 'گیاهی', 'ایرانی']
  },
  {
    title: 'ته‌چین مرغ', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'سینه مرغ', quantity: '1', unit: 'عدد' }, { name: 'ماست چکیده', quantity: '1.5', unit: 'پیمانه' }, { name: 'زرده تخم مرغ', quantity: '3', unit: 'عدد' }, { name: 'زعفران دم‌کرده', quantity: '4', unit: 'قاشق غذاخوری' }, { name: 'روغن', quantity: '1/2', unit: 'پیمانه' } ],
    instructions: '۱. مرغ را پخته و ریش‌ریش کنید.\n۲. برنج آبکش شده را با ماست، زرده تخم مرغ و زعفران مخلوط کنید.\n۳. لایه‌لایه برنج و مرغ را در قابلمه ریخته و دم کنید.',
    tags: ['مجلسی', 'سنتی', 'ایرانی']
  },
  {
    title: 'فلافل آبادان', mealTypes: ['شام', 'ناهار', 'عصرانه'],
    ingredients: [ { name: 'نخود', quantity: '2', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'سیر', quantity: '3', unit: 'حبه' }, { name: 'جعفری تازه', quantity: '1/2', unit: 'پیمانه' }, { name: 'پودر زیره', quantity: '1', unit: 'قاشق چای‌خوری' }, { name: 'روغن', quantity: 'برای سرخ کردن', unit: 'پیمانه' } ],
    instructions: '۱. نخود خیس‌خورده را چرخ کنید.\n۲. پیاز، سیر، جعفری و ادویه‌ها را اضافه کنید و خوب مخلوط کنید.\n۳. قالب زده و در روغن داغ سرخ کنید.',
    tags: ['جنوبی', 'گیاهی', 'ساندویچ', 'سریع']
  },
  {
    title: 'سمبوسه سیب‌زمینی', mealTypes: ['پیش‌غذا', 'عصرانه'],
    ingredients: [ { name: 'سیب‌زمینی', quantity: '3', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'نان لواش', quantity: '4', unit: 'عدد' }, { name: 'جعفری خرد شده', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'فلفل قرمز', quantity: '1/2', unit: 'قاشق چای‌خوری' } ],
    instructions: '۱. سیب‌زمینی‌ها را آب‌پز و پوره کنید.\n۲. با پیاز داغ، جعفری و ادویه‌ها مخلوط کنید.\n۳. در نان لواش پیچیده و سرخ کنید.',
    tags: ['جنوبی', 'گیاهی', 'سریع']
  },
  {
    title: 'ماکارونی با سویا', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'ماکارونی', quantity: '500', unit: 'گرم' }, { name: 'سویا', quantity: '1.5', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه فرنگی', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'فلفل دلمه‌ای', quantity: '1', unit: 'عدد' } ],
    instructions: '۱. سویا را خیس کرده، آبکش کنید و با پیاز تفت دهید.\n۲. رب و فلفل دلمه‌ای اضافه کنید.\n۳. ماکارونی را پخته و با سس مخلوط کرده دم کنید.',
    tags: ['گیاهی', 'پرطرفدار', 'اقتصادی']
  },
  {
    title: 'لوبیا پلو', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'گوشت چرخ‌کرده یا خورشتی', quantity: '300', unit: 'گرم' }, { name: 'لوبیا سبز', quantity: '300', unit: 'گرم' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. پیاز را تفت داده، گوشت و رب را اضافه کنید.\n۲. لوبیا سبز خرد شده را افزوده و بپزید.\n۳. سس آماده شده را لابه‌لای برنج دم کنید.',
    tags: ['سنتی', 'ایرانی', 'پرطرفدار']
  },
  {
    title: 'عدس پلو', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'عدس', quantity: '1', unit: 'پیمانه' }, { name: 'گوشت چرخ‌کرده', quantity: '200', unit: 'گرم' }, { name: 'کشمش پلویی', quantity: '1/2', unit: 'پیمانه' }, { name: 'پیاز داغ', quantity: '3', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. عدس را بپزید.\n۲. برنج را آبکش کرده و عدس را لابه‌لای آن دم کنید.\n۳. گوشت را تفت داده، کشمش را آماده کنید و هنگام سرو روی برنج بریزید.',
    tags: ['سنتی', 'اقتصادی', 'ایرانی']
  },
  {
    title: 'باقالی پلو با گوشت', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'گوشت گوسفندی یا ماهیچه', quantity: '400', unit: 'گرم' }, { name: 'باقلا سبز', quantity: '1', unit: 'پیمانه' }, { name: 'شوید تازه یا خشک', quantity: '1', unit: 'پیمانه' }, { name: 'سیر', quantity: '2', unit: 'حبه' } ],
    instructions: '۱. ماهیچه را با پیاز، سیر و ادویه بپزید.\n۲. برنج را با باقلا آبکش کرده و با شوید دم کنید.\n۳. گوشت پخته را کنار برنج سرو کنید.',
    tags: ['مجلسی', 'ایرانی']
  },
  {
    title: 'کتلت گوشت', mealTypes: ['شام', 'ناهار'],
    ingredients: [ { name: 'گوشت چرخ‌کرده', quantity: '300', unit: 'گرم' }, { name: 'سیب‌زمینی رنده شده', quantity: '2', unit: 'عدد' }, { name: 'پیاز رنده شده', quantity: '1', unit: 'عدد' }, { name: 'تخم مرغ', quantity: '1', unit: 'عدد' }, { name: 'آرد سوخاری', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. آب سیب‌زمینی و پیاز را بگیرید.\n۲. با گوشت، تخم‌مرغ و ادویه‌ها مخلوط کرده و ورز دهید.\n۳. در دست فرم داده و در روغن سرخ کنید.',
    tags: ['پرطرفدار', 'سنتی', 'سریع']
  },
  {
    title: 'آش رشته', mealTypes: ['شام', 'ناهار', 'پیش‌غذا'],
    ingredients: [ { name: 'سبزی آش', quantity: '1', unit: 'کیلوگرم' }, { name: 'نخود و لوبیا', quantity: '1', unit: 'پیمانه' }, { name: 'عدس', quantity: '1/2', unit: 'پیمانه' }, { name: 'رشته آشی', quantity: '300', unit: 'گرم' }, { name: 'کشک', quantity: '1', unit: 'پیمانه' }, { name: 'پیاز داغ و سیر داغ', quantity: 'به مقدار لازم', unit: '' } ],
    instructions: '۱. حبوبات را بپزید.\n۲. سبزی آش را اضافه کرده و بگذارید بپزد.\n۳. رشته آشی را افزوده و پس از پخت، با کشک، پیاز داغ و نعنا داغ تزیین کنید.',
    tags: ['سنتی', 'گیاهی', 'ایرانی']
  },
  {
    title: 'جوجه کباب تابه‌ای', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'سینه مرغ', quantity: '2', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'آبلیمو', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'زعفران دم‌کرده', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'روغن', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. مرغ‌ها را خرد کرده و با پیاز، آبلیمو، زعفران و ادویه مزه‌دار کنید.\n۲. در تابه‌ای با کمی روغن سرخ کنید.',
    tags: ['سریع', 'ایرانی']
  },
  {
    title: 'خورشت بادمجان', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت خورشتی', quantity: '300', unit: 'گرم' }, { name: 'بادمجان', quantity: '4', unit: 'عدد' }, { name: 'گوجه فرنگی', quantity: '3', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'غوره', quantity: '1/2', unit: 'پیمانه' } ],
    instructions: '۱. گوشت را با پیاز و رب بپزید.\n۲. بادمجان‌ها را سرخ کنید.\n۳. در نیم ساعت آخر پخت، بادمجان، گوجه و غوره را اضافه کنید.',
    tags: ['سنتی', 'ایرانی']
  },
  {
    title: 'کلم پلو شیرازی', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'کلم قمری یا برگ', quantity: '500', unit: 'گرم' }, { name: 'گوشت چرخ‌کرده (کوفته قلقلی)', quantity: '300', unit: 'گرم' }, { name: 'سبزی کلم پلو', quantity: '200', unit: 'گرم' }, { name: 'آبغوره', quantity: '3', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. کلم را خرد کرده و با کمی آبغوره تفت دهید.\n۲. کوفته قلقلی‌ها را سرخ کنید.\n۳. برنج را با سبزی، کلم و کوفته‌ها دم کنید.',
    tags: ['سنتی', 'شیرازی', 'ایرانی']
  },
  {
    title: 'کوکو سبزی', mealTypes: ['شام', 'پیش‌غذا'],
    ingredients: [ { name: 'سبزی کوکو', quantity: '500', unit: 'گرم' }, { name: 'تخم مرغ', quantity: '4', unit: 'عدد' }, { name: 'زرشک', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'گردو خرد شده', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'آرد', quantity: '1', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. سبزی، تخم‌مرغ، زرشک، گردو و آرد را با هم مخلوط کنید.\n۲. مایه را در تابه با روغن داغ بریزید و دو طرف آن را سرخ کنید.',
    tags: ['گیاهی', 'سریع', 'سنتی']
  },
  {
    title: 'کوکو سیب‌زمینی', mealTypes: ['شام', 'پیش‌غذا'],
    ingredients: [ { name: 'سیب‌زمینی', quantity: '4', unit: 'عدد' }, { name: 'تخم مرغ', quantity: '3', unit: 'عدد' }, { name: 'پیاز رنده شده', quantity: '1', unit: 'عدد' }, { name: 'نمک و زردچوبه', quantity: '1', unit: 'قاشق چای‌خوری' } ],
    instructions: '۱. سیب‌زمینی‌ها را آب‌پز و پوره کنید.\n۲. با پیاز، تخم‌مرغ و ادویه مخلوط کنید.\n۳. در روغن داغ سرخ کنید.',
    tags: ['گیاهی', 'سریع', 'اقتصادی']
  },
  {
    title: 'حلیم گندم', mealTypes: ['صبحانه', 'افطار'],
    ingredients: [ { name: 'گندم پوست کنده', quantity: '2', unit: 'پیمانه' }, { name: 'گوشت گوسفندی یا بوقلمون', quantity: '300', unit: 'گرم' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'کره', quantity: '50', unit: 'گرم' }, { name: 'دارچین', quantity: '1', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. گندم خیس خورده را بپزید تا کاملاً له شود.\n۲. گوشت را با پیاز پخته و ریش‌ریش کنید.\n۳. گندم و گوشت را مخلوط کرده و با همزن بکوبید تا کش‌دار شود.',
    tags: ['سنتی', 'مقوی', 'ایرانی']
  },
  {
    title: 'شله زرد', mealTypes: ['دسر', 'پیش‌غذا'],
    ingredients: [ { name: 'برنج نیم‌دانه', quantity: '1', unit: 'پیمانه' }, { name: 'شکر', quantity: '2', unit: 'پیمانه' }, { name: 'زعفران دم‌کرده', quantity: '1/2', unit: 'پیمانه' }, { name: 'گلاب', quantity: '1/2', unit: 'پیمانه' }, { name: 'کره', quantity: '30', unit: 'گرم' }, { name: 'خلال بادام', quantity: '50', unit: 'گرم' } ],
    instructions: '۱. برنج را با آب بپزید تا کاملاً شکفته شود.\n۲. شکر را اضافه کرده و هم بزنید.\n۳. زعفران، گلاب و کره را افزوده و پس از قوام آمدن سرو کنید.',
    tags: ['سنتی', 'دسر', 'ایرانی']
  },
  {
    title: 'فرنی', mealTypes: ['دسر', 'صبحانه'],
    ingredients: [ { name: 'آرد برنج', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'شیر', quantity: '2', unit: 'پیمانه' }, { name: 'شکر', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'گلاب', quantity: '1', unit: 'قاشق غذاخوری' }, { name: 'هل', quantity: '1/4', unit: 'قاشق چای‌خوری' } ],
    instructions: '۱. آرد برنج را در شیر سرد حل کنید.\n۲. روی حرارت ملایم مدام هم بزنید تا غلیظ شود.\n۳. شکر، گلاب و هل را اضافه کنید.',
    tags: ['دسر', 'سریع', 'سنتی']
  },
  {
    title: 'سوپ جو', mealTypes: ['پیش‌غذا', 'شام'],
    ingredients: [ { name: 'جو پرک', quantity: '1', unit: 'پیمانه' }, { name: 'هویج', quantity: '2', unit: 'عدد' }, { name: 'سینه مرغ', quantity: '1/2', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'جعفری خرد شده', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. مرغ را پخته و ریش‌ریش کنید.\n۲. جو پرک، هویج رنده شده و مرغ را با آب مرغ بپزید.\n۳. در آخر رب تفت داده شده و جعفری را اضافه کنید.',
    tags: ['سالم', 'رژیمی', 'پیش‌غذا']
  },
  {
    title: 'سوپ شیر و قارچ', mealTypes: ['پیش‌غذا', 'شام'],
    ingredients: [ { name: 'جو پرک', quantity: '1', unit: 'پیمانه' }, { name: 'قارچ', quantity: '200', unit: 'گرم' }, { name: 'شیر', quantity: '2', unit: 'لیتر' }, { name: 'خامه', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'عصاره مرغ', quantity: '1', unit: 'عدد' } ],
    instructions: '۱. جو پرک را با عصاره مرغ بپزید.\n۲. شیر گرم و قارچ تفت داده شده را اضافه کنید.\n۳. پس از غلیظ شدن، از روی حرارت برداشته و خامه را اضافه کنید.',
    tags: ['مجلسی', 'پیش‌غذا']
  },
  {
    title: 'خوراک لوبیا چیتی', mealTypes: ['شام', 'صبحانه'],
    ingredients: [ { name: 'لوبیا چیتی', quantity: '2', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'سیب‌زمینی', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'روغن زیتون', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. لوبیا چیتی را از شب قبل خیس کرده و بپزید.\n۲. پیاز را تفت داده، رب و سیب‌زمینی خرد شده را اضافه کنید.\n۳. همه را با لوبیا مخلوط کرده تا جا بیفتد.',
    tags: ['گیاهی', 'سالم', 'اقتصادی']
  },
  {
    title: 'خوراک عدسی', mealTypes: ['شام', 'صبحانه'],
    ingredients: [ { name: 'عدس', quantity: '2', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'سیب‌زمینی', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '1', unit: 'قاشق غذاخوری' }, { name: 'روغن زیتون', quantity: '1', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. عدس خیس‌خورده را بپزید.\n۲. پیاز داغ درست کرده و به همراه سیب‌زمینی نگینی و رب به عدس اضافه کنید.\n۳. بگذارید غلیظ شود.',
    tags: ['گیاهی', 'سالم', 'اقتصادی']
  },
  {
    title: 'کباب تابه‌ای', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت چرخ‌کرده', quantity: '300', unit: 'گرم' }, { name: 'پیاز رنده شده', quantity: '1', unit: 'عدد' }, { name: 'گوجه فرنگی', quantity: '3', unit: 'عدد' }, { name: 'نمک و فلفل', quantity: '1', unit: 'قاشق چای‌خوری' } ],
    instructions: '۱. آب پیاز را بگیرید و با گوشت و ادویه ورز دهید.\n۲. گوشت را در تابه پهن کنید و روی حرارت بگذارید.\n۳. پس از تغییر رنگ، برش زده و گوجه‌های حلقه‌ای را اضافه کنید تا بپزد.',
    tags: ['سریع', 'سنتی']
  },
  {
    title: 'دلمه برگ مو', mealTypes: ['پیش‌غذا', 'ناهار'],
    ingredients: [ { name: 'برگ مو', quantity: '30', unit: 'عدد' }, { name: 'گوشت چرخ‌کرده', quantity: '200', unit: 'گرم' }, { name: 'برنج', quantity: '1', unit: 'پیمانه' }, { name: 'لپه', quantity: '1/2', unit: 'پیمانه' }, { name: 'سبزی دلمه', quantity: '300', unit: 'گرم' }, { name: 'رب انار', quantity: '3', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. برنج و لپه را نیم‌پز کنید.\n۲. پیاز، گوشت و سبزی را تفت داده و با برنج و لپه مخلوط کنید.\n۳. از مواد داخل برگ‌ها پیچیده و در قابلمه بچینید. با چاشنی رب انار بپزید.',
    tags: ['مجلسی', 'سنتی', 'زمان‌بر']
  },
  {
    title: 'آبگوشت (دیزی)', mealTypes: ['ناهار'],
    ingredients: [ { name: 'گوشت گوسفندی با استخوان و چربی', quantity: '400', unit: 'گرم' }, { name: 'نخود و لوبیا سفید', quantity: '1', unit: 'پیمانه' }, { name: 'سیب‌زمینی', quantity: '2', unit: 'عدد' }, { name: 'گوجه فرنگی', quantity: '3', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. گوشت، حبوبات خیس‌خورده، پیاز و گوجه را بپزید.\n۲. در اواسط پخت، سیب‌زمینی‌ها را اضافه کنید.\n۳. چربی را کوبیده و با رب به قابلمه برگردانید.',
    tags: ['سنتی', 'ایرانی', 'مقوی']
  },
  {
    title: 'کشک کدو', mealTypes: ['پیش‌غذا', 'شام'],
    ingredients: [ { name: 'کدو سبز', quantity: '5', unit: 'عدد' }, { name: 'کشک', quantity: '1', unit: 'پیمانه' }, { name: 'پیاز داغ', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'سیر داغ و نعنا داغ', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'گوجه فرنگی', quantity: '2', unit: 'عدد' } ],
    instructions: '۱. کدوها را خرد و سرخ کنید.\n۲. گوجه خرد شده را افزوده و بپزید تا نرم شود.\n۳. با پیاز، سیر، نعنا داغ و کشک مخلوط کنید.',
    tags: ['گیاهی', 'کرمانی', 'سنتی']
  },
  {
    title: 'خورشت قیمه بادمجان', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت گوسفندی', quantity: '300', unit: 'گرم' }, { name: 'لپه', quantity: '1', unit: 'پیمانه' }, { name: 'بادمجان', quantity: '3', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'لیمو عمانی', quantity: '2', unit: 'عدد' } ],
    instructions: '۱. گوشت را با پیاز و رب بپزید.\n۲. لپه خیس‌خورده و لیمو عمانی را اضافه کنید.\n۳. بادمجان‌های سرخ شده را در نیم ساعت آخر به خورشت اضافه کنید.',
    tags: ['سنتی', 'ایرانی']
  },
  {
    title: 'دمپختک', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'باقلا زرد خشک', quantity: '1', unit: 'پیمانه' }, { name: 'پیاز', quantity: '2', unit: 'عدد' }, { name: 'زردچوبه', quantity: '1', unit: 'قاشق غذاخوری' }, { name: 'کره یا روغن حیوانی', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. باقلا را خیس کرده و بپزید.\n۲. پیاز داغ فراوان درست کرده و با زردچوبه تفت دهید.\n۳. برنج، باقلا و پیاز داغ را مخلوط و کته کنید.',
    tags: ['گیاهی', 'سنتی', 'سریع']
  },
  {
    title: 'خورشت فسنجان', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'مغز گردو آسیاب شده', quantity: '300', unit: 'گرم' }, { name: 'مرغ یا گوشت قلقلی', quantity: '400', unit: 'گرم' }, { name: 'رب انار', quantity: '1', unit: 'پیمانه' }, { name: 'شکر (اختیاری)', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'پیاز', quantity: '1', unit: 'عدد' } ],
    instructions: '۱. گردو را با پیاز رنده شده تفت دهید و آب سرد اضافه کنید تا به روغن بیفتد.\n۲. مرغ تفت داده شده و رب انار را اضافه کنید.\n۳. بگذارید روی حرارت ملایم چند ساعت جا بیفتد.',
    tags: ['مجلسی', 'سنتی', 'ایرانی']
  },
  {
    title: 'ته‌چین گوشت و بادمجان', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'گوشت پخته ریش‌ریش', quantity: '300', unit: 'گرم' }, { name: 'بادمجان سرخ شده', quantity: '2', unit: 'عدد' }, { name: 'ماست چکیده', quantity: '1.5', unit: 'پیمانه' }, { name: 'زرده تخم مرغ', quantity: '2', unit: 'عدد' }, { name: 'زعفران دم‌کرده', quantity: '3', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. مایه ته‌چین (ماست، زرده، زعفران و برنج) را آماده کنید.\n۲. در قابلمه لایه‌لایه برنج زعفرانی، بادمجان و گوشت بریزید.\n۳. روی حرارت ملایم دم کنید.',
    tags: ['مجلسی', 'ایرانی']
  },
  {
    title: 'تاس کباب', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت خورشتی', quantity: '300', unit: 'گرم' }, { name: 'سیب‌زمینی', quantity: '2', unit: 'عدد' }, { name: 'پیاز', quantity: '2', unit: 'عدد' }, { name: 'هویج', quantity: '2', unit: 'عدد' }, { name: 'به', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه و آلو', quantity: 'کمی', unit: '' } ],
    instructions: '۱. مواد را به صورت حلقه‌ای خرد کنید.\n۲. لایه‌لایه گوشت، پیاز، هویج، به و سیب‌زمینی را بچینید.\n۳. سس رب و آلو را روی آن ریخته و با حرارت ملایم بپزید.',
    tags: ['سنتی', 'سالم']
  },
  {
    title: 'خورشت کرفس', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت گوسفندی', quantity: '300', unit: 'گرم' }, { name: 'کرفس خرد شده', quantity: '400', unit: 'گرم' }, { name: 'نعنا و جعفری', quantity: '200', unit: 'گرم' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'آبغوره', quantity: '3', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. گوشت را با پیاز تفت داده و بپزید.\n۲. کرفس و سبزی را سرخ کرده و به گوشت نیم‌پز اضافه کنید.\n۳. با آبغوره طعم‌دار کنید و بگذارید جا بیفتد.',
    tags: ['سنتی', 'ایرانی']
  },
  {
    title: 'نخودآب', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'نخود', quantity: '2', unit: 'پیمانه' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'گوشت گوسفندی (اختیاری)', quantity: '200', unit: 'گرم' }, { name: 'زیره و زردچوبه', quantity: '1', unit: 'قاشق مرباخوری' } ],
    instructions: '۱. نخود را از قبل خیس کنید.\n۲. پیاز، گوشت و نخود را با ادویه‌ها بپزید تا کاملاً نرم شوند.\n۳. مقوی و مناسب روزهای سرد.',
    tags: ['مقوی', 'سنتی']
  },
  {
    title: 'رشته پلو', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'رشته پلویی', quantity: '1.5', unit: 'پیمانه' }, { name: 'کشمش و خرما', quantity: '1', unit: 'پیمانه' }, { name: 'گوشت قلقلی یا مرغ', quantity: '200', unit: 'گرم' } ],
    instructions: '۱. برنج را آبکش کنید و در ۵ دقیقه آخر رشته را اضافه کنید.\n۲. گوشت‌ها را سرخ کنید و کشمش و خرما را تفت دهید.\n۳. برنج و رشته را دم کرده و با مواد روی آن تزیین کنید.',
    tags: ['مجلسی', 'سنتی']
  },
  {
    title: 'مرغ ترش', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'مرغ', quantity: '4', unit: 'تکه' }, { name: 'سبزی معطر (چوچاق یا گشنیز و نعنا)', quantity: '200', unit: 'گرم' }, { name: 'گردو چرخ شده', quantity: '100', unit: 'گرم' }, { name: 'رب انار', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'سیر', quantity: '3', unit: 'حبه' } ],
    instructions: '۱. مرغ‌ها را سرخ کنید.\n۲. سبزی، سیر و گردو را تفت داده، رب انار و آب را اضافه کنید.\n۳. مرغ‌ها را درون سس قرار دهید تا بپزد و جا بیفتد.',
    tags: ['شمالی', 'سنتی', 'مجلسی']
  },
  {
    title: 'شیر برنج', mealTypes: ['دسر', 'صبحانه', 'شام'],
    ingredients: [ { name: 'برنج نیم‌دانه', quantity: '1', unit: 'پیمانه' }, { name: 'شیر', quantity: '4', unit: 'پیمانه' }, { name: 'خامه (اختیاری)', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'شیره انگور یا مربا', quantity: 'برای سرو', unit: '' } ],
    instructions: '۱. برنج را با کمی آب بپزید تا له شود.\n۲. شیر را اضافه کرده و بگذارید غلیظ شود.\n۳. با خامه مخلوط کرده و با مربا یا شیره سرو کنید.',
    tags: ['دسر', 'سنتی', 'گیاهی']
  },
  {
    title: 'ماهی شکم‌پر', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'ماهی سفید یا قزل‌آلا', quantity: '1', unit: 'عدد' }, { name: 'گردو خرد شده', quantity: '1/2', unit: 'پیمانه' }, { name: 'سبزی معطر (گشنیز، شنبلیله)', quantity: '1/2', unit: 'پیمانه' }, { name: 'رب انار', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'سیر و پیاز', quantity: '1', unit: 'عدد' } ],
    instructions: '۱. سبزی، گردو، سیر، پیاز و رب انار را تفت دهید.\n۲. شکم ماهی را با مواد پر کرده و بدوزید.\n۳. در فر یا تابه با حرارت ملایم بپزید.',
    tags: ['دریایی', 'مجلسی', 'شمالی']
  },
  {
    title: 'کلم پلو تهرانی', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'کلم برگ خرد شده', quantity: '500', unit: 'گرم' }, { name: 'گوشت چرخ‌کرده', quantity: '250', unit: 'گرم' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'ادویه پلویی', quantity: '1', unit: 'قاشق مرباخوری' } ],
    instructions: '۱. کلم را با پیاز و رب تفت دهید تا نرم شود.\n۲. گوشت چرخ‌کرده را با پیاز سرخ کرده و با کلم مخلوط کنید.\n۳. مایه را لابه‌لای برنج آبکش دم کنید.',
    tags: ['سنتی', 'ایرانی']
  },
  {
    title: 'کوفته تبریزی', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت چرخ‌کرده (مخلوط)', quantity: '500', unit: 'گرم' }, { name: 'لپه پخته', quantity: '1', unit: 'پیمانه' }, { name: 'برنج نیم‌پز', quantity: '1', unit: 'پیمانه' }, { name: 'سبزی کوفته', quantity: '200', unit: 'گرم' }, { name: 'تخم مرغ', quantity: '1', unit: 'عدد' }, { name: 'مواد میانی (آلو، گردو، پیاز داغ)', quantity: 'به مقدار لازم', unit: '' } ],
    instructions: '۱. گوشت، لپه و برنج را خوب بکوبید و با سبزی و تخم‌مرغ ورز دهید.\n۲. گلوله‌های بزرگ درست کرده و مواد میانی را درون آن قرار دهید.\n۳. سس رب و پیاز آماده کرده و کوفته‌ها را در آن بپزید.',
    tags: ['تبریزی', 'مجلسی', 'زمان‌بر']
  },
  {
    title: 'دوپیازه آلو', mealTypes: ['شام', 'پیش‌غذا'],
    ingredients: [ { name: 'سیب‌زمینی', quantity: '4', unit: 'عدد' }, { name: 'پیاز', quantity: '2', unit: 'عدد' }, { name: 'رب گوجه فرنگی', quantity: '1', unit: 'قاشق غذاخوری' }, { name: 'نمک، فلفل، زردچوبه', quantity: '1', unit: 'قاشق چای‌خوری' } ],
    instructions: '۱. سیب‌زمینی‌ها را آب‌پز و مکعبی خرد کنید.\n۲. پیاز فراوان سرخ کنید، زردچوبه و رب بزنید.\n۳. سیب‌زمینی‌ها را اضافه کرده و تفت دهید.',
    tags: ['شیرازی', 'گیاهی', 'سریع']
  },
  {
    title: 'ماش پلو', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'برنج', quantity: '3', unit: 'پیمانه' }, { name: 'ماش', quantity: '1', unit: 'پیمانه' }, { name: 'گوشت چرخ‌کرده (اختیاری)', quantity: '200', unit: 'گرم' }, { name: 'شوید (اختیاری)', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. ماش را بپزید.\n۲. برنج را آبکش کرده و ماش را لابه‌لای آن دم کنید.\n۳. با گوشت تفت داده شده سرو کنید.',
    tags: ['سنتی', 'گیاهی']
  },
  {
    title: 'کاله جوش (کله جوش)', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'کشک', quantity: '2', unit: 'پیمانه' }, { name: 'گردو خرد شده', quantity: '1/2', unit: 'پیمانه' }, { name: 'پیاز داغ', quantity: '3', unit: 'قاشق غذاخوری' }, { name: 'نعنا داغ', quantity: '1', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. پیاز داغ و گردو را تفت دهید.\n۲. نعنا داغ و کشک رقیق شده با آب را اضافه کنید.\n۳. پیش از جوش آمدن کامل از روی حرارت بردارید. با نان خشک سرو کنید.',
    tags: ['سنتی', 'سریع', 'گیاهی']
  },
  {
    title: 'خورشت بامیه', mealTypes: ['ناهار', 'شام'],
    ingredients: [ { name: 'گوشت خورشتی', quantity: '300', unit: 'گرم' }, { name: 'بامیه', quantity: '300', unit: 'گرم' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'رب گوجه', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'سیر', quantity: '2', unit: 'حبه' }, { name: 'آبلیمو یا تمبر هندی', quantity: '2', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. گوشت را با پیاز و رب بپزید.\n۲. بامیه‌ها را کمی در روغن تفت دهید.\n۳. در ۲۰ دقیقه آخر پخت، بامیه و چاشنی را اضافه کنید.',
    tags: ['جنوبی', 'ایرانی']
  },
  {
    title: 'اشکنه', mealTypes: ['شام', 'ناهار'],
    ingredients: [ { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'شنبلیله خشک', quantity: '1', unit: 'قاشق غذاخوری' }, { name: 'سیب‌زمینی (اختیاری)', quantity: '1', unit: 'عدد' }, { name: 'تخم مرغ', quantity: '2', unit: 'عدد' }, { name: 'آرد', quantity: '1', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. پیاز را سرخ کرده و آرد و شنبلیله را تفت دهید.\n۲. آب بریزید تا به جوش بیاید (سیب‌زمینی نگینی را بپزید).\n۳. تخم‌مرغ‌ها را در قابلمه بشکنید و هم بزنید تا بپزد.',
    tags: ['سنتی', 'سریع', 'اقتصادی']
  },
  {
    title: 'نرگسی اسفناج', mealTypes: ['صبحانه', 'شام'],
    ingredients: [ { name: 'اسفناج تازه', quantity: '300', unit: 'گرم' }, { name: 'پیاز داغ', quantity: '2', unit: 'قاشق غذاخوری' }, { name: 'سیر', quantity: '2', unit: 'حبه' }, { name: 'تخم مرغ', quantity: '2', unit: 'عدد' } ],
    instructions: '۱. اسفناج را بخارپز کنید.\n۲. با پیاز داغ و سیر تفت دهید.\n۳. تخم مرغ‌ها را روی آن بشکنید و بگذارید سفت شود.',
    tags: ['سالم', 'گیاهی', 'سریع']
  },
  {
    title: 'یتیمچه', mealTypes: ['شام', 'ناهار'],
    ingredients: [ { name: 'بادمجان', quantity: '4', unit: 'عدد' }, { name: 'گوجه فرنگی', quantity: '3', unit: 'عدد' }, { name: 'پیاز', quantity: '1', unit: 'عدد' }, { name: 'روغن', quantity: '3', unit: 'قاشق غذاخوری' } ],
    instructions: '۱. همه سبزیجات را نگینی یا حلقه‌ای خرد کنید.\n۲. لایه‌لایه در قابلمه بچینید و روی حرارت ملایم قرار دهید تا با آب خودشان بپزند.',
    tags: ['گیاهی', 'سریع', 'اقتصادی']
  }
];

let baseId = Date.now();
for (const [index, r] of recipesData.entries()) {
  const newRecipe = {
    id: (baseId + index).toString(),
    title: r.title,
    mealTypes: r.mealTypes,
    ingredients: r.ingredients.map((i, iIdx) => ({ id: `${baseId+index}-${iIdx}`, name: i.name, quantity: i.quantity, unit: i.unit })),
    instructions: r.instructions,
    prepTime: Math.floor(Math.random() * 30) + 10,
    cookTime: Math.floor(Math.random() * 60) + 15,
    calories: Math.floor(Math.random() * 500) + 200,
    difficulty: Math.random() > 0.6 ? 'متوسط' : 'آسان',
    tags: r.tags || [],
    imageUrl: `https://picsum.photos/seed/${baseId+index}/800/600`, // random placeholder image
    imageUrls: [],
    videoUrl: '',
    views: Math.floor(Math.random() * 500),
    published: true,
    createdAt: new Date().toISOString()
  };
  db.recipes.push(newRecipe);
}

// Ensure unique recipes by title (in case run multiple times)
const uniqueRecipes = [];
const seenTitles = new Set();
for (const r of db.recipes) {
  if (!seenTitles.has(r.title)) {
    seenTitles.add(r.title);
    uniqueRecipes.push(r);
  }
}
db.recipes = uniqueRecipes;

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log(`Successfully injected recipes. Total recipes: ${db.recipes.length}`);
