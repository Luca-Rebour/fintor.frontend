import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";

export type RecurringAdminFormState = {
  name: string;
  description: string;
  amount: string;
  accountName: string;
  currencyCode: string;
  startDate: string;
  endDate: string;
  transactionType: TransactionType;
  frequency: Frequency;
};

type RecurringAdminFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  form: RecurringAdminFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (next: RecurringAdminFormState) => void;
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
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor="#64748B"
      keyboardType={props.keyboardType ?? "default"}
      className="rounded-xl border border-[#1E2A47] bg-[#111C33] px-3 py-3 text-white"
    />
  );
}

export function RecurringAdminFormModal({
  visible,
  mode,
  form,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: RecurringAdminFormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-[#060F24]/70">
        <View className="max-h-[88%] rounded-t-3xl border border-[#1E2A47] bg-[#060F24] p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-app-textPrimary">
              {mode === "create" ? "Create recurring" : "Edit recurring"}
            </Text>
            <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-[#111C33]">
              <Text className="text-base font-bold text-[#94A3B8]">×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-4">
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
                onChangeText={(amount) => onChange({ ...form, amount })}
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
              <FieldLabel>ACCOUNT NAME</FieldLabel>
              <InputField
                value={form.accountName}
                onChangeText={(accountName) => onChange({ ...form, accountName })}
                placeholder="Checking Account"
              />
            </View>

            <View className="mt-4">
              <FieldLabel>CURRENCY CODE</FieldLabel>
              <InputField
                value={form.currencyCode}
                onChangeText={(currencyCode) => onChange({ ...form, currencyCode: currencyCode.toUpperCase() })}
                placeholder="USD"
              />
            </View>

            <View className="mt-4">
              <FieldLabel>START DATE (YYYY-MM-DD)</FieldLabel>
              <InputField
                value={form.startDate}
                onChangeText={(startDate) => onChange({ ...form, startDate })}
                placeholder="2026-01-01"
              />
            </View>

            <View className="mt-4">
              <FieldLabel>END DATE (YYYY-MM-DD)</FieldLabel>
              <InputField
                value={form.endDate}
                onChangeText={(endDate) => onChange({ ...form, endDate })}
                placeholder="2026-12-31"
              />
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
      </View>
    </Modal>
  );
}
