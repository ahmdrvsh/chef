const fs = require('fs');
let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const iconsOld = `import { Users, BookOpen, MessageSquare, Trash2, Edit, Plus, Image as ImageIcon, Check, X } from 'lucide-react';`;
const iconsNew = `import { Users, BookOpen, MessageSquare, Trash2, Edit, Plus, Image as ImageIcon, Check, X, Settings } from 'lucide-react';`;
admin = admin.replace(iconsOld, iconsNew);

const stateOld = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'recipes' | 'users' | 'comments'>('dashboard');`;
const stateNew = `  const [activeTab, setActiveTab] = useState<'dashboard' | 'recipes' | 'users' | 'comments' | 'settings'>('dashboard');
  const [adminSettings, setAdminSettings] = useState({ heroImageUrl: '' });`;
admin = admin.replace(stateOld, stateNew);

const fetchOld = `  const fetchAllData = () => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/stats', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setStats(data));
    
    fetch('/api/recipes').then(res => res.json()).then(data => setAllRecipes(data));
    
    fetch('/api/admin/users', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setAllUsers(data));
      
    fetch('/api/admin/comments', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setAllComments(data));
  };`;
const fetchNew = `  const fetchAllData = () => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/stats', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setStats(data));
    
    fetch('/api/recipes').then(res => res.json()).then(data => setAllRecipes(data));
    
    fetch('/api/admin/users', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setAllUsers(data));
      
    fetch('/api/admin/comments', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setAllComments(data));
      
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data) setAdminSettings(data);
    });
  };`;
admin = admin.replace(fetchOld, fetchNew);

const saveSettingsNew = `
  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminSettings)
      });
      alert('تنظیمات ذخیره شد');
    } catch(e) {
      console.error(e);
    }
  };
`;
admin = admin.replace(`  const submitReply = async (id: string) => {`, saveSettingsNew + `\n  const submitReply = async (id: string) => {`);

const tabsOld = `          <button onClick={() => setActiveTab('comments')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold \${activeTab === 'comments' ? 'bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}\`}>
            <MessageSquare className="w-5 h-5" />
            نظرات
          </button>`;
const tabsNew = `          <button onClick={() => setActiveTab('comments')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold \${activeTab === 'comments' ? 'bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}\`}>
            <MessageSquare className="w-5 h-5" />
            نظرات
          </button>
          <button onClick={() => setActiveTab('settings')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold \${activeTab === 'settings' ? 'bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}\`}>
            <Settings className="w-5 h-5" />
            تنظیمات سایت
          </button>`;
admin = admin.replace(tabsOld, tabsNew);

const renderSettingsOld = `        </div>
      </div>
    </div>
  );
}`;

const renderSettingsNew = `
          {activeTab === 'settings' && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-stone-100 dark:border-stone-700 pb-4">
                <h2 className="text-xl font-bold text-stone-800 dark:text-white">تنظیمات سایت</h2>
              </div>
              
              <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-100 dark:border-stone-700 shadow-sm max-w-2xl">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">لینک عکس محیاس (صفحه اول)</label>
                  <input 
                    type="text"
                    value={adminSettings.heroImageUrl}
                    onChange={e => setAdminSettings({...adminSettings, heroImageUrl: e.target.value})}
                    className="w-full border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-orange-500 text-left" dir="ltr"
                    placeholder="https://..."
                  />
                  {adminSettings.heroImageUrl && (
                    <div className="mt-4 w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 dark:border-stone-700">
                      <img src={adminSettings.heroImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                <button onClick={handleSaveSettings} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  ذخیره تنظیمات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
admin = admin.replace(renderSettingsOld, renderSettingsNew);

fs.writeFileSync('src/pages/Admin.tsx', admin);
