import { apiDelete, apiGet, apiPost } from "./api.client";
import {
  CreateCategoryRequestDTO,
  CreateCategoryResponseDTO,
  GetCategoriesResponseDTO,
} from "../types/api/categories";
import {
  CategoryModel,
  CategoryOptionModel as CategoryOption,
  CreateCategoryInputModel as CreateCategoryDTO,
} from "../types/models/category.model";
import {
  mapCategoryDtoToModel,
  mapCategoryModelToOption,
  mapCreateCategoryInputModelToRequestDto,
} from "../mappers/category.mapper";

export async function getCategoriesData(): Promise<CategoryOption[]> {
  try {
    const items = await apiGet<GetCategoriesResponseDTO>("/categories");

    return items
      .map(mapCategoryDtoToModel)
      .map(mapCategoryModelToOption);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategories(): Promise<CategoryModel[]> {
  const items = await apiGet<GetCategoriesResponseDTO>("/categories");
  return items.map(mapCategoryDtoToModel);
}

export async function createCategory(payload: CreateCategoryDTO): Promise<CategoryOption> {
  const requestPayload: CreateCategoryRequestDTO = mapCreateCategoryInputModelToRequestDto(payload);
  const response = await apiPost<CreateCategoryResponseDTO>("/categories", requestPayload);

  return mapCategoryModelToOption(mapCategoryDtoToModel(response));
}

export async function deleteCategoryById(categoryId: string): Promise<void> {
  const normalizedId = String(categoryId).trim();

  if (!normalizedId) {
    throw new Error("El id de la categoría es obligatorio");
  }

  await apiDelete<unknown>(`/categories/${encodeURIComponent(normalizedId)}`);
}
