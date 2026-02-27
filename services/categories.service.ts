import { apiGet } from "./api.client";
import {
  CategoriesResponse,
  CategoryApiItem,
  CategoryOption,
} from "../types/category";

function normalizeCategory(item: CategoryApiItem): CategoryOption | null {
  const rawId = item.id ?? item.categoryId;
  const rawLabel = item.name ?? item.categoryName ?? item.title;

  if (rawId === undefined || rawId === null || !rawLabel) {
    return null;
  }

  return {
    value: String(rawId),
    label: String(rawLabel).trim(),
  };
}

export async function getCategoriesData(): Promise<CategoryOption[]> {
  try {
    const response = await apiGet<CategoriesResponse>("/categories");
    const items = Array.isArray(response)
      ? response
      : "categories" in response
        ? response.categories
        : response.data;

    return items
      .map(normalizeCategory)
      .filter((category): category is CategoryOption => category !== null);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}