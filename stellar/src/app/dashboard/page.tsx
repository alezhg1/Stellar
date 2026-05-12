'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import SocraticChat from '@/components/SocraticChat';
import MasteryMap from '@/components/MasteryMap';
import { Sparkles, TrendingUp, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { onboardingComplete, predictedScore, topicsMastery, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (!onboardingComplete) {
      router.push('/onboarding');
    }
  }, [onboardingComplete, router]);

  if (!onboardingComplete) {
    return null; // Redirecting
  }

  const topicCount = Object.keys(topicsMastery).length;
  const avgMastery = topicCount > 0
    ? Math.round((Object.values(topicsMastery).reduce((a, b) => a + b, 0) / topicCount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-150 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-dark border-b border-gray-300/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Stellar</h1>
              <p className="text-xs text-gray-500">Твой AI-тьютор</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg shadow-sm">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Прогноз: {predictedScore} баллов
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Прогноз ЕГЭ</p>
                <p className="text-2xl font-bold text-gray-800">{predictedScore}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Тем изучено</p>
                <p className="text-2xl font-bold text-gray-800">{topicCount}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Средний прогресс</p>
                <p className="text-2xl font-bold text-gray-800">{avgMastery}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Section */}
          <div className="h-[600px]">
            <SocraticChat initialMessage="Помоги разобраться с тригонометрией" />
          </div>
          
          {/* Mastery Map */}
          <div>
            <MasteryMap />
            
            {/* Quick Tips */}
            <div className="mt-6 glass-dark rounded-2xl p-6 text-gray-800 shadow-lg">
              <h3 className="font-semibold mb-2">💡 Совет дня</h3>
              <p className="text-sm text-gray-600">
                Начни с тем, которые отмечены оранжевым цветом. Они требуют внимания, 
                но их можно быстро подтянуть. Это даст максимальный прирост баллов!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
