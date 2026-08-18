const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const startStr = "{/* آمار کلی */}";
const endStr = "{/* فرم افزودن غذا (مودال) */}";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end markers");
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

const uiNew = `{/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('dashboard')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'dashboard' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-800'}\`}>داشبورد</button>
        <button onClick={() => setActiveTab('recipes')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'recipes' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-800'}\`}>دستورات غذایی</button>
        <button onClick={() => setActiveTab('users')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'users' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-800'}\`}>کاربران</button>
        <button onClick={() => setActiveTab('comments')} className={\`pb-2 px-1 font-medium text-sm transition-colors \${activeTab === 'comments' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-800'}\`}>نظرات</button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div onClick={() => setActiveTab('users')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center ml-4">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">کل کاربران</p>
                <p className="text-2xl font-bold">{stats.usersCount}</p>
              </div>
            </div>
            <div onClick={() => setActiveTab('recipes')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center ml-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">دستورات غذایی</p>
                <p className="text-2xl font-bold">{stats.recipesCount}</p>
              </div>
            </div>
            <div onClick={() => setActiveTab('comments')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center ml-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">نظرات ثبت شده</p>
                <p className="text-2xl font-bold">{stats.commentsCount}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'recipes' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold mb-4 text-gray-800">لیست دستورات غذایی</h2>
           <div className="overflow-x-auto min-h-[400px]">
             <table className="w-full text-right">
               <thead>
                 <tr className="border-b border-gray-100 text-sm text-gray-500">
                   <th className="py-3 font-medium">عنوان غذا</th>
                   <th className="py-3 font-medium">نوع وعده</th>
                   <th className="py-3 font-medium">سختی</th>
                   <th className="py-3 font-medium">بازدید</th>
                   <th className="py-3 font-medium">عملیات</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {allRecipes.slice((recipePage-1)*RECIPES_PER_PAGE, recipePage*RECIPES_PER_PAGE).map((r: any) => (
                   <tr key={r.id} className="text-sm text-gray-700">
                     <td className="py-4 font-bold">{r.title}</td>
                     <td className="py-4">{r.mealTypes.join('، ')}</td>
                     <td className="py-4">
                       <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{r.difficulty}</span>
                     </td>
                     <td className="py-4 text-orange-600 font-bold">{r.views || 0}</td>
                     <td className="py-4">
                       <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline text-xs ml-3">ویرایش</button>
                       <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-xs">حذف</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {allRecipes.length === 0 && <p className="text-center text-gray-400 py-10">هیچ دستور غذایی یافت نشد.</p>}
           </div>
           
           {/* Pagination */}
           {allRecipes.length > RECIPES_PER_PAGE && (
             <div className="flex justify-center items-center gap-4 mt-6">
               <button 
                 disabled={recipePage === 1} 
                 onClick={() => setRecipePage(p => p - 1)}
                 className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
               <span className="text-sm font-bold text-gray-600">
                 صفحه {recipePage} از {Math.ceil(allRecipes.length / RECIPES_PER_PAGE)}
               </span>
               <button 
                 disabled={recipePage === Math.ceil(allRecipes.length / RECIPES_PER_PAGE)} 
                 onClick={() => setRecipePage(p => p + 1)}
                 className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
             </div>
           )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold mb-4 text-gray-800">لیست کاربران</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead>
                 <tr className="border-b border-gray-100 text-sm text-gray-500">
                   <th className="py-3 font-medium">نام</th>
                   <th className="py-3 font-medium">ایمیل</th>
                   <th className="py-3 font-medium">نقش</th>
                   <th className="py-3 font-medium">تاریخ عضویت</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {allUsers.map((u: any) => (
                   <tr key={u.id} className="text-sm text-gray-700">
                     <td className="py-4 font-bold">{u.name}</td>
                     <td className="py-4">{u.email}</td>
                     <td className="py-4">
                       <span className={\`px-2 py-1 rounded-md text-xs \${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}\`}>{u.role === 'admin' ? 'مدیر' : 'کاربر'}</span>
                     </td>
                     <td className="py-4">{new Date(u.createdAt).toLocaleDateString('fa-IR')}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {allUsers.length === 0 && <p className="text-center text-gray-400 py-10">کاربری یافت نشد.</p>}
           </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold mb-4 text-gray-800">مدیریت نظرات</h2>
           <div className="space-y-4">
             {allComments.map((c: any) => (
               <div key={c.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <p className="font-bold text-sm">{c.userName}</p>
                     <p className="text-xs text-gray-500">در رابطه با: {c.recipeTitle}</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
                     <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 hover:text-red-700 bg-white p-1 rounded-md border"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 </div>
                 <p className="text-gray-700 text-sm mb-3">{c.content}</p>
                 
                 {c.adminReply ? (
                   <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm">
                     <p className="font-bold text-orange-800 mb-1">پاسخ مدیر:</p>
                     <p className="text-orange-700">{c.adminReply}</p>
                   </div>
                 ) : (
                   replyingTo === c.id ? (
                     <div className="flex gap-2 mt-2">
                       <input 
                         type="text" 
                         value={replyContent} 
                         onChange={e => setReplyContent(e.target.value)}
                         placeholder="پاسخ خود را بنویسید..."
                         className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-orange-500 outline-none"
                       />
                       <button onClick={() => submitReply(c.id)} className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold">ثبت</button>
                       <button onClick={() => { setReplyingTo(null); setReplyContent(''); }} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold">لغو</button>
                     </div>
                   ) : (
                     <button onClick={() => setReplyingTo(c.id)} className="text-orange-600 hover:underline text-xs font-bold mt-1">پاسخ به این نظر</button>
                   )
                 )}
               </div>
             ))}
             {allComments.length === 0 && <p className="text-center text-gray-400 py-10">نظری یافت نشد.</p>}
           </div>
        </div>
      )}

      `;

content = before + uiNew + after;
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Patched Admin.tsx ui using slicing');
