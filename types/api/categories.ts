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
}

export type GetCategoryDTO = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type GetCategoriesResponseDTO = GetCategoryDTO[];