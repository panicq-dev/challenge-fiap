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

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  reviewed?: boolean;
  ok?: boolean;
  reviewedCount?: number;
  lastReviewedAt?: number;
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
  LibraryMain: undefined;
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
