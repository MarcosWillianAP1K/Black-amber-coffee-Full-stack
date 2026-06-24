export default class InventoryModel {
  id: number;
  publicId: string;
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  minQuantity: number;
  imgUrl: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: number,
    publicId: string,
    code: string | null,
    name: string,
    description: string | null,
    category: string | null,
    quantity: number,
    unit: string,
    minQuantity: number,
    imgUrl: string | null,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.code = code;
    this.name = name;
    this.description = description;
    this.category = category;
    this.quantity = quantity;
    this.unit = unit;
    this.minQuantity = minQuantity;
    this.imgUrl = imgUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDatabase(row: any): InventoryModel {
    const toStr = (v: any): string =>
      v instanceof Date ? v.toISOString() : String(v ?? "");

    let parsedQuantity = 0;
    if (row.quantity != null) {
      parsedQuantity = typeof row.quantity === "string" ? parseFloat(row.quantity) : Number(row.quantity);
    }

    let parsedMinQuantity = 0;
    if (row.minQuantity != null) {
      parsedMinQuantity = typeof row.minQuantity === "string" ? parseFloat(row.minQuantity) : Number(row.minQuantity);
    }

    return new InventoryModel(
      row.id,
      row.publicId,
      row.code ?? null,
      row.name ?? "",
      row.description ?? null,
      row.category ?? null,
      parsedQuantity,
      row.unit ?? "",
      parsedMinQuantity,
      row.imgUrl ?? null,
      toStr(row.createdAt),
      toStr(row.updatedAt),
    );
  }
}
