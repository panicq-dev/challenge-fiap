import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { Subject, Topic } from "../types";
import { colors } from "../theme/colors";
import { getSubjectIcon } from "../utils/icons";

interface SubjectCardProps {
  subject: Subject;
  expanded: boolean;
  onToggle: () => void;
  onTopicPress: (topic: Topic) => void;
  topicReviewed?: Record<string, boolean>;
  containerStyle?: ViewStyle;
}

export default function SubjectCard({
  subject,
  expanded,
  onToggle,
  onTopicPress,
  topicReviewed,
  containerStyle,
}: SubjectCardProps) {
  const topicLabel =
    subject.topics.length === 1 ? "1 tópico" : `${subject.topics.length} tópicos`;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Pressable
        style={[styles.card, expanded && styles.cardExpanded]}
        onPress={onToggle}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: subject.iconBackground },
          ]}
        >
          {getSubjectIcon(subject.icon, 22, subject.iconColor)}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{subject.title}</Text>
          <Text style={styles.subtitle}>{topicLabel}</Text>
        </View>

        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded && (
        <View style={styles.topicsContainer}>
          {subject.topics.length === 0 ? (
            <Text style={styles.emptyTopics}>Nenhum tópico cadastrado</Text>
          ) : (
            subject.topics.map((topic) => (
              <Pressable
                key={topic.id}
                style={styles.topicRow}
                onPress={() => onTopicPress(topic)}
              >
                <View style={styles.topicIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                {topicReviewed?.[topic.id] && (
                  <View style={styles.topicBadge}>
                    <Text style={styles.topicBadgeText}>Revisado</Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  topicsContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  topicIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicTitle: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },
  topicBadge: {
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyTopics: {
    padding: 16,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
  },
});
