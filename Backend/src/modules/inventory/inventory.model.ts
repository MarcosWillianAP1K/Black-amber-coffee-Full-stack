export default class InventoryModel {
  id: number;
  publicId: string;
  code: string | null;
  name: string;
  description: string;
  category: string;
  quantityType: string | null;
  quantity: number | null;
  createdAt: string;
  updatedAt: string | null;
  img: string | null;

  constructor(
    id: number,
    publicId: string,
    code: string | null,
    name: string,
    description: string,
    category: string,
    quantityType: string | null,
    quantity: number | null,
    createdAt: string,
    updatedAt: string | null,
    img: string | null,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.code = code;
    this.name = name;
    this.description = description;
    this.category = category;
    this.quantityType = quantityType;
    this.quantity = quantity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.img = img;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDatabase(row: any): InventoryModel {
    const toStr = (v: any): string =>
      v instanceof Date ? v.toISOString() : String(v ?? "");

    let parsedQuantity: number | null = null;
    if (row.quantity != null) {
      parsedQuantity = typeof row.quantity === "string" ? parseFloat(row.quantity) : Number(row.quantity);
    }

    return new InventoryModel(
      row.id,
      row.publicId,
      row.code ?? null,
      row.name ?? "",
      row.description ?? "",
      row.category ?? "",
      row.quantityType ?? null,
      parsedQuantity,
      toStr(row.createdAt),
      row.updatedAt ? toStr(row.updatedAt) : null,
      row.img ?? null,
    );
  }
}
