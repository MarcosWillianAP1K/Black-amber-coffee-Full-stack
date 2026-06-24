export interface CartItemModel {
  productId: number;
  productPublicId: string;
  name: string;
  description: string | null;
  imgUrl: string | null;
  price: number;
  category: string;
  quantity: number;
  observation: string | null;
  addedAt: string;
}

export default class CartModel {
  id: number;
  clientId: number;
  items: CartItemModel[];
  createdAt: string;
  updatedAt: string;

  constructor(
    id: number,
    clientId: number,
    items: CartItemModel[],
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.clientId = clientId;
    this.items = items;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }
}
