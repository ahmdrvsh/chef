import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { ChefHat } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/fridge');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('خطا در برقراری ارتباط با سرور');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-stone-800 p-10 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 mt-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-rose-500 shadow-md shadow-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">ثبت‌نام</h2>
      </div>
      
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 text-sm text-center font-bold">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">نام و نام خانوادگی</label>
          <input 
            type="text" 
            className="w-full border-none bg-stone-50 dark:bg-stone-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-rose-500/50 focus:outline-none transition-all outline-none text-stone-800 dark:text-stone-100" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">ایمیل</label>
          <input 
            type="email" 
            className="w-full border-none bg-stone-50 dark:bg-stone-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-rose-500/50 focus:outline-none transition-all outline-none text-left text-stone-800 dark:text-stone-100" 
            dir="ltr"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">رمز عبور</label>
          <input 
            type="password" 
            className="w-full border-none bg-stone-50 dark:bg-stone-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-rose-500/50 focus:outline-none transition-all outline-none text-left text-stone-800 dark:text-stone-100" 
            dir="ltr"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-stone-800 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-stone-900 transition-all hover:-translate-y-0.5 mt-2">
          ثبت‌نام
        </button>
      </form>
      
      <p className="text-center mt-8 text-sm text-stone-500 dark:text-stone-400">
        قبلا ثبت‌نام کرده‌اید؟ <Link to="/login" className="text-rose-500 font-bold hover:underline mx-1">وارد شوید</Link>
      </p>
    </div>
  );
}
