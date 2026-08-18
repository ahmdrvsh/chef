import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEK_DAYS_SHORT,
  toPersianDigits,
  getJalaliMonthLength,
  jalaliToGregorianStr,
  parseGregorianToJalali,
  getFirstDayOfJalaliMonthWeekday,
  getCurrentJalaliDate,
  formatToPersianShamsi
} from '../utils/jalali';
import { analyzeExpiry } from '../utils/expiryNotifier';

interface JalaliDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGregorianDate: string; // YYYY-MM-DD
  onSelectDate: (gregorianDateStr: string) => void;
  itemName?: string;
}

export const JalaliDatePickerModal: React.FC<JalaliDatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedGregorianDate,
  onSelectDate,
  itemName
}) => {
  const currentJalaliToday = getCurrentJalaliDate();

  // Active viewing year & month in calendar
  const [viewYear, setViewYear] = useState<number>(currentJalaliToday.jy);
  const [viewMonth, setViewMonth] = useState<number>(currentJalaliToday.jm);

  // Selected Jalali Date
  const [selectedJalali, setSelectedJalali] = useState<{ jy: number; jm: number; jd: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const parsed = parseGregorianToJalali(selectedGregorianDate);
      if (parsed) {
        setSelectedJalali(parsed);
        setViewYear(parsed.jy);
        setViewMonth(parsed.jm);
      } else {
        setSelectedJalali(null);
        setViewYear(currentJalaliToday.jy);
        setViewMonth(currentJalaliToday.jm);
      }
    }
  }, [isOpen, selectedGregorianDate]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const newSel = { jy: viewYear, jm: viewMonth, jd: day };
    setSelectedJalali(newSel);
  };

  const handleApplySelection = () => {
    if (!selectedJalali) {
      onSelectDate('');
    } else {
      const gregStr = jalaliToGregorianStr(selectedJalali.jy, selectedJalali.jm, selectedJalali.jd);
      onSelectDate(gregStr);
    }
    onClose();
  };

  const handleClearDate = () => {
    setSelectedJalali(null);
    onSelectDate('');
    onClose();
  };

  const handlePresetDays = (daysFromNow: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth() + 1;
    const d = targetDate.getDate();

    // convert to Jalali
    const gregStr = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
    const parsed = parseGregorianToJalali(gregStr);

    if (parsed) {
      setSelectedJalali(parsed);
      setViewYear(parsed.jy);
      setViewMonth(parsed.jm);
    }
  };

  const monthLength = getJalaliMonthLength(viewYear, viewMonth);
  const firstDayWeekday = getFirstDayOfJalaliMonthWeekday(viewYear, viewMonth);

  // Generate grid days
  const calendarCells = [];
  // Empty leading spaces
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= monthLength; d++) {
    calendarCells.push(d);
  }

  // Selected date analysis preview
  const currentGregStr = selectedJalali
    ? jalaliToGregorianStr(selectedJalali.jy, selectedJalali.jm, selectedJalali.jd)
    : '';
  const expiryAnalysis = currentGregStr ? analyzeExpiry(currentGregStr) : null;

  const yearOptions = Array.from({ length: 10 }, (_, i) => currentJalaliToday.jy - 2 + i);

  return (
    <div className="fixed inset-0 z-[110] bg-stone-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-y-auto">
      <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col rounded-t-[32px] rounded-b-none sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-500/30 border border-emerald-400/40 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  تقویم هجری شمسی
                </h3>
                <p className="text-[11px] text-emerald-200/80">
                  {itemName ? `انتخاب تاریخ انقضای «${itemName}»` : 'انتخاب تاریخ انقضا'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selected Date Header Display */}
          <div className="mt-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-200 block font-medium">تاریخ انتخاب شده:</span>
              <span className="text-sm font-black text-white">
                {selectedJalali
                  ? `${toPersianDigits(selectedJalali.jd)} ${PERSIAN_MONTH_NAMES[selectedJalali.jm - 1]} ${toPersianDigits(selectedJalali.jy)}`
                  : 'بدون تاریخ انقضا'}
              </span>
            </div>

            {expiryAnalysis && (
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 ${expiryAnalysis.badgeClass}`}>
                {expiryAnalysis.status === 'expired' && <AlertTriangle className="w-3.5 h-3.5" />}
                {expiryAnalysis.status === 'expiring_soon' && <Clock className="w-3.5 h-3.5" />}
                <span>{expiryAnalysis.badgeText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-stone-400 shrink-0 pr-1">پیش‌فرض:</span>
          <button
            type="button"
            onClick={() => handlePresetDays(0)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-stone-200 shrink-0 transition-colors"
          >
            امروز
          </button>
          <button
            type="button"
            onClick={() => handlePresetDays(3)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-stone-200 shrink-0 transition-colors"
          >
            ۳ روز دیگر
          </button>
          <button
            type="button"
            onClick={() => handlePresetDays(7)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-stone-200 shrink-0 transition-colors"
          >
            ۱ هفته
          </button>
          <button
            type="button"
            onClick={() => handlePresetDays(14)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-stone-200 shrink-0 transition-colors"
          >
            ۲ هفته
          </button>
          <button
            type="button"
            onClick={() => handlePresetDays(30)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-stone-200 shrink-0 transition-colors"
          >
            ۱ ماه
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between gap-2 mb-4 bg-stone-100/80 p-2 rounded-2xl border border-stone-200/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white text-stone-700 rounded-xl transition-all shadow-xs flex items-center justify-center"
              title="ماه قبل"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-stone-800">
                {PERSIAN_MONTH_NAMES[viewMonth - 1]}
              </span>

              {/* Year Dropdown */}
              <select
                value={viewYear}
                onChange={e => setViewYear(parseInt(e.target.value, 10))}
                className="bg-white border border-stone-300 font-black text-xs text-stone-800 px-2 py-1 rounded-xl focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    {toPersianDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-white text-stone-700 rounded-xl transition-all shadow-xs flex items-center justify-center"
              title="ماه بعد"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {PERSIAN_WEEK_DAYS_SHORT.map((wd, index) => (
              <div
                key={wd}
                className={`text-xs font-black py-1.5 rounded-lg ${
                  index === 6 ? 'text-rose-600 bg-rose-50/60' : 'text-stone-500'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty_${idx}`} className="h-10" />;
              }

              const isToday =
                currentJalaliToday.jy === viewYear &&
                currentJalaliToday.jm === viewMonth &&
                currentJalaliToday.jd === dayNum;

              const isSelected =
                selectedJalali &&
                selectedJalali.jy === viewYear &&
                selectedJalali.jm === viewMonth &&
                selectedJalali.jd === dayNum;

              const isFriday = (idx % 7) === 6;

              return (
                <button
                  key={`day_${dayNum}`}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-10 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-400/50'
                      : isToday
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 font-extrabold'
                      : isFriday
                      ? 'bg-rose-50/80 text-rose-700 hover:bg-rose-100 border border-rose-100'
                      : 'bg-stone-50 text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200/60'
                  }`}
                >
                  <span>{toPersianDigits(dayNum)}</span>
                  {isToday && !isSelected && (
                    <span className="text-[8px] font-black leading-none text-amber-700 mt-0.5">امروز</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearDate}
            className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>پاک کردن تاریخ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleApplySelection}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>تأیید تاریخ انقضا</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
