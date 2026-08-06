import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "../theme/colors";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandSection}>
        <View style={styles.brandIcon}>
          <Ionicons name="book" size={28} color={colors.white} />
        </View>
        <Text style={styles.brandTitle}>NoteZ</Text>
        <Text style={styles.brandSubtitle}>Estude de forma inteligente</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Acesse sua conta</Text>
        <Text style={styles.cardDescription}>
          Faça login para continuar ou entre sem login para acessar o app agora.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Senha</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Pressable style={[styles.button, styles.buttonDisabled]} disabled>
          <Text style={styles.buttonText}>Entrar</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.guestButton]}
          onPress={() => navigation.replace("Main")}
        >
          <Text style={[styles.buttonText, styles.guestButtonText]}>
            Entrar sem login
          </Text>
        </Pressable>

        <Text style={styles.noteText}>
          O login é apenas visual neste protótipo. Use "Entrar sem login" para
          acessar o app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
  guestButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  guestButtonText: {
    color: colors.primary,
  },
  noteText: {
    marginTop: 18,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
  },
});
