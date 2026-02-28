export type CategoryApiItem = {
  id?: string | number;
  categoryId?: string | number;
  name?: string;
  categoryName?: string;
  title?: string;
  icon?: string;
  color?: string;
};

export type CategoriesResponse =
  | CategoryApiItem[]
  | { categories: CategoryApiItem[] }
  | { data: CategoryApiItem[] };

export type CategoryOption = {
  label: string;
  value: string;
};

export type CreateCategoryDTO = {
  name: string;
  icon: string;
  color: string;
};