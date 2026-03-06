import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppIcon } from "../shared/AppIcon";
import { ICON_COLOR_OPTIONS, IconColorPicker } from "../shared/IconColorPicker";
import { CreateCategoryInputModel as CreateCategoryDTO } from "../../types/models/category.model";

type CreateCategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateCategory: (payload: CreateCategoryDTO) => Promise<void> | void;
};

export function CreateCategoryModal({
  visible,
  onClose,
  onCreateCategory,
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("Tag");
  const [selectedColor, setSelectedColor] = useState<string>(ICON_COLOR_OPTIONS[0]);
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setSelectedIcon("Tag");
    setSelectedColor(ICON_COLOR_OPTIONS[0]);
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

              <IconColorPicker
                selectedIcon={selectedIcon}
                selectedColor={selectedColor}
                onChangeIcon={setSelectedIcon}
                onChangeColor={setSelectedColor}
              />
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
