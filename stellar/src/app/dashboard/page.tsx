'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import SocraticChat from '@/components/SocraticChat';
import MasteryMap from '@/components/MasteryMap';
import { Sparkles, TrendingUp, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { onboardingComplete, predictedScore, topicsMastery } = useAppStore();

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Stellar</h1>
              <p className="text-xs text-slate-500">Твой AI-тьютор</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Прогноз ЕГЭ</p>
                <p className="text-2xl font-bold text-slate-900">{predictedScore}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Тем изучено</p>
                <p className="text-2xl font-bold text-slate-900">{topicCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Средний прогресс</p>
                <p className="text-2xl font-bold text-slate-900">{avgMastery}%</p>
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
            <div className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">💡 Совет дня</h3>
              <p className="text-sm opacity-90">
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
