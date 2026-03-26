export type CategoryModel = {
  id: string;
  label: string;
  icon: string;
  color: string;
  totalSpent: number;
};

export type CategoryOptionModel = {
  value: string;
  label: string;
};

export type CreateCategoryInputModel = {
  name: string;
  icon: string;
  color: string;
};
