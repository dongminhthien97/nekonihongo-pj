import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Check,
  XCircle,
  MessageSquare,
  Star,
  Clock,
  User,
  BookOpen,
  Send,
  AlertCircle,
  Eye,
  HelpCircle,
  CheckCircle,
  XSquare,
  Loader2,
  Download,
  RefreshCw,
  Info,
  Filter,
  Hash,
  Database,
} from "lucide-react";
import toast from "react-hot-toast";

interface TestAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect?: boolean;
  correctAnswer?: string;
  allCorrectAnswers?: string;
  subQuestionIndex: number;
  points?: number;
  maxPoints?: number;
  explanation?: string;
  questionType?: string;
  questionText?: string;
  originalAnswer?: string;
  adminChecked?: boolean;
}

interface UserTest {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  lessonId: number;
  lessonTitle?: string;
  score?: number | null;
  status: "pending" | "feedbacked";
  feedback: string | null;
  feedbackAt: string | null;
  submittedAt: string;
  answers?: TestAnswer[];
  timeSpent?: number;
}

interface AdminTestDetailModalProps {
  test: UserTest | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (
    testId: number,
    feedback: string,
    score: number,
  ) => Promise<void>;
  onDeleteTest: (testId: number) => Promise<void>;
  onShowCorrectAnswers: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

interface QuestionData {
  id: number;
  lesson_id: number;
  lessonId?: number;
  example?: string | null;
  type: string;
  text: string;
  options?: string[] | null;
  correct_answer?: string;
  correctAnswer?: string;
  points: number;
  explanation: string | null;
  answerParts?: string[];
  numParts?: number;
  subQuestions?: SubQuestionData[];
}

interface SubQuestionData {
  index: number;
  correctAnswer: string;
  possibleAnswers?: string[];
  points?: number;
}

interface QuestionMapping {
  testQuestionId: number;
  dbQuestionId: number;
  subIndex: number;
  subQuestionCount: number;
}

// Question Mapping Service
class QuestionMappingService {
  private static instance: QuestionMappingService;
  private mappings: Map<number, QuestionMapping[]> = new Map();

  private constructor() {
    this.initializeMappings();
  }

  static getInstance(): QuestionMappingService {
    if (!QuestionMappingService.instance) {
      QuestionMappingService.instance = new QuestionMappingService();
    }
    return QuestionMappingService.instance;
  }

  private initializeMappings() {
    // Lesson 1: 14 test questions map to 3 database questions
    const lesson1Mappings: QuestionMapping[] = [
      // Test Q1-6 map to DB Q7 (fill_blank with 5 parts)
      { testQuestionId: 1, dbQuestionId: 7, subIndex: 0, subQuestionCount: 5 },
      { testQuestionId: 2, dbQuestionId: 7, subIndex: 1, subQuestionCount: 5 },
      { testQuestionId: 3, dbQuestionId: 7, subIndex: 2, subQuestionCount: 5 },
      { testQuestionId: 4, dbQuestionId: 7, subIndex: 3, subQuestionCount: 5 },
      { testQuestionId: 5, dbQuestionId: 7, subIndex: 4, subQuestionCount: 5 },
      { testQuestionId: 6, dbQuestionId: 7, subIndex: 0, subQuestionCount: 5 }, // Repeat for different context

      // Test Q7-9 map to DB Q8 (fill_blank with 4 parts)
      { testQuestionId: 7, dbQuestionId: 8, subIndex: 0, subQuestionCount: 4 },
      { testQuestionId: 8, dbQuestionId: 8, subIndex: 1, subQuestionCount: 4 },
      { testQuestionId: 9, dbQuestionId: 8, subIndex: 2, subQuestionCount: 4 },

      // Test Q10-14 map to DB Q9 (multiple_choice with parts)
      { testQuestionId: 10, dbQuestionId: 9, subIndex: 0, subQuestionCount: 6 },
      { testQuestionId: 11, dbQuestionId: 9, subIndex: 1, subQuestionCount: 6 },
      { testQuestionId: 12, dbQuestionId: 9, subIndex: 2, subQuestionCount: 6 },
      { testQuestionId: 13, dbQuestionId: 9, subIndex: 3, subQuestionCount: 6 },
      { testQuestionId: 14, dbQuestionId: 9, subIndex: 4, subQuestionCount: 6 },
    ];

    this.mappings.set(1, lesson1Mappings);
  }

  getMapping(lessonId: number, testQuestionId: number): QuestionMapping | null {
    const lessonMappings = this.mappings.get(lessonId);
    if (!lessonMappings) return null;

    return (
      lessonMappings.find((m) => m.testQuestionId === testQuestionId) || null
    );
  }

  getAllMappings(lessonId: number): QuestionMapping[] {
    return this.mappings.get(lessonId) || [];
  }

  getDbQuestionIds(lessonId: number): number[] {
    const mappings = this.getAllMappings(lessonId);
    const uniqueIds = new Set(mappings.map((m) => m.dbQuestionId));
    return Array.from(uniqueIds);
  }
}

export function AdminTestDetailModal({
  test,
  isOpen,
  onClose,
  onSubmitFeedback,
  onDeleteTest,
  onShowCorrectAnswers,
  position = { x: 100, y: 100 },
  onPositionChange,
}: AdminTestDetailModalProps) {
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>(
    {},
  );
  const [modalPosition, setModalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [autoGraded, setAutoGraded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mappingInfo, setMappingInfo] = useState<QuestionMapping[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [lastFetchedLessonId, setLastFetchedLessonId] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionAnalysis, setShowQuestionAnalysis] = useState(false);

  const mappingService = QuestionMappingService.getInstance();
  const fetchTimeoutRef = useRef<number | null>(null);

  // Khởi tạo dữ liệu khi test thay đổi
  useEffect(() => {
    if (test) {
      console.log(
        `📝 Khởi tạo modal cho test ${test.id}, bài ${test.lessonId}`,
      );

      setFeedback(test.feedback || "");
      setScore(test.score ?? null);
      setFetchError(null);

      // Khởi tạo checked answers từ dữ liệu hiện có
      const initialChecks: Record<string, boolean> = {};
      if (test.answers) {
        test.answers.forEach((answer) => {
          const key = `${answer.questionId}_${answer.subQuestionIndex}`;
          if (answer.isCorrect !== undefined) {
            initialChecks[key] = answer.isCorrect;
          }
        });
      }
      setCheckedAnswers(initialChecks);

      // Lấy thông tin mapping
      const mappings = mappingService.getAllMappings(test.lessonId);
      setMappingInfo(mappings);
      console.log(
        `🗺️ Đã tải ${mappings.length} mappings cho bài ${test.lessonId}`,
      );

      // Chỉ fetch đáp án nếu lessonId thay đổi
      if (test.lessonId !== lastFetchedLessonId) {
        fetchCorrectAnswers();
        setLastFetchedLessonId(test.lessonId);
      }
    }
  }, [test]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Cập nhật vị trí modal khi prop thay đổi
  useEffect(() => {
    setModalPosition(position);
  }, [position]);

  // Hàm lấy token xác thực
  const getAuthToken = useCallback((): string | null => {
    const tokenKeys = [
      "token",
      "access_token",
      "auth_token",
      "user_token",
      "jwt_token",
      "jwt",
      "authToken",
      "accessToken",
      "user",
      "auth",
      "nekonihongo_token",
      "admin_token",
    ];

    // Kiểm tra localStorage
    for (const key of tokenKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        return value;
      }
    }

    // Kiểm tra sessionStorage
    for (const key of tokenKeys) {
      const value = sessionStorage.getItem(key);
      if (value) {
        return value;
      }
    }

    // Kiểm tra cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      for (const key of tokenKeys) {
        if (trimmedCookie.startsWith(`${key}=`)) {
          return trimmedCookie.substring(key.length + 1);
        }
      }
    }

    return null;
  }, []);

  // Fetch đáp án đúng từ API
  const fetchCorrectAnswers = async () => {
    if (!test || !test.lessonId) {
      toast.error("Không tìm thấy bài học để lấy đáp án");
      return;
    }

    // Hủy timeout trước đó nếu có
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập và thử lại.");
      }

      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log(`📤 Đang tải đáp án cho bài ${test.lessonId}`);

      // Sử dụng endpoint chính
      const apiUrl = `/api/admin/questions/lesson/${test.lessonId}/correct-answers`;
      console.log(`🌐 Fetching từ: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers,
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        // Thử endpoint thứ cấp nếu endpoint chính thất bại
        const fallbackUrl = `/admin/questions/lesson/${test.lessonId}/correct-answers`;
        console.log(`🌐 Thử fallback: ${fallbackUrl}`);

        const fallbackResponse = await fetch(fallbackUrl, {
          headers,
          credentials: "include",
          method: "GET",
        });

        if (!fallbackResponse.ok) {
          throw new Error(
            `Không thể kết nối đến server. Status: ${response.status} - ${response.statusText}`,
          );
        }

        const contentType = fallbackResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await fallbackResponse.text();
          console.error("Phản hồi không phải JSON:", text.substring(0, 500));
          throw new Error("Server trả về dữ liệu không đúng định dạng JSON");
        }

        const responseData = await fallbackResponse.json();
        console.log(`✅ Đã tải dữ liệu từ fallback:`, responseData);

        const processedData = processResponseData(responseData);
        if (!processedData || processedData.length === 0) {
          throw new Error("Không tìm thấy dữ liệu câu hỏi trong phản hồi");
        }

        setQuestionsData(processedData);

        // Auto-grade nếu chưa chấm
        if (!autoGraded && processedData.length > 0) {
          fetchTimeoutRef.current = window.setTimeout(
            () => autoGradeAnswers(processedData),
            500,
          );
        }

        toast.success(`Đã tải ${processedData.length} câu hỏi từ server`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Phản hồi không phải JSON:", text.substring(0, 500));
        throw new Error("Server trả về dữ liệu không đúng định dạng JSON");
      }

      const responseData = await response.json();
      console.log(`✅ Đã tải dữ liệu từ API:`, responseData);

      const processedData = processResponseData(responseData);
      if (!processedData || processedData.length === 0) {
        throw new Error("Không tìm thấy dữ liệu câu hỏi trong phản hồi");
      }

      setQuestionsData(processedData);

      // Auto-grade nếu chưa chấm
      if (!autoGraded && processedData.length > 0) {
        fetchTimeoutRef.current = window.setTimeout(
          () => autoGradeAnswers(processedData),
          500,
        );
      }

      toast.success(`Đã tải ${processedData.length} câu hỏi từ server`);
    } catch (error: any) {
      console.error("❌ Lỗi khi tải đáp án:", error);
      setFetchError(error.message || "Không thể kết nối đến server");
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý dữ liệu phản hồi từ API
  const processResponseData = (responseData: any): QuestionData[] => {
    console.log("🔄 Đang xử lý dữ liệu phản hồi:", responseData);

    if (!responseData) {
      console.error("Dữ liệu phản hồi rỗng");
      return [];
    }

    // Trường hợp 1: response là mảng
    if (Array.isArray(responseData)) {
      return responseData.map((item) => normalizeQuestionData(item));
    }

    // Trường hợp 2: response có thuộc tính 'data' là mảng
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map((item: any) => normalizeQuestionData(item));
    }

    // Trường hợp 3: response có thuộc tính 'questions' là mảng
    if (responseData.questions && Array.isArray(responseData.questions)) {
      return responseData.questions.map((item: any) =>
        normalizeQuestionData(item),
      );
    }

    console.error("Không thể tìm thấy mảng trong dữ liệu phản hồi");
    return [];
  };

  // Chuẩn hóa dữ liệu câu hỏi
  const normalizeQuestionData = (item: any): QuestionData => {
    const normalized: QuestionData = {
      id: item.id || item.questionId || 0,
      lesson_id: item.lesson_id || item.lessonId || 0,
      lessonId: item.lessonId || item.lesson_id || 0,
      type: (item.type || "fill_blank").toLowerCase(),
      text: item.text || item.questionText || item.content || "",
      correct_answer: item.correct_answer || item.correctAnswer || "",
      correctAnswer: item.correctAnswer || item.correct_answer || "",
      points: item.points || 10,
      explanation: item.explanation || item.hint || null,
    };

    // Xử lý answerParts cho fill_blank
    if (item.answerParts && Array.isArray(item.answerParts)) {
      normalized.answerParts = item.answerParts;
    } else if (normalized.type === "fill_blank" && normalized.correctAnswer) {
      normalized.answerParts = normalized.correctAnswer
        .split(";")
        .map((part: string) => part.trim());
    }

    // Xử lý numParts
    if (item.numParts !== undefined) {
      normalized.numParts = item.numParts;
    } else if (normalized.answerParts) {
      normalized.numParts = normalized.answerParts.length;
    }

    // Xử lý options cho multiple_choice
    if (item.options && Array.isArray(item.options)) {
      normalized.options = item.options;
    } else if (item.choices && Array.isArray(item.choices)) {
      normalized.options = item.choices;
    }

    // Xử lý example
    if (item.example !== undefined) {
      normalized.example = item.example;
    }

    console.log(`🔄 Đã chuẩn hóa câu hỏi ${normalized.id}: ${normalized.type}`);
    return normalized;
  };

  // Hàm so sánh đáp án với format đặc biệt cho multiple_choice
  const compareAnswers = (
    userAnswer: string,
    question: QuestionData,
    subIndex: number,
    mapping: QuestionMapping | null,
  ): boolean => {
    if (!question) return false;

    const userAns = userAnswer.trim();
    const correctAnswer =
      question.correctAnswer || question.correct_answer || "";
    const questionType = question.type.toLowerCase();

    console.log(`🔍 So sánh [Q${question.id}.${subIndex}]: "${userAns}" vs`, {
      correctAnswer,
      type: questionType,
      hasSemicolon: correctAnswer.includes(";"),
      hasComma: correctAnswer.includes(","),
    });

    // TRƯỜNG HỢP ĐẶC BIỆT: multiple_choice với format "何(なん),わたしの;その;わたし;新聞(しんぶん);だれ"
    if (questionType === "multiple_choice") {
      // 1. Tách các phần bằng dấu ;
      const answerSections = correctAnswer.split(";").map((s) => s.trim());

      // 2. Kiểm tra nếu subIndex hợp lệ
      if (subIndex >= 0 && subIndex < answerSections.length) {
        const section = answerSections[subIndex];

        // 3. Nếu phần có dấu , thì có nhiều đáp án đúng
        if (section.includes(",")) {
          const validAnswers = section.split(",").map((ans) => ans.trim());
          // So sánh không phân biệt hoa thường và bỏ khoảng trắng
          const normalizedUserAns = userAns.toLowerCase().trim();
          const isCorrect = validAnswers.some(
            (ans) => ans.toLowerCase().trim() === normalizedUserAns,
          );
          console.log(
            `✅ Multiple choice (nhiều đáp án): "${userAns}" trong [${validAnswers}] = ${isCorrect}`,
          );
          return isCorrect;
        }
        // 4. Nếu không có dấu , thì chỉ có một đáp án đúng
        else {
          const normalizedUserAns = userAns.toLowerCase().trim();
          const normalizedCorrectAns = section.toLowerCase().trim();
          const isCorrect = normalizedUserAns === normalizedCorrectAns;
          console.log(
            `✅ Multiple choice (một đáp án): "${userAns}" = "${section}" = ${isCorrect}`,
          );
          return isCorrect;
        }
      }

      console.log(
        `❌ SubIndex ${subIndex} không hợp lệ, chỉ có ${answerSections.length} sections`,
      );
      return false;
    }

    // TRƯỜNG HỢP 2: fill_blank với format "は;も;は;は;の"
    if (questionType === "fill_blank") {
      if (correctAnswer.includes(";")) {
        const answers = correctAnswer.split(";").map((ans) => ans.trim());
        const isCorrect =
          subIndex >= 0 && subIndex < answers.length
            ? answers[subIndex].toLowerCase().trim() ===
              userAns.toLowerCase().trim()
            : false;
        console.log(
          `✅ Fill blank: "${userAns}" = "${answers[subIndex] || "N/A"}" = ${isCorrect}`,
        );
        return isCorrect;
      }
      const isCorrect =
        correctAnswer.toLowerCase().trim() === userAns.toLowerCase().trim();
      console.log(
        `✅ Fill blank đơn giản: "${userAns}" = "${correctAnswer}" = ${isCorrect}`,
      );
      return isCorrect;
    }

    // TRƯỜNG HỢP MẶC ĐỊNH
    const isCorrect =
      correctAnswer.toLowerCase().trim() === userAns.toLowerCase().trim();
    console.log(
      `✅ So sánh mặc định: "${userAns}" = "${correctAnswer}" = ${isCorrect}`,
    );
    return isCorrect;
  };

  // Hàm lấy đáp án đúng cho sub question
  const getCorrectAnswerForSubQuestion = (
    question: QuestionData,
    subIndex: number,
    mapping: QuestionMapping | null,
  ): string => {
    if (!question) return "";

    const correctAnswer =
      question.correctAnswer || question.correct_answer || "";
    const questionType = question.type.toLowerCase();

    // Xử lý multiple_choice với format "何(なん),わたしの;その;わたし;新聞(しんぶん);だれ"
    if (questionType === "multiple_choice" && correctAnswer.includes(";")) {
      const answerSections = correctAnswer
        .split(";")
        .map((section) => section.trim());

      if (subIndex >= 0 && subIndex < answerSections.length) {
        const section = answerSections[subIndex];

        // Nếu có nhiều đáp án (cách nhau bởi dấu ,)
        if (section.includes(",")) {
          const answers = section.split(",").map((ans) => ans.trim());

          // Format hiển thị đẹp hơn
          if (answers.length === 2) {
            return `${answers[0]} hoặc ${answers[1]}`;
          } else if (answers.length > 2) {
            const last = answers.pop();
            return `${answers.join(", ")} hoặc ${last}`;
          }
          return section;
        }

        // Chỉ có một đáp án
        return section;
      }

      return "Không tìm thấy đáp án cho phần này";
    }

    // Xử lý fill_blank với format "は;も;は;は;の"
    if (questionType === "fill_blank" && correctAnswer.includes(";")) {
      const answers = correctAnswer.split(";").map((ans) => ans.trim());
      if (subIndex >= 0 && subIndex < answers.length) {
        return answers[subIndex];
      }
    }

    return correctAnswer;
  };

  // Hàm phân tích cấu trúc câu hỏi multiple_choice chi tiết
  const analyzeMultipleChoiceStructure = (
    question: QuestionData,
  ): Array<{
    index: number;
    questionText: string;
    correctAnswers: string[];
    userChoiceOptions?: string[]; // Các lựa chọn user có thể chọn
    format: string;
  }> => {
    const result: Array<{
      index: number;
      questionText: string;
      correctAnswers: string[];
      userChoiceOptions?: string[];
      format: string;
    }> = [];

    if (!question || question.type.toLowerCase() !== "multiple_choice") {
      return result;
    }

    const correctAnswer =
      question.correctAnswer || question.correct_answer || "";
    const questionText = question.text || "";

    // Tách các phần đáp án bằng dấu ;
    const answerSections = correctAnswer
      .split(";")
      .map((section) => section.trim());

    // Tìm các dòng trong question text để extract câu hỏi
    const lines = questionText.split("\n").filter((line) => line.trim());

    // Phân tích từng phần
    answerSections.forEach((section, index) => {
      // Lấy các đáp án đúng (có thể nhiều, cách nhau bởi dấu ,)
      const correctAnswers = section.includes(",")
        ? section.split(",").map((ans) => ans.trim())
        : [section];

      // Tìm câu hỏi tương ứng từ text
      let qText = "";
      if (index < lines.length) {
        // Tìm câu hỏi có dạng "[...]" chứa options
        const line = lines[index];
        const match = line.match(/\[(.*?)\]/);
        if (match) {
          qText = line.replace(/\[.*?\]/, `[chọn đáp án]`);
        } else {
          qText = line;
        }
      } else {
        qText = `Câu ${index + 1}: Chọn đáp án đúng`;
      }

      // Tìm các lựa chọn user có thể chọn (nếu có trong question text)
      let userChoiceOptions: string[] | undefined;
      if (index < lines.length) {
        const line = lines[index];
        const match = line.match(/\[(.*?)\]/);
        if (match) {
          userChoiceOptions = match[1].split(/[、,]/).map((opt) => opt.trim());
        }
      }

      result.push({
        index,
        questionText: qText,
        correctAnswers,
        userChoiceOptions,
        format: correctAnswers.length > 1 ? "multiple" : "single",
      });
    });

    return result;
  };

  // Hàm tự động chấm điểm
  const autoGradeAnswers = (questions: QuestionData[]) => {
    if (!test?.answers || questions.length === 0) {
      console.log("⚠️ Không thể tự động chấm: thiếu dữ liệu");
      return;
    }

    console.log(`🔄 Bắt đầu tự động chấm ${test.answers.length} câu trả lời`);

    const newChecks: Record<string, boolean> = {};
    let correctCount = 0;

    test.answers.forEach((answer) => {
      const key = `${answer.questionId}_${answer.subQuestionIndex}`;

      // Tìm mapping
      const mapping = mappingService.getMapping(
        test.lessonId,
        answer.questionId,
      );
      if (!mapping) {
        console.log(`❌ Không tìm thấy mapping cho câu ${answer.questionId}`);
        newChecks[key] = false;
        return;
      }

      // Tìm câu hỏi trong database
      const question = questions.find((q) => q.id === mapping.dbQuestionId);
      if (!question) {
        console.log(
          `❓ Không tìm thấy câu hỏi DB ${mapping.dbQuestionId} cho test câu ${answer.questionId}`,
        );
        newChecks[key] = false;
        return;
      }

      // Kiểm tra nếu đã được chấm thủ công
      if (checkedAnswers[key] !== undefined) {
        newChecks[key] = checkedAnswers[key];
        if (checkedAnswers[key]) correctCount++;
        return;
      }

      // So sánh đáp án
      const isCorrect = compareAnswers(
        answer.userAnswer || "",
        question,
        mapping.subIndex,
        mapping,
      );

      newChecks[key] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setCheckedAnswers(newChecks);
    setScore(correctCount);
    setAutoGraded(true);

    toast.success(
      `Đã tự động chấm: ${correctCount}/${test.answers.length} câu đúng`,
    );
    console.log(`📊 Kết quả chấm: ${correctCount}/${test.answers.length}`);
  };

  // Hàm lấy dữ liệu câu hỏi cho test question
  const getQuestionData = (
    testQuestionId: number,
  ): {
    question: QuestionData | undefined;
    mapping: QuestionMapping | null;
  } => {
    const mapping = mappingService.getMapping(
      test?.lessonId || 0,
      testQuestionId,
    );
    if (!mapping || !test) {
      return { question: undefined, mapping: null };
    }

    const question = questionsData.find((q) => q.id === mapping.dbQuestionId);
    return { question, mapping };
  };

  // Xử lý kéo thả modal
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 1000));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 700));

      const newPosition = { x: boundedX, y: boundedY };
      setModalPosition(newPosition);
      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    },
    [isDragging, dragStart, onPositionChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Xử lý check/uncheck đáp án
  const handleAnswerCheck = (
    questionId: number,
    subIndex: number,
    isCorrect: boolean,
  ) => {
    const key = `${questionId}_${subIndex}`;
    setCheckedAnswers((prev) => ({
      ...prev,
      [key]: isCorrect,
    }));

    setTimeout(() => calculateScoreFromChecks(), 100);
  };

  // Tính điểm từ các check
  const calculateScoreFromChecks = () => {
    if (!test?.answers) return 0;

    const totalQuestions = test.answers.length;
    const correctCount = Object.values(checkedAnswers).filter(Boolean).length;
    const calculatedScore = correctCount;

    setScore(calculatedScore);
    return calculatedScore;
  };

  // Xử lý submit feedback
  const handleSubmit = async () => {
    if (!test) return;

    if (!feedback.trim()) {
      toast.error("Vui lòng nhập phản hồi cho học viên");
      return;
    }

    setIsSubmitting(true);
    const finalScore = score || calculateScoreFromChecks() || 0;

    try {
      await onSubmitFeedback(test.id, feedback.trim(), finalScore);
      toast.success("Đã gửi phản hồi thành công");
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
      toast.error("Lỗi khi gửi phản hồi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa test
  const handleDelete = async () => {
    if (!test) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa bài test này? Hành động này không thể hoàn tác.",
    );

    if (!confirmed) return;

    try {
      await onDeleteTest(test.id);
      toast.success("Đã xóa bài test thành công");
      onClose();
    } catch (error) {
      console.error("Lỗi khi xóa bài test:", error);
      toast.error("Lỗi khi xóa bài test");
    }
  };

  // Hàm debug chi tiết
  const handleDetailedDebug = () => {
    console.clear();
    console.log("=== DEBUG CHI TIẾT CÂU HỎI ===");

    if (test?.answers) {
      test.answers.forEach((answer, idx) => {
        const { question, mapping } = getQuestionData(answer.questionId);

        console.log(`\n📝 Câu trả lời ${idx + 1}:`);
        console.log(`   Test Question ID: ${answer.questionId}`);
        console.log(`   SubIndex: ${answer.subQuestionIndex}`);
        console.log(`   User Answer: "${answer.userAnswer}"`);

        if (question) {
          const correctAnswer = getCorrectAnswerForSubQuestion(
            question,
            answer.subQuestionIndex,
            mapping,
          );

          console.log(`   DB Question ID: ${question.id}`);
          console.log(`   Question Type: ${question.type}`);
          console.log(
            `   Raw Correct Answer: "${question.correctAnswer || question.correct_answer}"`,
          );
          console.log(`   Processed Correct Answer: "${correctAnswer}"`);

          // Kiểm tra đúng/sai
          const isCorrect = compareAnswers(
            answer.userAnswer || "",
            question,
            answer.subQuestionIndex,
            mapping,
          );
          console.log(`   Kết quả: ${isCorrect ? "✓ ĐÚNG" : "✗ SAI"}`);

          // Phân tích đặc biệt cho multiple_choice
          if (question.type.toLowerCase() === "multiple_choice") {
            const analysis = analyzeMultipleChoiceStructure(question);
            if (analysis.length > 0) {
              console.log(`   📊 Phân tích cấu trúc:`);
              analysis.forEach((item) => {
                console.log(
                  `      Câu ${item.index + 1}: ${item.correctAnswers.join(" hoặc ")}`,
                );
              });
            }
          }
        }
      });
    }

    console.log("\n📊 Questions Data:", questionsData);
    console.log("\n🗺️ Mappings:", mappingInfo);
    console.log("\n✅ Checked Answers:", checkedAnswers);
    console.log("\n=== KẾT THÚC DEBUG ===");
    toast.success("Đã log debug chi tiết vào console");
  };

  // Hàm đánh dấu tất cả là đúng
  const markAllCorrect = () => {
    if (!test?.answers) return;

    const newChecks: Record<string, boolean> = {};
    test.answers.forEach((answer) => {
      const key = `${answer.questionId}_${answer.subQuestionIndex}`;
      newChecks[key] = true;
    });

    setCheckedAnswers(newChecks);
    calculateScoreFromChecks();
    toast.success("Đã chấm tất cả câu là ĐÚNG");
  };

  // Hàm đánh dấu tất cả là sai
  const markAllIncorrect = () => {
    if (!test?.answers) return;

    const newChecks: Record<string, boolean> = {};
    test.answers.forEach((answer) => {
      const key = `${answer.questionId}_${answer.subQuestionIndex}`;
      newChecks[key] = false;
    });

    setCheckedAnswers(newChecks);
    calculateScoreFromChecks();
    toast.success("Đã chấm tất cả câu là SAI");
  };

  // Tính toán tiến độ và thống kê
  const totalQuestions = test?.answers?.length || 0;
  const checkedCount = Object.keys(checkedAnswers).length;
  const correctCount = Object.values(checkedAnswers).filter(Boolean).length;
  const progressPercentage =
    totalQuestions > 0 ? (checkedCount / totalQuestions) * 100 : 0;

  // Group answers by questionId
  const groupedAnswers =
    test?.answers?.reduce(
      (groups, answer) => {
        const key = answer.questionId;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(answer);
        return groups;
      },
      {} as Record<number, TestAnswer[]>,
    ) || {};

  if (!isOpen || !test) return null;

  return (
    <div
      className="modal-container draggable-modal"
      style={{
        position: "fixed",
        left: `${modalPosition.x}px`,
        top: `${modalPosition.y}px`,
        zIndex: 1001,
      }}
    >
      {/* Modal Header - Draggable area */}
      <div
        className="modal-header draggable-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="modal-header-content">
          <h2 className="modal-title">
            <MessageSquare size={24} />
            Chấm điểm bài test
            {isLoading && (
              <span className="loading-badge">
                <Loader2 size={14} className="animate-spin" />
                Đang tải...
              </span>
            )}
          </h2>
          <div className="modal-subtitle-section">
            <div className="user-info">
              <User size={16} />
              <span>{test.userName || `User ${test.userId}`}</span>
              <span className="email-text">{test.userEmail}</span>
            </div>
            <div className="lesson-info">
              <BookOpen size={16} />
              <span>
                Bài {test.lessonId}: {test.lessonTitle || "Chưa có tiêu đề"}
              </span>
            </div>
            <div className="time-info">
              <Clock size={16} />
              <span>
                Nộp lúc: {new Date(test.submittedAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="close-button">
          <X size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Tiến độ chấm điểm</h3>
          <div className="progress-info">
            <span className="progress-text">
              {checkedCount}/{totalQuestions} câu đã chấm
              {autoGraded && (
                <span className="auto-grade-badge">
                  <CheckCircle size={12} />
                  Đã tự động chấm
                </span>
              )}
            </span>
            <span className="lesson-id">Bài {test.lessonId}</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-stats">
          <div className="stat-item">
            <Check size={16} className="stat-icon correct" />
            <span className="stat-count correct">{correctCount}</span>
            <span className="stat-label">Đúng</span>
          </div>
          <div className="stat-item">
            <XCircle size={16} className="stat-icon incorrect" />
            <span className="stat-count incorrect">
              {checkedCount - correctCount}
            </span>
            <span className="stat-label">Sai</span>
          </div>
          <div className="stat-item">
            <AlertCircle size={16} className="stat-icon pending" />
            <span className="stat-count pending">
              {totalQuestions - checkedCount}
            </span>
            <span className="stat-label">Chưa chấm</span>
          </div>
          <div className="stat-item">
            <Database size={16} className="stat-icon info" />
            <span className="stat-count info">{questionsData.length}</span>
            <span className="stat-label">Câu DB</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="header-actions">
        <div className="action-buttons-group">
          <button
            onClick={fetchCorrectAnswers}
            className="view-answers-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <Download size={16} />
                Tải đáp án từ DB
              </>
            )}
          </button>
          <button
            onClick={() => autoGradeAnswers(questionsData)}
            className="auto-grade-button"
            disabled={!questionsData || questionsData.length === 0 || isLoading}
          >
            <CheckCircle size={16} />
            Chấm tự động
          </button>
          <button
            onClick={handleDetailedDebug}
            className="debug-detail-button"
            title="Debug chi tiết"
          >
            <AlertCircle size={16} />
            Debug
          </button>
          <button
            onClick={() => setShowQuestionAnalysis(!showQuestionAnalysis)}
            className="analysis-toggle-button"
          >
            <Filter size={16} />
            {showQuestionAnalysis ? "Ẩn phân tích" : "Hiện phân tích"}
          </button>
        </div>

        <div className="mapping-info">
          <span className="mapping-text">
            <Hash size={14} />
            {mappingInfo.length} test → {questionsData.length} DB
          </span>
        </div>
      </div>

      {/* Error message */}
      {fetchError && (
        <div className="error-section">
          <div className="error-message">
            <AlertCircle size={20} />
            <div className="error-content">
              <strong>Lỗi khi tải đáp án:</strong>
              <p className="error-detail">{fetchError}</p>
              <div className="error-actions">
                <button
                  onClick={fetchCorrectAnswers}
                  className="retry-button"
                  disabled={isLoading}
                >
                  <RefreshCw size={14} />
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions Section */}
      <div className="questions-section">
        <div className="section-header">
          <h3 className="section-title">
            Chi tiết bài làm ({totalQuestions} câu)
          </h3>
          <div className="scoring-info">
            <HelpCircle size={16} />
            <span>
              Hiển thị đáp án học viên và đáp án đúng
              {questionsData.length > 0 &&
                ` (${questionsData.length} câu đã tải từ DB)`}
            </span>
          </div>
        </div>

        {questionsData.length === 0 && !fetchError && !isLoading && (
          <div className="no-data-message">
            <p>
              <Info size={20} />
              Chưa có dữ liệu câu hỏi từ Database. Vui lòng nhấn "Tải đáp án từ
              DB".
            </p>
          </div>
        )}

        <div className="questions-list">
          {Object.entries(groupedAnswers).map(([questionId, answers]) => {
            const testQuestionId = parseInt(questionId);
            const { question: questionData, mapping } =
              getQuestionData(testQuestionId);

            return (
              <div key={questionId} className="question-card">
                <div className="question-header">
                  <div className="question-header-left">
                    <span className="question-number">
                      Câu {testQuestionId}
                    </span>
                    {mapping && (
                      <span className="question-mapping">
                        → DB Câu {mapping.dbQuestionId}.{mapping.subIndex}
                      </span>
                    )}
                    <span className="question-type">
                      {questionData?.type
                        ? questionData.type === "fill_blank"
                          ? "Điền vào chỗ trống"
                          : questionData.type === "multiple_choice"
                            ? "Trắc nghiệm"
                            : questionData.type === "rearrange"
                              ? "Sắp xếp"
                              : questionData.type
                        : "Chưa tải"}
                    </span>
                  </div>
                  {!questionData && (
                    <span className="question-warning">
                      ⚠️ Chưa tải dữ liệu từ DB
                    </span>
                  )}
                </div>

                {questionData && (
                  <div className="question-content">
                    <div className="question-text-section">
                      <h4 className="section-subtitle">Nội dung câu hỏi:</h4>
                      <div className="question-text">
                        {questionData.text.split("\n").map((line, idx) => (
                          <div key={idx} className="question-line">
                            {line}
                          </div>
                        ))}
                      </div>

                      {questionData.explanation && (
                        <div className="question-explanation">
                          <strong>Giải thích:</strong>{" "}
                          {questionData.explanation}
                        </div>
                      )}

                      {/* Phân tích cấu trúc câu hỏi multiple_choice */}
                      {showQuestionAnalysis &&
                        questionData.type.toLowerCase() ===
                          "multiple_choice" && (
                          <div className="question-analysis">
                            <h4 className="analysis-title">
                              <Info size={14} />
                              Phân tích cấu trúc câu hỏi multiple_choice:
                            </h4>

                            <div className="analysis-meta">
                              <div className="meta-item">
                                <strong>Format raw:</strong>
                                <code className="meta-code">
                                  {questionData.correctAnswer ||
                                    questionData.correct_answer}
                                </code>
                              </div>
                              <div className="meta-item">
                                <strong>Number of sections:</strong>
                                <span className="meta-value">
                                  {
                                    analyzeMultipleChoiceStructure(questionData)
                                      .length
                                  }{" "}
                                  phần
                                </span>
                              </div>
                            </div>

                            {analyzeMultipleChoiceStructure(questionData).map(
                              (item, idx) => (
                                <div
                                  key={idx}
                                  className="analysis-item detailed"
                                >
                                  <div className="analysis-header">
                                    <span className="analysis-index">
                                      Phần {item.index + 1}
                                    </span>
                                    <span
                                      className={`analysis-type ${item.format === "multiple" ? "type-multiple" : "type-single"}`}
                                    >
                                      {item.format === "multiple"
                                        ? "Nhiều đáp án đúng"
                                        : "Một đáp án đúng"}
                                    </span>
                                  </div>

                                  <div className="analysis-question">
                                    <strong>Câu hỏi:</strong>{" "}
                                    {item.questionText}
                                  </div>

                                  {item.userChoiceOptions &&
                                    item.userChoiceOptions.length > 0 && (
                                      <div className="analysis-user-options">
                                        <span className="options-label">
                                          Lựa chọn cho user:
                                        </span>
                                        <div className="options-list">
                                          {item.userChoiceOptions.map(
                                            (opt, optIdx) => (
                                              <span
                                                key={optIdx}
                                                className="user-option"
                                              >
                                                {opt}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  <div className="analysis-answers">
                                    <span className="analysis-label">
                                      Đáp án đúng:
                                    </span>
                                    <div className="correct-answers-list">
                                      {item.correctAnswers.map(
                                        (ans, ansIdx) => (
                                          <div
                                            key={ansIdx}
                                            className="correct-answer-item"
                                          >
                                            <CheckCircle size={12} />
                                            <span className="answer-text">
                                              {ans}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="answers-list">
                  {answers.map((answer, index) => {
                    const key = `${answer.questionId}_${answer.subQuestionIndex}`;
                    const isChecked = checkedAnswers[key] !== undefined;
                    const isCorrect = checkedAnswers[key];

                    const { question: answerQuestion } = getQuestionData(
                      answer.questionId,
                    );
                    const correctAnswer = answerQuestion
                      ? getCorrectAnswerForSubQuestion(
                          answerQuestion,
                          answer.subQuestionIndex,
                          mapping,
                        )
                      : answer.correctAnswer || "";

                    return (
                      <div key={index} className="answer-item">
                        <div className="answer-header">
                          <span className="part-label">
                            Phần {answer.subQuestionIndex + 1}
                          </span>
                          <div className="answer-comparison">
                            <div className="comparison-item">
                              <span className="comparison-label">
                                Học viên:
                              </span>
                              <span
                                className={`user-answer ${isChecked && !isCorrect ? "incorrect-text" : ""}`}
                              >
                                {answer.userAnswer || "(Chưa trả lời)"}
                              </span>
                            </div>
                            <div className="comparison-item">
                              <span className="comparison-label">
                                Đáp án đúng:
                              </span>
                              <span className="correct-answer">
                                {correctAnswer || "(Chưa tải)"}
                              </span>
                            </div>
                          </div>
                          <div className="check-buttons">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnswerCheck(
                                  answer.questionId,
                                  answer.subQuestionIndex,
                                  true,
                                );
                              }}
                              className={`check-button ${isChecked && isCorrect ? "active-correct" : ""}`}
                            >
                              <Check size={16} />
                              <span>Đúng</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnswerCheck(
                                  answer.questionId,
                                  answer.subQuestionIndex,
                                  false,
                                );
                              }}
                              className={`check-button ${isChecked && !isCorrect ? "active-incorrect" : ""}`}
                            >
                              <XCircle size={16} />
                              <span>Sai</span>
                            </button>
                          </div>
                        </div>

                        <div className="answer-info">
                          <div className="answer-status">
                            <span className="status-label">Trạng thái:</span>
                            <span
                              className={`status-badge ${isChecked ? (isCorrect ? "status-correct" : "status-incorrect") : "status-unchecked"}`}
                            >
                              {isChecked
                                ? isCorrect
                                  ? "✓ Đã chấm Đúng"
                                  : "✗ Đã chấm Sai"
                                : "Chưa chấm"}
                            </span>

                            {answer.userAnswer &&
                              correctAnswer &&
                              answer.userAnswer.trim() !== "" &&
                              answerQuestion && (
                                <span className="comparison-result">
                                  {compareAnswers(
                                    answer.userAnswer,
                                    answerQuestion,
                                    answer.subQuestionIndex,
                                    mapping,
                                  ) ? (
                                    <span className="match-correct">
                                      ✓ Khớp đáp án
                                    </span>
                                  ) : (
                                    <span className="match-incorrect">
                                      ✗ Không khớp
                                    </span>
                                  )}
                                </span>
                              )}
                          </div>

                          {answer.userAnswer &&
                            correctAnswer &&
                            answer.userAnswer.trim() !== "" &&
                            answerQuestion &&
                            !compareAnswers(
                              answer.userAnswer,
                              answerQuestion,
                              answer.subQuestionIndex,
                              mapping,
                            ) && (
                              <div className="comparison-detail">
                                <div className="detail-row">
                                  <span>Đáp án học viên:</span>
                                  <code className="answer-detail incorrect-detail">
                                    "{answer.userAnswer}"
                                  </code>
                                </div>
                                <div className="detail-row">
                                  <span>Đáp án đúng:</span>
                                  <code className="answer-detail correct-detail">
                                    "{correctAnswer}"
                                  </code>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Summary */}
      <div className="score-summary">
        <div className="score-info">
          <h3>
            <Star size={20} />
            Điểm số
          </h3>
          <div className="score-display">
            <span className="score-value">{score !== null ? score : 0}</span>
            <span className="score-max">/{totalQuestions} điểm</span>
          </div>
          <div className="score-percentage">
            (
            {totalQuestions > 0
              ? Math.round(((score || 0) / totalQuestions) * 100)
              : 0}
            %)
          </div>
        </div>
        <div className="score-actions">
          <button
            onClick={calculateScoreFromChecks}
            className="calculate-button"
          >
            Tính điểm từ chấm thủ công
          </button>
          <button onClick={markAllCorrect} className="mark-all-correct-button">
            Chấm tất cả là Đúng
          </button>
          <button
            onClick={markAllIncorrect}
            className="mark-all-incorrect-button"
          >
            Chấm tất cả là Sai
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="feedback-section">
        <h3>
          <MessageSquare size={20} />
          Phản hồi của Admin
        </h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Nhập phản hồi chi tiết cho học viên (nhận xét về bài làm, gợi ý cải thiện, lời khen...)"
          className="feedback-textarea"
          rows={4}
        />

        {test.feedback && test.feedbackAt && (
          <div className="previous-feedback">
            <strong>Phản hồi trước:</strong>
            <p>{test.feedback}</p>
            <small>
              Lúc: {new Date(test.feedbackAt).toLocaleString("vi-VN")}
            </small>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleDelete} className="delete-button">
          <XSquare size={16} />
          Xóa bài test
        </button>
        <div className="submit-buttons">
          <button onClick={onClose} className="cancel-button">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={16} />
                Gửi phản hồi ({score !== null ? score : 0} điểm)
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-container {
          background: white;
          border-radius: 1rem;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          width: 1000px;
          max-height: 90vh;
          overflow: hidden auto;
          pointer-events: auto;
          min-width: 800px;
          min-height: 600px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          user-select: none;
        }

        .modal-header-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .loading-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          margin-left: 10px;
        }

        .modal-subtitle-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .user-info,
        .lesson-info,
        .time-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .email-text {
          font-style: italic;
          opacity: 0.8;
          margin-left: 0.5rem;
        }

        .close-button {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.5rem;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .progress-section {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .auto-grade-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #10b981;
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .lesson-id {
          padding: 0.25rem 0.75rem;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .progress-bar-container {
          height: 0.5rem;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .progress-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-icon {
          border-radius: 50%;
          padding: 0.25rem;
        }

        .stat-icon.correct { color: #10b981; background: #dcfce7; }
        .stat-icon.incorrect { color: #ef4444; background: #fee2e2; }
        .stat-icon.pending { color: #f59e0b; background: #fef3c7; }
        .stat-icon.info { color: #3b82f6; background: #dbeafe; }

        .stat-count {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .stat-count.correct { color: #10b981; }
        .stat-count.incorrect { color: #ef4444; }
        .stat-count.pending { color: #f59e0b; }
        .stat-count.info { color: #3b82f6; }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .header-actions {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-buttons-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .mapping-info {
          padding: 0.5rem 0.75rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mapping-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-answers-button,
        .auto-grade-button,
        .debug-detail-button,
        .analysis-toggle-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .view-answers-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .view-answers-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }

        .auto-grade-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .auto-grade-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
        }

        .debug-detail-button {
          background: #8b5cf6;
          color: white;
        }

        .debug-detail-button:hover:not(:disabled) {
          background: #7c3aed;
          transform: translateY(-1px);
        }

        .analysis-toggle-button {
          background: #f59e0b;
          color: white;
        }

        .analysis-toggle-button:hover:not(:disabled) {
          background: #d97706;
          transform: translateY(-1px);
        }

        .view-answers-button:disabled,
        .auto-grade-button:disabled,
        .debug-detail-button:disabled,
        .analysis-toggle-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .error-section {
          padding: 1.5rem;
          background: #fef2f2;
          border-bottom: 1px solid #fecaca;
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .error-content {
          flex: 1;
        }

        .error-content strong {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .error-detail {
          margin: 0 0 1rem 0;
          line-height: 1.5;
          color: #991b1b;
        }

        .error-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .retry-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          background: #dc2626;
          color: white;
        }

        .retry-button:hover:not(:disabled) {
          background: #b91c1c;
        }

        .retry-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-data-message {
          padding: 2rem;
          text-align: center;
          background: #f3f4f6;
          border-radius: 0.5rem;
          margin: 1.5rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .questions-section {
          padding: 1.5rem;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-title {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .scoring-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          border-left: 3px solid #0ea5e9;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .question-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          background: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .question-header {
          padding: 1rem 1.25rem;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .question-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .question-number {
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 9999px;
          min-width: 70px;
          text-align: center;
        }

        .question-mapping {
          padding: 0.25rem 0.75rem;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.375rem;
          border: 1px solid #bae6fd;
        }

        .question-type {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.375rem;
        }

        .question-warning {
          padding: 0.25rem 0.75rem;
          background: #fef3c7;
          color: #92400e;
          border-radius: 0.375rem;
          font-size: 0.75rem;
        }

        .question-content {
          padding: 1.5rem;
          background: white;
        }

        .question-text-section {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border-left: 4px solid #3b82f6;
        }

        .section-subtitle {
          margin: 0 0 0.75rem 0;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .question-text {
          font-size: 0.875rem;
          color: #1f2937;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .question-line {
          margin-bottom: 0.5rem;
        }

        .question-explanation {
          padding: 0.75rem;
          background: #f0f9ff;
          border-radius: 0.375rem;
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: #0369a1;
          border-left: 3px solid #0ea5e9;
        }

        /* Phân tích câu hỏi multiple_choice */
        .question-analysis {
          margin: 1rem 0;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border-left: 4px solid #8b5cf6;
        }

        .analysis-title {
          margin: 0 0 1rem 0;
          color: #7c3aed;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .analysis-meta {
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
          border-left: 3px solid #94a3b8;
        }

        .meta-item {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .meta-item:last-child {
          margin-bottom: 0;
        }

        .meta-code {
          background: #1e293b;
          color: #e2e8f0;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.75rem;
        }

        .meta-value {
          color: #475569;
          font-weight: 500;
        }

        .analysis-item.detailed {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          background: white;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .analysis-index {
          font-weight: 600;
          color: #334155;
          font-size: 0.875rem;
        }

        .analysis-type {
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .type-multiple {
          background: #fef3c7;
          color: #92400e;
        }

        .type-single {
          background: #d1fae5;
          color: #065f46;
        }

        .analysis-question {
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .analysis-question strong {
          color: #1f2937;
        }

        .analysis-user-options {
          margin: 0.75rem 0;
          padding: 0.75rem;
          background: #f1f5f9;
          border-radius: 0.375rem;
        }

        .options-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .options-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .user-option {
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .analysis-answers {
          margin-top: 0.75rem;
        }

        .analysis-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .correct-answers-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .correct-answer-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f0fdf4;
          border-radius: 0.375rem;
          border: 1px solid #bbf7d0;
        }

        .correct-answer-item svg {
          color: #16a34a;
          flex-shrink: 0;
        }

        .answer-text {
          font-weight: 500;
          color: #166534;
          font-size: 0.875rem;
        }

        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
        }

        .answer-item {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.25rem;
          background: #fafafa;
          transition: all 0.2s;
        }

        .answer-item:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .part-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          min-width: 80px;
        }

        .answer-comparison {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 300px;
        }

        .comparison-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comparison-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.75rem;
          min-width: 100px;
        }

        .user-answer {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.875rem;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid #d1d5db;
          word-break: break-word;
        }

        .incorrect-text {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .correct-answer {
          font-weight: 600;
          color: #059669;
          font-size: 0.875rem;
          background: #f0fdf4;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid #86efac;
          word-break: break-word;
        }

        .check-buttons {
          display: flex;
          gap: 0.5rem;
          min-width: 180px;
        }

        .check-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid transparent;
          cursor: pointer;
          flex: 1;
          justify-content: center;
        }

        .check-button.active-correct {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .check-button.active-incorrect {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        .check-button:hover:not(.active-correct):not(.active-incorrect) {
          background: #e5e7eb;
        }

        .answer-info {
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .answer-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .status-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-correct {
          background: #dcfce7;
          color: #166534;
        }

        .status-incorrect {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-unchecked {
          background: #f3f4f6;
          color: #6b7280;
        }

        .comparison-result {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
        }

        .match-correct {
          background: #dcfce7;
          color: #166534;
        }

        .match-incorrect {
          background: #fef3c7;
          color: #92400e;
        }

        .comparison-detail {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .answer-detail {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.75rem;
          word-break: break-word;
        }

        .incorrect-detail {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .correct-detail {
          background: #f0fdf4;
          color: #059669;
          border: 1px solid #86efac;
        }

        .score-summary {
          padding: 1.5rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-top: 1px solid #e5e7eb;
        }

        .score-info h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem 0;
          color: #1e40af;
          font-size: 1.125rem;
        }

        .score-display {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .score-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e40af;
        }

        .score-max {
          font-size: 1.5rem;
          color: #3b82f6;
        }

        .score-percentage {
          font-size: 1rem;
          color: #6b7280;
        }

        .score-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .calculate-button,
        .mark-all-correct-button,
        .mark-all-incorrect-button {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .calculate-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .calculate-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }

        .mark-all-correct-button {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .mark-all-correct-button:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: translateY(-1px);
        }

        .mark-all-incorrect-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .mark-all-incorrect-button:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
        }

        .feedback-section {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .feedback-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .feedback-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          resize: none;
          transition: all 0.2s;
          font-family: inherit;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          min-height: 100px;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: transparent;
          box-shadow:
            0 0 0 2px #3b82f6,
            0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .previous-feedback {
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          border-left: 4px solid #9ca3af;
        }

        .previous-feedback strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .previous-feedback p {
          margin: 0 0 0.5rem 0;
          color: #4b5563;
          font-size: 0.875rem;
        }

        .previous-feedback small {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .action-buttons {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
        }

        .delete-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .delete-button:hover {
          background: #fecaca;
        }

        .submit-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }

        .cancel-button:hover {
          background: #f3f4f6;
        }

        .submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default AdminTestDetailModal;
