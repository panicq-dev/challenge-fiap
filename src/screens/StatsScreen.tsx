import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLibrary } from "../context/LibraryContext";
import { colors } from "../theme/colors";

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { subjects, flashcards } = useLibrary();

  const perSubject = useMemo(() => {
    return subjects.map((subject) => {
      const subjectFlashcards = flashcards.filter((fc) =>
        subject.topics.some((t) => t.id === fc.topicId),
      );

      const reviewed = subjectFlashcards.filter((f) => f.reviewed).length;
      const ok = subjectFlashcards.filter((f) => f.ok).length;
      const toReview = subjectFlashcards.filter((f) => f.reviewed && !f.ok).length;

      return {
        id: subject.id,
        title: subject.title,
        reviewed,
        ok,
        toReview,
        total: subjectFlashcards.length,
      };
    });
  }, [subjects, flashcards]);

  const totalReviewed = useMemo(() => {
    return flashcards.reduce((sum, f) => sum + (f.reviewedCount ?? 0), 0);
  }, [flashcards]);

  const reviewItems = useMemo(() => {
    return flashcards.filter((f) => f.reviewed && !f.ok).slice(0, 20);
  }, [flashcards]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Estatísticas</Text>
        </View>

        <View style={styles.topStatsRow}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total revisado</Text>
            <Text style={styles.totalNumber}>{totalReviewed}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Desempenho por matéria</Text>
        {perSubject.map((s) => {
          const percent = s.total > 0 ? Math.round((s.reviewed / s.total) * 100) : 0;
          return (
            <View key={s.id} style={styles.statCard}>
              <View style={styles.statLeft}>
                <Text style={styles.statTitle}>{s.title}</Text>
                <Text style={styles.statSubtitle}>{s.total} flashcards</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                </View>
              </View>
              <View style={styles.statRight}>
                <Text style={styles.statNumber}>{percent}%</Text>
                <Text style={styles.statLabel}>Concluído</Text>
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Conteúdos a revisar</Text>
        {reviewItems.length === 0 ? (
          <Text style={styles.empty}>Nenhum conteúdo marcado para revisão</Text>
        ) : (
          reviewItems.map((f) => {
            const subject = subjects.find((s) => s.topics.some((t) => t.id === f.topicId));
            return (
              <View key={f.id} style={styles.reviewRow}>
                <View style={[styles.reviewIcon, { backgroundColor: subject?.iconBackground || colors.background }]}>
                  <Ionicons name={subject?.icon as any || "document-text"} size={18} color={subject?.iconColor || colors.primary} />
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewTitle} numberOfLines={1}>{f.front}</Text>
                  <Text style={styles.reviewSubtitle}>{subject?.title} • {subject?.topics.find((t) => t.id === f.topicId)?.title}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textSecondary, marginBottom: 12 },
  topStatsRow: { flexDirection: "row", justifyContent: "flex-start", gap: 12, marginBottom: 12 },
  totalCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, minWidth: 140, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  totalLabel: { fontSize: 13, color: colors.textSecondary },
  totalNumber: { fontSize: 20, fontWeight: "800", color: colors.text },
  statCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  statLeft: { flex: 1 },
  statTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  statSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  progressBarBg: { height: 10, backgroundColor: colors.background, borderRadius: 8, overflow: "hidden", marginTop: 10 },
  progressBarFill: { height: 10, backgroundColor: colors.primary },
  statRight: { alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 8 },
  reviewRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  reviewIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  reviewInfo: { flex: 1 },
  reviewTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  reviewSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
