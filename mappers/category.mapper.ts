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
  const rawTotalSpent =
    (dto as unknown as { totalSpent?: unknown; TotalSpent?: unknown }).totalSpent ??
    (dto as unknown as { totalSpent?: unknown; TotalSpent?: unknown }).TotalSpent;

  const totalSpent = Number.isFinite(Number(rawTotalSpent)) ? Math.abs(Number(rawTotalSpent)) : 0;

  return {
    id: String(dto.id ?? ""),
    label: String(dto.name ?? "Sin categoría").trim() || "Sin categoría",
    icon: String(dto.icon ?? "Tag").trim() || "Tag",
    color: String(dto.color ?? APP_COLORS.actionPrimary).trim() || APP_COLORS.actionPrimary,
    totalSpent,
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

