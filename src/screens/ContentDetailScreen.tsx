import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
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
import { ContentViewMode, LibraryStackParamList } from "../types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<LibraryStackParamList, "ContentDetail">;

const viewModes: { key: ContentViewMode; label: string }[] = [
  { key: "flashcard", label: "Flashcard" },
  { key: "exercicios", label: "Exercícios" },
  { key: "resumos", label: "Resumos" },
];

const mockContent: Record<
  Exclude<ContentViewMode, "flashcard">,
  { title: string; items: string[] }
> = {
  exercicios: {
    title: "Exercícios",
    items: [
      "1. Resolva: 2x + 5 = 15",
      "2. Determine o valor de x: 3x - 7 = 8",
      "3. Resolva: 5(x + 2) = 25",
      "4. Encontre x: x/4 + 3 = 7",
    ],
  },
  resumos: {
    title: "Resumos",
    items: [
      "Equações do 1º grau possuem expoente 1 na incógnita.",
      "Para resolver, isole a incógnita usando operações inversas.",
      "Sempre verifique a solução substituindo na equação original.",
      "Equações equivalentes mantêm o mesmo conjunto solução.",
    ],
  },
};

export default function ContentDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { topicId, subjectTitle, subjectSubtitle, topicTitle } = route.params;
  const { getFlashcardsByTopic, addFlashcard } = useLibrary();
  const [activeMode, setActiveMode] = useState<ContentViewMode>("flashcard");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const flashcards = getFlashcardsByTopic(topicId);
  const unreviewedFlashcards = flashcards.filter((card) => !card.reviewed);

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

  const mockItems =
    activeMode !== "flashcard"
      ? mockContent[activeMode].items.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : [];

  function handleStartStudy(startIndex = 0) {
    const studyCards = unreviewedFlashcards.length > 0 ? unreviewedFlashcards : flashcards;
    if (studyCards.length === 0) {
      return;
    }

    navigation.navigate("FlashcardStudy", {
      topicId,
      subjectTitle,
      topicTitle,
      startIndex,
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
              onPress={() => handleStartStudy(index)}
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

  function renderMockContent() {
    const content = mockContent[activeMode as Exclude<ContentViewMode, "flashcard">];

    return (
      <>
        <Text style={styles.sectionTitle}>{content.title}</Text>
        {mockItems.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item encontrado</Text>
        ) : (
          mockItems.map((item, index) => (
            <View key={`${activeMode}-${index}`} style={styles.contentCard}>
              <View style={styles.contentIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.contentText}>{item}</Text>
            </View>
          ))
        )}
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
          : renderMockContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  studyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
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
    backgroundColor: "#EFF6FF",
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
    backgroundColor: colors.white,
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
