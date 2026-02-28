import { apiGet, apiPost } from "./api.client";
import {
  CategoriesResponse,
  CategoryApiItem,
  CategoryOption,
  CreateCategoryDTO,
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

export async function createCategory(payload: CreateCategoryDTO): Promise<CategoryOption> {
  const requestPayload = {
    name: payload.name,
    icon: payload.icon,
    color: payload.color,
  };

  const response = await apiPost<CategoryApiItem>("/categories", requestPayload);
  const normalized = normalizeCategory(response);

  if (!normalized) {
    throw new Error("La categoría creada no tiene un formato válido");
  }

  return normalized;
}