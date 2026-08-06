import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

import { SubjectIcon } from "../types";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export function getSubjectIcon(
  icon: SubjectIcon,
  size: number,
  color: string,
) {
  switch (icon) {
    case "calculator":
      return (
        <MaterialCommunityIcons
          name="ruler-square-compass"
          size={size}
          color={color}
        />
      );
    case "atom":
      return <Ionicons name="nuclear" size={size} color={color} />;
    case "flask":
      return <MaterialCommunityIcons name="flask" size={size} color={color} />;
    case "book":
      return <Ionicons name="book" size={size} color={color} />;
    case "dna":
      return <MaterialCommunityIcons name="dna" size={size} color={color} />;
    default:
      return <Ionicons name="folder" size={size} color={color} />;
  }
}

export function getTabIcon(
  routeName: string,
  focused: boolean,
  color: string,
  size: number,
) {
  const name: IoniconName =
    routeName === "Home"
      ? focused
        ? "home"
        : "home-outline"
      : routeName === "Biblioteca"
        ? focused
          ? "library"
          : "library-outline"
        : focused
          ? "person"
          : "person-outline";

  return <Ionicons name={name} size={size} color={color} />;
}
