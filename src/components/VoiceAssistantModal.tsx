import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  X,
  ChefHat,
  CheckCircle2,
  Clock,
  Flame,
  ShoppingCart,
  Plus,
  ArrowRight,
  AlertCircle,
  Refrigerator,
  Settings2,
  Edit3,
  HelpCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FridgeItem } from '../data/initialData';
import { fetchFridge, addToShoppingList } from '../db';
import {
  startPersianSpeechRecognition,
  stopPersianSpeechRecognition,
  isSpeechRecognitionSupported,
  speakPersianText,
  stopPersianSpeech,
  isSpeechSynthesisSupported
} from '../utils/speechUtils';
import { askVoiceAssistant, AISuggestionItem, AIVoiceAssistantResponse } from '../utils/aiAssistant';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  defaultMealType?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  defaultMealType = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialPrompt);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [response, setResponse] = useState<AIVoiceAssistantResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [addedShoppingItems, setAddedShoppingItems] = useState<Record<string, boolean>>({});

  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const audioWaveIntervalRef = useRef<any>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>([40, 60, 30, 80, 50, 70, 45]);

  useEffect(() => {
    if (isOpen) {
      loadFridge();
      setErrorMsg(null);
      if (initialPrompt) {
        setTranscript(initialPrompt);
      }
    } else {
      handleStopAll();
    }
  }, [isOpen, initialPrompt]);

  const loadFridge = async () => {
    try {
      const items = await fetchFridge();
      setFridgeItems(items);
    } catch {}
  };

  const handleStopAll = () => {
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current();
      stopRecognitionRef.current = null;
    }
    stopPersianSpeechRecognition();
    stopPersianSpeech();
    setIsListening(false);
    setIsSpeaking(false);
    if (audioWaveIntervalRef.current) {
      clearInterval(audioWaveIntervalRef.current);
      audioWaveIntervalRef.current = null;
    }
  };

  const startVoiceRecording = () => {
    setErrorMsg(null);
    stopPersianSpeech();
    setIsSpeaking(false);

    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('مرورگر شما از تشخیص گفتار صوتی پشتیبانی نمی‌کند. لطفاً پیام خود را تایپ کنید.');
      setIsEditingText(true);
      return;
    }

    setIsListening(true);
    setTranscript('');

    // Animate sound waves
    if (audioWaveIntervalRef.current) clearInterval(audioWaveIntervalRef.current);
    audioWaveIntervalRef.current = setInterval(() => {
      setWaveHeights(
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 70) + 20)
      );
    }, 120);

    const stopFn = startPersianSpeechRecognition({
      onStart: () => {
        setIsListening(true);
      },
      onTranscript: (currentText, isFinal) => {
        setTranscript(currentText);
        if (isFinal) {
          // If speech finished cleanly, we can auto-submit or let user confirm
        }
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setIsListening(false);
        if (audioWaveIntervalRef.current) clearInterval(audioWaveIntervalRef.current);
      },
      onEnd: () => {
        setIsListening(false);
        if (audioWaveIntervalRef.current) clearInterval(audioWaveIntervalRef.current);
      }
    });

    stopRecognitionRef.current = stopFn;
  };

  const stopVoiceRecording = () => {
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current();
      stopRecognitionRef.current = null;
    }
    stopPersianSpeechRecognition();
    setIsListening(false);
    if (audioWaveIntervalRef.current) clearInterval(audioWaveIntervalRef.current);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || transcript).trim();
    if (!textToSend) {
      setErrorMsg('لطفاً ابتدا صحبت کنید یا پیام خود را تایپ نمایید.');
      return;
    }

    stopVoiceRecording();
    stopPersianSpeech();
    setIsSpeaking(false);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await askVoiceAssistant({
        message: textToSend,
        fridgeItems,
        preferences: user?.preferences || {},
        currentMealType: defaultMealType
      });

      setResponse(res);

      // Auto speak response text
      if (autoSpeakEnabled && res.replyMessage) {
        speakPersianText(res.replyMessage, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false)
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در دریافت پاسخ از دستیار هوشمند.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeechPlayback = () => {
    if (isSpeaking) {
      stopPersianSpeech();
      setIsSpeaking(false);
    } else if (response?.replyMessage) {
      speakPersianText(response.replyMessage, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  const handleAddMissingToShoppingList = async (suggestion: AISuggestionItem) => {
    if (!suggestion.missingIngredients || suggestion.missingIngredients.length === 0) return;

    for (const item of suggestion.missingIngredients) {
      await addToShoppingList({
        name: item,
        quantity: 1,
        unit: 'عدد',
        category: 'مواد اولیه'
      });
    }

    setAddedShoppingItems(prev => ({
      ...prev,
      [suggestion.title]: true
    }));
  };

  const sampleVoicePrompts = [
    'من تو یخچالم مرغ، برنج و ماست دارم. چی بپزم؟',
    'یک غذای سریع و رژیمی برای شام پیشنهاد بده',
    'با موجودی یخچالم بهترین غذا چیه؟',
    'یک خورشت خوشمزه و مجلسی ایرانی پیشنهاد بده'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto dir-rtl">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">دستیار صوتی سرآشپز سفره</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  GapGPT AI
                </span>
              </div>
              <p className="text-xs text-stone-300">با دستیار صوتی صحبت کنید تا بر اساس یخچالتان بهترین غذاها را پیشنهاد دهد</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
              title={autoSpeakEnabled ? 'پخش خودکار صدا فعال است' : 'پخش خودکار صدا خاموش است'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                autoSpeakEnabled
                  ? 'bg-emerald-700/80 border-emerald-500 text-emerald-200'
                  : 'bg-white/10 border-white/10 text-stone-400'
              }`}
            >
              {autoSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                handleStopAll();
                onClose();
              }}
              className="text-stone-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-stone-50/50">
          
          {/* User Context Bar (Fridge & Diet) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-stone-200/80 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-stone-700 font-bold">
                <Refrigerator className="w-4 h-4 text-emerald-600" />
                <span>موجودی یخچال:</span>
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-black border border-emerald-200">
                  {fridgeItems.length} قلم کالا
                </span>
              </div>

              {user?.preferences?.diet && (
                <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                  <span>رژیم:</span>
                  <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                    {user.preferences.diet}
                  </span>
                </div>
              )}
            </div>

            {user?.preferences?.allergies && user.preferences.allergies.length > 0 && (
              <div className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                پرهیز از: {user.preferences.allergies.join('، ')}
              </div>
            )}
          </div>

          {/* Voice Input Station / Wave Area */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            
            {/* Pulsing Mic Button */}
            <div className="relative flex items-center justify-center">
              {isListening && (
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
              )}
              {isListening && (
                <div className="absolute w-20 h-20 rounded-full bg-emerald-500/30 animate-pulse" />
              )}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`relative z-10 w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white scale-105 shadow-rose-600/30 ring-4 ring-rose-300'
                    : 'bg-gradient-to-tr from-emerald-700 to-teal-600 text-white hover:scale-105 shadow-emerald-700/30 active:scale-95'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-bounce" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Status & Soundwave Indicator */}
            <div>
              <h3 className="text-sm sm:text-base font-black text-stone-800">
                {isListening
                  ? 'درحال شنیدن صدای شما... صحبت کنید'
                  : transcript
                  ? 'پیام شما آماده ارسال است'
                  : 'روی میکروفون کلیک کنید و بگویید چه غذایی می‌خواهید'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isListening
                  ? 'وقتی صحبتتان تمام شد، مجدداً روی دکمه کلیک کنید یا ارسال را بزنید'
                  : 'یا از میان پیشنهادهای آماده زیر یکی را انتخاب نمایید'}
              </p>
            </div>

            {/* Sound Wave Bars when recording */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 h-10 px-4">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 bg-emerald-600 rounded-full transition-all duration-150"
                  />
                ))}
              </div>
            )}

            {/* Transcript & Text Input Box */}
            <div className="w-full max-w-xl">
              {isEditingText ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="مثلاً: من تو یخچالم مرغ، قارچ و گوجه دارم. یک شام سبک و سریع چی بپزم؟"
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>می‌توانید متن را ویرایش یا تکمیل کنید</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingText(false)}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      بستن ویرایش
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3 text-right">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-2">
                      {transcript || 'هنوز متنی دریافت نشده است...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditingText(true)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
                      title="ویرایش یا تایپ دستی"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {transcript && (
                      <button
                        type="button"
                        onClick={() => setTranscript('')}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                        title="پاک کردن متن"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Voice Prompts */}
            {!transcript && !isListening && (
              <div className="w-full max-w-xl">
                <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>نمونه سوالات صوتی آماده:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {sampleVoicePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(sample);
                        handleSendQuery(sample);
                      }}
                      className="px-3 py-1.5 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200/60 transition-all text-right cursor-pointer active:scale-95"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <button
                type="button"
                disabled={isLoading || !transcript.trim()}
                onClick={() => handleSendQuery()}
                className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading || !transcript.trim()
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 active:scale-98'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>درحال تحلیل و ساخت پیشنهادها...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>دریافت پیشنهاد سرآشپز هوشمند</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 text-xs font-medium w-full max-w-xl text-right">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* AI Response Section */}
          {response && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Chef Audio Reply Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-5 shadow-lg border border-emerald-700/40 relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300">
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-300">پاسخ صوتی سرآشپز سفره:</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleSpeechPlayback}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-amber-400 text-stone-900 shadow-md shadow-amber-400/30 animate-pulse'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>توقف صدا</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>پخش مجدد صوت</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-stone-100 text-right">
                    {response.replyMessage}
                  </p>
                </div>
              </div>

              {/* 3 Suggested Recipe Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-sm font-black text-stone-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>پیشنهادهای ۳گانه برای شما:</span>
                  </h4>
                  <span className="text-xs text-stone-500 font-medium">
                    بر اساس موجودی یخچال و سلیقه غذایی
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {response.suggestions.map((sugg, idx) => {
                    const isAddedToShopping = addedShoppingItems[sugg.title];

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="space-y-2.5">
                          
                          {/* Card Header & Match Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg">
                              {sugg.category || 'دسته‌بندی'}
                            </span>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 border border-emerald-300/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {sugg.matchPercentage}% تطابق با یخچال
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h5 className="text-sm font-black text-stone-900 group-hover:text-emerald-700 transition-colors">
                              {sugg.title}
                            </h5>
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                              {sugg.description}
                            </p>
                          </div>

                          {/* Meta times & difficulty */}
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-bold bg-stone-50 p-2 rounded-xl">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{(sugg.prepTime || 15) + (sugg.cookTime || 30)} دقیقه</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-rose-500" />
                              <span>{sugg.difficulty || 'آسان'}</span>
                            </div>
                            {sugg.caloriesPerServing && (
                              <>
                                <span>•</span>
                                <span>{sugg.caloriesPerServing} کالری</span>
                              </>
                            )}
                          </div>

                          {/* Needed From Fridge */}
                          {sugg.neededFromFridge && sugg.neededFromFridge.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-stone-700 block mb-1">
                                مواد موجود در یخچال:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {sugg.neededFromFridge.map((ing, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.5 rounded-md font-semibold"
                                  >
                                    ✓ {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missing Ingredients */}
                          {sugg.missingIngredients && sugg.missingIngredients.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-amber-800 block mb-1">
                                اقلام کسری / خرید:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {sugg.missingIngredients.map((ing, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium"
                                  >
                                    + {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Instructions Summary */}
                          {sugg.instructionsSummary && (
                            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-[11px] text-stone-700 leading-relaxed">
                              <span className="font-bold text-stone-900 block mb-0.5">طرز تهیه مختصر:</span>
                              {sugg.instructionsSummary}
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-stone-100 flex flex-col gap-1.5">
                          {sugg.missingIngredients && sugg.missingIngredients.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAddMissingToShoppingList(sugg)}
                              disabled={isAddedToShopping}
                              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isAddedToShopping
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 active:scale-95'
                              }`}
                            >
                              {isAddedToShopping ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>به لیست خرید اضافه شد</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                                  <span>افزودن کسری‌ها به لیست خرید</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              handleStopAll();
                              onClose();
                              navigate(`/recipes?q=${encodeURIComponent(sugg.title)}`);
                            }}
                            className="w-full py-2 px-3 bg-stone-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>مشاهده در دستورهای پخت</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>پشتیبانی از صدای فارسی، بهینه‌سازی شده با هوش مصنوعی GapGPT</span>
          </div>

          <button
            type="button"
            onClick={() => {
              handleStopAll();
              onClose();
            }}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
