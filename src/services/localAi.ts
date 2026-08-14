export interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StudyExercise {
  id: string;
  prompt: string;
  options: ExerciseOption[];
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

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function buildSummary(sourceText: string, topicTitle?: string): StudySummary {
  const cleanText = normalizeText(sourceText);
  const sentences = cleanText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const preview = sentences.slice(0, 3).join(" ");

  return {
    id: `summary-${Date.now()}`,
    title: topicTitle ? `Resumo de ${topicTitle}` : "Resumo gerado pela IA",
    text:
      preview.length > 0
        ? preview
        : "O conteúdo foi identificado e resumido com foco nos pontos centrais do tema.",
    bullets:
      sentences.length > 0
        ? sentences.slice(0, 4).map((sentence) => sentence.trim())
        : [
            "O texto foi reconhecido corretamente pela etapa de OCR.",
            "A IA organiza os conceitos mais importantes em uma visão geral.",
            "Os principais pontos-chave são reutilizados em seguida para gerar exercícios.",
          ],
  };
}

function buildExercise(sourceText: string, topicTitle?: string): StudyExercise {
  const cleanText = normalizeText(sourceText);
  const keywords = cleanText
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 4);

  const subject = topicTitle ?? "tema estudado";
  const question =
    keywords.length > 0
      ? `Qual dos itens abaixo melhor resume o conceito principal de ${subject} descrito no texto?`
      : `Qual alternativa melhor descreve a ideia central do conteúdo relacionado a ${subject}?`;

  const correctText =
    keywords.length > 0
      ? `O texto destaca ${keywords.join(", ")} como elementos centrais do tema.`
      : "O texto enfatiza os principais conceitos e a relação entre eles.";

  return {
    id: `exercise-${Date.now()}`,
    prompt: question,
    options: [
      { id: "a", text: correctText, isCorrect: true },
      { id: "b", text: "O texto trata apenas de detalhes irrelevantes e desconectados do tema principal.", isCorrect: false },
      { id: "c", text: "A ideia central é ignorar a estrutura do raciocínio e usar uma resposta memorística sem contexto.", isCorrect: false },
      { id: "d", text: "O conteúdo não possui relação com o assunto, sendo apenas uma lista de palavras soltas.", isCorrect: false },
    ],
    explanation:
      "A alternativa correta é a que reforça a ideia central do texto e a organização dos conceitos, em vez de focar em detalhes irrelevantes ou interpretações equivocadas.",
  };
}

export async function generateStudyContentFromText(
  topicId: string,
  sourceText: string,
  topicTitle?: string,
): Promise<GeneratedStudyContent> {
  const text = normalizeText(sourceText) || "Texto vazio. A IA receberá o conteúdo extraído via OCR para gerar resumo e exercício.";

  return {
    id: `content-${Date.now()}`,
    topicId,
    sourceText: text,
    summary: buildSummary(text, topicTitle),
    exercise: buildExercise(text, topicTitle),
    generatedAt: Date.now(),
  };
}
