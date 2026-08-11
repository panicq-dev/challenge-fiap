import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
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
import { useTheme } from "../context/ThemeContext";
import { RootTabParamList } from "../types";
import { colors } from "../theme/colors";
import { getSubjectIcon } from "../utils/icons";

const actionItems = [
  { key: "quiz", title: "Quiz", icon: "school-outline" },
  { key: "resumos", title: "Resumos", icon: "document-text-outline" },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { subjects, flashcards } = useLibrary();
  const { colors, toggleTheme, mode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return subjects;
    }

    return subjects.filter(
      (subject) =>
        subject.title.toLowerCase().includes(query) ||
        subject.subtitle.toLowerCase().includes(query),
    );
  }, [subjects, searchQuery]);

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

  const recentTopics = useMemo(() => {
    // Build a list of topics with the newest review timestamp (if any)
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
      .filter(({ topic, lastReviewed }) => topic && lastReviewed > 0)
      .sort((a, b) => b.lastReviewed - a.lastReviewed);

    if (topicsWithStudy.length > 0) {
      return topicsWithStudy.slice(0, 3).map(({ subject, topic }) => ({ subject, topic }));
    }

    // Fallback: show first topic from first two subjects
    return subjects
      .slice(0, 2)
      .flatMap((subject) => subject.topics.slice(0, 1))
      .map((topic) => ({ subject: subjects.find((subj) => subj.topics.includes(topic))!, topic }));
  }, [subjects, flashcards]);

  function handleViewAll() {
    navigation.navigate("Biblioteca");
  }

  function renderSubjectCard({ item }: { item: (typeof subjectCards)[number] }) {
    return (
      <Pressable
        style={[styles.subjectCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={() => setSelectedSubject(item.id)}
      >
        <View
          style={[
            styles.subjectIcon,
            { backgroundColor: item.iconBackground },
          ]}
        >
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

  const selected = subjects.find((s) => s.id === selectedSubject) ?? null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}> 
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={[styles.brand, { color: colors.text }]}>NOTEZ</Text>
          <Pressable style={[styles.themeButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={toggleTheme} hitSlop={8}>
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

        <View style={styles.actionsRow}>
          {actionItems.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.actionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => {
                // placeholder actions: Quiz / Resumos (not implemented)
              }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Desempenho geral</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredSubjects.length} matérias disponíveis
            </Text>
          </View>
          <Pressable onPress={handleViewAll}>
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
            <View
              style={[
                styles.recentIcon,
                { backgroundColor: subject.iconBackground },
              ]}
            >
              {getSubjectIcon(subject.icon, 20, subject.iconColor)}
            </View>
            <View style={styles.recentInfo}>
              <Text style={[styles.recentTopic, { color: colors.text }]}>{topic.title}</Text>
              <Text style={[styles.recentSubject, { color: colors.textSecondary }]}>{subject.title}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
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
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: 6,
  },
  subjectSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
    color: colors.text,
  },
  subjectTopics: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
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
    color: colors.text,
    marginBottom: 2,
  },
  recentSubject: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
