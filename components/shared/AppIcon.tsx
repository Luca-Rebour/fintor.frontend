import React from "react";

const LucideIcons = require("lucide-react-native/dist/esm/lucide-react-native.js") as Record<
  string,
  React.ComponentType<any>
>;

type AppIconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: unknown;
};

function normalizeLucideName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Circle";
  }

  if (trimmed.includes("-")) {
    return trimmed
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function AppIcon({ name, size = 18, color = "#FFFFFF", strokeWidth = 2, style }: AppIconProps) {
  const lucideKey = normalizeLucideName(String(name || ""));

  const IconComponent =
    LucideIcons[lucideKey] ??
    LucideIcons.Circle;

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style as any} />;
}
