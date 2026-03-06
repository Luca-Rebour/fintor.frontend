import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAccountsData } from "../../services/account.service";
import { getAuthUserSnapshot } from "../../services/auth.service";
import { getExchangeRateForCurrencies } from "../../services/currencies.service";
import { AccountOptionModel as AccountOption } from "../../types/models/account.model";
import { CreateGoalInputModel as CreateGoalDTO } from "../../types/models/goal.model";
import { AppIcon } from "../shared/AppIcon";
import { AppDatePicker } from "../shared/DatePicker";
import { ICON_COLOR_OPTIONS, IconColorPicker } from "../shared/IconColorPicker";

type CreateGoalModalProps = {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateTarget: (payload: CreateGoalDTO) => Promise<void>;
};

const DEFAULT_GOAL_ICON = "Target";
const DEFAULT_ACCENT_COLOR = ICON_COLOR_OPTIONS[7] ?? "#8B5CF6";

function getUserBaseCurrencyCode() {
  const authUser = getAuthUserSnapshot();
  const rawCode =
    (authUser as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.baseCurrencyCode ??
    (authUser as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.BaseCurrencyCode;

  if (typeof rawCode === "string" && rawCode.trim()) {
    return rawCode.trim().toUpperCase();
  }

  return "USD";
}

function formatAccountOptionLabel(option: AccountOption) {
  const currencyCode = option.currencyCode?.trim().toUpperCase();
  return currencyCode ? `${option.label} (${currencyCode})` : option.label;
}

function getSelectedAccountLabel(options: AccountOption[], value: string) {
  const selected = options.find((option) => option.value === value);
  return selected ? formatAccountOptionLabel(selected) : "Seleccioná una cuenta";
}

function resolveExchangeRateFromAccount(
  accountId: string,
  accountOptions: AccountOption[],
): Promise<number | null> {
  const selectedAccount = accountOptions.find((option) => option.value === accountId);

  if (!selectedAccount) {
    return Promise.resolve(null);
  }

  const accountCurrencyCode = selectedAccount.currencyCode?.trim().toUpperCase() || "USD";
  const baseCurrencyCode = getUserBaseCurrencyCode();

  if (accountCurrencyCode === baseCurrencyCode) {
    return Promise.resolve(1);
  }

  return getExchangeRateForCurrencies(accountCurrencyCode, baseCurrencyCode);
}

export function CreateGoalModal({
  visible,
  isSubmitting,
  onClose,
  onCreateTarget,
}: CreateGoalModalProps) {
  const targetDateInitial = useMemo(() => new Date(), []);
  const targetDateMinimum = useMemo(() => new Date(1970, 0, 1), []);
  const targetDateMaximum = useMemo(() => new Date(2100, 11, 31), []);
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_GOAL_ICON);
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_ACCENT_COLOR);
  const [accountId, setAccountId] = useState("");
  const [titleError, setTitleError] = useState("");
  const [targetAmountError, setTargetAmountError] = useState("");
  const [currentAmountError, setCurrentAmountError] = useState("");
  const [dateError, setDateError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountTriggerRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isActive = true;

    async function loadAccounts() {
      const data = await getAccountsData();

      if (!isActive) {
        return;
      }

      setAccountOptions(data);
      setAccountId((previous) =>
        data.some((option) => option.value === previous)
          ? previous
          : data[0]?.value ?? "",
      );
    }

    loadAccounts();

    return () => {
      isActive = false;
    };
  }, [visible]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate("");
    setSelectedIcon(DEFAULT_GOAL_ICON);
    setSelectedColor(DEFAULT_ACCENT_COLOR);
    setAccountId(accountOptions[0]?.value ?? "");
    setTitleError("");
    setTargetAmountError("");
    setCurrentAmountError("");
    setDateError("");
    setAccountError("");
    setIsAccountOpen(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function openAccountSelect() {
    accountTriggerRef.current?.measureInWindow((x, y, width) => {
      const estimatedHeight = Math.min(240, 36 + accountOptions.length * 48);
      const top = Math.max(12, y - estimatedHeight - 6);
      setDropdownPosition({ top, left: x, width });
      setIsAccountOpen((previous) => !previous);
    });
  }

  async function handleCreate() {
    const parsedTargetAmount = Number(targetAmount.replace(",", "."));
    const parsedCurrentAmount = Number((currentAmount || "0").replace(",", "."));

    const nextTitleError = title.trim() ? "" : "Ingresá un título";
    const nextTargetAmountError =
      Number.isFinite(parsedTargetAmount) && parsedTargetAmount > 0
        ? ""
        : "Ingresá un monto objetivo válido";
    const nextCurrentAmountError =
      Number.isFinite(parsedCurrentAmount) && parsedCurrentAmount >= 0
        ? ""
        : "Ingresá un monto actual válido";
    const nextDateError = targetDate ? "" : "Seleccioná una fecha objetivo";
    const nextAccountError = accountId ? "" : "Seleccioná una cuenta";

    setTitleError(nextTitleError);
    setTargetAmountError(nextTargetAmountError);
    setCurrentAmountError(nextCurrentAmountError);
    setDateError(nextDateError);
    setAccountError(nextAccountError);

    if (nextTitleError || nextTargetAmountError || nextCurrentAmountError || nextDateError || nextAccountError) {
      return;
    }

    const exchangeRate = await resolveExchangeRateFromAccount(accountId, accountOptions);
    if (!exchangeRate || exchangeRate <= 0) {
      setAccountError("No se pudo calcular el tipo de cambio de la cuenta");
      return;
    }

    await onCreateTarget({
      title: title.trim(),
      description: description.trim(),
      targetAmount: parsedTargetAmount,
      currentAmount: parsedCurrentAmount,
      icon: selectedIcon,
      targetDate,
      accentColor: selectedColor,
      accountId,
      exchangeRate,
    });

    handleClose();
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
              <Text className="text-app-textPrimary text-xl font-bold">Crear target</Text>
              <Pressable onPress={handleClose} className="p-1">
                <AppIcon name="X" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView
              className="px-5 py-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text className="text-app-textSecondary text-xs uppercase mb-2">Título</Text>
              <TextInput
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (titleError) {
                    setTitleError("");
                  }
                }}
                placeholder="Ej: Viaje a Europa"
                placeholderTextColor="#64748B"
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
              />
              {titleError ? <Text className="text-red-400 text-xs mt-2">{titleError}</Text> : null}

              <Text className="text-app-textSecondary text-xs uppercase mt-3 mb-2">Descripción (opcional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ej: Summer 2026"
                placeholderTextColor="#64748B"
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
              />

              <Text className="text-app-textSecondary text-xs uppercase mt-3 mb-2">Monto objetivo</Text>
              <TextInput
                value={targetAmount}
                onChangeText={(text) => {
                  setTargetAmount(text);
                  if (targetAmountError) {
                    setTargetAmountError("");
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#64748B"
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
              />
              {targetAmountError ? <Text className="text-red-400 text-xs mt-2">{targetAmountError}</Text> : null}

              <Text className="text-app-textSecondary text-xs uppercase mt-3 mb-2">Monto actual</Text>
              <TextInput
                value={currentAmount}
                onChangeText={(text) => {
                  setCurrentAmount(text);
                  if (currentAmountError) {
                    setCurrentAmountError("");
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#64748B"
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
              />
              {currentAmountError ? <Text className="text-red-400 text-xs mt-2">{currentAmountError}</Text> : null}

              <AppDatePicker
                label="Fecha objetivo"
                value={targetDate}
                placeholder="Seleccionar fecha objetivo"
                initialDate={targetDateInitial}
                minimumDate={targetDateMinimum}
                maximumDate={targetDateMaximum}
                iosTitle="Fecha objetivo"
                cancelLabel="Cancelar"
                doneLabel="Listo"
                onChange={(nextDate) => {
                  setTargetDate(nextDate);
                  if (dateError) {
                    setDateError("");
                  }
                }}
              />
              {dateError ? <Text className="text-red-400 text-xs mt-2">{dateError}</Text> : null}

              <Text className="text-app-textSecondary text-xs uppercase mt-3 mb-2">Cuenta</Text>
              <Pressable
                ref={accountTriggerRef}
                onPress={openAccountSelect}
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-app-textPrimary text-sm">{getSelectedAccountLabel(accountOptions, accountId)}</Text>
                <AppIcon name={isAccountOpen ? "ChevronUp" : "ChevronDown"} size={16} color="#94A3B8" />
              </Pressable>
              {accountError ? <Text className="text-red-400 text-xs mt-2">{accountError}</Text> : null}

              <IconColorPicker
                selectedIcon={selectedIcon}
                selectedColor={selectedColor}
                onChangeIcon={setSelectedIcon}
                onChangeColor={setSelectedColor}
                selectedIconLabel="Ícono seleccionado"
                colorSectionLabel="Color"
              />
            </ScrollView>

            <View className="px-5 py-4 border-t border-[#1E2A47]">
              <Pressable
                onPress={handleCreate}
                disabled={isSubmitting}
                className="items-center justify-center py-4 rounded-2xl bg-[#18C8FF]"
              >
                <Text className="text-[#060F24] text-base font-bold">
                  {isSubmitting ? "Guardando..." : "Crear target"}
                </Text>
              </Pressable>
            </View>
          </View>

          {isAccountOpen ? (
            <>
              <Pressable
                onPress={() => {
                  setIsAccountOpen(false);
                }}
                style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
              />

              <View
                style={{
                  position: "absolute",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  zIndex: 999,
                  elevation: 24,
                  maxHeight: 240,
                }}
                className="bg-[#0C1830] border border-[#1E2A47] rounded-xl overflow-hidden"
              >
                <View className="px-3 py-2 border-b border-[#1E2A47]">
                  <Text className="text-app-textSecondary text-xs uppercase">Seleccioná cuenta</Text>
                </View>

                <ScrollView nestedScrollEnabled>
                  {accountOptions.map((option) => {
                    const isSelected = option.value === accountId;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          setAccountId(option.value);
                          setIsAccountOpen(false);
                          if (accountError) {
                            setAccountError("");
                          }
                        }}
                        className="px-3 py-3 flex-row items-center justify-between border-b border-[#1E2A47]"
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"
                          }`}
                        >
                          {formatAccountOptionLabel(option)}
                        </Text>
                        {isSelected ? <AppIcon name="Check" size={14} color="#18C8FF" /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
