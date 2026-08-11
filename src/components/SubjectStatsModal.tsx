import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Modal, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useLibrary } from "../context/LibraryContext";
import { colors } from "../theme/colors";
import { getSubjectIcon } from "../utils/icons";

interface Props {
  subjectId: string | null;
  visible: boolean;
  onClose: () => void;
}

export default function SubjectStatsModal({ subjectId, visible, onClose }: Props) {
  const { subjects, flashcards } = useLibrary();
  const subject = subjects.find((s) => s.id === subjectId) ?? null;

  const subjectFlashcards = useMemo(() => {
    if (!subject) return [];
    return flashcards.filter((f) => subject.topics.some((t) => t.id === f.topicId));
  }, [subject, flashcards]);

  const total = subjectFlashcards.length;
  const reviewed = subjectFlashcards.filter((f) => f.reviewed).length;
  const corrects = subjectFlashcards.filter((f) => f.ok).length;
  const totalReviews = subjectFlashcards.reduce((s, f) => s + (f.reviewedCount ?? 0), 0);

  const wrongs = subjectFlashcards.filter((f) => f.reviewed && !f.ok).sort((a, b) => (b.reviewedCount ?? 0) - (a.reviewedCount ?? 0));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[styles.iconWrap, { backgroundColor: subject?.iconBackground || colors.background }]}>
                {subject && getSubjectIcon(subject.icon, 24, subject.iconColor)}
              </View>
              <View>
                <Text style={styles.title}>{subject?.title}</Text>
                <Text style={styles.subtitle}>{subject?.subtitle}</Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.bigChart}>
              <View style={styles.bigChartLabels}>
                <Text style={styles.bigNumber}>{corrects}</Text>
                <Text style={styles.bigLabel}>acertos</Text>
              </View>

              <View style={styles.bigChartBarWrap}>
                <View style={[styles.bigChartBarBase]}>
                  <View style={[styles.bigChartBarFill, { width: `${Math.round((corrects / Math.max(totalReviews, 1)) * 100)}%` }]} />
                </View>
                <Text style={styles.bigChartNote}>{totalReviews} revisões totais</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Conteúdos mais errados</Text>
            {wrongs.length === 0 ? (
              <Text style={styles.empty}>Nenhum conteúdo com erros registrados</Text>
            ) : (
              wrongs.map((f) => (
                <View key={f.id} style={styles.wrongRow}>
                  <Text style={styles.wrongFront}>{f.front}</Text>
                  <Text style={styles.wrongMeta}>{subject?.topics.find((t) => t.id === f.topicId)?.title} • revisado {f.reviewedCount ?? 0}x</Text>
                </View>
              ))
            )}

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(11,13,24,0.45)", justifyContent: "center" },
  container: { marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 16, overflow: "hidden", maxHeight: "85%" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderColor: colors.border },
  iconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 8 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary },
  content: { padding: 16 },
  bigChart: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  bigChartLabels: { width: 96, alignItems: "center" },
  bigNumber: { fontSize: 28, fontWeight: "900", color: colors.text },
  bigLabel: { fontSize: 13, color: colors.textSecondary },
  bigChartBarWrap: { flex: 1, paddingLeft: 12 },
  bigChartBarBase: { height: 18, backgroundColor: colors.background, borderRadius: 10, overflow: "hidden" },
  bigChartBarFill: { height: 18, backgroundColor: "#34D399" },
  bigChartNote: { fontSize: 12, color: colors.textSecondary, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 8 },
  empty: { color: colors.textSecondary },
  wrongRow: { backgroundColor: colors.background, padding: 12, borderRadius: 10, marginBottom: 8 },
  wrongFront: { fontWeight: "700", color: colors.text },
  wrongMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
});
