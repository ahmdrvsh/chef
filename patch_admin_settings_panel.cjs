const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldEnd = `      {activeTab === 'comments' && (
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-700 overflow-hidden">`;

const newPanel = `      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-stone-100 mb-6">مدیریت مواد اولیه یخچال</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 dark:text-stone-200">افزودن دسته‌بندی جدید</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="نام دسته‌بندی..."
                  className="flex-1 border border-gray-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-stone-900 text-stone-700 dark:text-stone-200"
                />
                <button onClick={addCategory} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold">افزودن</button>
              </div>
              
              <h3 className="font-bold text-gray-700 dark:text-stone-200 mt-6">دسته‌بندی‌های موجود</h3>
              <div className="space-y-2">
                {Object.keys(adminSettings.ingredients || {}).map(cat => (
                  <div 
                    key={cat} 
                    onClick={() => setSelectedAdminCategory(cat)}
                    className={\`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-colors \${selectedAdminCategory === cat ? 'bg-orange-50 border-orange-500 dark:bg-stone-700 dark:border-orange-500' : 'bg-gray-50 border-gray-200 dark:bg-stone-900 dark:border-stone-700'}\`}
                  >
                    <span className="font-bold text-gray-700 dark:text-stone-200">{cat}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat); }} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {selectedAdminCategory ? (
                <>
                  <h3 className="font-bold text-gray-700 dark:text-stone-200">مواد زیرمجموعه: {selectedAdminCategory}</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newIngredient}
                      onChange={e => setNewIngredient(e.target.value)}
                      placeholder="نام ماده غذایی..."
                      className="flex-1 border border-gray-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-stone-900 text-stone-700 dark:text-stone-200"
                    />
                    <button onClick={addIngredient} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold">افزودن</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(adminSettings.ingredients?.[selectedAdminCategory] || []).map(ing => (
                      <span key={ing} className="bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-600 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {ing}
                        <button onClick={() => deleteIngredient(selectedAdminCategory, ing)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-stone-700 rounded-xl">
                  یک دسته‌بندی برای مدیریت مواد انتخاب کنید
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 border-t pt-6 flex justify-end">
            <button onClick={handleSaveSettings} className="bg-stone-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-900 transition-colors">
              ذخیره تغییرات یخچال
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'comments' && (
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-700 overflow-hidden">`;

code = code.replace(oldEnd, newPanel);
fs.writeFileSync('src/pages/Admin.tsx', code);
