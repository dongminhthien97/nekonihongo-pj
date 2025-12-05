// src/components/LessonCard.tsx
import { type Lesson } from "../data/vocabularyLessons";

interface LessonCardProps {
  lesson: Lesson;
  onSelect: (lesson: Lesson) => void;
}

export function LessonCard({ lesson, onSelect }: LessonCardProps) {
  return (
    <button
      onClick={() => onSelect(lesson)}
      className="group relative w-full h-28 sm:h-32 rounded-3xl bg-white/80 backdrop-blur-xl 
                 border-4 border-white/50 hover:border-pink-300 
                 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/40
                 transition-all duration-500 
                 flex items-center justify-center gap-4 px-6 shadow-xl overflow-hidden"
    >
      {/* Glow khi hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />

      {/* Icon */}
      <div className="relative z-10 text-5xl group-hover:animate-bounce">
        {lesson.icon}
      </div>

      {/* Tiêu đề */}
      <div className="relative z-10 text-left">
        <p className="text-xl font-black text-white drop-shadow-lg">
          Bài {lesson.id}
        </p>
        <p className="text-sm text-white/90 line-clamp-2 leading-tight">
          {lesson.title}
        </p>
      </div>
    </button>
  );
}