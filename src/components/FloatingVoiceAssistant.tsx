import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { VoiceAssistantModal } from './VoiceAssistantModal';

export const FloatingVoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-500/30 cursor-pointer"
          title="دستیار صوتی هوشمند سفره"
        >
          {/* Animated Glow Pulse */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-40 blur-xs group-hover:opacity-75 transition duration-300" />
          
          <div className="relative flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center text-amber-300">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black hidden sm:inline-block">
              دستیار صوتی
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse hidden sm:inline-block" />
          </div>
        </button>
      </div>

      {/* Modal */}
      <VoiceAssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
