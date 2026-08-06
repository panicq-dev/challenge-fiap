import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../theme/colors";

interface CreateSubjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, subtitle: string) => void;
}

export default function CreateSubjectModal({
  visible,
  onClose,
  onCreate,
}: CreateSubjectModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  function handleCreate() {
    if (!title.trim()) {
      return;
    }

    onCreate(title, subtitle);
    setTitle("");
    setSubtitle("");
    onClose();
  }

  function handleClose() {
    setTitle("");
    setSubtitle("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova matéria</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.label}>Nome da matéria</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Geografia"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Conteúdo de humanas"
            placeholderTextColor={colors.textMuted}
            value={subtitle}
            onChangeText={setSubtitle}
          />

          <Pressable
            style={[styles.button, !title.trim() && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!title.trim()}
          >
            <Text style={styles.buttonText}>Criar matéria</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
