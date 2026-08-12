import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "../../context/SettingsContext";
import { AccountStackParamList } from "../../types";

type Props = NativeStackScreenProps<AccountStackParamList, "Help">;

export default function HelpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const styles = useMemoStyles(colors);

  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert("Não foi possível abrir", "Verifique se você tem um app compatível instalado.");
    }
  };

  const contactOptions = [
    {
      label: "Enviar email",
      description: "suporte@notez.app",
      icon: "mail-outline" as const,
      onPress: () => openLink("mailto:robertodantas990@gmail.com?subject=Suporte NoteZ"),
    },
    {
      label: "Falar no WhatsApp",
      description: "Atendimento em horário comercial",
      icon: "logo-whatsapp" as const,
      onPress: () => openLink("https://wa.me/5511957992190"),
    },
    {
      label: "Perguntas frequentes",
      description: "Veja as dúvidas mais comuns",
      icon: "help-circle-outline" as const,
      onPress: () => openLink("https://fiap.com.br/faq"),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.intro}>
          Precisa de ajuda? Escolha uma das opções abaixo para falar com a gente.
        </Text>

        {contactOptions.map((option) => (
          <Pressable key={option.label} style={styles.row} onPress={option.onPress}>
            <View style={styles.rowIconContainer}>
              <Ionicons name={option.icon} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{option.label}</Text>
              <Text style={styles.rowDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function useMemoStyles(colors: Record<string, string>) {
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
    content: { paddingHorizontal: 20, gap: 12 },
    intro: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
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
  });
}
