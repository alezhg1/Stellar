// Socratic AI System Prompt
export const SOCRATIC_SYSTEM_PROMPT = `Ты — Stellar, сократический тьютор по математике для подготовки к ОГЭ/ЕГЭ.
Твоя цель — научить ученика решать задачи, а не дать готовый ответ.

СТРОГИЕ ПРАВИЛА:
1. НИКОГДА не пиши финальный ответ или полное решение сразу.
2. Если ученик просит решение: дай только первый шаг или наводящий вопрос.
3. Используй метод "лесов" (scaffolding): разбивай сложную задачу на микро-шаги.
4. Задавай проверочные вопросы: "Что ты уже пробовал?", "Какая формула здесь применима?"
5. Если ученик ошибся, укажи на тип ошибки, но не давай правильный путь сразу.
6. Опирайся только на предоставленный контекст из ФИПИ (RAG).
7. Тон: поддерживающий, как у старшего товарища. Избегай сухого академического языка.
8. После каждого шага спрашивай: "Понятно ли это? Хочешь подсказку или попробуешь сам?"

Контекст из базы знаний ФИПИ: {context}

История диалога:
{history}

Текущий запрос ученика: {message}`;

// Topic weights for ЕГЭ Math Profile (example)
export const TOPIC_WEIGHTS: Record<string, number> = {
  'algebra_basics': 8,
  'equations': 10,
  'inequalities': 9,
  'functions': 11,
  'geometry_planar': 7,
  'geometry_stereometric': 5,
  'trigonometry': 8,
  'logarithms': 6,
  'derivatives': 4,
  'probability': 3,
};

// Diagnostic questions for onboarding
export const ONBOARDING_QUESTIONS = [
  {
    id: 1,
    text: "Найдите корень уравнения: 2x + 5 = 15",
    topic: "algebra_basics",
    correctAnswer: "5",
  },
  {
    id: 2,
    text: "Вычислите: sin(30°) * cos(60°)",
    topic: "trigonometry",
    correctAnswer: "0.25",
  },
  {
    id: 3,
    text: "Решите неравенство: x² - 4 > 0",
    topic: "inequalities",
    correctAnswer: "(-∞; -2) ∪ (2; +∞)",
  },
  {
    id: 4,
    text: "Найдите производную функции: f(x) = x³ + 2x",
    topic: "derivatives",
    correctAnswer: "3x² + 2",
  },
  {
    id: 5,
    text: "Чему равен log₂(8)?",
    topic: "logarithms",
    correctAnswer: "3",
  },
  {
    id: 6,
    text: "Найдите площадь круга радиусом 5",
    topic: "geometry_planar",
    correctAnswer: "25π",
  },
  {
    id: 7,
    text: "Решите уравнение: 2^x = 16",
    topic: "algebra_basics",
    correctAnswer: "4",
  },
  {
    id: 8,
    text: "Найдите значение выражения: (a-b)(a+b) при a=5, b=3",
    topic: "algebra_basics",
    correctAnswer: "16",
  },
  {
    id: 9,
    text: "Какова вероятность выпадения четного числа на кубике?",
    topic: "probability",
    correctAnswer: "0.5",
  },
  {
    id: 10,
    text: "Найдите угол между касательной и радиусом в точке касания",
    topic: "geometry_planar",
    correctAnswer: "90°",
  },
];

// Mastery Map structure (simplified hierarchy)
export const MASTERY_MAP_STRUCTURE = [
  { id: 'algebra_basics', label: 'Алгебра (базовая)', parentId: null },
  { id: 'equations', label: 'Уравнения', parentId: 'algebra_basics' },
  { id: 'inequalities', label: 'Неравенства', parentId: 'algebra_basics' },
  { id: 'functions', label: 'Функции', parentId: 'algebra_basics' },
  { id: 'logarithms', label: 'Логарифмы', parentId: 'functions' },
  { id: 'derivatives', label: 'Производные', parentId: 'functions' },
  { id: 'trigonometry', label: 'Тригонометрия', parentId: 'algebra_basics' },
  { id: 'geometry_planar', label: 'Планиметрия', parentId: null },
  { id: 'geometry_stereometric', label: 'Стереометрия', parentId: null },
  { id: 'probability', label: 'Теория вероятностей', parentId: null },
];

// Predictive Progress calculation
export function calculatePredictedScore(
  topicsMastery: Record<string, number>
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [topic, mastery] of Object.entries(topicsMastery)) {
    const weight = TOPIC_WEIGHTS[topic] || 5;
    totalWeight += weight;
    weightedSum += mastery * weight;
  }

  // Normalize to 100-point scale (ЕГЭ max score ~100)
  if (totalWeight === 0) return 0;
  
  const baseScore = (weightedSum / totalWeight) * 100;
  
  // Add small bonus for consistency (all topics above 50%)
  const allAboveThreshold = Object.values(topicsMastery).every(m => m >= 0.5);
  const bonus = allAboveThreshold ? 5 : 0;
  
  return Math.min(100, Math.round(baseScore + bonus));
}
