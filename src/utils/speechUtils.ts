// Speech Recognition & Synthesis Utility for Sofreh Persian AI Voice Assistant

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

let activeRecognition: any = null;

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
};

export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
};

export const startPersianSpeechRecognition = (
  handlers: SpeechRecognitionHandlers
): (() => void) | null => {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError?.('مرورگر شما از قابلیت تبدیل صوت به متن پشتیبانی نمی‌کند.');
    return null;
  }

  try {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {}
      activeRecognition = null;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'fa-IR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      handlers.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      handlers.onTranscript?.(currentText, Boolean(finalTranscript));
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      let errorMsg = 'خطا در تشخیص گفتار رخ داد.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'اجازه دسترسی به میکروفون داده نشده است. لطفاً دسترسی را در مرورگر فعال کنید.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'صدایی شنیده نشد. لطفاً دوباره صحبت کنید.';
      } else if (event.error === 'network') {
        errorMsg = 'خطای اتصال اینترنت هنگام تشخیص صدا.';
      }
      handlers.onError?.(errorMsg);
    };

    recognition.onend = () => {
      handlers.onEnd?.();
      activeRecognition = null;
    };

    activeRecognition = recognition;
    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {}
      activeRecognition = null;
    };
  } catch (err: any) {
    handlers.onError?.('شروع ضبط صدا با خطا مواجه شد: ' + (err.message || 'خطای نامشخص'));
    return null;
  }
};

export const stopPersianSpeechRecognition = (): void => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {}
    activeRecognition = null;
  }
};

// Text to Speech
export const speakPersianText = (
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): void => {
  if (!isSpeechSynthesisSupported() || !text) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any previous speech

    // Clean up markdown / bullets from speech text for smoother listening
    const cleanSpeechText = text
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = 'fa-IR';
    utterance.rate = options?.rate || 0.95;
    utterance.pitch = options?.pitch || 1.0;

    // Pick Persian / Arabic / multilingual voice if available
    const voices = window.speechSynthesis.getVoices();
    const faVoice = voices.find(
      v => v.lang === 'fa-IR' || v.lang.startsWith('fa') || v.name.toLowerCase().includes('persian') || v.name.toLowerCase().includes('farsi')
    ) || voices.find(v => v.lang.startsWith('ar')) || voices.find(v => v.default);

    if (faVoice) {
      utterance.voice = faVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      options?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Failed to speak text:', e);
  }
};

export const stopPersianSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
};

export const pausePersianSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.pause();
    } catch {}
  }
};

export const resumePersianSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.resume();
    } catch {}
  }
};
