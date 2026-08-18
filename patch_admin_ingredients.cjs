const fs = require('fs');
let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const stateOld = `  const [adminSettings, setAdminSettings] = useState({ heroImageUrl: '' });`;
const stateNew = `  const [adminSettings, setAdminSettings] = useState<{ heroImageUrl: string; ingredients?: Record<string, string[]> }>({ heroImageUrl: '' });
  const [newCategory, setNewCategory] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [selectedAdminCategory, setSelectedAdminCategory] = useState('');`;
admin = admin.replace(stateOld, stateNew);

const fetchSettingsOld = `    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data) setAdminSettings(data);
    });`;
const fetchSettingsNew = `    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data) {
        setAdminSettings(data);
        if (data.ingredients && Object.keys(data.ingredients).length > 0) {
          setSelectedAdminCategory(Object.keys(data.ingredients)[0]);
        }
      }
    });`;
admin = admin.replace(fetchSettingsOld, fetchSettingsNew);

const handleIngredientFns = `
  const addCategory = () => {
    if (!newCategory.trim()) return;
    setAdminSettings(prev => ({
      ...prev,
      ingredients: {
        ...(prev.ingredients || {}),
        [newCategory]: []
      }
    }));
    setSelectedAdminCategory(newCategory);
    setNewCategory('');
  };

  const deleteCategory = (cat: string) => {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;
    setAdminSettings(prev => {
      const copy = { ...prev.ingredients };
      delete copy[cat];
      return { ...prev, ingredients: copy };
    });
    if (selectedAdminCategory === cat) setSelectedAdminCategory('');
  };

  const addIngredient = () => {
    if (!newIngredient.trim() || !selectedAdminCategory) return;
    setAdminSettings(prev => {
      const copy = { ...prev.ingredients };
      if (!copy[selectedAdminCategory]) copy[selectedAdminCategory] = [];
      if (!copy[selectedAdminCategory].includes(newIngredient)) {
        copy[selectedAdminCategory] = [...copy[selectedAdminCategory], newIngredient];
      }
      return { ...prev, ingredients: copy };
    });
    setNewIngredient('');
  };

  const deleteIngredient = (cat: string, ing: string) => {
    setAdminSettings(prev => {
      const copy = { ...prev.ingredients };
      if (copy[cat]) {
        copy[cat] = copy[cat].filter(i => i !== ing);
      }
      return { ...prev, ingredients: copy };
    });
  };
`;

admin = admin.replace(`  const handleSaveSettings = async () => {`, handleIngredientFns + `\n  const handleSaveSettings = async () => {`);

const settingsRenderOld = `                <button onClick={handleSaveSettings} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  ذخیره تنظیمات
                </button>
              </div>
            </div>
          )}`;

const settingsRenderNew = `                <button onClick={handleSaveSettings} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  ذخیره عکس محیاس
                </button>
              </div>

              <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-100 dark:border-stone-700 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-stone-800 dark:text-white">مدیریت مواد اولیه در یخچال</h3>
                  <button onClick={handleSaveSettings} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    ذخیره تغییرات مواد
                  </button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 border-l border-stone-100 dark:border-stone-700 pl-6">
                    <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-4">دسته‌بندی‌ها</h4>
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="دسته‌بندی جدید"
                        className="flex-1 border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-orange-500"
                      />
                      <button onClick={addCategory} className="bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800 p-1.5 rounded-lg hover:bg-stone-700 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {adminSettings.ingredients && Object.keys(adminSettings.ingredients).map(cat => (
                        <div key={cat} className={\`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors \${selectedAdminCategory === cat ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold' : 'hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'}\`} onClick={() => setSelectedAdminCategory(cat)}>
                          <span className="text-sm">{cat}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat); }} className="text-stone-400 hover:text-rose-500 transition-colors p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-4">مواد زیرمجموعه {selectedAdminCategory ? \`(\${selectedAdminCategory})\` : ''}</h4>
                    {selectedAdminCategory ? (
                      <>
                        <div className="flex gap-2 mb-4 max-w-sm">
                          <input 
                            type="text"
                            value={newIngredient}
                            onChange={e => setNewIngredient(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addIngredient()}
                            placeholder="ماده جدید (اینتر بزنید)"
                            className="flex-1 border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-orange-500"
                          />
                          <button onClick={addIngredient} className="bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800 px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors text-sm font-bold">
                            افزودن
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(adminSettings.ingredients?.[selectedAdminCategory] || []).map(ing => (
                            <div key={ing} className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 rounded-full">
                              <span className="text-sm text-stone-700 dark:text-stone-300">{ing}</span>
                              <button onClick={() => deleteIngredient(selectedAdminCategory, ing)} className="text-stone-400 hover:text-rose-500 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {(adminSettings.ingredients?.[selectedAdminCategory] || []).length === 0 && (
                            <div className="text-sm text-stone-500 dark:text-stone-400">موردی یافت نشد.</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-stone-500 dark:text-stone-400 py-4">ابتدا یک دسته‌بندی انتخاب کنید.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}`;
admin = admin.replace(settingsRenderOld, settingsRenderNew);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('patched admin');
