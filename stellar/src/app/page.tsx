import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-150 to-gray-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-gray-700 font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Stellar</h1>
          </div>
          <nav className="flex gap-4">
            <Link 
              href="/onboarding" 
              className="px-4 py-2 glass-button text-gray-700 hover:text-gray-900 font-medium transition-all rounded-xl"
            >
              Начать подготовку
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Твой персональный AI-репетитор<br />
            <span className="text-gray-600">для подготовки к ЕГЭ и ОГЭ</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Stellar не просто проверяет ответы — он учит мыслить. 
            Находит пробелы в знаниях, объясняет ошибки и строит 
            персональный путь к максимальному баллу.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="px-8 py-4 glass-card text-gray-800 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Пройти диагностику бесплатно
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 glass-button text-gray-700 rounded-xl font-semibold text-lg hover:bg-white/80 transition-all"
            >
              Узнать больше
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Почему Stellar работает?
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="glass-card p-8 rounded-2xl shadow-lg">
            <div className="w-14 h-14 glass-dark rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">Сократовский метод</h4>
            <p className="text-gray-600 leading-relaxed">
              AI никогда не даёт готовый ответ. Задаёт наводящие вопросы, помогает найти ошибку самостоятельно и понять причину.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-2xl shadow-lg">
            <div className="w-14 h-14 glass-dark rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">Карта знаний</h4>
            <p className="text-gray-600 leading-relaxed">
              Визуальный граф тем показывает пробелы. Ошибка по тригонометрии подсветит корень проблемы — алгебру или геометрию.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-2xl shadow-lg">
            <div className="w-14 h-14 glass-dark rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">Прогноз результата</h4>
            <p className="text-gray-600 leading-relaxed">
              ML-модель предсказывает итоговый балл на основе прогресса. Показывает, какие темы подтянуть для цели.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto glass-dark rounded-3xl p-12 text-center text-gray-800 shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">Готов начать подготовку?</h3>
          <p className="text-gray-600 mb-8 text-lg">
            Пройди 10-минутную диагностику и получи персональный план на неделю
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-4 glass-card text-gray-800 rounded-xl font-semibold text-lg hover:bg-white/80 transition-all shadow-lg"
          >
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-300/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center">
              <span className="text-gray-700 font-bold text-sm">S</span>
            </div>
            <span className="text-gray-600 font-medium">Stellar © 2024</span>
          </div>
          <p className="text-gray-500 text-sm">
            Проект для ИТ-смены Артек • EduTech Solutions
          </p>
        </div>
      </footer>
    </main>
  );
}
