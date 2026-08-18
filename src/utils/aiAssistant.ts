// AI Voice Assistant API client for Sofreh

import { getAuthToken } from '../context/AuthContext';
import { FridgeItem } from '../data/initialData';

export interface AISuggestionItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  matchPercentage: number;
  neededFromFridge: string[];
  missingIngredients: string[];
  instructionsSummary: string;
  caloriesPerServing?: number;
}

export interface AIVoiceAssistantResponse {
  source: 'gapgpt' | 'culinary_engine';
  model?: string;
  replyMessage: string;
  suggestions: AISuggestionItem[];
}

export async function askVoiceAssistant(params: {
  message: string;
  fridgeItems?: FridgeItem[];
  preferences?: any;
  currentMealType?: string;
}): Promise<AIVoiceAssistantResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/ai/voice-assistant', {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'خطا در برقراری ارتباط با دستیار صوتی');
  }

  return await res.json();
}

export async function checkAIStatus(): Promise<{ enabled: boolean; provider: string; model: string }> {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    enabled: false,
    provider: 'موتور هوشمند محلی سفره',
    model: 'gpt-4o-mini'
  };
}
