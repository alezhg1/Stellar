'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import SocraticChat from '@/components/SocraticChat';
import MasteryMap from '@/components/MasteryMap';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  useEffect(() => {
    if (!onboardingComplete) {
      router.push('/onboarding');
    }
  }, [onboardingComplete, router]);

  if (!onboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            Stellar
          </h1>
          <p className="text-gray-600">Твой персональный AI-учитель</p>
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <motion.div 
          className="lg:col-span-2 h-[600px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SocraticChat />
        </motion.div>

        {/* Mastery Map Section */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MasteryMap />
        </motion.div>
      </div>
    </motion.div>
  );
}
