const fs = require('fs');
let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Replace imports and add state
profile = profile.replace(
  `import React, { useContext } from 'react';\nimport { AuthContext } from '../App';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { LogOut, Heart, User } from 'lucide-react';`,
  `import React, { useContext, useState, useEffect } from 'react';\nimport { AuthContext } from '../App';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { LogOut, Heart, User, Edit2, Check, X } from 'lucide-react';`
);

const stateOld = `  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }`;

const stateNew = `  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', birthDate: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        birthDate: user.birthDate || '',
        phoneNumber: user.phoneNumber || ''
      });
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/me', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || '',
          birthDate: data.birthDate || '',
          phoneNumber: data.phoneNumber || ''
        });
        const savedUserData = localStorage.getItem('user');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          localStorage.setItem('user', JSON.stringify({ ...parsed, ...data }));
        }
      }
    } catch(e) {}
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        const savedUserData = localStorage.getItem('user');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }));
        }
        setIsEditing(false);
        setMessage('اطلاعات با موفقیت ذخیره شد.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('خطا در ذخیره اطلاعات');
      }
    } catch(e) {
      setMessage('خطا در ذخیره اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }`;
  
profile = profile.replace(stateOld, stateNew);

const headerOld = `        <div className="flex items-center gap-6 mb-8 border-b border-stone-100 dark:border-stone-700 pb-8">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-1">{user.name}</h1>
            <p className="text-stone-500 dark:text-stone-400">{user.email}</p>
          </div>
        </div>`;
        
const headerNew = `        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-stone-100 dark:border-stone-700 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div>
              {!isEditing ? (
                <>
                  <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-1">{profileData.name || user.name}</h1>
                  <p className="text-stone-500 dark:text-stone-400">{user.email}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-sm">{user.email}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end self-start md:self-center">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 px-4 py-2 rounded-xl transition-colors">
                <Edit2 className="w-4 h-4" />
                ویرایش پروفایل
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                  <Check className="w-4 h-4" />
                  ذخیره
                </button>
                <button onClick={() => setIsEditing(false)} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-4 py-2 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                  لغو
                </button>
              </div>
            )}
          </div>
        </div>
        
        {message && (
          <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-xl text-sm font-bold border border-green-100">
            {message}
          </div>
        )}
        
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-widest">تاریخ تولد (اختیاری)</label>
            {!isEditing ? (
              <p className="text-stone-800 dark:text-stone-200 font-medium">{profileData.birthDate || '---'}</p>
            ) : (
              <input 
                type="text" 
                placeholder="مثال: ۱۳۷۰/۰۵/۱۲"
                value={profileData.birthDate} 
                onChange={e => setProfileData({...profileData, birthDate: e.target.value})}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all text-left" dir="ltr"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-widest">شماره تماس (اختیاری)</label>
            {!isEditing ? (
              <p className="text-stone-800 dark:text-stone-200 font-medium" dir="ltr">{profileData.phoneNumber || '---'}</p>
            ) : (
              <input 
                type="tel" 
                placeholder="09120000000"
                value={profileData.phoneNumber} 
                onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all text-left" dir="ltr"
              />
            )}
          </div>
        </div>`;
profile = profile.replace(headerOld, headerNew);

fs.writeFileSync('src/pages/Profile.tsx', profile);
