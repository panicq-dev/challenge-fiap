import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "../../context/SettingsContext";
import { ThemeColors } from "../../theme/colors";
import { AccountStackParamList, ThemeMode } from "../../types";

type Props = NativeStackScreenProps<AccountStackParamList, "Settings">;

const themeOptions: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "light", label: "Claro", icon: "sunny-outline" },
  { key: "dark", label: "Escuro", icon: "moon-outline" },
];

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    theme,
    setTheme,
    colors,
  } = useSettings();
  const styles = useMemoStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Geral</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.row}>
          <View style={styles.rowIconContainer}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Ativar notificações</Text>
            <Text style={styles.rowDescription}>
              Receba lembretes de estudo e novidades do app.
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Tema</Text>
        <View style={styles.themeGroup}>
          {themeOptions.map((option) => {
            const selected = option.key === theme;
            return (
              <Pressable
                key={option.key}
                style={[styles.themeOption, selected && styles.themeOptionSelected]}
                onPress={() => setTheme(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={selected ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    selected && styles.themeOptionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function useMemoStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    content: { paddingHorizontal: 20 },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textSecondary,
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 18,
      padding: 16,
      gap: 12,
    },
    rowIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
    rowDescription: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    themeGroup: { flexDirection: "row", gap: 12 },
    themeOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeOptionLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
    themeOptionLabelSelected: { color: colors.white },
  });
}
