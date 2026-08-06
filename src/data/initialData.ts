import { Subject } from "../types";

export const initialSubjects: Subject[] = [
  {
    id: "1",
    title: "Matemática",
    subtitle: "Conteúdo de exatas",
    icon: "calculator",
    iconColor: "#2563EB",
    iconBackground: "#DBEAFE",
    topics: [
      { id: "1-1", title: "Equações do 1º Grau" },
      { id: "1-2", title: "Equações do 2º Grau" },
      { id: "1-3", title: "Sistemas Lineares" },
      { id: "1-4", title: "Função Quadrática" },
      { id: "1-5", title: "Polinômios" },
      { id: "1-6", title: "Inequações" },
    ],
  },
  {
    id: "2",
    title: "Física",
    subtitle: "Conteúdo de exatas",
    icon: "atom",
    iconColor: "#7C3AED",
    iconBackground: "#EDE9FE",
    topics: [
      { id: "2-1", title: "Cinemática" },
      { id: "2-2", title: "Dinâmica" },
      { id: "2-3", title: "Termodinâmica" },
    ],
  },
  {
    id: "3",
    title: "Química",
    subtitle: "Conteúdo de exatas",
    icon: "flask",
    iconColor: "#16A34A",
    iconBackground: "#DCFCE7",
    topics: [
      { id: "3-1", title: "Tabela Periódica" },
      { id: "3-2", title: "Ligações Químicas" },
      { id: "3-3", title: "Reações Químicas" },
    ],
  },
  {
    id: "4",
    title: "História",
    subtitle: "Conteúdo de humanas",
    icon: "book",
    iconColor: "#B45309",
    iconBackground: "#FEF3C7",
    topics: [
      { id: "4-1", title: "Brasil Colônia" },
      { id: "4-2", title: "Império" },
      { id: "4-3", title: "República" },
    ],
  },
  {
    id: "5",
    title: "Biologia",
    subtitle: "Conteúdo de natureza",
    icon: "dna",
    iconColor: "#0D9488",
    iconBackground: "#CCFBF1",
    topics: [
      { id: "5-1", title: "Citologia" },
      { id: "5-2", title: "Genética" },
      { id: "5-3", title: "Ecologia" },
    ],
  },
];

export const iconOptions = [
  { icon: "calculator" as const, color: "#2563EB", background: "#DBEAFE" },
  { icon: "atom" as const, color: "#7C3AED", background: "#EDE9FE" },
  { icon: "flask" as const, color: "#16A34A", background: "#DCFCE7" },
  { icon: "book" as const, color: "#B45309", background: "#FEF3C7" },
  { icon: "dna" as const, color: "#0D9488", background: "#CCFBF1" },
  { icon: "default" as const, color: "#64748B", background: "#F1F5F9" },
];
