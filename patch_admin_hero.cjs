const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const newHeroSettings = `<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-700 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-stone-100 mb-6">تنظیمات صفحه اصلی</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-stone-200 mb-1">آدرس عکس محیاس</label>
              <input 
                type="text" 
                value={adminSettings.heroImageUrl || ''}
                onChange={e => setAdminSettings({...adminSettings, heroImageUrl: e.target.value})}
                className="w-full border border-gray-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-stone-900 text-stone-700 dark:text-stone-200"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-stone-200 mb-1">متن معرفی (من محیاس هستم...)</label>
              <input 
                type="text" 
                value={adminSettings.heroSubtitle || ''}
                onChange={e => setAdminSettings({...adminSettings, heroSubtitle: e.target.value})}
                className="w-full border border-gray-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-stone-900 text-stone-700 dark:text-stone-200"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={handleSaveSettings} className="bg-stone-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-900 transition-colors">
                ذخیره تنظیمات صفحه اصلی
              </button>
            </div>
          </div>
        </div>`;

const searchString = `{activeTab === 'settings' && (`;
code = code.replace(searchString, searchString + '\n        ' + newHeroSettings);

fs.writeFileSync('src/pages/Admin.tsx', code);
