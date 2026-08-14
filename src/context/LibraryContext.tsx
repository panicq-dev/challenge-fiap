import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { initialFlashcards } from "../data/initialFlashcards";
import { initialSubjects } from "../data/initialData";
import { generateStudyContentFromText } from "../services/localAi";
import {
  Flashcard,
  FlashcardDifficulty,
  GeneratedStudyContent,
  Subject,
  SubjectIcon,
} from "../types";

interface CreateSubjectInput {
  title: string;
  subtitle: string;
  icon?: SubjectIcon;
}

interface CreateFlashcardInput {
  topicId: string;
  front: string;
  back: string;
  difficulty?: FlashcardDifficulty;
}

interface LibraryContextValue {
  subjects: Subject[];
  flashcards: Flashcard[];
  studyContentByTopic: Record<string, GeneratedStudyContent>;
  addSubject: (input: CreateSubjectInput) => void;
  addTopic: (subjectId: string, title: string) => void;
  addFlashcard: (input: CreateFlashcardInput) => void;
  markFlashcardReviewed: (flashcardId: string, difficulty: FlashcardDifficulty) => void;
  getFlashcardsByTopic: (topicId: string) => Flashcard[];
  getDueFlashcards: () => Flashcard[];
  getStudyContentByTopic: (topicId: string) => GeneratedStudyContent | undefined;
  generateStudyContent: (
    topicId: string,
    sourceText: string,
    topicTitle?: string,
  ) => Promise<GeneratedStudyContent | null>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function pickIconOption(index: number) {
  const options = [
    { icon: "calculator" as const, color: "#2563EB", background: "#DBEAFE" },
    { icon: "atom" as const, color: "#7C3AED", background: "#EDE9FE" },
    { icon: "flask" as const, color: "#16A34A", background: "#DCFCE7" },
    { icon: "book" as const, color: "#B45309", background: "#FEF3C7" },
    { icon: "dna" as const, color: "#0D9488", background: "#CCFBF1" },
    { icon: "default" as const, color: "#64748B", background: "#F1F5F9" },
  ];

  return options[index % options.length];
}

const REVIEW_INTERVALS_MS: Record<FlashcardDifficulty, number> = {
  hard: 3 * 60 * 60 * 1000,
  medium: 2 * 24 * 60 * 60 * 1000,
  easy: 5 * 24 * 60 * 60 * 1000,
};

function getNextReviewAt(difficulty: FlashcardDifficulty) {
  return Date.now() + REVIEW_INTERVALS_MS[difficulty];
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [studyContentByTopic, setStudyContentByTopic] = useState<
    Record<string, GeneratedStudyContent>
  >({});

  const addSubject = useCallback((input: CreateSubjectInput) => {
    const trimmedTitle = input.title.trim();
    if (!trimmedTitle) {
      return;
    }

    setSubjects((current) => {
      const iconOption = pickIconOption(current.length);

      const newSubject: Subject = {
        id: Date.now().toString(),
        title: trimmedTitle,
        subtitle: input.subtitle.trim() || "Nova matéria",
        icon: input.icon ?? iconOption.icon,
        iconColor: iconOption.color,
        iconBackground: iconOption.background,
        topics: [],
      };

      return [...current, newSubject];
    });
  }, []);

  const addTopic = useCallback((subjectId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    setSubjects((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              topics: [
                ...subject.topics,
                { id: `${subjectId}-${Date.now()}`, title: trimmedTitle },
              ],
            }
          : subject,
      ),
    );
  }, []);

  const addFlashcard = useCallback((input: CreateFlashcardInput) => {
    const front = input.front.trim();
    const back = input.back.trim();
    const difficulty = input.difficulty ?? "medium";
    if (!front || !back) {
      return;
    }

    const newFlashcard: Flashcard = {
      id: `fc-${Date.now()}`,
      topicId: input.topicId,
      front,
      back,
      reviewed: false,
      ok: difficulty !== "hard",
      reviewedCount: 0,
      lastReviewedAt: undefined,
      difficulty,
      nextReviewAt: Date.now(),
    };

    setFlashcards((current) => [...current, newFlashcard]);
  }, []);

  const markFlashcardReviewed = useCallback(
    (flashcardId: string, difficulty: FlashcardDifficulty) => {
      setFlashcards((current) =>
        current.map((fc) =>
          fc.id === flashcardId
            ? {
                ...fc,
                reviewed: true,
                ok: difficulty !== "hard",
                difficulty,
                reviewedCount: (fc.reviewedCount ?? 0) + 1,
                lastReviewedAt: Date.now(),
                nextReviewAt: getNextReviewAt(difficulty),
              }
            : fc,
        ),
      );
    },
    [],
  );

  const getFlashcardsByTopic = useCallback(
    (topicId: string) =>
      flashcards.filter((flashcard) => flashcard.topicId === topicId),
    [flashcards],
  );

  const getDueFlashcards = useCallback(() => {
    const now = Date.now();
    return flashcards
      .filter((flashcard) => flashcard.nextReviewAt === undefined || flashcard.nextReviewAt <= now)
      .sort((a, b) => {
        const priority: Record<FlashcardDifficulty, number> = { hard: 0, medium: 1, easy: 2 };
        const aPri = priority[a.difficulty];
        const bPri = priority[b.difficulty];
        if (aPri !== bPri) return aPri - bPri;
        return (b.lastReviewedAt ?? 0) - (a.lastReviewedAt ?? 0);
      });
  }, [flashcards]);

  const getStudyContentByTopic = useCallback(
    (topicId: string) => studyContentByTopic[topicId],
    [studyContentByTopic],
  );

  const generateStudyContent = useCallback(
    async (topicId: string, sourceText: string, topicTitle?: string) => {
      const trimmedText = sourceText.trim();
      if (!trimmedText) {
        return null;
      }

      const generated = await generateStudyContentFromText(topicId, trimmedText, topicTitle);

      setStudyContentByTopic((current) => ({
        ...current,
        [topicId]: generated,
      }));

      return generated;
    },
    [],
  );

  const value = useMemo(
    () => ({
      subjects,
      flashcards,
      studyContentByTopic,
      addSubject,
      addTopic,
      addFlashcard,
      markFlashcardReviewed,
      getFlashcardsByTopic,
      getDueFlashcards,
      getStudyContentByTopic,
      generateStudyContent,
    }),
    [subjects, flashcards, studyContentByTopic, addSubject, addTopic, addFlashcard, markFlashcardReviewed, getFlashcardsByTopic, getDueFlashcards, getStudyContentByTopic, generateStudyContent],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }

  return context;
}
