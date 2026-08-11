import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState, useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CreateSubjectModal from "../components/CreateSubjectModal";
import SubjectCard from "../components/SubjectCard";
import { useLibrary } from "../context/LibraryContext";
import { LibraryStackParamList, Subject, Topic } from "../types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryMain">;

export default function LibraryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { subjects, addSubject } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // If another screen requested opening a specific topic, navigate to it
  useEffect(() => {
    const params: any = route.params as any;
    const openTopicId: string | undefined = params?.openTopicId;
    if (openTopicId) {
      // find subject and topic
      const subject = subjects.find((s) => s.topics.some((t) => t.id === openTopicId));
      const topic = subject?.topics.find((t) => t.id === openTopicId);
      if (subject && topic) {
        navigation.navigate("ContentDetail", {
          topicId: topic.id,
          subjectTitle: subject.title,
          subjectSubtitle: subject.subtitle,
          topicTitle: topic.title,
        });

        // clear params so we don't reopen repeatedly
        navigation.setParams({
          openTopicId: undefined,
          openSubjectTitle: undefined,
          openTopicTitle: undefined,
          openSubjectSubtitle: undefined,
        } as any);
      }
    }
  }, [route.params, subjects, navigation]);

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return subjects;
    }

    return subjects.filter(
      (subject) =>
        subject.title.toLowerCase().includes(query) ||
        subject.subtitle.toLowerCase().includes(query) ||
        subject.topics.some((topic) =>
          topic.title.toLowerCase().includes(query),
        ),
    );
  }, [subjects, searchQuery]);

  const subjectCountLabel =
    filteredSubjects.length === 1
      ? "1 matéria"
      : `${filteredSubjects.length} matérias`;

  function handleToggle(subjectId: string) {
    setExpandedId((current) => (current === subjectId ? null : subjectId));
  }

  function handleTopicPress(subject: Subject, topic: Topic) {
    navigation.navigate("ContentDetail", {
      topicId: topic.id,
      subjectTitle: subject.title,
      subjectSubtitle: subject.subtitle,
      topicTitle: topic.title,
    });
  }

  function renderSubject({ item }: { item: Subject }) {
    return (
      <SubjectCard
        subject={item}
        expanded={expandedId === item.id}
        onToggle={() => handleToggle(item.id)}
        onTopicPress={(topic) => handleTopicPress(item, topic)}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="library" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Biblioteca</Text>
            <Text style={styles.count}>{subjectCountLabel}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} hitSlop={8}>
            <Ionicons name="filter-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={8}>
            <Ionicons name="grid-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar matérias..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubject}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma matéria encontrada</Text>
        }
      />

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>

      <CreateSubjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(title, subtitle, icon) => addSubject({ title, subtitle, icon })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 40,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
