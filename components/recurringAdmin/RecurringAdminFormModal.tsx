import { APP_COLORS } from "../../constants/colors";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";
import { CreateRecurringTransactionInput } from "../../types/recurring";
import { AccountOptionModel as AccountOption } from "../../types/models/account.model";
import { CategoryOptionModel as CategoryOption } from "../../types/models/category.model";
import { AppBottomSheetModal } from "../shared/AppBottomSheetModal";

type GoalOption = {
  value: string;
  label: string;
};

type RecurringAdminFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  form: CreateRecurringTransactionInput;
  accountOptions: AccountOption[];
  categoryOptions: CategoryOption[];
  goalOptions: GoalOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (next: CreateRecurringTransactionInput) => void;
  onSubmit: () => void;
};

const FREQUENCY_OPTIONS: { value: Frequency; labelKey: string }[] = [
  { value: Frequency.Daily, labelKey: "recurringAdmin.item.frequency.daily" },
  { value: Frequency.Weekly, labelKey: "recurringAdmin.item.frequency.weekly" },
  { value: Frequency.BiWeekly, labelKey: "recurringAdmin.item.frequency.biWeekly" },
  { value: Frequency.Monthly, labelKey: "recurringAdmin.item.frequency.monthly" },
  { value: Frequency.Quarterly, labelKey: "recurringAdmin.item.frequency.quarterly" },
  { value: Frequency.Yearly, labelKey: "recurringAdmin.item.frequency.yearly" },
];

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-2 text-xs font-semibold tracking-wider text-app-textSecondary">{children}</Text>;
}

function InputField(props: {
  value: string | number;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
}) {
  return (
    <TextInput
      value={String(props.value)}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={APP_COLORS.textMuted}
      keyboardType={props.keyboardType ?? "default"}
      className="rounded-xl border border-app-border bg-app-bgSecondary px-3 py-3 text-white"
    />
  );
}

function formatDateForForm(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function resolveDateFromForm(value: string): Date {
  const parsedDate = new Date(`${value}T00:00:00`);

  if (!value || Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

export function RecurringAdminFormModal({
  visible,
  mode,
  form,
  accountOptions,
  categoryOptions,
  goalOptions,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: RecurringAdminFormModalProps) {
  const { t } = useTranslation();
  const [activeDateField, setActiveDateField] = useState<"startDate" | "endDate" | null>(null);
  const [draftDate, setDraftDate] = useState(new Date());
  const [amountInput, setAmountInput] = useState("");

  function toSafeAmountString(value: unknown): string {
    if (typeof value === "number") {
      return Number.isFinite(value) ? String(value) : "";
    }

    if (typeof value === "string") {
      const normalized = normalizeAmountInput(value);
      return normalized;
    }

    return "";
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAmountInput(toSafeAmountString(form.amount));
  }, [visible, mode]);

  function normalizeAmountInput(rawValue: string): string {
    const normalizedDecimal = rawValue.replace(/,/g, ".");
    const digitsAndDotsOnly = normalizedDecimal.replace(/[^\d.]/g, "");

    const [integerPart = "", ...fractionParts] = digitsAndDotsOnly.split(".");
    if (fractionParts.length === 0) {
      return integerPart;
    }

    return `${integerPart}.${fractionParts.join("")}`;
  }

  function handleAmountChange(rawValue: string) {
    const normalizedValue = normalizeAmountInput(rawValue);
    setAmountInput(normalizedValue);

    if (!normalizedValue || normalizedValue === ".") {
      onChange({ ...form, amount: 0 });
      return;
    }

    const parsedAmount = Number(normalizedValue);
    if (Number.isFinite(parsedAmount)) {
      onChange({ ...form, amount: parsedAmount });
    }
  }

  useEffect(() => {
    if (!visible) {
      setActiveDateField(null);
    }
  }, [visible]);

  function applySelectedDate(nextDate: Date) {
    if (!activeDateField) {
      return;
    }

    const formattedDate = formatDateForForm(nextDate);

    if (activeDateField === "startDate") {
      onChange({ ...form, startDate: formattedDate });
      return;
    }

    onChange({ ...form, endDate: formattedDate });
  }

  function openDatePicker(field: "startDate" | "endDate") {
    const currentValue = field === "startDate" ? form.startDate : form.endDate;
    setDraftDate(resolveDateFromForm(currentValue));
    setActiveDateField(field);
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      if (Platform.OS !== "ios") {
        setActiveDateField(null);
      }
      return;
    }

    if (!selectedDate) {
      return;
    }

    if (Platform.OS === "ios") {
      setDraftDate(selectedDate);
      return;
    }

    applySelectedDate(selectedDate);
    setActiveDateField(null);
  }

  return (
    <AppBottomSheetModal visible={visible} onClose={onClose} snapPoints={["88%"]} debugName="RecurringAdminFormModal">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <View className="h-full max-h-[88%] rounded-t-3xl border border-app-border bg-app-bgPrimary p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-app-textPrimary">
                {mode === "create" ? t("recurringAdmin.form.createTitle") : t("recurringAdmin.form.editTitle")}
              </Text>
              <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-app-bgSecondary">
                <Text className="text-base font-bold text-app-textSecondary">×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-4"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
            <FieldLabel>{t("recurringAdmin.form.fields.name")}</FieldLabel>
            <InputField
              value={form.name}
              onChangeText={(name) => onChange({ ...form, name })}
              placeholder={t("recurringAdmin.form.placeholders.name")}
            />

            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.description")}</FieldLabel>
              <InputField
                value={form.description}
                onChangeText={(description) => onChange({ ...form, description })}
                placeholder={t("recurringAdmin.form.placeholders.description")}
              />
            </View>

            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.amount")}</FieldLabel>
              <InputField
                value={amountInput}
                onChangeText={handleAmountChange}
                placeholder={t("recurringAdmin.form.placeholders.amount")}
                keyboardType="decimal-pad"
              />
            </View>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => onChange({ ...form, transactionType: TransactionType.Income })}
                className={`flex-1 rounded-xl px-3 py-3 ${
                  form.transactionType === TransactionType.Income ? "bg-app-accentBlue" : "bg-app-bgSecondary"
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    form.transactionType === TransactionType.Income ? "text-app-bgPrimary" : "text-app-textSecondary"
                  }`}
                >
                  {t("recurringAdmin.form.transactionType.income")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onChange({ ...form, transactionType: TransactionType.Expense })}
                className={`flex-1 rounded-xl px-3 py-3 ${
                  form.transactionType === TransactionType.Expense ? "bg-app-accentBlue" : "bg-app-bgSecondary"
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    form.transactionType === TransactionType.Expense ? "text-white" : "text-app-textSecondary"
                  }`}
                >
                  {t("recurringAdmin.form.transactionType.expense")}
                </Text>
              </Pressable>
            </View>

            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.frequency")}</FieldLabel>
              <View className="flex-row flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((option) => {
                  const isActive = option.value === form.frequency;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => onChange({ ...form, frequency: option.value })}
                      className={`rounded-full px-3 py-2 ${isActive ? "bg-app-accentBlue" : "bg-app-bgSecondary"}`}
                    >
                      <Text className={`text-xs font-semibold ${isActive ? "text-app-bgPrimary" : "text-app-textSecondary"}`}>
                        {t(option.labelKey as any)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.account")}</FieldLabel>
              <View className="rounded-xl border border-app-border bg-app-bgSecondary p-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {accountOptions.map((account) => {
                    const isSelected = form.accountId === account.value;

                    return (
                      <Pressable
                        key={account.value}
                        onPress={() => onChange({ ...form, accountId: account.value })}
                        className={`mr-2 rounded-lg px-3 py-2 ${isSelected ? "bg-app-accentBlue" : "bg-app-border"}`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? "text-app-bgPrimary" : "text-[#CBD5E1]"}`}>
                          {account.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.category")}</FieldLabel>
              <View className="rounded-xl border border-app-border bg-app-bgSecondary p-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categoryOptions.map((category) => {
                    const isSelected = form.categoryId === category.value;

                    return (
                      <Pressable
                        key={category.value}
                        onPress={() => onChange({ ...form, categoryId: category.value })}
                        className={`mr-2 rounded-lg px-3 py-2 ${isSelected ? "bg-app-accentBlue" : "bg-app-border"}`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? "text-app-bgPrimary" : "text-[#CBD5E1]"}`}>
                          {category.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View className="mt-4">
              <FieldLabel>Goal (optional)</FieldLabel>
              <View className="rounded-xl border border-app-border bg-app-bgSecondary p-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {goalOptions.map((goal) => {
                    const isSelected = (form.goalId ?? "") === goal.value;

                    return (
                      <Pressable
                        key={goal.value || "no-goal"}
                        onPress={() => onChange({ ...form, goalId: goal.value || null })}
                        className={`mr-2 rounded-lg px-3 py-2 ${isSelected ? "bg-app-accentBlue" : "bg-app-border"}`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? "text-app-bgPrimary" : "text-[#CBD5E1]"}`}>
                          {goal.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>



            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.startDate")}</FieldLabel>
              <Pressable
                onPress={() => openDatePicker("startDate")}
                className="rounded-xl border border-app-border bg-app-bgSecondary px-3 py-3"
              >
                <Text className={`text-base ${form.startDate ? "text-white" : "text-app-textMuted"}`}>
                  {form.startDate || t("recurringAdmin.form.placeholders.selectStartDate")}
                </Text>
              </Pressable>
            </View>

            <View className="mt-4">
              <FieldLabel>{t("recurringAdmin.form.fields.endDate")}</FieldLabel>
              <Pressable
                onPress={() => openDatePicker("endDate")}
                className="rounded-xl border border-app-border bg-app-bgSecondary px-3 py-3"
              >
                <Text className={`text-base ${form.endDate ? "text-white" : "text-app-textMuted"}`}>
                  {form.endDate || t("recurringAdmin.form.placeholders.selectEndDate")}
                </Text>
              </Pressable>
            </View>
            </ScrollView>

            <View className="mt-2 flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-app-bgSecondary px-4 py-3"
              >
                <Text className="text-center text-sm font-semibold text-app-textSecondary">{t("common.cancel")}</Text>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-app-accentBlue px-4 py-3"
              >
                <Text className="text-center text-sm font-semibold text-app-bgPrimary">
                  {isSubmitting ? t("recurringAdmin.form.actions.saving") : mode === "create" ? t("recurringAdmin.form.actions.create") : t("recurringAdmin.form.actions.save")}
                </Text>
              </Pressable>
            </View>
          </View>

          {activeDateField && Platform.OS !== "ios" ? (
            <DateTimePicker
              value={resolveDateFromForm(activeDateField === "startDate" ? form.startDate : form.endDate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          ) : null}
        </KeyboardAvoidingView>

        {activeDateField && Platform.OS === "ios" ? (
          <AppBottomSheetModal visible={!!activeDateField} onClose={() => setActiveDateField(null)} snapPoints={["40%"]} debugName="RecurringAdminFormModal:IOSDatePicker">
            <View className="rounded-t-3xl border border-app-border bg-app-bgPrimary px-4 pb-6 pt-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Pressable onPress={() => setActiveDateField(null)} className="px-2 py-2">
                  <Text className="text-sm font-semibold text-app-textSecondary">{t("common.cancel")}</Text>
                </Pressable>

                <Text className="text-sm font-semibold text-app-textPrimary">
                  {activeDateField === "startDate" ? t("recurringAdmin.form.iosDatePicker.startDate") : t("recurringAdmin.form.iosDatePicker.endDate")}
                </Text>

                <Pressable
                  onPress={() => {
                    applySelectedDate(draftDate);
                    setActiveDateField(null);
                  }}
                  className="px-2 py-2"
                >
                  <Text className="text-sm font-semibold text-app-accentBlue">{t("common.done")}</Text>
                </Pressable>
              </View>

              <DateTimePicker value={draftDate} mode="date" display="spinner" onChange={handleDateChange} />
            </View>
          </AppBottomSheetModal>
        ) : null}
    </AppBottomSheetModal>
  );
}

