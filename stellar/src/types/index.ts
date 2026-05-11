export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface TopicNode {
  id: string;
  label: string;
  status: 'mastered' | 'learning' | 'locked' | 'problem';
  parentId?: string;
  childrenIds?: string[];
}

export interface DiagnosticResult {
  topicId: string;
  isCorrect: boolean;
  timestamp: Date;
}

export interface UserProgress {
  userId: string;
  predictedScore: number;
  topicsMastery: Record<string, number>;
  lastUpdated: Date;
}

export interface OnboardingQuestion {
  id: number;
  text: string;
  topic: string;
  correctAnswer?: string;
}
