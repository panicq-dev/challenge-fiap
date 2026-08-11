import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>NOTEZ</Text>
      </View>
      <Text style={styles.tag}>Organize. Estude. Repita.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 2,
  },
  tag: {
    color: colors.white,
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
});
