import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";
import { CreateRecurringTransactionInput } from "../../types/recurring";
import { AccountOption } from "../../types/account";
import { CategoryOption } from "../../types/category";

type RecurringAdminFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  form: CreateRecurringTransactionInput;
  accountOptions: AccountOption[];
  categoryOptions: CategoryOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (next: CreateRecurringTransactionInput) => void;
  onSubmit: () => void;
};

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: Frequency.Daily, label: "Daily" },
  { value: Frequency.Weekly, label: "Weekly" },
  { value: Frequency.BiWeekly, label: "Bi-Weekly" },
  { value: Frequency.Monthly, label: "Monthly" },
  { value: Frequency.Quarterly, label: "Quarterly" },
  { value: Frequency.Yearly, label: "Yearly" },
];

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-2 text-xs font-semibold tracking-wider text-[#94A3B8]">{children}</Text>;
}

function InputField(props: {
  value: string | number;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <TextInput
      value={String(props.value)}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor="#64748B"
      keyboardType={props.keyboardType ?? "default"}
      className="rounded-xl border border-[#1E2A47] bg-[#111C33] px-3 py-3 text-white"
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
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: RecurringAdminFormModalProps) {
  const [activeDateField, setActiveDateField] = useState<"startDate" | "endDate" | null>(null);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed" || !selectedDate) {
      setActiveDateField(null);
      return;
    }

    const formattedDate = formatDateForForm(selectedDate);

    if (activeDateField === "startDate") {
      onChange({ ...form, startDate: formattedDate });
    }

    if (activeDateField === "endDate") {
      onChange({ ...form, endDate: formattedDate });
    }

    if (Platform.OS !== "ios") {
      setActiveDateField(null);
      return;
    }

    setActiveDateField(null);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-[#060F24]/70">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <View className="max-h-[88%] rounded-t-3xl border border-[#1E2A47] bg-[#060F24] p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-app-textPrimary">
                {mode === "create" ? "Create recurring" : "Edit recurring"}
              </Text>
              <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-[#111C33]">
                <Text className="text-base font-bold text-[#94A3B8]">×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-4"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
            <FieldLabel>NAME</FieldLabel>
            <InputField
              value={form.name}
              onChangeText={(name) => onChange({ ...form, name })}
              placeholder="Spotify"
            />

            <View className="mt-4">
              <FieldLabel>DESCRIPTION</FieldLabel>
              <InputField
                value={form.description}
                onChangeText={(description) => onChange({ ...form, description })}
                placeholder="Monthly recurring transaction"
              />
            </View>

            <View className="mt-4">
              <FieldLabel>AMOUNT</FieldLabel>
              <InputField
                value={form.amount}
                onChangeText={(amount) => onChange({ ...form, amount: Number(amount) })}
                placeholder="15.99"
                keyboardType="numeric"
              />
            </View>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => onChange({ ...form, transactionType: TransactionType.Income })}
                className={`flex-1 rounded-xl px-3 py-3 ${
                  form.transactionType === TransactionType.Income ? "bg-[#18C8FF]" : "bg-[#111C33]"
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    form.transactionType === TransactionType.Income ? "text-[#060F24]" : "text-[#94A3B8]"
                  }`}
                >
                  Income
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onChange({ ...form, transactionType: TransactionType.Expense })}
                className={`flex-1 rounded-xl px-3 py-3 ${
                  form.transactionType === TransactionType.Expense ? "bg-[#1D4ED8]" : "bg-[#111C33]"
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    form.transactionType === TransactionType.Expense ? "text-white" : "text-[#94A3B8]"
                  }`}
                >
                  Expense
                </Text>
              </Pressable>
            </View>

            <View className="mt-4">
              <FieldLabel>FREQUENCY</FieldLabel>
              <View className="flex-row flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((option) => {
                  const isActive = option.value === form.frequency;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => onChange({ ...form, frequency: option.value })}
                      className={`rounded-full px-3 py-2 ${isActive ? "bg-[#18C8FF]" : "bg-[#111C33]"}`}
                    >
                      <Text className={`text-xs font-semibold ${isActive ? "text-[#060F24]" : "text-[#94A3B8]"}`}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-4">
              <FieldLabel>ACCOUNT</FieldLabel>
              <View className="rounded-xl border border-[#1E2A47] bg-[#111C33] p-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {accountOptions.map((account) => {
                    const isSelected = form.accountId === account.value;

                    return (
                      <Pressable
                        key={account.value}
                        onPress={() => onChange({ ...form, accountId: account.value })}
                        className={`mr-2 rounded-lg px-3 py-2 ${isSelected ? "bg-[#18C8FF]" : "bg-[#1A243B]"}`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? "text-[#060F24]" : "text-[#CBD5E1]"}`}>
                          {account.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View className="mt-4">
              <FieldLabel>CATEGORY</FieldLabel>
              <View className="rounded-xl border border-[#1E2A47] bg-[#111C33] p-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categoryOptions.map((category) => {
                    const isSelected = form.categoryId === category.value;

                    return (
                      <Pressable
                        key={category.value}
                        onPress={() => onChange({ ...form, categoryId: category.value })}
                        className={`mr-2 rounded-lg px-3 py-2 ${isSelected ? "bg-[#18C8FF]" : "bg-[#1A243B]"}`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? "text-[#060F24]" : "text-[#CBD5E1]"}`}>
                          {category.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>



            <View className="mt-4">
              <FieldLabel>START DATE</FieldLabel>
              <Pressable
                onPress={() => setActiveDateField("startDate")}
                className="rounded-xl border border-[#1E2A47] bg-[#111C33] px-3 py-3"
              >
                <Text className={`text-base ${form.startDate ? "text-white" : "text-[#64748B]"}`}>
                  {form.startDate || "Select start date"}
                </Text>
              </Pressable>
            </View>

            <View className="mt-4">
              <FieldLabel>END DATE</FieldLabel>
              <Pressable
                onPress={() => setActiveDateField("endDate")}
                className="rounded-xl border border-[#1E2A47] bg-[#111C33] px-3 py-3"
              >
                <Text className={`text-base ${form.endDate ? "text-white" : "text-[#64748B]"}`}>
                  {form.endDate || "Select end date"}
                </Text>
              </Pressable>
            </View>
            </ScrollView>

            <View className="mt-2 flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#111C33] px-4 py-3"
              >
                <Text className="text-center text-sm font-semibold text-[#94A3B8]">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#18C8FF] px-4 py-3"
              >
                <Text className="text-center text-sm font-semibold text-[#060F24]">
                  {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>

          {activeDateField ? (
            <DateTimePicker
              value={resolveDateFromForm(activeDateField === "startDate" ? form.startDate : form.endDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
