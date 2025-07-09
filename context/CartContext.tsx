import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Product = {
  quantity: number;
  id: string;
  name: string;
  price: number;
  image_url: string;
};

type CartContextType = {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
};

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      const json = await AsyncStorage.getItem("cart");
      if (json) {
        setItems(JSON.parse(json));
      }
    };
    loadCart();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    if (!items.find((p) => p.id === product.id)) {
      setItems((prev) => [...prev, product]);
    }
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
