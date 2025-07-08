export type Product = {
  id: string;
  name: string;
  type: "license" | "device";
  price: number;
  image_url: string;
};