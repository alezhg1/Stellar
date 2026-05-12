import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { calculatePredictedScore } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { userId, answers } = await req.json();

    if (!userId || !answers) {
      return NextResponse.json(
        { error: 'userId и answers обязательны' },
        { status: 400 }
      );
    }

    const topicsMastery: Record<string, number> = {};
    const topicResults: Record<string, { correct: number; total: number }> = {};

    for (const [questionIdStr, isCorrect] of Object.entries(answers)) {
      const mockQuestions: Record<number, string> = {
        1: 'algebra_basics', 2: 'trigonometry', 3: 'inequalities',
        4: 'derivatives', 5: 'logarithms', 6: 'geometry_planar',
        7: 'algebra_basics', 8: 'algebra_basics', 9: 'probability',
        10: 'geometry_planar',
      };
      
      const questionId = parseInt(questionIdStr, 10);
      const topic = mockQuestions[questionId];
      if (!topic) continue;

      if (!topicResults[topic]) {
        topicResults[topic] = { correct: 0, total: 0 };
      }
      topicResults[topic].total += 1;
      if (isCorrect) topicResults[topic].correct += 1;

      db.saveDiagnosticResponse({
        user_id: userId,
        question_id: questionIdStr,
        selected_option: isCorrect ? 1 : 0,
        is_correct: isCorrect,
      }).catch(console.error);
    }

    for (const [topic, data] of Object.entries(topicResults)) {
      topicsMastery[topic] = data.correct / data.total;
    }

    const predictedScore = calculatePredictedScore(topicsMastery);

    return NextResponse.json({ success: true, topicsMastery, predictedScore });
  } catch (error) {
    console.error('Error in diagnostic API:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
