import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSettings } from "../context/SettingsContext";
import { ThemeColors } from "../theme/colors";

interface CreateFlashcardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (front: string, back: string) => void;
}

export default function CreateFlashcardModal({
  visible,
  onClose,
  onCreate,
}: CreateFlashcardModalProps) {
  const { colors } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  function handleCreate() {
    if (!front.trim() || !back.trim()) {
      return;
    }

    onCreate(front, back);
    setFront("");
    setBack("");
    onClose();
  }

  function handleClose() {
    setFront("");
    setBack("");
    onClose();
  }

  const canCreate = front.trim().length > 0 && back.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Novo flashcard</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.label}>Frente (pergunta)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: O que é uma equação?"
            placeholderTextColor={colors.textMuted}
            value={front}
            onChangeText={setFront}
            multiline
          />

          <Text style={styles.label}>Verso (resposta)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Igualdade entre duas expressões algébricas."
            placeholderTextColor={colors.textMuted}
            value={back}
            onChangeText={setBack}
            multiline
          />

          <Pressable
            style={[styles.button, !canCreate && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={styles.buttonText}>Adicionar flashcard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.45)",
      justifyContent: "flex-end",
    },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
