export class ProductCategory {
  static readonly CAFE = "cafe";
  static readonly CHA = "cha";
  static readonly SUCO = "suco";
  static readonly SMOOTHIE = "smoothie";
  static readonly LANCHE = "lanche";
  static readonly SOBREMESA = "sobremesa";
  static readonly OUTRO = "outro";

  static readonly VALUES = [
    ProductCategory.CAFE,
    ProductCategory.CHA,
    ProductCategory.SUCO,
    ProductCategory.SMOOTHIE,
    ProductCategory.LANCHE,
    ProductCategory.SOBREMESA,
    ProductCategory.OUTRO,
  ] as const;

  static values() {
    return ProductCategory.VALUES;
  }

  static isValid(category: string): category is (typeof ProductCategory.VALUES)[number] {
    return ProductCategory.VALUES.includes(category as any);
  }
}

export type ProductCategoryType = ReturnType<typeof ProductCategory.values>[number];