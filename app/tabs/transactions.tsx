import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { AppIcon } from "../../components/shared/AppIcon";
import {
  addNewTransaction,
  deleteTransactionById,
  getTransactionsData,
  subscribeToTransactions,
} from "../../services/transactions.service";
import { createAccount, getAccountsData } from "../../services/account.service";
import { getExchangeRateForCurrencies, loadCurrencyOptions } from "../../services/currencies.service";
import { getAuthUserSnapshot, subscribeToAuthUser } from "../../services/auth.service";
import { CreateTransactionDTO, TransactionDTO } from "../../types/transaction";
import { AccountOption, CreateAccountDTO } from "../../types/account";
import { User } from "../../types/api/signUp";
import { createCategory } from "../../services/categories.service";
import { CreateCategoryDTO } from "../../types/category";
import {
  CreateExpenseModal,
} from "../../components/transactions/CreateExpenseModal";
import { TransactionActionButtons } from "../../components/transactions/TransactionActionButtons";
import { CreateIncomeModal} from "../../components/transactions/CreateIncomeModal";
import { CreateAccountModal } from "../../components/transactions/CreateAccountModal";
import { CreateCategoryModal } from "../../components/transactions/CreateCategoryModal";
import { TransactionListItem } from "../../components/transactions/TransactionListItem";
import { TransactionSummaryCards } from "../../components/transactions/TransactionSummaryCards";

type TransactionGroup = {
  dateKey: string;
  title: string;
  items: TransactionDTO[];
};

type TransactionListRow =
  | {
      id: string;
      kind: "group";
      title: string;
    }
  | {
      id: string;
      kind: "transaction";
      transaction: TransactionDTO;
    };

const ALL_ACCOUNTS_VALUE = "__all_accounts__";
  type AmountDisplayCurrency = "BASE" | "USD";

function getSelectedAccountLabel(options: AccountOption[], selectedAccountValue: string) {
  if (selectedAccountValue === ALL_ACCOUNTS_VALUE) {
    return "Todas las cuentas";
  }

  return options.find((option) => option.value === selectedAccountValue)?.label ?? "Todas las cuentas";
}

function getLocalDateKey(input: string) {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getGroupTitle(dateKey: string) {
  const todayKey = getLocalDateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterdayDate.toISOString());

  if (dateKey === todayKey) {
    return "Today";
  }

  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function TransactionsScreen() {
  const [transactionsData, setTransactionsData] = useState<TransactionDTO[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [selectedAccountValue, setSelectedAccountValue] = useState<string>(ALL_ACCOUNTS_VALUE);
  const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false);
  const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false);
  const [amountDisplayCurrency, setAmountDisplayCurrency] =
    useState<AmountDisplayCurrency>("BASE");
  const [isCreateExpenseModalVisible, setIsCreateExpenseModalVisible] =
    useState(false);
  const [isCreateIncomeModalVisible, setIsCreateIncomeModalVisible] =
    useState(false);
  const [isCreateAccountModalVisible, setIsCreateAccountModalVisible] =
    useState(false);
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] =
    useState(false);
  const [isItemSwipeActive, setIsItemSwipeActive] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(getAuthUserSnapshot());
  const [baseToUsdRate, setBaseToUsdRate] = useState<number | null>(null);

  function toggleFiltersMenu() {
    setIsFiltersMenuOpen((previous) => {
      const nextValue = !previous;

      if (!nextValue) {
        setIsAccountFilterOpen(false);
      }

      return nextValue;
    });
  }

  function getUserBaseCurrencyCode(user: User | null) {
    const rawCode =
      (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.baseCurrencyCode ??
      (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.BaseCurrencyCode;

    if (typeof rawCode === "string" && rawCode.trim()) {
      return rawCode.trim().toUpperCase();
    }

    return "USD";
  }

  const baseCurrencyCode = getUserBaseCurrencyCode(authUser);

  function getAccountCurrencyCode(accountId: string) {
    return (
      accountOptions
        .find((account) => account.value === accountId)
        ?.currencyCode?.trim()
        .toUpperCase() || "USD"
    );
  }

  async function resolveExchangeRateForAccount(accountId: string): Promise<number | null> {
    const accountCurrencyCode = getAccountCurrencyCode(accountId);

    const baseCurrencyCode = getUserBaseCurrencyCode(authUser);

    if (accountCurrencyCode === baseCurrencyCode) {
      return null;
    }

    return getExchangeRateForCurrencies(accountCurrencyCode, baseCurrencyCode);
  }

  function getAmountInBaseCurrency(transaction: TransactionDTO) {
    const amount = Math.abs(transaction.amount);
    const exchangeRate = Number(transaction.exchangeRate);

    if (Number.isFinite(exchangeRate) && exchangeRate > 0) {
      return amount * exchangeRate;
    }

    return amount;
  }

  function getDisplayAmount(transaction: TransactionDTO) {
    const amountInBaseCurrency = getAmountInBaseCurrency(transaction);

    if (amountDisplayCurrency === "BASE") {
      return amountInBaseCurrency;
    }

    if (baseCurrencyCode === "USD") {
      return amountInBaseCurrency;
    }

    const transactionCurrencyCode = transaction.currencyCode?.trim().toUpperCase() || "USD";
    if (transactionCurrencyCode === "USD") {
      return Math.abs(transaction.amount);
    }

    if (Number.isFinite(baseToUsdRate) && (baseToUsdRate ?? 0) > 0) {
      return amountInBaseCurrency * (baseToUsdRate as number);
    }

    return amountInBaseCurrency;
  }

  const summaryCurrencyCode = amountDisplayCurrency === "USD" ? "USD" : baseCurrencyCode;

  async function buildTransactionPayload(
    payload: CreateTransactionDTO,
    transactionType: 0 | 1,
  ): Promise<CreateTransactionDTO | null> {
    const accountCurrencyCode = getAccountCurrencyCode(payload.accountId);
    const baseCurrencyCode = getUserBaseCurrencyCode(authUser);
    const exchangeRate = await resolveExchangeRateForAccount(payload.accountId);

    if (exchangeRate === null && accountCurrencyCode !== baseCurrencyCode) {
      Alert.alert("Error", "No se pudo obtener el tipo de cambio para esta transacción.");
      return null;
    }

    return {
      amount: payload.amount,
      description: payload.description,
      categoryId: payload.categoryId,
      transactionType,
      icon: payload.icon,
      accountId: payload.accountId,
      exchangeRate,
    };
  }

  async function loadAccounts() {
    const data = await getAccountsData();
    setAccountOptions(data);
    setSelectedAccountValue((previous) =>
      previous === ALL_ACCOUNTS_VALUE || data.some((option) => option.value === previous)
        ? previous
        : ALL_ACCOUNTS_VALUE,
    );
  }

  async function loadTransactions(showInitialLoader = true) {
    try {
      if (showInitialLoader) {
        setIsLoading(true);
      }
      setError("");
      await getTransactionsData();
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load transactions";
      setError(message);
    } finally {
      if (showInitialLoader) {
        setIsLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await Promise.all([loadTransactions(false), loadAccounts()]);
    setIsRefreshing(false);
  }

  useEffect(() => {
    const unsubscribe = subscribeToTransactions((transactions) => {
      setTransactionsData(transactions);
    });
    const unsubscribeAuth = subscribeToAuthUser((user) => {
      setAuthUser(user);
    });

    loadCurrencyOptions();
    loadAccounts();
    loadTransactions();

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBaseToUsdRate() {
      if (amountDisplayCurrency !== "USD") {
        return;
      }

      if (baseCurrencyCode === "USD") {
        setBaseToUsdRate(1);
        return;
      }

      const rate = await getExchangeRateForCurrencies(baseCurrencyCode, "USD");
      if (!isMounted) {
        return;
      }

      setBaseToUsdRate(rate);
    }

    loadBaseToUsdRate();

    return () => {
      isMounted = false;
    };
  }, [amountDisplayCurrency, baseCurrencyCode]);

  const filteredTransactions = useMemo(() => {
    if (selectedAccountValue === ALL_ACCOUNTS_VALUE) {
      return transactionsData;
    }

    const selectedLabel = accountOptions.find((option) => option.value === selectedAccountValue)?.label;
    if (!selectedLabel) {
      return transactionsData;
    }

    const normalizedSelectedAccount = selectedLabel.trim().toLowerCase();
    return transactionsData.filter(
      (transaction) => transaction.accountName?.trim().toLowerCase() === normalizedSelectedAccount,
    );
  }, [transactionsData, accountOptions, selectedAccountValue]);

  const monthlySummary = useMemo(
    () => calculateMonthlySummary(filteredTransactions),
    [filteredTransactions, amountDisplayCurrency, baseToUsdRate, baseCurrencyCode],
  );

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    const map = new Map<string, TransactionDTO[]>();

    for (const txn of filteredTransactions) {
      const key = getLocalDateKey(txn.date);
      const current = map.get(key) ?? [];
      current.push(txn);
      map.set(key, current);
    }

    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // fecha descendente
      .map(([dateKey, items]) => ({
        dateKey,
        title: getGroupTitle(dateKey),
        items: items.sort((a, b) => +new Date(b.date) - +new Date(a.date)),
      }));
  }, [filteredTransactions]);

  const transactionRows = useMemo<TransactionListRow[]>(() => {
    return groupedTransactions.flatMap((group) => {
      const groupHeader: TransactionListRow = {
        id: `group-${group.dateKey}`,
        kind: "group",
        title: group.title,
      };

      const groupItems: TransactionListRow[] = group.items.map((txn) => ({
        id: `txn-${txn.id}`,
        kind: "transaction",
        transaction: txn,
      }));

      return [groupHeader, ...groupItems];
    });
  }, [groupedTransactions]);

  const overallBalance = useMemo(() => {
    return filteredTransactions.reduce((balance, transaction) => {
      const amount = getDisplayAmount(transaction);

      if (transaction.transactionType === 0) {
        return balance + amount;
      }

      if (transaction.transactionType === 1) {
        return balance - amount;
      }

      return balance;
    }, 0);
  }, [filteredTransactions, amountDisplayCurrency, baseToUsdRate, baseCurrencyCode]);

  const toggleExpanded = (id: string) => {
    setExpandedTransactionId((prev) => (prev === id ? null : id));
  };

  async function handleCreateExpense(payload: CreateTransactionDTO) {
    const toCreate = await buildTransactionPayload(payload, 1);
    if (!toCreate) {
      return;
    }

    await addNewTransaction(toCreate);
  }

  async function handleCreateIncome(payload: CreateTransactionDTO) {
    const toCreate = await buildTransactionPayload(payload, 0);
    if (!toCreate) {
      return;
    }

    await addNewTransaction(toCreate);
  }

  async function handleCreateAccount(payload: Omit<CreateAccountDTO, "exchangeRate">) {
    try {
      const normalizedInitialBalance = Number(payload.initialBalance);

      if (!Number.isFinite(normalizedInitialBalance)) {
        Alert.alert("Error", "El saldo inicial no es válido.");
        return;
      }

      const accountCurrencyCode = payload.currencyCode.trim().toUpperCase() || "USD";
      const userBaseCurrencyCode = getUserBaseCurrencyCode(authUser);

      let exchangeRate = 1;
      if (accountCurrencyCode !== userBaseCurrencyCode) {
        const resolvedRate = await getExchangeRateForCurrencies(accountCurrencyCode, userBaseCurrencyCode);

        if (resolvedRate === null) {
          Alert.alert("Error", "No se pudo obtener el tipo de cambio para crear la cuenta.");
          return;
        }

        exchangeRate = resolvedRate;
      }

      await createAccount({
        ...payload,
        initialBalance: normalizedInitialBalance,
        currencyCode: accountCurrencyCode,
        exchangeRate,
      });
      await loadAccounts();
      setSelectedAccountValue(ALL_ACCOUNTS_VALUE);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "No se pudo crear la cuenta";
      Alert.alert("Error", message);
    }
  }

  async function handleCreateCategory(payload: CreateCategoryDTO) {
    try {
      await createCategory(payload);
      Alert.alert("Categoría creada", `La categoría \"${payload.name}\" fue creada correctamente.`);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "No se pudo crear la categoría";
      Alert.alert("Error", message);
    }
  }

  function handleRequestDeleteTransaction(transactionId: string) {
    Alert.alert(
      "Eliminar transacción",
      "¿Seguro que quieres eliminar esta transacción? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransactionById(transactionId);
            } catch (deleteError) {
              const message = deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la transacción";
              Alert.alert("Error", message);
            }
          },
        },
      ],
    );
  }

  function calculateMonthlySummary(transactions: TransactionDTO[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let totalSpending = 0;
    let totalIncome = 0;

    for (const txn of transactions) {
      const txnDate = new Date(txn.date);
      if (
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      ) {
        const convertedAmount = getDisplayAmount(txn);

        if (txn.transactionType == 1) {
          totalSpending += convertedAmount;
        } else if (txn.transactionType == 0) {
          totalIncome += convertedAmount;
        }
      }
    }

    return { totalSpending, totalIncome };
  }

  return (
    <View className="flex-1 bg-[#060F24]">
      <FlatList
        data={!isLoading && !error ? transactionRows : []}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isItemSwipeActive}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: 110 }}
        ListHeaderComponent={
          <>
            <View className="px-4 py-3 border-b border-[#1E2A47]">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-app-textPrimary">
                  Transactions
                </Text>

                <Pressable
                  onPress={toggleFiltersMenu}
                  className="h-10 w-10 items-center justify-center rounded-xl border border-[#1E2A47] bg-[#0C1830]"
                >
                  <AppIcon
                    name="Filter"
                    size={16}
                    color={isFiltersMenuOpen ? "#18C8FF" : "#94A3B8"}
                  />
                </Pressable>
              </View>

              {isFiltersMenuOpen ? (
                <>
                  <View className="mt-3 relative">
                    <Text className="text-app-textSecondary text-xs uppercase mb-2">Cuenta</Text>
                    <Pressable
                      onPress={() => setIsAccountFilterOpen((previous) => !previous)}
                      className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 flex-row items-center justify-between"
                    >
                      <Text className="text-app-textPrimary text-sm">
                        {getSelectedAccountLabel(accountOptions, selectedAccountValue)}
                      </Text>
                      <AppIcon
                        name={isAccountFilterOpen ? "ChevronUp" : "ChevronDown"}
                        size={16}
                        color="#94A3B8"
                      />
                    </Pressable>

                    {isAccountFilterOpen ? (
                      <View
                        className="absolute left-0 right-0 top-full mt-2 bg-[#0C1830] border border-[#1E2A47] rounded-xl overflow-hidden max-h-56 z-50"
                        style={{ elevation: 24 }}
                      >
                        <ScrollView nestedScrollEnabled>
                          {[{ value: ALL_ACCOUNTS_VALUE, label: "Todas las cuentas" }, ...accountOptions].map((option) => {
                            const isSelected = option.value === selectedAccountValue;
                            return (
                              <Pressable
                                key={option.value}
                                onPress={() => {
                                  setSelectedAccountValue(option.value);
                                  setIsAccountFilterOpen(false);
                                }}
                                className="px-3 py-3 flex-row items-center justify-between border-b border-[#1E2A47]"
                              >
                                <Text className={`text-sm ${isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"}`}>
                                  {option.label}
                                </Text>
                                {isSelected ? <AppIcon name="Check" size={14} color="#18C8FF" /> : null}
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    ) : null}
                  </View>

                  <View className="mt-3">
                    <Text className="text-app-textSecondary text-xs uppercase mb-2">Moneda de montos</Text>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setAmountDisplayCurrency("BASE")}
                        className={`flex-1 rounded-xl px-3 py-2 border ${
                          amountDisplayCurrency === "BASE"
                            ? "bg-[#12304A] border-[#18C8FF]"
                            : "bg-[#0C1830] border-[#1E2A47]"
                        }`}
                      >
                        <Text
                          className={`text-center text-sm ${
                            amountDisplayCurrency === "BASE"
                              ? "text-app-primary font-semibold"
                              : "text-app-textPrimary"
                          }`}
                        >
                          Principal ({baseCurrencyCode})
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setAmountDisplayCurrency("USD")}
                        className={`flex-1 rounded-xl px-3 py-2 border ${
                          amountDisplayCurrency === "USD"
                            ? "bg-[#12304A] border-[#18C8FF]"
                            : "bg-[#0C1830] border-[#1E2A47]"
                        }`}
                      >
                        <Text
                          className={`text-center text-sm ${
                            amountDisplayCurrency === "USD"
                              ? "text-app-primary font-semibold"
                              : "text-app-textPrimary"
                          }`}
                        >
                          USD
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : null}
            </View>

            <TransactionSummaryCards
              monthlySpending={monthlySummary.totalSpending}
              monthlyIncome={monthlySummary.totalIncome}
              balance={overallBalance}
              currencyCode={summaryCurrencyCode}
            />
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center justify-center mt-10">
              <ActivityIndicator size="large" color="#18C8FF" />
            </View>
          ) : error ? (
            <View className="items-center justify-center px-6 mt-8">
              <Text className="text-center text-base text-app-textPrimary">
                {error}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.kind === "group") {
            return (
              <View className="mb-1 px-4">
                <Text className="text-app-textSecondary text-xs uppercase mb-2">
                  {item.title}
                </Text>
              </View>
            );
          }

          return (
            <View className="px-2">
              <TransactionListItem
                transaction={item.transaction}
                isExpanded={expandedTransactionId === item.transaction.id}
                onToggle={toggleExpanded}
                onSwipeLeft={handleRequestDeleteTransaction}
                onDeleteRequest={handleRequestDeleteTransaction}
                onSwipeGestureChange={setIsItemSwipeActive}
              />
            </View>
          );
        }}
      />

      <TransactionActionButtons
        onAddExpense={() => setIsCreateExpenseModalVisible(true)}
        onAddIncome={() => setIsCreateIncomeModalVisible(true)}
        onAddAccount={() => setIsCreateAccountModalVisible(true)}
        onAddCategory={() => setIsCreateCategoryModalVisible(true)}
        onMenuOpen={() => {
          loadCurrencyOptions();
        }}
      />

      <CreateExpenseModal
        visible={isCreateExpenseModalVisible}
        onClose={() => setIsCreateExpenseModalVisible(false)}
        onCreateExpense={handleCreateExpense}
      />

      <CreateIncomeModal
        visible={isCreateIncomeModalVisible}
        onClose={() => setIsCreateIncomeModalVisible(false)}
        onCreateIncome={handleCreateIncome}
      />

      <CreateAccountModal
        visible={isCreateAccountModalVisible}
        onClose={() => setIsCreateAccountModalVisible(false)}
        onCreateAccount={handleCreateAccount}
      />

      <CreateCategoryModal
        visible={isCreateCategoryModalVisible}
        onClose={() => setIsCreateCategoryModalVisible(false)}
        onCreateCategory={handleCreateCategory}
      />
    </View>
  );
}
