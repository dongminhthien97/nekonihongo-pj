import {
  BookOpen,
  FileText,
  Languages,
  CreditCard,
  ClipboardCheck,
} from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF6E9] via-[#FFC7EA]/20 to-[#C7FFF1]/30">
      {/* Navigation */}
      <Navigation currentPage="landing" onNavigate={onNavigate} />
      <Background />

      {/* Features Section */}
      <section className="container animate-fade-in mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vocabulary Card */}
          <button
            onClick={() => onNavigate("vocabulary")}
            className="group relative bg-white/80 rounded-[32px] p-8 hover:scale-105 transition-all duration-500 overflow-hidden "
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFC7EA] to-[#D8C8FF] flex items-center justify-center group-hover:animate-bounce-subtle">
                <Languages className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl text-gray-800">Từ Vựng</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Học từ vựng tiếng Nhật cơ bản
              </p>
              <div className="flex gap-2 pt-2">
                <span className="text-2xl animate-wiggle">😺</span>
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </button>

          {/* Grammar Card */}
          <button
            onClick={() => onNavigate("grammar")}
            className="group bg-white/80 rounded-[32px] p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer "
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D8C8FF] to-[#C7FFF1] flex items-center justify-center group-hover:animate-bounce-subtle">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl text-gray-800">Ngữ Pháp</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Khám phá cấu trúc câu và ngữ pháp tiếng Nhật một cách dễ hiểu
              </p>
              <div className="flex gap-2 pt-2">
                <span className="text-2xl animate-wiggle delay-1">🤓</span>
                <span className="text-2xl">📖</span>
              </div>
            </div>
          </button>

          {/* Kanji Card */}
          <button
            onClick={() => onNavigate("kanji")}
            className="group bg-white/80 rounded-[32px] p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C7FFF1] to-[#FFC7EA] flex items-center justify-center group-hover:animate-bounce-subtle">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl text-gray-800">Kanji</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Học chữ Kanji với ý nghĩa và cách đọc On-Kun chi tiết
              </p>
              <div className="flex gap-2 pt-2">
                <span className="text-2xl animate-wiggle delay-2">✍️</span>
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </button>

          {/* Flashcard Card */}
          <button
            onClick={() => onNavigate("flashcard")}
            className="group bg-white/80 rounded-[32px] p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFC7EA] via-[#D8C8FF] to-[#C7FFF1] flex items-center justify-center group-hover:animate-bounce-subtle">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl text-gray-800">Flashcard</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Luyện tập và ghi nhớ từ vựng, Kanji với thẻ flashcard
              </p>
              <div className="flex gap-2 pt-2">
                <span className="text-2xl animate-wiggle delay-3">🃏</span>
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </button>

          {/* Exercise Card */}
          <button
            onClick={() => onNavigate("exercise")}
            className="group bg-white/80 rounded-[32px] p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D8C8FF] via-[#FFC7EA] to-[#FFF6E9] flex items-center justify-center group-hover:animate-bounce-subtle">
                <ClipboardCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl text-gray-800">Bài Tập</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Làm bài tập trắc nghiệm để kiểm tra kiến thức của bạn
              </p>
              <div className="flex gap-2 pt-2">
                <span className="text-2xl animate-wiggle delay-4">📝</span>
                <span className="text-2xl">💯</span>
              </div>
            </div>
          </button>
        </div>
      </section>
      {/* Floating Cat Animation */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50 hidden lg:block">
        <img
          src="https://i.pinimg.com/1200x/8c/98/00/8c9800bb4841e7daa0a3db5f7db8a4b7.jpg"
          alt="Flying Neko"
          className="w-40 h-40 
               sm:w-24 sm:h-24 
               md:w-28 md:h-28 
               lg:w-32 lg:h-32 
               xl:w-36 xl:h-36 
               rounded-full object-cover 
               shadow-2xl 
               animate-fly 
               drop-shadow-2xl"
          style={{
            filter: "drop-shadow(0 10px 20px rgba(255, 182, 233, 0.4))",
          }}
        />
      </div>

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes fly {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-50px, -30px); }
          50% { transform: translate(-100px, 0); }
          75% { transform: translate(-50px, 30px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes pulse-soft {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes sakura-fall {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }

        @keyframes sparkle {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-5px); opacity: 1; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }

        .animate-fly {
          animation: fly 10s ease-in-out infinite;
        }

        .animate-wiggle {
          animation: wiggle 1.5s ease-in-out infinite;
        }

        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }

        .delay-1 {
          animation-delay: 0.3s;
        }

        .delay-2 {
          animation-delay: 0.6s;
        }

        .delay-3 {
          animation-delay: 0.9s;
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .animate-sakura-fall {
          animation: sakura-fall 3s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

                .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
                  @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
