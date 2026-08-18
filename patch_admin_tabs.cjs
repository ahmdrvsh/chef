const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldTabs = `<button onClick={() => setActiveTab('comments')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'comments' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:text-stone-100'}\`}>نظرات</button>
      </div>`;
const newTabs = `<button onClick={() => setActiveTab('comments')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'comments' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:text-stone-100'}\`}>نظرات</button>
        <button onClick={() => setActiveTab('settings')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'settings' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:text-stone-100'}\`}>تنظیمات یخچال</button>
      </div>`;
code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/pages/Admin.tsx', code);
