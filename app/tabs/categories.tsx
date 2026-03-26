import { APP_COLORS } from "../../constants/colors";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../components/shared/AppIcon";
import { CreateCategoryModal } from "../../components/transactions/CreateCategoryModal";
import { resolveApiErrorMessage } from "../../i18n/resolve-api-error-message";
import {
  createCategory,
  deleteCategoryById,
  getCategories,
} from "../../services/categories.service";
import { getAuthUserSnapshot, subscribeToAuthUser } from "../../services/auth.service";
import {
  CategoryModel,
  CreateCategoryInputModel as CreateCategoryDTO,
} from "../../types/models/category.model";
import { AuthUserModel as User } from "../../types/models/auth.model";

function isProtectedCategory(categoryLabel: string): boolean {
  return categoryLabel.trim().toLowerCase() === "general";
}

function isGeneralCategory(categoryLabel: string): boolean {
  return categoryLabel.trim().toLowerCase() === "general";
}

function getUserBaseCurrencyCode(user: User | null): string {
  const rawCode =
    (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.baseCurrencyCode ??
    (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.BaseCurrencyCode;

  if (typeof rawCode === "string" && rawCode.trim()) {
    return rawCode.trim().toUpperCase();
  }

  return "USD";
}

function formatCurrencyAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(getAuthUserSnapshot());

  const baseCurrencyCode = getUserBaseCurrencyCode(authUser);

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthUser((user) => {
      setAuthUser(user);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  async function loadCategories(showLoader = true) {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      setError("");
      const categoriesResponse = await getCategories();

      setCategories(categoriesResponse);
    } catch (loadError) {
      const message = resolveApiErrorMessage(loadError, t, "categories.errors.failedToLoad");
      setError(message);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const categoriesWithTotals = useMemo(
    () =>
      [...categories].sort((left, right) => {
        const isLeftGeneral = isGeneralCategory(left.label);
        const isRightGeneral = isGeneralCategory(right.label);

        if (isLeftGeneral && !isRightGeneral) {
          return -1;
        }

        if (!isLeftGeneral && isRightGeneral) {
          return 1;
        }

        return right.totalSpent - left.totalSpent;
      }),
    [categories],
  );

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadCategories(false);
    setIsRefreshing(false);
  }

  async function handleCreateCategory(payload: CreateCategoryDTO) {
    try {
      await createCategory(payload);
      Alert.alert(
        t("transactions.success.categoryCreatedTitle"),
        t("transactions.success.categoryCreatedMessage", { name: payload.name }),
      );
      await loadCategories(false);
    } catch (createError) {
      const message = resolveApiErrorMessage(createError, t, "transactions.errors.createCategoryFailed");
      Alert.alert(t("transactions.errors.genericTitle"), message);
      throw createError;
    }
  }

  function handleRequestDeleteCategory(category: CategoryModel) {
    Alert.alert(
      t("categories.delete.title"),
      t("categories.delete.message", { name: category.label }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("categories.delete.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategoryById(category.id);
              await loadCategories(false);
            } catch (deleteError) {
              const message = resolveApiErrorMessage(deleteError, t, "categories.errors.deleteFailed");
              Alert.alert(t("categories.errors.genericTitle"), message);
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bgPrimary">
        <ActivityIndicator color={APP_COLORS.actionPrimary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bgPrimary px-6">
        <Text className="text-center text-sm text-app-textSecondary">{error}</Text>
        <Pressable
          className="mt-4 rounded-xl bg-app-accentBlue px-4 py-3"
          onPress={() => loadCategories()}
        >
          <Text className="font-semibold text-[#061324]">{t("common.retry")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bgPrimary">
      <View className="border-b border-app-border px-5 pb-4 pt-6">
        <Text className="text-2xl font-bold text-app-textPrimary">{t("categories.title")}</Text>
        <Text className="mt-1 text-sm text-app-textSecondary">{t("categories.subtitle")}</Text>

        <Pressable
          onPress={() => setIsCreateCategoryModalVisible(true)}
          className="mt-4 flex-row items-center justify-center rounded-2xl bg-app-accentBlue px-4 py-3"
        >
          <AppIcon name="Plus" color="#061324" size={18} />
          <Text className="ml-2 text-base font-bold text-[#061324]">{t("categories.actions.create")}</Text>
        </Pressable>
      </View>

      <FlatList
        data={categoriesWithTotals}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center rounded-2xl border border-app-border bg-app-bgSecondary p-6">
            <Text className="text-center text-sm text-app-textSecondary">{t("categories.empty")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-3 flex-row items-center rounded-2xl border border-app-border bg-app-bgSecondary p-4">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${item.color}22` }}
            >
              <AppIcon name={item.icon} color={item.color || APP_COLORS.actionPrimary} size={18} />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-app-textPrimary">{item.label}</Text>
              <Text className="mt-1 text-xs text-app-textSecondary">
                {t("categories.spent", {
                  amount: formatCurrencyAmount(item.totalSpent, baseCurrencyCode),
                })}
              </Text>
            </View>

            {!isProtectedCategory(item.label) ? (
              <Pressable
                onPress={() => handleRequestDeleteCategory(item)}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2"
              >
                <Text className="text-xs font-semibold text-red-400">{t("categories.actions.delete")}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />

      <CreateCategoryModal
        visible={isCreateCategoryModalVisible}
        onClose={() => setIsCreateCategoryModalVisible(false)}
        onCreateCategory={handleCreateCategory}
      />
    </View>
  );
}