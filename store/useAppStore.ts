import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TopicMastery {
  id: string;
  name: string;
  mastery: number; // 0-100
  lastPracticed?: number;
}

export interface OnboardingAnswer {
  questionId: number;
  topic: string;
  isCorrect: boolean;
}

interface AppState {
  // Onboarding
  onboardingComplete: boolean;
  onboardingAnswers: OnboardingAnswer[];
  
  // Chat
  messages: Message[];
  
  // Mastery Map
  topicsMastery: TopicMastery[];
  
  // Actions
  completeOnboarding: (answers: OnboardingAnswer[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  updateTopicMastery: (topicId: string, delta: number) => void;
  resetProgress: () => void;
}

const defaultTopics: TopicMastery[] = [
  { id: 'algebra', name: 'Алгебра', mastery: 50 },
  { id: 'geometry', name: 'Геометрия', mastery: 50 },
  { id: 'trigonometry', name: 'Тригонометрия', mastery: 50 },
  { id: 'calculus', name: 'Начала анализа', mastery: 50 },
  { id: 'probability', name: 'Теория вероятностей', mastery: 50 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      onboardingAnswers: [],
      messages: [],
      topicsMastery: defaultTopics,

      completeOnboarding: (answers) => {
        // Calculate initial mastery based on answers
        const topicScores: Record<string, { correct: number; total: number }> = {};
        
        answers.forEach((answer) => {
          if (!topicScores[answer.topic]) {
            topicScores[answer.topic] = { correct: 0, total: 0 };
          }
          topicScores[answer.topic].total += 1;
          if (answer.isCorrect) {
            topicScores[answer.topic].correct += 1;
          }
        });

        const updatedTopics = defaultTopics.map((topic) => {
          const lowerTopicName = topic.name.toLowerCase();
          const score = topicScores[lowerTopicName];
          
          if (score) {
            const accuracy = score.correct / score.total;
            // Base 30% + accuracy bonus (up to 40%)
            const newMastery = Math.min(100, Math.max(0, 30 + accuracy * 40));
            return { ...topic, mastery: Math.round(newMastery) };
          }
          return topic;
        });

        set({
          onboardingComplete: true,
          onboardingAnswers: answers,
          topicsMastery: updatedTopics,
        });
      },

      addMessage: (message) => {
        const currentMessages = get().messages;
        set({ messages: [...currentMessages, message] });

        // If this is a user message and AI confirms correctness, update mastery
        if (message.role === 'user') {
          // This will be enhanced when we parse AI responses
          // For now, we'll update based on simple keyword detection
          const content = message.content.toLowerCase();
          
          // Detect topic from message
          const topicMap: Record<string, string> = {
            'алгебр': 'algebra',
            'геометр': 'geometry',
            'тригон': 'trigonometry',
            'синус': 'trigonometry',
            'косинус': 'trigonometry',
            'тангенс': 'trigonometry',
            'производн': 'calculus',
            'интеграл': 'calculus',
            'вероятн': 'probability',
            'статистик': 'probability',
          };

          let detectedTopic: string | null = null;
          for (const [keyword, topicId] of Object.entries(topicMap)) {
            if (content.includes(keyword)) {
              detectedTopic = topicId;
              break;
            }
          }

          // Small mastery boost for engagement
          if (detectedTopic) {
            get().updateTopicMastery(detectedTopic, 2);
          }
        }
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      updateTopicMastery: (topicId, delta) => {
        const topics = get().topicsMastery;
        const updatedTopics = topics.map((topic) => {
          if (topic.id === topicId) {
            return {
              ...topic,
              mastery: Math.min(100, Math.max(0, topic.mastery + delta)),
              lastPracticed: Date.now(),
            };
          }
          return topic;
        });
        set({ topicsMastery: updatedTopics });
      },

      resetProgress: () => {
        set({
          onboardingComplete: false,
          onboardingAnswers: [],
          messages: [],
          topicsMastery: defaultTopics,
        });
      },
    }),
    {
      name: 'stellar-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
