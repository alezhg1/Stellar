import { create } from 'zustand';
import { Message, TopicNode, UserProgress } from '@/types';

interface AppState {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;
  
  // Onboarding
  onboardingComplete: boolean;
  diagnosticResults: Record<number, boolean>;
  
  // Chat
  messages: Message[];
  isChatLoading: boolean;
  
  // Mastery Map
  topicsMastery: Record<string, number>;
  
  // Progress
  predictedScore: number;
  
  // Actions
  setUserId: (id: string) => void;
  completeOnboarding: (results: Record<number, boolean>) => void;
  addMessage: (message: Message) => void;
  setChatLoading: (loading: boolean) => void;
  updateTopicMastery: (topicId: string, mastery: number) => void;
  updatePredictedScore: (score: number) => void;
  resetState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  userId: null,
  isAuthenticated: false,
  onboardingComplete: false,
  diagnosticResults: {},
  messages: [],
  isChatLoading: false,
  topicsMastery: {},
  predictedScore: 0,
  
  // Actions
  setUserId: (id: string) => set({ userId: id, isAuthenticated: true }),
  
  completeOnboarding: (results: Record<number, boolean>) => {
    const topicsMastery: Record<string, number> = {};
    
    // Group results by topic and calculate mastery
    const topicResults: Record<string, { correct: number; total: number }> = {};
    
    Object.entries(results).forEach(([questionId, isCorrect]) => {
      // In real app, map questionId to topic from ONBOARDING_QUESTIONS
      const topic = `topic_${questionId}`;
      if (!topicResults[topic]) {
        topicResults[topic] = { correct: 0, total: 0 };
      }
      topicResults[topic].total += 1;
      if (isCorrect) {
        topicResults[topic].correct += 1;
      }
    });
    
    // Convert to mastery percentages
    Object.entries(topicResults).forEach(([topic, data]) => {
      topicsMastery[topic] = data.correct / data.total;
    });
    
    // Calculate initial predicted score
    const avgMastery = Object.values(topicsMastery).reduce((a, b) => a + b, 0) / 
                       Object.values(topicsMastery).length || 0;
    const predictedScore = Math.round(avgMastery * 100);
    
    set({
      onboardingComplete: true,
      diagnosticResults: results,
      topicsMastery,
      predictedScore,
    });
  },
  
  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  
  setChatLoading: (loading: boolean) => set({ isChatLoading: loading }),
  
  updateTopicMastery: (topicId: string, mastery: number) =>
    set((state) => ({
      topicsMastery: { ...state.topicsMastery, [topicId]: mastery },
    })),
  
  updatePredictedScore: (score: number) => set({ predictedScore: score }),
  
  resetState: () =>
    set({
      userId: null,
      isAuthenticated: false,
      onboardingComplete: false,
      diagnosticResults: {},
      messages: [],
      isChatLoading: false,
      topicsMastery: {},
      predictedScore: 0,
    }),
}));
