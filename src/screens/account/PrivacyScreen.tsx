import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "../../context/SettingsContext";
import { ThemeColors } from "../../theme/colors";
import { AccountStackParamList } from "../../types";

type Props = NativeStackScreenProps<AccountStackParamList, "Privacy">;

const sections = [
  {
    title: "1. Dados que coletamos",
    body:
      "Coletamos apenas as informações necessárias para o funcionamento do app: nome, email e seu progresso de estudo (matérias, flashcards e estatísticas). Não coletamos dados sensíveis nem compartilhamos suas informações com terceiros para fins de publicidade.",
  },
  {
    title: "2. Como usamos seus dados",
    body:
      "Seus dados são usados exclusivamente para personalizar sua experiência dentro do app, como salvar seu progresso, preferências de tema e notificações.",
  },
  {
    title: "3. Armazenamento",
    body:
      "As informações ficam salvas localmente no seu dispositivo. Caso o app seja conectado a um servidor no futuro, você será notificado sobre qualquer mudança nesta política.",
  },
  {
    title: "4. Seus direitos",
    body:
      "Você pode editar ou excluir seus dados a qualquer momento através da tela de Editar Perfil, ou saindo da sua conta na opção 'Sair'.",
  },
  {
    title: "5. Contato",
    body:
      "Dúvidas sobre privacidade podem ser enviadas pela tela de Ajuda e Suporte.",
  },
];

export default function PrivacyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const styles = useMemoStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacidade</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updatedAt}>Última atualização: agosto de 2026</Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
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
    content: { paddingHorizontal: 20, paddingBottom: 32 },
    updatedAt: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 20,
    },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    sectionBody: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
    },
  });
}
