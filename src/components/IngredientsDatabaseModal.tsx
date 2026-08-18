import React, { useState, useMemo } from 'react';
import { X, Search, Download, Copy, Check, FileSpreadsheet, FileJson, Table, HelpCircle } from 'lucide-react';
import { INITIAL_INGREDIENTS } from '../data/ingredientsData';
import { Ingredient } from '../data/initialData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CONVERSION_RULES: Record<string, string> = {
  'پیمانه': '۱ پیمانه = ۲۴۰ گرم | ۲۴۰ میلی‌لیتر | ۱۶ قاشق غذاخوری | ۴۸ قاشق چای‌خوری | ۱ لیوان',
  'لیوان': '۱ لیوان = ۲۴۰ گرم | ۲۴۰ میلی‌لیتر | ۱۶ قاشق غذاخوری | ۴۸ قاشق چای‌خوری | ۱ پیمانه',
  'کیلوگرم': '۱ کیلوگرم = ۱۰۰۰ گرم | ۵ عدد بزرگ | ۷ عدد متوسط | ۱۰ عدد کوچک',
  'گرم': '۱ گرم = ۰.۰۰۱ کیلوگرم | ۰.۰۰۴۱۶ پیمانه | ۰.۰۶۶۷ قاشق غذاخوری',
  'عدد': '۱ عدد = ۰.۷۵ عدد بزرگ | ۱.۵ عدد کوچک | ۱۵۰ گرم | ۰.۱۵ کیلوگرم',
  'قاشق غذاخوری': '۱ قاشق غذاخوری = ۳ قاشق چای‌خوری | ۱۵ میلی‌لیتر | ۱۵ گرم | ۰.۰۶۲۵ پیمانه',
  'قاشق چای‌خوری': '۱ قاشق چای‌خوری = ۰.۳۳۳ قاشق غذاخوری | ۵ میلی‌لیتر | ۵ گرم',
  'میلی‌لیتر': '۱ میلی‌لیتر = ۱ گرم | ۰.۰۰۴۱۶ پیمانه | ۰.۰۶۶۷ قاشق غذاخوری',
  'دسته': '۱ دسته = ۵۰ گرم (حدودی) | ۰.۰۵ کیلوگرم',
  'حبه': '۱ حبه = ۵ گرم | ۰.۲ بوته',
  'بسته': '۱ بسته = ۲۰۰ گرم | ۱ عدد بسته',
  'قوطی': '۱ قوطی = ۴۰۰ گرم | ۱ عدد'
};

export const IngredientsDatabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(INITIAL_INGREDIENTS.map(i => i.category).filter(Boolean));
    return ['همه', ...Array.from(cats)];
  }, []);

  const getConversionText = (item: Ingredient): string => {
    if (item.conversions && item.conversions.length > 0) {
      return item.conversions.map(c => `۱ ${item.defaultUnit} = ${c.ratio} ${c.unit}`).join(' | ');
    }
    if (DEFAULT_CONVERSION_RULES[item.defaultUnit]) {
      return DEFAULT_CONVERSION_RULES[item.defaultUnit];
    }
    return `تبدیل استاندارد واحد ${item.defaultUnit}`;
  };

  const filteredIngredients = useMemo(() => {
    return INITIAL_INGREDIENTS.filter(item => {
      const matchCat = selectedCategory === 'همه' || item.category === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      if (!term) return matchCat;

      const matchName = item.name.toLowerCase().includes(term);
      const matchUnit = item.defaultUnit.toLowerCase().includes(term);
      const matchId = item.id.includes(term);
      const convText = getConversionText(item).toLowerCase();
      const matchConv = convText.includes(term);

      return matchCat && (matchName || matchUnit || matchId || matchConv);
    });
  }, [searchTerm, selectedCategory]);

  // Client-side CSV Download using UTF-8 BOM
  const handleDownloadCSV = () => {
    const csvRows = [
      ['کد (ID)', 'نام ماده اولیه', 'دسته‌بندی', 'واحد پیش‌فرض', 'نسبت‌های تبدیل واحد']
    ];

    INITIAL_INGREDIENTS.forEach(item => {
      csvRows.push([
        item.id,
        item.name,
        item.category || '-',
        item.defaultUnit,
        getConversionText(item)
      ]);
    });

    const csvString = '\uFEFF' + csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sofreh_ingredients_database.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Client-side JSON Download
  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(INITIAL_INGREDIENTS, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sofreh_ingredients_database.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy to Clipboard
  const handleCopyClipboard = () => {
    const lines = [
      'کد\tنام ماده اولیه\tدسته‌بندی\tواحد پیش‌فرض\tنسبت‌های تبدیل واحد',
      ...filteredIngredients.map(item => `${item.id}\t${item.name}\t${item.category || '-'}\t${item.defaultUnit}\t${getConversionText(item)}`)
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-fadeIn dir-rtl overflow-y-auto">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">
                بانک اطلاعاتی مواد اولیه و نسبت‌های تبدیل واحد
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مجموعاً {INITIAL_INGREDIENTS.length} ماده اولیه استاندارد سفره با واحد پیش‌فرض و فرمول‌های تبدیل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar & Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام ماده، واحد یا نسبت تبدیل..."
                className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Downloads & Copy Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>دانلود CSV (اکسل)</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <FileJson className="w-4 h-4" />
              <span>دانلود JSON</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد!' : 'کپی کل جدول'}</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            برای دانلود مستقیم فایل در دستگاه خود، بر روی دکمه <strong>«دانلود CSV»</strong> کلیک کنید. در صورت محدودیت دانلود مرورگر، دکمه <strong>«کپی کل جدول»</strong> تمام ۵۵۰ ماده اولیه را مستقیماً در اکسل یا Word وارد می‌کند.
          </span>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-right text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold sticky top-0 shadow-sm border-b border-slate-200">
                <th className="py-2.5 px-3 w-16">کد</th>
                <th className="py-2.5 px-3 w-48">نام ماده اولیه</th>
                <th className="py-2.5 px-3 w-40">دسته‌بندی</th>
                <th className="py-2.5 px-3 w-32">واحد پیش‌فرض</th>
                <th className="py-2.5 px-3">نسبت‌های تبدیل واحد (فرمول هوشمند)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ماده اولیه‌ای با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredIngredients.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-xs">{item.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">{item.category || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-semibold">
                        {item.defaultUnit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 leading-relaxed">
                      {getConversionText(item)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>نمایش {filteredIngredients.length} مورد از {INITIAL_INGREDIENTS.length} ماده اولیه ثبت‌شده</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
