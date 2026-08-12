import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ComponentProps, useMemo } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { AccountStackParamList } from "../types";
import type { ThemeColors } from "../theme/colors";

type Props = NativeStackScreenProps<AccountStackParamList, "AccountMain">;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface MenuItem {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  destructive?: boolean;
}

// Tipagem para o objeto de cores
type ColorTheme = ThemeColors;

const profileMetrics = [
  { label: "12 dias", value: "Sequência", icon: "flame" },
  { label: "2.450", value: "Pontos", icon: "trophy" },
  { label: "75%", value: "Meta diária", icon: "speedometer" },
  { label: "48", value: "Documentos", icon: "document-text" },
] as const;

export default function AccountScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { colors } = useSettings();
  const styles = useMemoStyles(colors);

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const sections: { title: string; data: MenuItem[] }[] = useMemo(
    () => [
      {
        title: "Conta",
        data: [
          {
            label: "Editar Perfil",
            icon: "person-circle-outline",
            onPress: () => navigation.navigate("EditProfile"),
          },
          {
            label: "Geral",
            icon: "options-outline",
            onPress: () => navigation.navigate("Settings"),
          },
          {
            label: "Privacidade",
            icon: "lock-closed-outline",
            onPress: () => navigation.navigate("Privacy"),
          },
        ],
      },
      {
        title: "Geral",
        data: [
          {
            label: "Ajuda e Suporte",
            icon: "help-circle-outline",
            onPress: () => navigation.navigate("Help"),
          },
          {
            label: "Sair",
            icon: "exit-outline",
            destructive: true,
            onPress: handleLogout,
          },
        ],
      },
    ], 
    [navigation],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.white} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{user?.name ?? "Convidado"}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            {profileMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons name={metric.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.metricValue}>{metric.label}</Text>
                <Text style={styles.metricLabel}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList<MenuItem>
              data={section.data}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.menuItem}
                  android_ripple={{ color: colors.background }}
                  onPress={item.onPress}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.destructive ? "#dc2626" : colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      item.destructive && styles.menuLabelDestructive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {!item.destructive && (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
            />
          </View>
        ))}

        <Text style={styles.footerText}>Versão 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// Custom hook memoizado para criar o StyleSheet com base no tema recebido
function useMemoStyles(colors: ColorTheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingHorizontal: 20, paddingBottom: 32 },
        profileCard: {
          borderRadius: 28,
          padding: 24,
          backgroundColor: "#2F63F5",
          marginBottom: 24,
        },
        profileHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
        avatar: {
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.18)",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        },
        profileText: { flex: 1 },
        profileName: { fontSize: 22, fontWeight: "800", color: colors.white, marginBottom: 4 },
        profileEmail: { fontSize: 14, color: "rgba(255,255,255,0.78)" },
        metricsGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
        },
        metricCard: {
          width: "48%",
          backgroundColor: colors.cardBackground,
          borderRadius: 20,
          padding: 16,
        },
        metricIcon: {
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: colors.cardBackground,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        },
        metricValue: { fontSize: 18, fontWeight: "800", color: colors.white, marginBottom: 4 },
        metricLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
        section: { marginBottom: 24 },
        sectionTitle: {
          fontSize: 15,
          fontWeight: "700",
          color: colors.textSecondary,
          marginBottom: 12,
        },
        menuItem: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.cardBackground,
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 16,
        },
        menuIconContainer: {
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        },
        menuLabel: { flex: 1, fontSize: 16, color: colors.text, fontWeight: "600" },
        menuLabelDestructive: { color: "#dc2626" },
        separator: { height: 12 },
        footerText: { textAlign: "center", color: colors.textSecondary, fontSize: 13, marginTop: 8 },
      }),
    [colors]
  );
}