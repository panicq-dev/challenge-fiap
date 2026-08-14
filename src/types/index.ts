export type ContentViewMode = "flashcard" | "exercicios" | "resumos";

export type SubjectIcon =
  | "calculator"
  | "atom"
  | "flask"
  | "book"
  | "dna"
  | "default";

export interface Topic {
  id: string;
  title: string;
}

export interface StudyExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StudyExercise {
  id: string;
  prompt: string;
  options: StudyExerciseOption[];
  explanation: string;
}

export interface StudySummary {
  id: string;
  title: string;
  text: string;
  bullets: string[];
}

export interface GeneratedStudyContent {
  id: string;
  topicId: string;
  sourceText: string;
  summary: StudySummary;
  exercise: StudyExercise;
  generatedAt: number;
}

export type FlashcardDifficulty = "easy" | "medium" | "hard";

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  reviewed?: boolean;
  ok?: boolean;
  reviewedCount?: number;
  lastReviewedAt?: number;
  difficulty: FlashcardDifficulty;
  nextReviewAt?: number;
}

export interface Subject {
  id: string;
  title: string;
  subtitle: string;
  icon: SubjectIcon;
  iconColor: string;
  iconBackground: string;
  topics: Topic[];
}

export type LibraryStackParamList = {
  LibraryMain: {
    openTopicId?: string;
    openSubjectTitle?: string;
    openSubjectSubtitle?: string;
    openTopicTitle?: string;
  } | undefined;
  ContentDetail: {
    topicId: string;
    subjectTitle: string;
    subjectSubtitle: string;
    topicTitle: string;
  };
  FlashcardStudy: {
    topicId: string;
    subjectTitle: string;
    topicTitle: string;
    startIndex?: number;
    flashcardId?: string;
    reviewOnlyUnreviewed?: boolean;
  };
};

export type RootTabParamList = {
  Home: undefined;
  Biblioteca: undefined;
  Conta: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Stats: undefined;
};

export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
}

export type ThemeMode = "light" | "dark";

export type AccountStackParamList = {
  AccountMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Privacy: undefined;
  Help: undefined;
};
