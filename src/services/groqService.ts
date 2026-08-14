export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqCompletionRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface GroqCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message?: string;
    type?: string;
  };
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_SYSTEM_PROMPT =
  "Você é um assistente especialista em resumos. Resuma o texto fornecido de forma clara, direta e organizada em tópicos em português.";

function getGroqApiKey() {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!key || !key.trim()) {
    throw new Error("Groq API key não configurada. Defina EXPO_PUBLIC_GROQ_API_KEY no ambiente do Expo.");
  }

  return key.trim();
}

function normalizeSummaryText(content: string) {
  return content
    .replace(/```(?:json|txt|md)?/gi, "")
    .replace(/^Resumo\s*:\s*/i, "")
    .replace(/^\s*[-*]\s*/gm, "• ")
    .trim();
}

export async function summarizeTextWithGroq(text: string): Promise<string> {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("O texto OCR está vazio.");
  }

  const payload: GroqCompletionRequest = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: GROQ_SYSTEM_PROMPT },
      { role: "user", content: cleanText },
    ],
    temperature: 0.2,
    max_tokens: 600,
  };

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getGroqApiKey()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as GroqCompletionResponse;

    if (!response.ok) {
      const message = data?.error?.message ?? "Falha desconhecida na API da Groq.";
      throw new Error(message);
    }

    const generatedText = data?.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error("A API da Groq não retornou um resumo válido.");
    }

    return normalizeSummaryText(generatedText);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Não foi possível gerar o resumo na Groq.");
  }
}
