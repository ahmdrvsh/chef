const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHomeStart = `<div className="py-20 text-center max-w-4xl mx-auto">
      <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-sm font-bold tracking-wide">
        آشپزی هوشمند، زندگی سالم‌تر
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold text-stone-800 mb-8 leading-[1.2] tracking-tight">
        با مواد داخل یخچال، <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-500">بهترین غذاها</span> را بپزید
      </h1>
      <p className="text-xl text-stone-500 mb-12 max-w-2xl mx-auto leading-relaxed">
        دیگر نگران «چی بپزم؟» نباشید. مواد موجود در یخچال خود را وارد کنید تا ما بهترین و هوشمندانه‌ترین دستورات پخت را به شما پیشنهاد دهیم.
      </p>
      <Link to="/fridge" className="bg-rose-500 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:bg-rose-600 transition-all duration-300 inline-flex items-center gap-3 hover:-translate-y-1">
        شروع کنید
        <ChefHat className="w-6 h-6" />
      </Link>`;

const newHomeStart = `<div className="flex flex-col w-full -mt-12">
      {/* Hero Section */}
      <div className="bg-rose-500 text-white py-24 md:py-32 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-4 border-white"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white blur-xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold tracking-wide backdrop-blur-sm border border-white/30">
            آشپزی هوشمند، زندگی سالم‌تر
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.2] tracking-tight">
            با مواد داخل یخچال، <br />
            <span className="text-white">بهترین غذاها</span> را بپزید
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            دیگر نگران «چی بپزم؟» نباشید. مواد موجود در یخچال خود را وارد کنید تا ما بهترین و هوشمندانه‌ترین دستورات پخت را به شما پیشنهاد دهیم.
          </p>
          <Link to="/fridge" className="bg-white text-rose-500 px-10 py-5 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:bg-stone-50 transition-all duration-300 inline-flex items-center gap-3 hover:-translate-y-1">
            شروع کنید
            <ChefHat className="w-6 h-6" />
          </Link>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 mt-16 w-full">`;

code = code.replace(oldHomeStart, newHomeStart);

const oldFeaturesStart = `{/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mt-32 text-right">`;

const newFeaturesStart = `{/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mt-20 text-right">`;

code = code.replace(oldFeaturesStart, newFeaturesStart);

const oldContainerEnd = `</div>
  );`;

const newContainerEnd = `</div>
    </div>
  );`;

code = code.replace(oldContainerEnd, newContainerEnd);

fs.writeFileSync('src/App.tsx', code);
