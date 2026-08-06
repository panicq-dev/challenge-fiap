import { Flashcard } from "../types";

export const initialFlashcards: Flashcard[] = [
  {
    id: "fc-1",
    topicId: "1-1",
    front: "Como é representado o coeficiente linear numa equação?",
    back: "Pela letra b na forma ax + b = 0, onde b é o termo independente.",
  },
  {
    id: "fc-2",
    topicId: "1-1",
    front: "O que é uma equação do 1º grau?",
    back: "Uma equação em que a incógnita aparece com expoente 1.",
  },
  {
    id: "fc-3",
    topicId: "1-1",
    front: "Qual a forma geral de uma equação do 1º grau?",
    back: "ax + b = 0, com a ≠ 0.",
  },
  {
    id: "fc-4",
    topicId: "1-1",
    front: "Como verificar se a solução está correta?",
    back: "Substituindo o valor de x na equação original e confirmando a igualdade.",
  },
];
