import { APP_COLORS } from "../../constants/colors";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAccountsData } from "../../services/account.service";
import { getCategoriesData } from "../../services/categories.service";
import { getGoalsData } from "../../services/goals.service";
import { AccountOptionModel as AccountOption } from "../../types/models/account.model";
import { CategoryOptionModel as CategoryOption } from "../../types/models/category.model";
import { CreateTransactionInputModel as CreateTransactionDTO } from "../../types/models/transaction.model";
import { AppIcon } from "../shared/AppIcon";
import { AppBottomSheetModal } from "../shared/AppBottomSheetModal";

type GoalOption = {
  value: string;
  label: string;
};

const NO_GOAL_VALUE = "";
const NO_GOAL_LABEL = "";

type CreateExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateExpense: (payload: CreateTransactionDTO) => Promise<void>;
};

const DEFAULT_EXPENSE_ICON = "ShoppingCart";

function getOptionLabel(
  options: Array<{ label: string; value: string }>,
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatAccountOptionLabel(option: AccountOption) {
  const currencyCode = option.currencyCode?.trim().toUpperCase();
  return currencyCode ? `${option.label} (${currencyCode})` : option.label;
}

function getSelectedAccountLabel(options: AccountOption[], value: string) {
  const selected = options.find((option) => option.value === value);
  return selected ? formatAccountOptionLabel(selected) : value;
}

function isAccountOption(option: CategoryOption | AccountOption | GoalOption): option is AccountOption {
  return typeof (option as AccountOption).currencyCode === "string";
}

function SelectField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View className="mt-3">
      <Text className="text-app-textSecondary text-xs uppercase mb-2">{label}</Text>
      <Pressable
        onPress={onPress}
        className="bg-app-surface border border-app-border rounded-xl px-3 py-3 flex-row items-center justify-between"
      >
        <Text className="text-app-textPrimary text-sm">{value}</Text>
        <AppIcon name="ChevronDown" size={16} color={APP_COLORS.textSecondary} />
      </Pressable>
    </View>
  );
}

export function CreateExpenseModal({
  visible,
  onClose,
  onCreateExpense,
}: CreateExpenseModalProps) {
  const { t } = useTranslation();
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [goalOptions, setGoalOptions] = useState<GoalOption[]>([{ value: NO_GOAL_VALUE, label: NO_GOAL_LABEL }]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [goal, setGoal] = useState(NO_GOAL_VALUE);
  const [amountError, setAmountError] = useState("");
  const [activeSelectType, setActiveSelectType] = useState<"category" | "account" | "goal" | null>(null);

  const activeSelectOptions =
    activeSelectType === "category"
      ? categoryOptions
      : activeSelectType === "account"
        ? accountOptions
        : goalOptions;

  const activeSelectValue =
    activeSelectType === "category"
      ? category
      : activeSelectType === "account"
        ? account
        : goal;

  const activeSelectLabel =
    activeSelectType === "category"
      ? t("transactions.fields.category")
      : activeSelectType === "account"
        ? t("transactions.fields.account")
        : t("transactions.fields.goalOptional");

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isActive = true;

    async function loadSelectData() {
      const [categoriesData, accountsData, goalsData] = await Promise.all([
        getCategoriesData(),
        getAccountsData(),
        getGoalsData(),
      ]);

      if (!isActive) {
        return;
      }

      setCategoryOptions(categoriesData);
      setCategory((previous) =>
        categoriesData.some((option) => option.value === previous)
          ? previous
          : categoriesData[0]?.value ?? "",
      );

      setAccountOptions(accountsData);
      setAccount((previous) =>
        accountsData.some((option) => option.value === previous)
          ? previous
          : accountsData[0]?.value ?? "",
      );

      const goalSelectOptions: GoalOption[] = [
        { value: NO_GOAL_VALUE, label: t("transactions.labels.noGoal") },
        ...goalsData.map((goalItem) => ({
          value: goalItem.id,
          label: goalItem.title,
        })),
      ];

      setGoalOptions(goalSelectOptions);
      setGoal((previous) =>
        goalSelectOptions.some((option) => option.value === previous)
          ? previous
          : NO_GOAL_VALUE,
      );
    }

    loadSelectData();

    return () => {
      isActive = false;
    };
  }, [visible]);

  function resetForm() {
    setAmount("");
    setDescription("");
    setCategory(categoryOptions[0]?.value ?? "");
    setAccount(accountOptions[0]?.value ?? "");
    setGoal(NO_GOAL_VALUE);
    setAmountError("");
    setActiveSelectType(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleCreate() {
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError(t("transactions.errors.invalidAmount"));
      return;
    }

    try {
      await onCreateExpense({
        amount: parsedAmount,
        description: description.trim(),
        transactionType: 1,
        categoryId: category,
        icon: DEFAULT_EXPENSE_ICON,
        accountId: account,
        goalId: goal || null,
        exchangeRate: null,
      });

      resetForm();
      onClose();
    } catch {
      // Parent screen handles and displays translated errors.
    }
  }

  return (
    <AppBottomSheetModal visible={visible} onClose={handleClose} snapPoints={["92%"]} debugName="CreateExpenseModal">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
          <View className="h-full max-h-[92%] rounded-t-3xl border-t border-app-border bg-app-bgSecondary">
            <View className="px-5 pt-4 pb-3 border-b border-app-border flex-row items-center justify-between">
              <Text className="text-app-textPrimary text-xl font-bold">{t("transactions.createExpense.title")}</Text>
              <Pressable onPress={handleClose} className="p-1">
                <AppIcon name="X" size={18} color={APP_COLORS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              className="px-5 py-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
            <Text className="text-app-textSecondary text-xs uppercase mb-2">{t("transactions.fields.amount")}</Text>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (amountError) {
                  setAmountError("");
                }
              }}
              keyboardType="decimal-pad"
              placeholder={t("transactions.placeholders.amount")}
              placeholderTextColor={APP_COLORS.textMuted}
              className="bg-app-surface border border-app-border rounded-xl px-3 py-3 text-app-textPrimary"
            />
            {amountError ? <Text className="text-red-400 text-xs mt-2">{amountError}</Text> : null}

            <Text className="text-app-textSecondary text-xs uppercase mt-3 mb-2">{t("transactions.fields.descriptionOptional")}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t("transactions.placeholders.addDetails")}
              placeholderTextColor={APP_COLORS.textMuted}
              className="bg-app-surface border border-app-border rounded-xl px-3 py-3 text-app-textPrimary"
            />

            <SelectField
              label={t("transactions.fields.category")}
              value={getOptionLabel(categoryOptions, category)}
              onPress={() => setActiveSelectType("category")}
            />

            <SelectField
              label={t("transactions.fields.account")}
              value={getSelectedAccountLabel(accountOptions, account)}
              onPress={() => setActiveSelectType("account")}
            />

            <SelectField
              label={t("transactions.fields.goalOptional")}
              value={getOptionLabel(goalOptions, goal)}
              onPress={() => setActiveSelectType("goal")}
            />
          </ScrollView>

            <View className="px-5 py-4 border-t border-app-border">
              <Pressable
                onPress={handleCreate}
                className="items-center justify-center py-4 rounded-2xl bg-app-danger"
              >
                <Text className="text-white text-base font-bold">{t("transactions.createExpense.createButton")}</Text>
              </Pressable>
            </View>
          </View>
      </KeyboardAvoidingView>

      <AppBottomSheetModal
        visible={activeSelectType !== null}
        onClose={() => setActiveSelectType(null)}
        snapPoints={["55%"]}
        debugName="CreateExpenseModalSelect"
        stackBehavior="push"
      >
        <View className="px-5 pt-4 pb-2 border-b border-app-border">
          <Text className="text-app-textPrimary text-lg font-semibold">{t("transactions.select.selectLabel", { label: activeSelectLabel })}</Text>
        </View>
        <ScrollView className="max-h-full" nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {activeSelectOptions.map((option) => {
            const isSelected = option.value === activeSelectValue;
            const optionLabel =
              activeSelectType === "account" && isAccountOption(option)
                ? formatAccountOptionLabel(option)
                : option.label;

            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  if (activeSelectType === "category") {
                    setCategory(option.value);
                  } else if (activeSelectType === "account") {
                    setAccount(option.value);
                  } else {
                    setGoal(option.value);
                  }
                  setActiveSelectType(null);
                }}
                className="px-5 py-4 flex-row items-center justify-between border-b border-app-border"
              >
                <Text className={`text-sm ${isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"}`}>
                  {optionLabel}
                </Text>
                {isSelected ? <AppIcon name="Check" size={16} color={APP_COLORS.actionPrimary} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </AppBottomSheetModal>
    </AppBottomSheetModal>
  );
}

