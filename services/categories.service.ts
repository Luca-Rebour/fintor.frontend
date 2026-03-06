import { apiGet, apiPost } from "./api.client";
import {
  CreateCategoryRequestDTO,
  CreateCategoryResponseDTO,
  GetCategoriesResponseDTO,
} from "../types/api/categories";
import {
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

export async function createCategory(payload: CreateCategoryDTO): Promise<CategoryOption> {
  const requestPayload: CreateCategoryRequestDTO = mapCreateCategoryInputModelToRequestDto(payload);
  const response = await apiPost<CreateCategoryResponseDTO>("/categories", requestPayload);

  return mapCategoryModelToOption(mapCategoryDtoToModel(response));
}
