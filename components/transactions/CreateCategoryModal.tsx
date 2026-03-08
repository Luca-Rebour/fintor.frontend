import { APP_COLORS } from "../../constants/colors";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppIcon } from "../shared/AppIcon";
import { ICON_COLOR_OPTIONS, IconColorPicker } from "../shared/IconColorPicker";
import { AppBottomSheetModal } from "../shared/AppBottomSheetModal";
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
  const { t } = useTranslation();
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
      setNameError(t("transactions.errors.categoryNameRequired"));
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
    <AppBottomSheetModal visible={visible} onClose={handleClose} snapPoints={["92%"]} debugName="CreateCategoryModal">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
          <View className="h-full max-h-[92%] rounded-t-3xl border-t border-app-border bg-app-bgSecondary">
            <View className="px-5 pt-4 pb-3 border-b border-app-border flex-row items-center justify-between">
              <Text className="text-app-textPrimary text-xl font-bold">{t("transactions.createCategory.title")}</Text>
              <Pressable onPress={handleClose} className="p-1">
                <AppIcon name="X" size={18} color={APP_COLORS.textSecondary} />
              </Pressable>
            </View>

            <View className="px-5 py-4">
              <Text className="text-app-textSecondary text-xs uppercase mb-2">{t("transactions.fields.name")}</Text>
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (nameError) {
                    setNameError("");
                  }
                }}
                placeholder={t("transactions.placeholders.categoryName")}
                placeholderTextColor={APP_COLORS.textMuted}
                className="bg-app-surface border border-app-border rounded-xl px-3 py-3 text-app-textPrimary"
              />
              {nameError ? <Text className="text-red-400 text-xs mt-2">{nameError}</Text> : null}

              <IconColorPicker
                selectedIcon={selectedIcon}
                selectedColor={selectedColor}
                onChangeIcon={setSelectedIcon}
                onChangeColor={setSelectedColor}
                useBottomSheetSelector
                bottomSheetTitle={t("transactions.createCategory.selectIconTitle")}
                bottomSheetSnapPoints={["78%"]}
              />
            </View>

            <View className="px-5 py-4 border-t border-app-border">
              <Pressable
                onPress={handleCreate}
                disabled={isSubmitting}
                className="items-center justify-center py-4 rounded-2xl bg-app-accentBlue"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#061324" />
                ) : (
                  <Text className="text-[#061324] text-base font-bold">{t("transactions.createCategory.createButton")}</Text>
                )}
              </Pressable>
            </View>
          </View>
      </KeyboardAvoidingView>
    </AppBottomSheetModal>
  );
}

