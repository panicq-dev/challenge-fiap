import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CreateFlashcardModal from "../components/CreateFlashcardModal";
import { useLibrary } from "../context/LibraryContext";
import { useSettings } from "../context/SettingsContext";
import { summarizeTextWithGroq } from "../services/groqService";
import { extractTextFromSelectedImage } from "../services/ocr";
import { ContentViewMode, LibraryStackParamList } from "../types";
import { ThemeColors } from "../theme/colors";

type Props = NativeStackScreenProps<LibraryStackParamList, "ContentDetail">;

const viewModes: { key: ContentViewMode; label: string }[] = [
  { key: "flashcard", label: "Flashcard" },
  { key: "exercicios", label: "Exercícios" },
  { key: "resumos", label: "Resumos" },
];

export default function ContentDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { topicId, subjectTitle, subjectSubtitle, topicTitle } = route.params;
  const { colors } = useSettings();
  const styles = createStyles(colors);
  const {
    getFlashcardsByTopic,
    addFlashcard,
    getStudyContentByTopic,
    generateStudyContent,
  } = useLibrary();
  const [activeMode, setActiveMode] = useState<ContentViewMode>("flashcard");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");

  const flashcards = getFlashcardsByTopic(topicId);
  const dueFlashcards = flashcards.filter(
    (card) => card.nextReviewAt === undefined || card.nextReviewAt <= Date.now(),
  );
  const unreviewedFlashcards = flashcards.filter((card) => !card.reviewed);
  const generatedContent = getStudyContentByTopic(topicId);

  useEffect(() => {
    if (!generatedContent && activeMode !== "flashcard") {
      setIsGenerating(true);

      const generatedText = [
        `O tema ${topicTitle} envolve conceitos fundamentais para o estudo desta disciplina.`,
        "A partir da leitura do material, é possível identificar os pontos principais, as relações entre ideias e os princípios que sustentam o assunto.",
        "Esses elementos ajudam a organizar o raciocínio, revisar os conteúdos e responder exercícios de forma mais segura.",
      ].join(" ");

      generateStudyContent(topicId, generatedText, topicTitle)
        .catch(() => null)
        .finally(() => setIsGenerating(false));
    }
  }, [activeMode, generateStudyContent, generatedContent, topicId, topicTitle]);

  const filteredFlashcards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return flashcards;
    }

    return flashcards.filter(
      (card) =>
        card.front.toLowerCase().includes(query) ||
        card.back.toLowerCase().includes(query),
    );
  }, [flashcards, searchQuery]);

  const exerciseItems = useMemo(() => {
    if (activeMode !== "exercicios" || !generatedContent) {
      return [];
    }

    return [
      generatedContent.exercise.prompt,
      ...generatedContent.exercise.options.map((option) => `${option.id.toUpperCase()}) ${option.text}`),
    ];
  }, [activeMode, generatedContent]);

  const summaryItems = useMemo(() => {
    if (activeMode !== "resumos" || !generatedContent) {
      return [];
    }

    return generatedContent.summary.bullets;
  }, [activeMode, generatedContent]);

  function handleStartStudy(startIndex = 0, flashcardId?: string) {
    const studyCards = unreviewedFlashcards.length > 0 ? unreviewedFlashcards : dueFlashcards.length > 0 ? dueFlashcards : flashcards;
    if (studyCards.length === 0) {
      return;
    }

    const chosenIndex = flashcardId
      ? studyCards.findIndex((card) => card.id === flashcardId)
      : studyCards.findIndex((card) => card.id === flashcards[startIndex]?.id);

    navigation.navigate("FlashcardStudy", {
      topicId,
      subjectTitle,
      topicTitle,
      startIndex: chosenIndex >= 0 ? chosenIndex : 0,
      flashcardId: flashcardId,
      reviewOnlyUnreviewed: unreviewedFlashcards.length > 0,
    });
  }

  function renderFlashcardContent() {
    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Flashcards ({filteredFlashcards.length})
          </Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </Pressable>
        </View>

        {filteredFlashcards.length > 0 && (
          <Pressable style={styles.studyBanner} onPress={() => handleStartStudy()}>
            <View style={styles.studyBannerIcon}>
              <Ionicons name="play" size={20} color={colors.primary} />
            </View>
            <View style={styles.studyBannerText}>
              <Text style={styles.studyBannerTitle}>Estudar flashcards</Text>
              <Text style={styles.studyBannerSubtitle}>
                {flashcards.length} cards disponíveis
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}

        {filteredFlashcards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="layers-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>Nenhum flashcard ainda</Text>
            <Text style={styles.emptySubtext}>
              Adicione flashcards com frente e verso para começar a estudar
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Criar primeiro flashcard</Text>
            </Pressable>
          </View>
        ) : (
          filteredFlashcards.map((card, index) => (
            <Pressable
              key={card.id}
              style={styles.contentCard}
              onPress={() => handleStartStudy(index, card.id)}
            >
              <View style={styles.contentIcon}>
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.flashcardContent}>
                <Text style={styles.flashcardFront}>{card.front}</Text>
                <Text style={styles.flashcardBack} numberOfLines={1}>
                  {card.back}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))
        )}

        <CreateFlashcardModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={(front, back) =>
            addFlashcard({ topicId, front, back })
          }
        />
      </>
    );
  }

  async function handleGenerateFromImage() {
    setIsExtractingOcr(true);
    setSummaryError(null);
    setSummary("");
    setOcrText("");

    try {
      const extractedText = await extractTextFromSelectedImage();
      if (!extractedText) {
        setSummaryError("Nenhum texto foi encontrado na imagem.");
        return;
      }

      setOcrText(extractedText);
      setIsSummarizing(true);
      const generatedSummary = await summarizeTextWithGroq(extractedText);
      setSummary(generatedSummary);
      await generateStudyContent(topicId, extractedText, topicTitle);
      setActiveMode("resumos");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao processar a imagem.";
      setSummaryError(message);
      console.warn("Falha ao extrair ou resumir texto da imagem:", error);
    } finally {
      setIsExtractingOcr(false);
      setIsSummarizing(false);
    }
  }

  function renderGeneratedContent() {
    const isExerciseMode = activeMode === "exercicios";
    const items = isExerciseMode ? exerciseItems : summaryItems;
    const contentTitle = isExerciseMode
      ? generatedContent?.exercise?.prompt || "Exercícios"
      : generatedContent?.summary?.title || "Resumo";

    return (
      <>
        <Pressable
          style={styles.ocrButton}
          onPress={handleGenerateFromImage}
          disabled={isExtractingOcr || isSummarizing}
        >
          {isExtractingOcr || isSummarizing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="camera-outline" size={18} color={colors.white} />
          )}
          <Text style={styles.ocrButtonText}>
            {isExtractingOcr
              ? "Lendo imagem..."
              : isSummarizing
                ? "Gerando resumo..."
                : "Gerar com OCR"}
          </Text>
        </Pressable>

        {ocrText ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Texto extraído</Text>
            <Text style={styles.summaryText}>{ocrText}</Text>
          </View>
        ) : null}

        {summaryError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Erro ao gerar resumo</Text>
            <Text style={styles.errorText}>{summaryError}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{contentTitle}</Text>

        {isGenerating || isSummarizing ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isSummarizing ? "Gerando resumo..." : "Gerando conteúdo por IA local..."}
            </Text>
          </View>
        ) : !generatedContent ? (
          <Text style={styles.emptyText}>Nenhum conteúdo foi gerado ainda.</Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item encontrado</Text>
        ) : (
          items.map((item, index) => (
            <View key={`${activeMode}-${index}`} style={styles.contentCard}>
              <View style={styles.contentIcon}>
                <Ionicons
                  name={isExerciseMode ? "school-outline" : "document-text-outline"}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.contentText}>{item}</Text>
            </View>
          ))
        )}

        {!isExerciseMode && (summary || generatedContent?.summary?.text) ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo geral</Text>
            <Text style={styles.summaryText}>{summary || generatedContent?.summary?.text}</Text>
          </View>
        ) : null}

        {isExerciseMode && generatedContent?.exercise?.explanation ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Explicação</Text>
            <Text style={styles.summaryText}>{generatedContent.exercise.explanation}</Text>
          </View>
        ) : null}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable hitSlop={8}>
              <Ionicons name="share-outline" size={22} color={colors.white} />
            </Pressable>
            <Pressable hitSlop={8}>
              <Ionicons
                name="bookmark-outline"
                size={22}
                color={colors.white}
              />
            </Pressable>
          </View>
        </View>

        <Text style={styles.subjectTitle}>{subjectTitle}</Text>
        <Text style={styles.subjectSubtitle}>{subjectSubtitle}</Text>
        <Text style={styles.topicTitle}>{topicTitle}</Text>

        <View style={styles.tabs}>
          {viewModes.map((mode) => {
            const isActive = activeMode === mode.key;

            return (
              <Pressable
                key={mode.key}
                style={styles.tab}
                onPress={() => setActiveMode(mode.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {mode.label}
                </Text>
                {isActive && <View style={styles.tabIndicator} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeMode === "flashcard"
          ? renderFlashcardContent()
          : renderGeneratedContent()}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  subjectTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  subjectSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: "700",
  },
  tabIndicator: {
    height: 2,
    backgroundColor: colors.white,
    borderRadius: 1,
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  ocrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ocrButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  errorText: {
    color: "#7F1D1D",
    fontSize: 13,
    lineHeight: 20,
  },
  studyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  studyBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studyBannerText: {
    flex: 1,
  },
  studyBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  studyBannerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  flashcardContent: {
    flex: 1,
  },
  flashcardFront: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  flashcardBack: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  contentText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  loadingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
