
export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StudyMaterials {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  topics: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuizResult {
  topic: string;
  score: number; // Percentage
  totalQuestions: number;
  correctAnswers: number;
}
