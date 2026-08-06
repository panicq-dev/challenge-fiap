import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MenuItem = {
  label: string;
  icon: IoniconName;
  destructive?: boolean;
};

const profileMetrics = [
  { label: "12 dias", value: "Sequência", icon: "flame" },
  { label: "2.450", value: "Pontos", icon: "trophy" },
  { label: "75%", value: "Meta diária", icon: "speedometer" },
  { label: "48", value: "Documentos", icon: "document-text" },
] as const;

const accountActions: MenuItem[] = [
  { label: "Editar Perfil", icon: "person-circle-outline" },
  { label: "Notificações", icon: "notifications-outline" },
  { label: "Privacidade", icon: "lock-closed-outline" },
];

const generalLinks: MenuItem[] = [
  { label: "Ajuda e Suporte", icon: "help-circle-outline" },
  { label: "Sair", icon: "exit-outline", destructive: true },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();

  const sections = useMemo(
    () => [
      {
        title: "Conta",
        data: accountActions,
      },
      {
        title: "Geral",
        data: generalLinks,
      },
    ],
    [],
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
              <Text style={styles.profileName}>Maria Silva</Text>
              <Text style={styles.profileEmail}>maria.silva@email.com</Text>
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
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textMuted}
                    />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: "#2F63F5",
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 16,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
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
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  menuLabelDestructive: {
    color: "#dc2626",
  },
  separator: {
    height: 12,
  },
  footerText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
});
