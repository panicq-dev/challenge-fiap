import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLibrary } from "../context/LibraryContext";
import { LibraryStackParamList } from "../types";

type Props = NativeStackScreenProps<LibraryStackParamList, "FlashcardStudy">;

export default function FlashcardStudyScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { topicId, subjectTitle, topicTitle, startIndex = 0 } = route.params;
  const { getFlashcardsByTopic, markFlashcardReviewed } = useLibrary();

  const flashcards = getFlashcardsByTopic(topicId);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [showBack, setShowBack] = useState(false);

  const currentCard = flashcards[currentIndex];
  const total = flashcards.length;
  const progress = total > 0 ? (currentIndex + 1) / total : 0;
  const progressLabel = total > 0 ? `${currentIndex + 1} de ${total}` : "0 de 0";
  const progressPercent = Math.round(progress * 100);

  const cardText = useMemo(() => {
    if (!currentCard) {
      return "";
    }
    return showBack ? currentCard.back : currentCard.front;
  }, [currentCard, showBack]);

  function goToIndex(index: number) {
    if (index < 0 || index >= total) {
      return;
    }
    setCurrentIndex(index);
    setShowBack(false);
  }

  function handlePrevious() {
    goToIndex(currentIndex - 1);
  }

  function handleNext() {
    goToIndex(currentIndex + 1);
  }

  function handleMarkAndNext(ok: boolean) {
    if (currentCard) {
      markFlashcardReviewed(currentCard.id, ok);
    }

    if (currentIndex < total - 1) {
      handleNext();
    } else {
      navigation.goBack();
    }
  }

  if (total === 0) {
    return (
      <LinearGradient
        colors={["#1E40AF", "#2563EB", "#3B82F6"]}
        style={[styles.container, styles.emptyContainer, { paddingTop: insets.top }]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.emptyText}>Nenhum flashcard para estudar</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
      style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTitles}>
          <Text style={styles.subjectTitle}>{subjectTitle}</Text>
          <Text style={styles.topicTitle}>{topicTitle}</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{progressLabel}</Text>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <Pressable
        style={styles.card}
        onPress={() => setShowBack((current) => !current)}
      >
        <Text style={styles.cardText}>{cardText}</Text>
        <Text style={styles.flipHint}>
          {showBack ? "Toque para ver a pergunta" : "Toque para ver a resposta"}
        </Text>
      </Pressable>

      <View style={styles.controls}>
        <Pressable
          style={[styles.controlButton, styles.controlSecondary, currentIndex === 0 && styles.controlDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={[styles.controlButton, styles.controlWrong]}
          onPress={() => handleMarkAndNext(false)}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={[styles.controlButton, styles.controlCorrect]}
          onPress={() => handleMarkAndNext(true)}
        >
          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={[styles.controlButton, styles.controlNext, currentIndex === total - 1 && styles.controlDisabled]}
          onPress={handleNext}
          disabled={currentIndex === total - 1}
        >
          <Ionicons name="chevron-forward" size={24} color={colorsPrimary} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const colorsPrimary = "#2563EB";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    padding: 20,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitles: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 24,
  },
  subjectTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  progressSection: {
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  card: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 32,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 32,
  },
  flipHint: {
    position: "absolute",
    bottom: 24,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingBottom: 8,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  controlSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  controlWrong: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
  },
  controlCorrect: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#14B8A6",
  },
  controlNext: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
  },
  controlDisabled: {
    opacity: 0.4,
  },
});
