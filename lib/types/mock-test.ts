// Mock Test Types

// Mock Test
export interface MockTest {
  id: string;
  title: string;
  description: string;
  category: "reading" | "listening" | "writing" | "speaking";
  createdBy: string; // Moderator ID
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  scheduledDate?: string; // ISO date string
  duration: number; // in minutes
  totalMarks: number;
  instructions?: string;
}

// Question Types
export type QuestionType = 
  | "multiple_choice" 
  | "fill_blank" 
  | "essay" 
  | "speaking" 
  | "matching" 
  | "reorder" 
  | "true_false"
  | "short_answer";

// Option for multiple choice questions
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  image?: string; // URL to image (optional)
}

// Question
export interface Question {
  id: string;
  mockTestId: string;
  questionType: QuestionType;
  questionText: string;
  questionImage?: string; // URL to image (optional)
  audioUrl?: string; // URL to audio file (for listening questions)
  options?: QuestionOption[]; // For multiple choice questions
  correctAnswer?: string | string[]; // The correct answer(s)
  marks: number;
  order: number; // Question sequence in the test
  timeLimit?: number; // Time limit in seconds (for timed questions)
  instructions?: string;
}

// Student Attempt
export interface StudentAttempt {
  id: string;
  userId: string;
  mockTestId: string;
  startedAt: string;
  completedAt?: string;
  status: "in_progress" | "completed" | "abandoned";
  totalScore?: number;
  percentageScore?: number;
  feedback?: string;
  gradedBy?: string; // Moderator ID or "ai" for AI grading
  gradedAt?: string;
}

// Student Response
export interface StudentResponse {
  id: string;
  attemptId: string;
  questionId: string;
  response: string | string[] | { [key: string]: any }; // Student's answer
  isCorrect?: boolean;
  score?: number;
  audioResponse?: string; // URL to recorded audio (for speaking questions)
  imageResponse?: string; // URL to uploaded image (for writing questions)
  feedback?: string;
  gradedBy?: "ai" | "manual"; // Whether graded by AI or manually
  gradedAt?: string;
  aiScore?: number; // Score given by AI
  manualScore?: number; // Score given by moderator
  finalScore?: number; // Final score (can be adjusted by moderator)
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  mockTestId?: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: "upcoming_test" | "result_available" | "feedback" | "system";
}

// Analytics
export interface TestAnalytics {
  userId: string;
  mockTestId: string;
  category: "reading" | "listening" | "writing" | "speaking";
  score: number;
  percentageScore: number;
  completedAt: string;
  timeSpent: number; // in seconds
  questionsAttempted: number;
  questionsCorrect: number;
  strengths?: string[];
  weaknesses?: string[];
}

// Progress
export interface UserProgress {
  userId: string;
  category: "reading" | "listening" | "writing" | "speaking" | "overall";
  level: "beginner" | "intermediate" | "advanced" | "expert";
  score: number;
  testsCompleted: number;
  lastTestDate: string;
  improvementAreas?: string[];
}
