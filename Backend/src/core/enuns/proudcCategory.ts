export class ProductCategory {
  static readonly COFFEE = "COFFEE";
  static readonly DRINKS = "DRINKS";
  static readonly FOOD = "FOOD";
  static readonly OTHER = "OTHER";

  static readonly VALUES = [
    ProductCategory.COFFEE,
    ProductCategory.DRINKS,
    ProductCategory.FOOD,
    ProductCategory.OTHER,
  ] as const;

  static values() {
    return ProductCategory.VALUES;
  }

  static isValid(category: string): category is (typeof ProductCategory.VALUES)[number] {
    return ProductCategory.VALUES.includes(category as any);
  }
}

export type ProductCategoryType = ReturnType<typeof ProductCategory.values>[number];