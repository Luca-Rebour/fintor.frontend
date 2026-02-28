import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppIcon } from "../shared/AppIcon";
import { CreateCategoryDTO } from "../../types/category";

type CreateCategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateCategory: (payload: CreateCategoryDTO) => Promise<void> | void;
};

const LucideIcons = require("lucide-react-native/dist/esm/lucide-react-native.js") as Record<string, unknown>;

const ICON_OPTIONS = Object.keys(LucideIcons)
  .filter((name) => /^[A-Z]/.test(name) && !name.endsWith("Icon"))
  .sort((a, b) => a.localeCompare(b));

const COLOR_OPTIONS = [
  "#18C8FF",
  "#B63BFF",
  "#22C55E",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#14B8A6",
  "#8B5CF6",
  "#EC4899",
  "#0EA5E9",
  "#10B981",
  "#EAB308",
  "#6366F1",
  "#84CC16",
  "#06B6D4",
  "#A855F7",
  "#F43F5E",
  "#3B82F6",
  "#64748B",
  "#4ADE80",
] as const;

const INITIAL_ICONS_BATCH = 40;
const ICONS_BATCH_STEP = 40;

export function CreateCategoryModal({
  visible,
  onClose,
  onCreateCategory,
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("Tag");
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0]);
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleIconCount, setVisibleIconCount] = useState(INITIAL_ICONS_BATCH);

  const filteredIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return ICON_OPTIONS;
    }

    return ICON_OPTIONS.filter((iconName) =>
      iconName.toLowerCase().includes(normalizedSearch),
    );
  }, [iconSearch]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleIconCount);
  }, [filteredIcons, visibleIconCount]);

  useEffect(() => {
    setVisibleIconCount(INITIAL_ICONS_BATCH);
  }, [iconSearch, visible]);

  function resetForm() {
    setName("");
    setIconSearch("");
    setSelectedIcon("Tag");
    setSelectedColor(COLOR_OPTIONS[0]);
    setNameError("");
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleCreate() {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setNameError("Ingresa un nombre para la categoría");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateCategory({
        name: normalizedName,
        icon: selectedIcon,
        color: selectedColor,
      });

      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <View className="flex-1 justify-end bg-black/60">
          <Pressable className="flex-1" onPress={handleClose} />

          <View className="max-h-[92%] rounded-t-3xl border-t border-[#1E2A47] bg-[#111C33]">
            <View className="items-center pt-3">
              <View className="h-1.5 w-12 rounded-full bg-[#334155]" />
            </View>

            <View className="px-5 pt-4 pb-3 border-b border-[#1E2A47] flex-row items-center justify-between">
              <Text className="text-app-textPrimary text-xl font-bold">Add Category</Text>
              <Pressable onPress={handleClose} className="p-1">
                <AppIcon name="X" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="px-5 py-4">
              <Text className="text-app-textSecondary text-xs uppercase mb-2">Name</Text>
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (nameError) {
                    setNameError("");
                  }
                }}
                placeholder="Ej. Food, Utilities, Travel"
                placeholderTextColor="#64748B"
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
              />
              {nameError ? <Text className="text-red-400 text-xs mt-2">{nameError}</Text> : null}

              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-app-textSecondary text-xs uppercase">Selected icon</Text>
                <View className="flex-row items-center rounded-xl border border-[#1E2A47] bg-[#0C1830] px-3 py-2">
                  <AppIcon name={selectedIcon} size={16} color="#18C8FF" />
                  <Text className="ml-2 text-xs text-app-textPrimary">{selectedIcon}</Text>
                </View>
              </View>

              <View className="mt-3 rounded-xl border border-[#1E2A47] bg-[#0C1830] px-3 py-2 flex-row items-center">
                <AppIcon name="Search" size={15} color="#94A3B8" />
                <TextInput
                  value={iconSearch}
                  onChangeText={setIconSearch}
                  placeholder="Buscar icono por nombre"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  className="ml-2 flex-1 text-sm text-app-textPrimary"
                />
              </View>

              <Text className="text-app-textSecondary text-xs uppercase mt-4 mb-2">Icons</Text>

              <FlatList
                data={visibleIcons}
                keyExtractor={(item) => item}
                numColumns={4}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                initialNumToRender={24}
                maxToRenderPerBatch={28}
                windowSize={7}
                style={{ maxHeight: 260 }}
                columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
                contentContainerStyle={{ paddingBottom: 6 }}
                onEndReachedThreshold={0.35}
                onEndReached={() => {
                  setVisibleIconCount((current) => {
                    if (current >= filteredIcons.length) {
                      return current;
                    }

                    return Math.min(current + ICONS_BATCH_STEP, filteredIcons.length);
                  });
                }}
                renderItem={({ item: iconName }) => {
                  const isSelected = iconName === selectedIcon;

                  return (
                    <Pressable
                      onPress={() => setSelectedIcon(iconName)}
                      style={{ width: "23%", minWidth: 64, height: 64 }}
                      className={`rounded-xl border items-center justify-center ${
                        isSelected ? "border-[#18C8FF] bg-[#10314A]" : "border-[#1E2A47] bg-[#111C33]"
                      }`}
                    >
                      <AppIcon name={iconName} size={16} color={isSelected ? "#18C8FF" : "#94A3B8"} />
                      <Text
                        numberOfLines={1}
                        className={`mt-1 text-[10px] ${isSelected ? "text-app-primary" : "text-app-textSecondary"}`}
                      >
                        {iconName}
                      </Text>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <View className="py-6">
                    <Text className="text-center text-sm text-app-textSecondary">No se encontraron iconos</Text>
                  </View>
                }
              />

              <Text className="text-app-textSecondary text-xs uppercase mt-4 mb-2">Color</Text>
              <View className="rounded-xl border border-[#1E2A47] bg-[#0C1830] p-3 mb-2">
                <View className="flex-row flex-wrap gap-3">
                  {COLOR_OPTIONS.map((color) => {
                    const isSelected = color === selectedColor;
                    return (
                      <Pressable
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        className={`h-10 w-10 rounded-full border-2 items-center justify-center ${
                          isSelected ? "border-white" : "border-[#1E2A47]"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected ? <AppIcon name="Check" size={14} color="#FFFFFF" /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View className="px-5 py-4 border-t border-[#1E2A47]">
              <Pressable
                onPress={handleCreate}
                disabled={isSubmitting}
                className="items-center justify-center py-4 rounded-2xl bg-[#18C8FF]"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#061324" />
                ) : (
                  <Text className="text-[#061324] text-base font-bold">Create Category</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
