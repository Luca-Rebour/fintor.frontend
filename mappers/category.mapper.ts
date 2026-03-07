import { APP_COLORS } from "../constants/colors";
import {
  CreateCategoryRequestDTO,
  CreateCategoryResponseDTO,
  GetCategoryDTO,
} from "../types/api/categories";
import {
  CategoryModel,
  CategoryOptionModel,
  CreateCategoryInputModel,
} from "../types/models/category.model";

export function mapCategoryDtoToModel(dto: GetCategoryDTO | CreateCategoryResponseDTO): CategoryModel {
  console.log(dto);
  return {
    id: String(dto.id ?? ""),
    label: String(dto.name ?? "Sin categoría").trim() || "Sin categoría",
    icon: String(dto.icon ?? "Tag").trim() || "Tag",
    color: String(dto.color ?? APP_COLORS.actionPrimary).trim() || APP_COLORS.actionPrimary,
  };
}

export function mapCategoryModelToOption(model: CategoryModel): CategoryOptionModel {
  return {
    value: model.id,
    label: model.label,
  };
}

export function mapCreateCategoryInputModelToRequestDto(model: CreateCategoryInputModel): CreateCategoryRequestDTO {
  return {
    name: model.name.trim(),
    icon: model.icon.trim(),
    color: model.color.trim(),
  };
}

