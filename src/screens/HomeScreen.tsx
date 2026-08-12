import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import SubjectStatsModal from "../components/SubjectStatsModal";

import { useLibrary } from "../context/LibraryContext";
import { useSettings } from "../context/SettingsContext";
import { RootTabParamList } from "../types";
import { ThemeColors } from "../theme/colors";
import { getSubjectIcon } from "../utils/icons";

const actionItems = [
  { key: "quiz", title: "Quiz", icon: "school-outline" },
  { key: "resumos", title: "Resumos", icon: "document-text-outline" },
] as const;

function isSameDay(timestamp: number, compareTo: number) {
  const date = new Date(timestamp);
  const other = new Date(compareTo);
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { subjects, flashcards, getDueFlashcards, getFlashcardsByTopic } = useLibrary();
  const { colors, theme, setTheme } = useSettings();
  const styles = useMemo(() => useMemoStyles(colors), [colors]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showDueModal, setShowDueModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const mode = theme;
  const toggleTheme = () => setTheme(mode === "light" ? "dark" : "light");

  const dueFlashcards = useMemo(() => getDueFlashcards().slice(0, 3), [getDueFlashcards]);
  const reviewedTodayCount = useMemo(
    () => flashcards.filter((card) => card.lastReviewedAt && isSameDay(card.lastReviewedAt, Date.now())).length,
    [flashcards],
  );
  const notReviewedCount = useMemo(
    () => flashcards.filter((card) => !card.reviewed).length,
    [flashcards],
  );

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return subjects;
    }

    return subjects.filter(
      (subject) =>
        subject.title.toLowerCase().includes(query) ||
        subject.subtitle.toLowerCase().includes(query) ||
        subject.topics.some((topic) => topic.title.toLowerCase().includes(query)),
    );
  }, [subjects, searchQuery]);

  const dueModalItems = useMemo(() => getDueFlashcards().slice(0, 6), [getDueFlashcards]);

  const subjectCards = useMemo(
    () =>
      filteredSubjects.slice(0, 3).map((subject) => {
        const subjectFlashcards = flashcards.filter((fc) =>
          subject.topics.some((t) => t.id === fc.topicId),
        );
        const totalFlashcards = subjectFlashcards.length;
        const reviewedFlashcards = subjectFlashcards.filter((f) => f.reviewed).length;

        return {
          ...subject,
          progress: totalFlashcards > 0 ? Math.round((reviewedFlashcards / totalFlashcards) * 100) : 0,
          topicCountLabel:
            subject.topics.length === 1 ? "1 tópico" : `${subject.topics.length} tópicos`,
        };
      }),
    [filteredSubjects, flashcards],
  );

  const subjectPerformance = useMemo(
    () =>
      subjects.map((subject) => {
        const subjectFlashcards = flashcards.filter((fc) =>
          subject.topics.some((t) => t.id === fc.topicId),
        );
        const totalFlashcards = subjectFlashcards.length;
        const reviewedFlashcards = subjectFlashcards.filter((f) => f.reviewed).length;
        const dueCount = subjectFlashcards.filter(
          (fc) => fc.nextReviewAt === undefined || fc.nextReviewAt <= Date.now(),
        ).length;

        return {
          ...subject,
          totalFlashcards,
          reviewedFlashcards,
          dueCount,
          progress: totalFlashcards > 0 ? Math.round((reviewedFlashcards / totalFlashcards) * 100) : 0,
        };
      }),
    [subjects, flashcards],
  );

  const recentTopics = useMemo(() => {
    const topicsWithStudy = subjects
      .flatMap((subject) =>
        subject.topics.map((topic) => {
          const topicFlashcards = flashcards.filter((card) => card.topicId === topic.id);
          const lastReviewed = topicFlashcards.reduce((acc, cur) => {
            if (!cur.lastReviewedAt) return acc;
            return Math.max(acc, cur.lastReviewedAt);
          }, 0 as number);

          return { subject, topic, lastReviewed };
        }),
      )
      .filter(({ lastReviewed }) => lastReviewed > 0)
      .sort((a, b) => b.lastReviewed - a.lastReviewed);

    if (topicsWithStudy.length > 0) {
      return topicsWithStudy.slice(0, 3).map(({ subject, topic }) => ({ subject, topic }));
    }

    return subjects
      .slice(0, 2)
      .flatMap((subject) => subject.topics.slice(0, 1))
      .map((topic) => ({ subject: subjects.find((subj) => subj.topics.includes(topic))!, topic }));
  }, [subjects, flashcards]);

  function handleViewAll() {
    setShowDueModal(true);
  }

  function handleViewAllPerformance() {
    setShowPerformanceModal(true);
  }

  function renderSubjectCard({ item }: { item: (typeof subjectCards)[number] }) {
    return (
      <Pressable
        style={[styles.subjectCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={() => setSelectedSubject(item.id)}
      >
        <View style={[styles.subjectIcon, { backgroundColor: item.iconBackground }]}>
          {getSubjectIcon(item.icon, 22, item.iconColor)}
        </View>
        <Text style={[styles.subjectTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.subjectSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        <View style={styles.subjectFooter}>
          <Text style={[styles.subjectProgress, { color: colors.primary }]}>{item.progress}% completo</Text>
          <Text style={[styles.subjectTopics, { color: colors.textSecondary }]}>{item.topicCountLabel}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={[styles.brand, { color: colors.text }]}>NOTEZ</Text>
          <Pressable
            style={[styles.themeButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={toggleTheme}
            hitSlop={8}
          >
            <Ionicons
              name={mode === "dark" ? "sunny-outline" : "moon-outline"}
              size={20}
              color={colors.text}
            />
          </Pressable>
        </View>

        <Text style={[styles.greeting, { color: colors.text }]}>Olá, Estudante!</Text>
        <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>Continue de onde parou</Text>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar materiais, tópicos..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={[styles.statusRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Revisados hoje</Text>
            <Text style={[styles.statusValue, { color: colors.primary }]}>{reviewedTodayCount}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Não revisados</Text>
            <Text style={[styles.statusValue, { color: colors.danger || "#EF4444" }]}>{notReviewedCount}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Agendados</Text>
            <Text style={[styles.statusValue, { color: colors.primary }]}>{dueFlashcards.length}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Revisão agendada</Text>
            <Text style={styles.sectionSubtitle}>Os cards difíceis e médios aparecem primeiro</Text>
          </View>
          <Pressable onPress={handleViewAll}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </Pressable>
        </View>

        {dueFlashcards.length > 0 ? (
          <FlatList
            data={dueFlashcards}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const subject = subjects.find((subj) => subj.topics.some((topic) => topic.id === item.topicId));
              return (
                <Pressable
                  style={[styles.dueCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => {
                    const topicTitle = subject?.topics.find((t) => t.id === item.topicId)?.title ?? "";

                    navigation.navigate("Biblioteca" as any, {
                      screen: "FlashcardStudy",
                      params: {
                        topicId: item.topicId,
                        subjectTitle: subject?.title ?? "",
                        topicTitle,
                        startIndex: 0,
                        flashcardId: item.id,
                      },
                    });
                  }}
                >
                  <Text style={[styles.dueCardTitle, { color: colors.text }]} numberOfLines={2}>{item.front}</Text>
                  <View style={styles.dueMetaRow}>
                    <Text style={[styles.dueTag, item.difficulty === "hard" ? styles.difficultyHard : item.difficulty === "medium" ? styles.difficultyMedium : styles.difficultyEasy]}>
                      {item.difficulty === "hard" ? "Difícil" : item.difficulty === "medium" ? "Médio" : "Fácil"}
                    </Text>
                    <Text style={[styles.dueWhen, { color: colors.textSecondary }]}>Agora</Text>
                  </View>
                </Pressable>
              );
            }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectList}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
            <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum flashcard agendado para agora.</Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Continue estudando suas matérias para agendar novos cards.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Desempenho geral</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredSubjects.length} matérias disponíveis
            </Text>
          </View>
          <Pressable onPress={handleViewAllPerformance}>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </Pressable>
        </View>

        <FlatList
          data={subjectCards}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderSubjectCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectList}
        />

        <SubjectStatsModal subjectId={selectedSubject} visible={!!selectedSubject} onClose={() => setSelectedSubject(null)} />

        <View style={styles.sectionHeader}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estudado recentemente</Text>
        </View>

        {recentTopics.map(({ subject, topic }) => (
          <Pressable
            key={topic.id}
            style={[styles.recentCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("Biblioteca" as any, {
                screen: "LibraryMain",
                params: {
                  openTopicId: topic.id,
                  openSubjectTitle: subject.title,
                  openSubjectSubtitle: subject.subtitle,
                  openTopicTitle: topic.title,
                },
              })
            }
          >
            <View style={[styles.recentIcon, { backgroundColor: subject.iconBackground }]}>
              {getSubjectIcon(subject.icon, 20, subject.iconColor)}
            </View>
            <View style={styles.recentInfo}>
              <Text style={[styles.recentTopic, { color: colors.text }]}>{topic.title}</Text>
              <Text style={[styles.recentSubject, { color: colors.textSecondary }]}>{subject.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
        <Modal visible={showDueModal} transparent animationType="slide" onRequestClose={() => setShowDueModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Revisões agendadas</Text>
                <Pressable onPress={() => setShowDueModal(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              {dueModalItems.length === 0 ? (
                <Text style={[styles.modalEmptyText, { color: colors.textSecondary }]}>Nenhum flashcard agendado no momento.</Text>
              ) : (
                dueModalItems.map((item) => {
                  const subject = subjects.find((subj) => subj.topics.some((topic) => topic.id === item.topicId));
                  const topicTitle = subject?.topics.find((t) => t.id === item.topicId)?.title ?? "";
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.modalItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {
                        setShowDueModal(false);
                        navigation.navigate("Biblioteca" as any, {
                          screen: "FlashcardStudy",
                          params: {
                            topicId: item.topicId,
                            subjectTitle: subject?.title ?? "",
                            topicTitle,
                            startIndex: 0,
                            flashcardId: item.id,
                          },
                        });
                      }}
                    >
                      <View style={styles.modalItemHeader}>
                        <Text style={[styles.modalItemTitle, { color: colors.text }]} numberOfLines={1}>{topicTitle}</Text>
                        <Text style={[styles.modalItemBadge, item.difficulty === "hard" ? styles.difficultyHard : item.difficulty === "medium" ? styles.difficultyMedium : styles.difficultyEasy]}>
                          {item.difficulty === "hard" ? "Difícil" : item.difficulty === "medium" ? "Médio" : "Fácil"}
                        </Text>
                      </View>
                      <Text style={[styles.modalItemText, { color: colors.textSecondary }]} numberOfLines={2}>{item.front}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        </Modal>

        <Modal visible={showPerformanceModal} transparent animationType="slide" onRequestClose={() => setShowPerformanceModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Desempenho por matéria</Text>
                <Pressable onPress={() => setShowPerformanceModal(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              {subjectPerformance.map((subject) => (
                <View key={subject.id} style={[styles.performanceItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                  <View style={styles.performanceHeader}>
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{subject.title}</Text>
                    <Text style={[styles.performanceProgress, { color: colors.primary }]}>{subject.progress}%</Text>
                  </View>
                  <Text style={[styles.modalItemText, { color: colors.textSecondary }]}>{subject.subtitle}</Text>
                  <View style={styles.performanceStats}>
                    <Text style={[styles.performanceStat, { color: colors.text }]}>{subject.reviewedFlashcards}/{subject.totalFlashcards} revisados</Text>
                    <Text style={[styles.performanceStat, { color: colors.text }]}>{subject.dueCount} agendados</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const useMemoStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    brand: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 1,
    },
    greeting: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    greetingSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 18,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      backgroundColor: colors.cardBackground,
    },
    statusItem: {
      alignItems: "center",
      flex: 1,
    },
    statusLabel: {
      fontSize: 12,
      marginBottom: 4,
    },
    statusValue: {
      fontSize: 18,
      fontWeight: "800",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },
    subjectList: {
      paddingBottom: 16,
    },
    subjectCard: {
      width: 240,
      marginRight: 16,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
    },
    subjectIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    subjectTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 6,
    },
    subjectSubtitle: {
      fontSize: 13,
      marginBottom: 18,
    },
    subjectFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    subjectProgress: {
      fontSize: 13,
      fontWeight: "700",
    },
    subjectTopics: {
      fontSize: 12,
    },
    recentCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    recentIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    recentInfo: {
      flex: 1,
    },
    recentTopic: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 2,
    },
    recentSubject: {
      fontSize: 13,
    },
    dueCard: {
      width: 220,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 16,
    },
    dueCardTitle: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 12,
    },
    dueMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dueTag: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: "700",
      color: colors.white,
    },
    difficultyHard: {
      backgroundColor: "#DC2626",
    },
    difficultyMedium: {
      backgroundColor: "#F59E0B",
    },
    difficultyEasy: {
      backgroundColor: "#10B981",
    },
    dueWhen: {
      fontSize: 12,
    },
    emptyState: {
      borderRadius: 24,
      borderWidth: 1,
      marginBottom: 20,
      padding: 18,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 6,
    },
    emptyHint: {
      fontSize: 13,
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "75%",
      borderWidth: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
    },
    modalEmptyText: {
      fontSize: 15,
      textAlign: "center",
      marginTop: 24,
    },
    modalItem: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
    },
    modalItemHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    modalItemTitle: {
      fontSize: 15,
      fontWeight: "700",
      flex: 1,
      marginRight: 10,
    },
    modalItemBadge: {
      fontSize: 11,
      fontWeight: "700",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      overflow: "hidden",
      color: "#FFFFFF",
    },
    modalItemText: {
      fontSize: 13,
      lineHeight: 20,
    },
    performanceItem: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
    },
    performanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    performanceProgress: {
      fontSize: 14,
      fontWeight: "800",
    },
    performanceStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
    },
    performanceStat: {
      fontSize: 13,
    },
  });
