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
import { Flashcard, Subject, SubjectIcon } from "../types";

interface CreateSubjectInput {
  title: string;
  subtitle: string;
  icon?: SubjectIcon;
}

interface CreateFlashcardInput {
  topicId: string;
  front: string;
  back: string;
}

interface LibraryContextValue {
  subjects: Subject[];
  flashcards: Flashcard[];
  addSubject: (input: CreateSubjectInput) => void;
  addTopic: (subjectId: string, title: string) => void;
  addFlashcard: (input: CreateFlashcardInput) => void;
  getFlashcardsByTopic: (topicId: string) => Flashcard[];
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

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);

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
    if (!front || !back) {
      return;
    }

    const newFlashcard: Flashcard = {
      id: `fc-${Date.now()}`,
      topicId: input.topicId,
      front,
      back,
    };

    setFlashcards((current) => [...current, newFlashcard]);
  }, []);

  const getFlashcardsByTopic = useCallback(
    (topicId: string) =>
      flashcards.filter((flashcard) => flashcard.topicId === topicId),
    [flashcards],
  );

  const value = useMemo(
    () => ({
      subjects,
      flashcards,
      addSubject,
      addTopic,
      addFlashcard,
      getFlashcardsByTopic,
    }),
    [subjects, flashcards, addSubject, addTopic, addFlashcard, getFlashcardsByTopic],
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
