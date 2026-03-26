export type CreateCategoryRequestDTO = {
  name: string,
  icon: string,
  color: string
}

export type CreateCategoryResponseDTO = {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalSpent?: number;
  TotalSpent?: number;
}

export type GetCategoryDTO = {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalSpent?: number;
  TotalSpent?: number;
};

export type GetCategoriesResponseDTO = GetCategoryDTO[];