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

  // total number of review actions across all flashcards
  const totalReviewed = useMemo(() => {
    return flashcards.reduce((sum, f) => sum + (f.reviewedCount ?? 0), 0);
  }, [flashcards]);

  // compute max value for chart scaling (use totalReviews and ok counts)
  const perSubjectExtended = useMemo(() => {
    return perSubject.map((s) => ({
      ...s,
      totalReviews: flashcards
        .filter((f) => subjects.find((sub) => sub.id === s.id)?.topics.some((t) => t.id === f.topicId))
        .reduce((sum, f) => sum + (f.reviewedCount ?? 0), 0),
    }));
  }, [perSubject, flashcards, subjects]);

  const maxCompareValue = useMemo(() => {
    let maxV = 0;
    perSubjectExtended.forEach((s) => {
      maxV = Math.max(maxV, s.totalReviews ?? 0, s.ok ?? 0);
    });
    return Math.max(maxV, 1);
  }, [perSubjectExtended]);

  const wrongBySubject = useMemo(() => {
    const map: Record<string, { title: string; items: typeof flashcards }> = {} as any;
    flashcards
      .filter((f) => f.reviewed && !f.ok)
      .forEach((f) => {
        const subject = subjects.find((s) => s.topics.some((t) => t.id === f.topicId));
        const sid = subject?.id ?? "-";
        if (!map[sid]) map[sid] = { title: subject?.title ?? "Geral", items: [] as any };
        map[sid].items.push(f as any);
      });

    return Object.entries(map).map(([id, v]) => ({ id, title: v.title, items: v.items }));
  }, [flashcards, subjects]);

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
          <View style={styles.chartCard}>
            <Text style={styles.totalLabel}>Porcentagem por matéria</Text>
            <View style={styles.miniChart}>
              {perSubject.map((s) => {
                const percent = s.total > 0 ? Math.round((s.reviewed / s.total) * 100) : 0;
                return (
                  <View key={s.id} style={styles.miniBarWrap}>
                    <View style={[styles.miniBarFill, { height: `${percent}%` }]} />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Desempenho por matéria</Text>
        {perSubjectExtended.map((s) => {
          const percent = s.total > 0 ? Math.round((s.reviewed / s.total) * 100) : 0;
          const reviews = s.totalReviews ?? 0;
          const corrects = s.ok ?? 0;
          const reviewsWidth = Math.round((reviews / maxCompareValue) * 100);
          const correctsWidth = Math.round((corrects / maxCompareValue) * 100);

          return (
            <View key={s.id} style={styles.statCard}>
              <View style={styles.statLeft}>
                <Text style={styles.statTitle}>{s.title}</Text>
                <Text style={styles.statSubtitle}>{s.total} flashcards • {reviews} revisões</Text>
                <View style={{ height: 8 }} />
                <View style={styles.compareRow}>
                  <View style={styles.compareLabel}><Text style={styles.smallLabel}>Revisões</Text></View>
                  <View style={styles.compareBarBg}>
                    <View style={[styles.reviewsBar, { width: `${reviewsWidth}%` }]} />
                  </View>
                  <Text style={styles.smallValue}>{reviews}</Text>
                </View>
                <View style={[styles.compareRow, { marginTop: 6 }]}>
                  <View style={styles.compareLabel}><Text style={styles.smallLabel}>Acertos</Text></View>
                  <View style={styles.compareBarBg}>
                    <View style={[styles.correctsBar, { width: `${correctsWidth}%` }]} />
                  </View>
                  <Text style={styles.smallValue}>{corrects}</Text>
                </View>
              </View>
              <View style={styles.statRight}>
                <Text style={styles.statNumber}>{percent}%</Text>
                <Text style={styles.statLabel}>Concluído</Text>
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Flashcards errados</Text>
        {wrongBySubject.length === 0 ? (
          <Text style={styles.empty}>Nenhum flashcard marcado como errado</Text>
        ) : (
          wrongBySubject.map((group) => {
            const subject = subjects.find((s) => s.id === group.id);
            return (
              <View key={group.id} style={{ marginBottom: 12 }}>
                <Text style={[styles.statTitle, { marginBottom: 8 }]}>{group.title}</Text>
                {group.items.map((f: any) => (
                  <View key={f.id} style={styles.reviewRow}>
                    <View style={[styles.reviewIcon, { backgroundColor: subject?.iconBackground || colors.background }]}>
                      <Ionicons name={subject?.icon as any || "document-text"} size={18} color={subject?.iconColor || colors.primary} />
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewTitle} numberOfLines={1}>{f.front}</Text>
                      <Text style={styles.reviewSubtitle}>{subject?.title} • {subject?.topics.find((t) => t.id === f.topicId)?.title} • revisado {f.reviewedCount ?? 0}x</Text>
                    </View>
                  </View>
                ))}
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
  totalCard: { backgroundColor: colors.cardBackground, borderRadius: 14, padding: 14, minWidth: 140, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  totalLabel: { fontSize: 13, color: colors.textSecondary },
  totalNumber: { fontSize: 20, fontWeight: "800", color: colors.text },
  statCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardBackground, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  statLeft: { flex: 1 },
  statTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  statSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  progressBarBg: { height: 10, backgroundColor: colors.background, borderRadius: 8, overflow: "hidden", marginTop: 10 },
  progressBarFill: { height: 10, backgroundColor: colors.primary },
  chartCard: { marginLeft: 12, backgroundColor: colors.cardBackground, borderRadius: 14, padding: 10, minWidth: 140, borderWidth: 1, borderColor: colors.border, justifyContent: "center" },
  miniChart: { flexDirection: "row", alignItems: "flex-end", height: 60, gap: 8, marginTop: 8 },
  miniBarWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end", marginHorizontal: 4, backgroundColor: "transparent" },
  miniBarFill: { width: "100%", backgroundColor: colors.primary, borderRadius: 6 },
  statRight: { alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  compareRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  compareLabel: { width: 72 },
  smallLabel: { fontSize: 12, color: colors.textSecondary },
  compareBarBg: { flex: 1, height: 10, backgroundColor: colors.background, borderRadius: 8, overflow: "hidden", marginHorizontal: 8 },
  reviewsBar: { height: 10, backgroundColor: "#60A5FA", borderRadius: 8 },
  correctsBar: { height: 10, backgroundColor: "#34D399", borderRadius: 8 },
  smallValue: { width: 30, textAlign: "right", color: colors.text, fontWeight: "700" },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 8 },
  reviewRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardBackground, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  reviewIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  reviewInfo: { flex: 1 },
  reviewTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  reviewSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
