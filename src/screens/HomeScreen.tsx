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

import { useLibrary } from "../context/LibraryContext";
import { RootTabParamList } from "../types";
import { colors } from "../theme/colors";
import { getSubjectIcon } from "../utils/icons";

const actionItems = [
  { key: "quiz", title: "Quiz", icon: "school-outline" },
  { key: "resumos", title: "Resumos", icon: "document-text-outline" },
  { key: "stats", title: "Stats", icon: "bar-chart-outline" },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { subjects, flashcards } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");

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
        const totalTopics = subject.topics.length;
        const studiedTopics = subject.topics.filter((topic) =>
          flashcards.some((card) => card.topicId === topic.id),
        ).length;

        return {
          ...subject,
          progress: totalTopics > 0 ? Math.round((studiedTopics / totalTopics) * 100) : 0,
          topicCountLabel:
            totalTopics === 1 ? "1 tópico" : `${totalTopics} tópicos`,
        };
      }),
    [filteredSubjects, flashcards],
  );

  const recentTopics = useMemo(() => {
    const topicsWithStudy = subjects
      .flatMap((subject) =>
        subject.topics.map((topic) => ({ subject, topic })),
      )
      .filter(({ topic }) =>
        flashcards.some((card) => card.topicId === topic.id),
      );

    if (topicsWithStudy.length > 0) {
      return topicsWithStudy.slice(0, 2);
    }

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
      <Pressable style={styles.subjectCard} onPress={handleViewAll}>
        <View
          style={[
            styles.subjectIcon,
            { backgroundColor: item.iconBackground },
          ]}
        >
          {getSubjectIcon(item.icon, 22, item.iconColor)}
        </View>
        <Text style={styles.subjectTitle}>{item.title}</Text>
        <Text style={styles.subjectSubtitle}>{item.subtitle}</Text>
        <View style={styles.subjectFooter}>
          <Text style={styles.subjectProgress}>{item.progress}% completo</Text>
          <Text style={styles.subjectTopics}>{item.topicCountLabel}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.circleButton} hitSlop={8}>
            <Ionicons name="menu-outline" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.brand}>NOTEZ</Text>
          <Pressable style={styles.circleButton} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.greeting}>Olá, Estudante!</Text>
        <Text style={styles.greetingSubtitle}>Continue de onde parou</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar materiais, tópicos..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.actionsRow}>
          {actionItems.map((item) => (
            <Pressable key={item.key} style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Minhas matérias</Text>
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

        <View style={styles.sectionHeader}> 
          <Text style={styles.sectionTitle}>Estudado recentemente</Text>
        </View>

        {recentTopics.map(({ subject, topic }) => (
          <Pressable
            key={topic.id}
            style={styles.recentCard}
            onPress={handleViewAll}
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
              <Text style={styles.recentTopic}>{topic.title}</Text>
              <Text style={styles.recentSubject}>{subject.title}</Text>
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
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
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
