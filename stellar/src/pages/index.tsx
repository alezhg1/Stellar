// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Stellar</h1>
          <nav className="space-x-4">
            <Link href="/onboarding" className="text-gray-600 hover:text-blue-600">
              Начать подготовку
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
            Твой персональный AI-репетитор
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Stellar не просто дает ответы. Он учит мыслить, находит пробелы в знаниях 
            и строит индивидуальный путь к высоким баллам на ЕГЭ и ОГЭ.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-blue-500 text-4xl mb-4">🧠</div>
              <h3 className="font-bold text-lg mb-2">Сократовский метод</h3>
              <p className="text-gray-600">AI задает наводящие вопросы, помогая тебе самому прийти к решению.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-blue-500 text-4xl mb-4">🗺️</div>
              <h3 className="font-bold text-lg mb-2">Карта знаний</h3>
              <p className="text-gray-600">Визуализируем твои пробелы и показываем, какую тему подтянуть.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-blue-500 text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg mb-2">Прогноз баллов</h3>
              <p className="text-gray-600">Предсказываем результат экзамена на основе твоего прогресса.</p>
            </div>
          </div>

          <Link 
            href="/onboarding"
            className="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 transition transform hover:scale-105"
          >
            Пройти диагностику бесплатно
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500">
          © 2024 Stellar EdTech. Проект для Артек ИТ-смены.
        </div>
      </footer>
    </div>
  );
}