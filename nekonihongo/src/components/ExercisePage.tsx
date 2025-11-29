import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import {
  BookOpen,
  FileText,
  Languages,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  List,
} from "lucide-react";

interface ExercisePageProps {
  onNavigate: (page: string) => void;
}

type Category = "vocabulary" | "kanji" | "grammar";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

interface ExerciseData {
  vocabulary: Exercise[];
  kanji: Exercise[];
  grammar: Exercise[];
}

// Data cho các bài tập
const exerciseData: ExerciseData = {
  vocabulary: [
    {
      id: 1,
      title: "Từ vựng N5 - Cơ bản",
      description: "Các từ vựng cơ bản trong tiếng Nhật",
      questions: [
        {
          id: 1,
          question: "Từ 'こんにちは' có nghĩa là gì?",
          options: ["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Từ 'ありがとう' có nghĩa là gì?",
          options: ["Xin lỗi", "Cảm ơn", "Tạm biệt", "Xin chào"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "Từ 'すみません' có nghĩa là gì?",
          options: ["Cảm ơn", "Tạm biệt", "Xin lỗi", "Xin chào"],
          correctAnswer: 2,
        },
        {
          id: 4,
          question: "Từ 'さようなら' có nghĩa là gì?",
          options: ["Xin chào", "Cảm ơn", "Xin lỗi", "Tạm biệt"],
          correctAnswer: 3,
        },
        {
          id: 5,
          question: "Từ 'はい' có nghĩa là gì?",
          options: ["Vâng/Có", "Không", "Có thể", "Không biết"],
          correctAnswer: 0,
        },
        {
          id: 6,
          question: "Từ 'いいえ' có nghĩa là gì?",
          options: ["Vâng", "Không", "Có thể", "Chắc chắn"],
          correctAnswer: 1,
        },
        {
          id: 7,
          question: "Từ 'おはよう' có nghĩa là gì?",
          options: [
            "Chào buổi tối",
            "Chào buổi sáng",
            "Chào buổi trưa",
            "Tạm biệt",
          ],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Từ 'おやすみ' có nghĩa là gì?",
          options: ["Chào buổi sáng", "Tạm biệt", "Chúc ngủ ngon", "Cảm ơn"],
          correctAnswer: 2,
        },
        {
          id: 9,
          question: "Từ 'ください' có nghĩa là gì?",
          options: ["Cho tôi", "Cảm ơn", "Xin lỗi", "Tạm biệt"],
          correctAnswer: 0,
        },
        {
          id: 10,
          question: "Từ 'どうぞ' có nghĩa là gì?",
          options: ["Cảm ơn", "Mời bạn", "Xin lỗi", "Tạm biệt"],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: 2,
      title: "Từ vựng N5 - Con số",
      description: "Học cách đếm số trong tiếng Nhật",
      questions: [
        {
          id: 1,
          question: "Số '1' trong tiếng Nhật là gì?",
          options: ["に", "いち", "さん", "し"],
          correctAnswer: 1,
        },
        {
          id: 2,
          question: "Số '2' trong tiếng Nhật là gì?",
          options: ["いち", "に", "さん", "し"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "Số '3' trong tiếng Nhật là gì?",
          options: ["に", "し", "さん", "ご"],
          correctAnswer: 2,
        },
        {
          id: 4,
          question: "Số '5' trong tiếng Nhật là gì?",
          options: ["し", "ご", "ろく", "なな"],
          correctAnswer: 1,
        },
        {
          id: 5,
          question: "Số '10' trong tiếng Nhật là gì?",
          options: ["きゅう", "じゅう", "はち", "なな"],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "Số '100' trong tiếng Nhật là gì?",
          options: ["ひゃく", "せん", "まん", "じゅう"],
          correctAnswer: 0,
        },
        {
          id: 7,
          question: "Số '1000' trong tiếng Nhật là gì?",
          options: ["ひゃく", "せん", "まん", "おく"],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Số '4' có thể đọc là gì?",
          options: ["し hoặc よん", "ご", "ろく", "なな"],
          correctAnswer: 0,
        },
        {
          id: 9,
          question: "Số '7' có thể đọc là gì?",
          options: ["ろく", "なな hoặc しち", "はち", "きゅう"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Số '9' trong tiếng Nhật là gì?",
          options: ["はち", "きゅう", "じゅう", "なな"],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: 3,
      title: "Từ vựng N5 - Gia đình",
      description: "Từ vựng về thành viên trong gia đình",
      questions: [
        {
          id: 1,
          question: "Từ 'おかあさん' có nghĩa là gì?",
          options: ["Bố", "Mẹ", "Anh trai", "Chị gái"],
          correctAnswer: 1,
        },
        {
          id: 2,
          question: "Từ 'おとうさん' có nghĩa là gì?",
          options: ["Bố", "Mẹ", "Em trai", "Em gái"],
          correctAnswer: 0,
        },
        {
          id: 3,
          question: "Từ 'おにいさん' có nghĩa là gì?",
          options: ["Em trai", "Anh trai", "Chị gái", "Em gái"],
          correctAnswer: 1,
        },
        {
          id: 4,
          question: "Từ 'おねえさん' có nghĩa là gì?",
          options: ["Em gái", "Mẹ", "Chị gái", "Anh trai"],
          correctAnswer: 2,
        },
        {
          id: 5,
          question: "Từ 'おとうと' có nghĩa là gì?",
          options: ["Anh trai", "Em trai", "Em gái", "Chị gái"],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "Từ 'いもうと' có nghĩa là gì?",
          options: ["Chị gái", "Em gái", "Mẹ", "Bố"],
          correctAnswer: 1,
        },
        {
          id: 7,
          question: "Từ 'かぞく' có nghĩa là gì?",
          options: ["Bạn bè", "Gia đình", "Người lạ", "Hàng xóm"],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Từ 'おじいさん' có nghĩa là gì?",
          options: ["Ông", "Bà", "Bác", "Chú"],
          correctAnswer: 0,
        },
        {
          id: 9,
          question: "Từ 'おばあさん' có nghĩa là gì?",
          options: ["Ông", "Bà", "Cô", "Dì"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Từ 'こども' có nghĩa là gì?",
          options: ["Người lớn", "Trẻ em", "Gia đình", "Bạn bè"],
          correctAnswer: 1,
        },
      ],
    },
  ],
  kanji: [
    {
      id: 1,
      title: "Kanji N5 - Số đếm",
      description: "Các chữ Kanji biểu thị số",
      questions: [
        {
          id: 1,
          question: "Kanji '一' đọc là gì?",
          options: ["に", "いち", "さん", "し"],
          correctAnswer: 1,
        },
        {
          id: 2,
          question: "Kanji '二' có nghĩa là gì?",
          options: ["Một", "Hai", "Ba", "Bốn"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "Kanji '三' đọc là gì?",
          options: ["に", "さん", "し", "ご"],
          correctAnswer: 1,
        },
        {
          id: 4,
          question: "Kanji '四' có nghĩa là gì?",
          options: ["Ba", "Bốn", "Năm", "Sáu"],
          correctAnswer: 1,
        },
        {
          id: 5,
          question: "Kanji '五' đọc là gì?",
          options: ["し", "ご", "ろく", "なな"],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "Kanji '六' có nghĩa là gì?",
          options: ["Năm", "Sáu", "Bảy", "Tám"],
          correctAnswer: 1,
        },
        {
          id: 7,
          question: "Kanji '七' đọc là gì?",
          options: ["ろく", "なな", "はち", "きゅう"],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Kanji '八' có nghĩa là gì?",
          options: ["Sáu", "Bảy", "Tám", "Chín"],
          correctAnswer: 2,
        },
        {
          id: 9,
          question: "Kanji '九' đọc là gì?",
          options: ["はち", "きゅう", "じゅう", "ひゃく"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Kanji '十' có nghĩa là gì?",
          options: ["Chín", "Mười", "Trăm", "Nghìn"],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: 2,
      title: "Kanji N5 - Thời gian",
      description: "Kanji liên quan đến thời gian",
      questions: [
        {
          id: 1,
          question: "Kanji '日' có thể đọc là gì?",
          options: ["ひ/にち", "つき", "とし", "あさ"],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Kanji '月' có nghĩa là gì?",
          options: ["Ngày", "Tháng", "Năm", "Tuần"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "Kanji '年' đọc là gì?",
          options: ["ひ", "つき", "とし/ねん", "しゅう"],
          correctAnswer: 2,
        },
        {
          id: 4,
          question: "Kanji '時' có nghĩa là gì?",
          options: ["Ngày", "Giờ", "Phút", "Giây"],
          correctAnswer: 1,
        },
        {
          id: 5,
          question: "Kanji '分' đọc là gì?",
          options: ["じ", "ふん", "びょう", "ねん"],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "Kanji '今' có nghĩa là gì?",
          options: ["Ngày mai", "Hôm nay", "Bây giờ", "Hôm qua"],
          correctAnswer: 2,
        },
        {
          id: 7,
          question: "Kanji '毎日' đọc là gì?",
          options: ["まいにち", "まいつき", "まいとし", "まいしゅう"],
          correctAnswer: 0,
        },
        {
          id: 8,
          question: "Kanji '先週' có nghĩa là gì?",
          options: ["Tuần sau", "Tuần trước", "Tuần này", "Mỗi tuần"],
          correctAnswer: 1,
        },
        {
          id: 9,
          question: "Kanji '来年' đọc là gì?",
          options: ["きょねん", "らいねん", "ことし", "まいとし"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Kanji '午前' có nghĩa là gì?",
          options: ["Buổi trưa", "Buổi chiều", "Buổi sáng", "Buổi tối"],
          correctAnswer: 2,
        },
      ],
    },
    {
      id: 3,
      title: "Kanji N5 - Cơ bản",
      description: "Các Kanji cơ bản thường gặp",
      questions: [
        {
          id: 1,
          question: "Kanji '人' đọc là gì?",
          options: ["ひと", "もの", "こと", "とき"],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Kanji '水' có nghĩa là gì?",
          options: ["Lửa", "Nước", "Gió", "Đất"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "Kanji '火' đọc là gì?",
          options: ["みず", "ひ/か", "つち", "かぜ"],
          correctAnswer: 1,
        },
        {
          id: 4,
          question: "Kanji '木' có nghĩa là gì?",
          options: ["Cây", "Hoa", "Lá", "Rễ"],
          correctAnswer: 0,
        },
        {
          id: 5,
          question: "Kanji '山' đọc là gì?",
          options: ["かわ", "やま", "うみ", "そら"],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "Kanji '川' có nghĩa là gì?",
          options: ["Núi", "Sông", "Biển", "Trời"],
          correctAnswer: 1,
        },
        {
          id: 7,
          question: "Kanji '大' đọc là gì?",
          options: ["ちいさい", "おおきい", "たかい", "ひくい"],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Kanji '小' có nghĩa là gì?",
          options: ["Lớn", "Nhỏ", "Cao", "Thấp"],
          correctAnswer: 1,
        },
        {
          id: 9,
          question: "Kanji '上' đọc là gì?",
          options: ["した", "うえ", "ひだり", "みぎ"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Kanji '下' có nghĩa là gì?",
          options: ["Trên", "Dưới", "Trái", "Phải"],
          correctAnswer: 1,
        },
      ],
    },
  ],
  grammar: [
    {
      id: 1,
      title: "Ngữ pháp N5 - です/だ",
      description: "Cách dùng です và だ",
      questions: [
        {
          id: 1,
          question: "Câu nào đúng?",
          options: [
            "わたしは学生です",
            "わたしは学生だ",
            "わたしは学生",
            "Cả A và B đều đúng",
          ],
          correctAnswer: 3,
        },
        {
          id: 2,
          question: "'です' được dùng trong văn nói nào?",
          options: ["Lịch sự", "Thân mật", "Trang trọng", "Cả A và C"],
          correctAnswer: 3,
        },
        {
          id: 3,
          question: "Thể phủ định của 'です' là gì?",
          options: ["ではない", "じゃない", "ではありません", "Cả A và C"],
          correctAnswer: 3,
        },
        {
          id: 4,
          question: "Câu 'これは本_____' điền gì?",
          options: ["です", "だ", "である", "Cả A, B, C đều được"],
          correctAnswer: 0,
        },
        {
          id: 5,
          question: "Thể quá khứ của 'です' là gì?",
          options: ["でした", "だった", "であった", "Cả A và B"],
          correctAnswer: 3,
        },
        {
          id: 6,
          question: "'だ' được dùng khi nào?",
          options: [
            "Văn nói lịch sự",
            "Văn nói thân mật",
            "Văn viết trang trọng",
            "Cả B và C",
          ],
          correctAnswer: 3,
        },
        {
          id: 7,
          question: "Câu nào SAI?",
          options: ["学生です", "学生だです", "学生だ", "学生である"],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Thể phủ định quá khứ lịch sự của 'です' là?",
          options: [
            "ではなかった",
            "じゃなかった",
            "ではありませんでした",
            "Cả A và C",
          ],
          correctAnswer: 3,
        },
        {
          id: 9,
          question: "'きれいです' có nghĩa là gì?",
          options: ["Đẹp", "Sạch sẽ", "Cả A và B", "Không có đáp án đúng"],
          correctAnswer: 2,
        },
        {
          id: 10,
          question: "Câu hỏi với 'です' kết thúc bằng gì?",
          options: ["ですか", "ですね", "ですよ", "ですが"],
          correctAnswer: 0,
        },
      ],
    },
    {
      id: 2,
      title: "Ngữ pháp N5 - Trợ từ は/が",
      description: "Phân biệt trợ từ は và が",
      questions: [
        {
          id: 1,
          question: "'は' dùng để làm gì?",
          options: [
            "Chỉ chủ đề",
            "Chỉ tân ngữ",
            "Chỉ địa điểm",
            "Chỉ thời gian",
          ],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "'が' thường dùng để làm gì?",
          options: [
            "Chỉ chủ đề",
            "Nhấn mạnh chủ ngữ",
            "Chỉ tân ngữ",
            "Chỉ địa điểm",
          ],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "Câu 'わたし___学生です' điền gì?",
          options: ["は", "が", "を", "に"],
          correctAnswer: 0,
        },
        {
          id: 4,
          question: "Câu hỏi 'だれ___来ましたか' điền gì?",
          options: ["は", "が", "を", "に"],
          correctAnswer: 1,
        },
        {
          id: 5,
          question: "'好きです' thường đi với trợ từ nào?",
          options: ["は", "が", "を", "に"],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "'分かります' thường đi với trợ từ nào?",
          options: ["は", "が", "を", "で"],
          correctAnswer: 1,
        },
        {
          id: 7,
          question: "Câu 'りんご___あります' điền gì?",
          options: ["は", "が", "を", "に"],
          correctAnswer: 1,
        },
        {
          id: 8,
          question: "Trong câu đối lập, dùng trợ từ nào?",
          options: ["は", "が", "Cả A và B", "Không dùng trợ từ"],
          correctAnswer: 0,
        },
        {
          id: 9,
          question: "'できます' thường đi với trợ từ nào?",
          options: ["は", "が", "を", "に"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Câu 'これ___本です' điền gì?",
          options: ["は", "が", "を", "の"],
          correctAnswer: 0,
        },
      ],
    },
    {
      id: 3,
      title: "Ngữ pháp N5 - Trợ từ を/に/で",
      description: "Cách dùng các trợ từ を, に, で",
      questions: [
        {
          id: 1,
          question: "'を' thường chỉ gì?",
          options: ["Chủ ngữ", "Tân ngữ trực tiếp", "Địa điểm", "Thời gian"],
          correctAnswer: 1,
        },
        {
          id: 2,
          question: "Câu 'ご飯___食べます' điền gì?",
          options: ["は", "が", "を", "に"],
          correctAnswer: 2,
        },
        {
          id: 3,
          question: "'に' dùng để chỉ gì?",
          options: [
            "Thời gian",
            "Điểm đến",
            "Người nhận",
            "Tất cả các đáp án trên",
          ],
          correctAnswer: 3,
        },
        {
          id: 4,
          question: "Câu '学校___行きます' điền gì?",
          options: ["を", "に", "で", "へ"],
          correctAnswer: 1,
        },
        {
          id: 5,
          question: "'で' chỉ địa điểm làm gì?",
          options: [
            "Nơi có ai/cái gì đó",
            "Nơi diễn ra hành động",
            "Điểm đến",
            "Nơi xuất phát",
          ],
          correctAnswer: 1,
        },
        {
          id: 6,
          question: "Câu '図書館___勉強します' điền gì?",
          options: ["を", "に", "で", "へ"],
          correctAnswer: 2,
        },
        {
          id: 7,
          question: "'で' còn dùng để chỉ gì?",
          options: [
            "Phương tiện",
            "Phương pháp",
            "Nguyên liệu",
            "Tất cả đáp án trên",
          ],
          correctAnswer: 3,
        },
        {
          id: 8,
          question: "Câu '電車___行きます' điền gì?",
          options: ["を", "に", "で", "が"],
          correctAnswer: 2,
        },
        {
          id: 9,
          question: "Câu '友達___会います' điền gì?",
          options: ["を", "に", "で", "と"],
          correctAnswer: 1,
        },
        {
          id: 10,
          question: "Câu '公園___散歩します' điền gì?",
          options: ["を", "に", "で", "へ"],
          correctAnswer: 0,
        },
      ],
    },
  ],
};

export function ExercisePage({ onNavigate }: ExercisePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Shuffle questions khi chọn bài tập
  useEffect(() => {
    if (selectedExercise) {
      const shuffled = [...selectedExercise.questions].sort(
        () => Math.random() - 0.5
      );
      setShuffledQuestions(shuffled);
      setUserAnswers(new Array(10).fill(null));
      setShowResult(false);
    }
  }, [selectedExercise]);

  const categories = [
    {
      id: "vocabulary" as Category,
      title: "Bài tập Từ vựng",
      description: "Luyện tập từ vựng tiếng Nhật",
      icon: Languages,
      gradient: "from-[#FFC7EA] via-[#FF9FD5] to-[#FF77C2]",
      glowColor: "rgba(255, 199, 234, 0.5)",
    },
    {
      id: "kanji" as Category,
      title: "Bài tập Kanji",
      description: "Luyện tập chữ Kanji",
      icon: FileText,
      gradient: "from-[#D8C8FF] via-[#C4AFFF] to-[#B096FF]",
      glowColor: "rgba(216, 200, 255, 0.5)",
    },
    {
      id: "grammar" as Category,
      title: "Bài tập Ngữ pháp",
      description: "Luyện tập ngữ pháp tiếng Nhật",
      icon: BookOpen,
      gradient: "from-[#C7FFF1] via-[#9FFFE5] to-[#77FFD9]",
      glowColor: "rgba(199, 255, 241, 0.5)",
    },
  ];

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedExercise(null);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    shuffledQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResult(true);
  };

  const handleRetry = () => {
    if (selectedExercise) {
      const shuffled = [...selectedExercise.questions].sort(
        () => Math.random() - 0.5
      );
      setShuffledQuestions(shuffled);
      setUserAnswers(new Array(10).fill(null));
      setShowResult(false);
      setScore(0);
    }
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
    setShowResult(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedExercise(null);
    setShowResult(false);
  };

  const getScoreMessage = (score: number) => {
    if (score <= 1) return "Ảo vậy chời 😿";
    if (score <= 5) return "Cần cố gắng thêm 💪";
    if (score <= 8) return "OK có cố gắng 😺";
    return "Tuyệt vời 🎉";
  };

  const getScoreEmoji = (score: number) => {
    if (score <= 1) return "😿";
    if (score <= 5) return "😼";
    if (score <= 8) return "😸";
    return "😻";
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Yuumi */}
      <Background />

      <Navigation currentPage="exercise" onNavigate={onNavigate} />

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl animate-float">📝</span>
            <h1 className="text-5xl md:text-5xl text-white hero-text-glow animate-float">
              Bài Tập Luyện Tập
            </h1>
            <span
              className="text-5xl animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              ✨
            </span>
          </div>
          <p className="flex text-white text-lg max-w-2xl mx-auto hero-text-glow">
            Luyện tập từ vựng, Kanji và ngữ pháp với các bài tập trắc nghiệm thú
            vị
          </p>
        </div>

        {/* Category Selection View */}
        {!selectedCategory && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="group relative glass-card rounded-[32px] p-8 hover:scale-105 transition-all duration-500 animate-fade-in overflow-hidden"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      boxShadow: `0 0 40px ${category.glowColor}, inset 0 0 40px rgba(255,255,255,0.1)`,
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                      style={{
                        background: `radial-gradient(circle at center, ${category.glowColor} 0%, transparent 70%)`,
                      }}
                    />

                    {/* Animated cat decoration */}
                    <div className="absolute -top-8 -right-8 text-7xl opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      🐱
                    </div>

                    <div className="relative z-10">
                      <div
                        className={`bg-gradient-to-br ${category.gradient} rounded-[24px] p-8 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl`}
                      >
                        <Icon className="w-20 h-20 mx-auto text-white drop-shadow-lg" />
                      </div>
                      <h3 className="text-white text-2xl mb-3 drop-shadow-lg">
                        {category.title}
                      </h3>
                      <p className="text-white text-md leading-relaxed">
                        {category.description}
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-2 text-white/90 group-hover:gap-4 transition-all">
                        <span className="text-lg">Bắt đầu</span>
                        <span className="text-2xl group-hover:translate-x-2 transition-transform">
                          →
                        </span>
                      </div>
                    </div>

                    {/* Sparkle effects */}
                    <div className="absolute top-4 right-4 text-xl animate-sparkle">
                      ✨
                    </div>
                    <div
                      className="absolute bottom-4 left-4 text-xl animate-sparkle"
                      style={{ animationDelay: "0.5s" }}
                    >
                      ⭐
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exercise List View */}
        {selectedCategory && !selectedExercise && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <button
              onClick={handleBackToCategories}
              className="glass-button flex items-center gap-2 text-white/90 hover:text-white mb-8 group px-6 py-3 rounded-[20px]"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
              <span>Quay lại danh mục</span>
            </button>

            <div className="bg-white/80 rounded-[32px] p-8 mb-8 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl drop-shadow-lg">
                  {selectedCategory === "vocabulary" && "📚"}
                  {selectedCategory === "kanji" && "📝"}
                  {selectedCategory === "grammar" && "📖"}
                </span>
                <h2 className="text-5xl text-white hero-text-glow bg-clip-text text-transparent drop-shadow-lg animate-float">
                  {categories.find((c) => c.id === selectedCategory)?.title}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {exerciseData[selectedCategory].map((exercise, index) => (
                <button
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="w-full bg-white/80 rounded-[24px] p-6 hover:scale-[1.02] transition-all duration-300 border border-white/10 hover:border-white/30 group animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#FFC7EA] to-[#D8C8FF] rounded-[16px] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                      <span className="text-xl">{exercise.id}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white text-xl mb-2 drop-shadow-lg">
                        {exercise.title}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {exercise.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-sm text-white/60">
                        <span>📝 10 câu hỏi</span>
                        <span>•</span>
                        <span>⏱️ ~5 phút</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-3xl group-hover:translate-x-2 transition-transform">
                      ▶️
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quiz View */}
        {selectedExercise && !showResult && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <button
              onClick={handleBackToList}
              className="glass-button flex items-center gap-2 text-white/90 hover:text-white mb-8 group px-6 py-3 rounded-[20px]"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
              <span>Quay lại danh sách</span>
            </button>

            <div className="bg-white/80 rounded-[32px] p-8 mb-8 text-black border border-white/20">
              <h2 className="text-3xl mb-3 drop-shadow-lg">
                {selectedExercise.title}
              </h2>
              <p className="text-black leading-relaxed">
                {selectedExercise.description}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm">
                <span>📝 {shuffledQuestions.length} câu hỏi</span>
                <span>•</span>
                <span>
                  ✅ {userAnswers.filter((a) => a !== null).length}/
                  {shuffledQuestions.length} đã trả lời
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {shuffledQuestions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="bg-white/80 rounded-[24px] p-6 border border-white/20 animate-slide-in"
                  style={{ animationDelay: `${qIndex * 0.05}s` }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FFC7EA] to-[#D8C8FF] rounded-full flex items-center justify-center text-white shadow-lg">
                      <span className="text-lg">{qIndex + 1}</span>
                    </div>
                    <h3 className="flex-1 text-black text-lg drop-shadow-lg">
                      {question.question}
                    </h3>
                  </div>

                  <div className="space-y-3 ml-16">
                    {question.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className={`w-full text-left p-4 rounded-[16px] border-2 transition-all duration-300 ${
                          userAnswers[qIndex] === oIndex
                            ? "text-black border-white/50 shadow-[0_0_80px_rgba(236,72,153,0.9)] scale-[1.02] border-4 border-transparent animate-border-spin"
                            : "glass-card text-white/80 border-white/20 hover:border-white/40 hover:scale-[1.01]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              userAnswers[qIndex] === oIndex
                                ? "border-white bg-white/80"
                                : "border-white/40"
                            }`}
                          >
                            {userAnswers[qIndex] === oIndex && (
                              <div className="w-3 h-3 rounded-full bg-white/80 shadow-lg" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={userAnswers.some((a) => a === null)}
                className="bg-white/80 px-12 py-5 rounded-[24px] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 text-black border border-white/30 shadow-[0_0_40px_rgba(255,199,234,0.6)]"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">Nộp bài</span>
              </button>
            </div>
          </div>
        )}

        {/* Result View */}
        {showResult && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white/80 rounded-[32px] p-12 text-center border border-white/20 shadow-[0_0_60px_rgba(255,199,234,0.4)]">
              <div className="text-9xl mb-6 animate-bounce drop-shadow-2xl">
                {getScoreEmoji(score)}
              </div>

              <h2 className="text-4xl text-white hero-text-glow mb-6 drop-shadow-lg">
                Kết quả của bạn
              </h2>

              <div className="text-7xl mb-6">
                <span className="hero-text-glow text-white drop-shadow-2xl animate-sparkle">
                  {score}/10
                </span>
              </div>

              <p className="hero-text-glow text-3xl text-white mb-10 drop-shadow-lg">
                {getScoreMessage(score)}
              </p>

              <div className="flex flex-wrap justify-center gap-6 mt-10">
                <button
                  onClick={handleRetry}
                  className="group relative px-10 py-5 font-black
                hover:scale-110 active:scale-95 
                transition-all duration-300 
                flex items-center gap-3 
                "
                >
                  <RotateCcw className="w-6 h-6" />
                  <span className="text-3xl text-shadow-glow ">Làm lại</span>
                </button>
                <button
                  onClick={handleBackToList}
                  className="group px-10 py-5 font-black
               hover:scale-110 active:scale-95 
               transition-all duration-300 
               flex items-center gap-3
               "
                >
                  <List className="w-6 h-6" />
                  <span className="text-3xl text-shadow-glow">
                    Danh sách bài tập
                  </span>
                </button>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="mt-10 space-y-4">
              <h3 className="text-white hero-text-glow text-2xl text-center mb-8 drop-shadow-lg ">
                Chi tiết câu trả lời ✨
              </h3>
              {shuffledQuestions.map((question, index) => {
                const isCorrect = userAnswers[index] === question.correctAnswer;
                return (
                  <div
                    key={question.id}
                    className={`bg-white/80 rounded-[24px] p-6 border-2 animate-slide-in ${
                      isCorrect
                        ? "border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        : "border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          isCorrect
                            ? "bg-green-500/20 text-shadow-glow"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-7 h-7" />
                        ) : (
                          <XCircle className="w-7 h-7" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-black text-lg mb-4 drop-shadow-lg">
                          {question.question}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-white/70">
                              Bạn đã chọn:
                            </span>
                            <span
                              className={`px-4 py-2 rounded-[12px] text-sm shadow-lg ${
                                isCorrect
                                  ? "bg-green-500/20 text-shadow-glow border border-green-400/30"
                                  : "bg-red-500/20 text-red-300 border border-red-400/30"
                              }`}
                            >
                              {question.options[userAnswers[index]!]}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-white/70">
                                Đáp án đúng:
                              </span>
                              <span className="px-4 py-2 rounded-[12px] text-sm bg-green-500/20 text-shadow-glow border border-green-400/30 shadow-lg">
                                {question.options[question.correctAnswer]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
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
        /* Glass Morphism Effects */
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .glass-card-gradient {
          background: linear-gradient(135deg, rgba(255, 199, 234, 0.15) 0%, rgba(216, 200, 255, 0.15) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 20px rgba(255, 199, 234, 0.5);
        }

        /* Animations */
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-30px);
          }
          50% {
            transform: scale(1.05) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
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

        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
          .hero-text-glow {
    text-shadow: 
      0 0 20px #FF69B4,
      0 0 40px #A020F0,
      0 0 60px #00FFFF,
      0 0 80px #FF69B4,
      0 0 100px #A020F0,
      0 4px 20px rgba(0,0,0,0.9);
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));

    @keyframes border-spin {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.animate-border-spin {
  background-size: 400% 400%;
  animation: border-spin 4s linear infinite;
}
    @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }    
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
