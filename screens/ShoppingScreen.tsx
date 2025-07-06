import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useCart } from "../context/CartContext";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

type Product = {
  id: string;
  name: string;
  type: "license" | "device";
  price: number;
  image_url: string;
};

const auth = getAuth();

const ShoppingScreen = () => {
  const { addToCart,items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"license" | "device">("license");
  const layout = useWindowDimensions();
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);

  useLayoutEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    navigation.setOptions({
      headerTitle: "Store",
      headerRight: () => (
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("CartScreen" as never)}>
  <View style={{ position: "relative" }}>
    <Ionicons name="cart-outline" size={24} style={styles.icon} />
    {items.length > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{items.length}</Text>
      </View>
    )}
  </View>
</TouchableOpacity>

          {user ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.email?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("Login" as never)}
            >
              <Ionicons name="log-in-outline" size={24} style={styles.icon} />
            </TouchableOpacity>
          )}
        </View>
      ),
    });

    return () => unsubscribe();
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setProducts(data);
      } catch (err) {
        console.error("فشل تحميل المنتجات", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => p.type === activeType);

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={200}
      style={[styles.card, { width: layout.width / 2 - 20 }]}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.cardContent}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.price}>
            {item.price?.toLocaleString?.() || 0} ر.س
          </Text>
          <TouchableOpacity
            style={styles.cartIcon}
            onPress={() =>
              addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
              })
            }
          >
            <Ionicons name="cart" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeType === "license" && styles.activeFilter,
          ]}
          onPress={() => setActiveType("license")}
        >
          <Text
            style={
              activeType === "license" ? styles.activeText : styles.inactiveText
            }
          >
            Licenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeType === "device" && styles.activeFilter,
          ]}
          onPress={() => setActiveType("device")}
        >
          <Text
            style={
              activeType === "device" ? styles.activeText : styles.inactiveText
            }
          >
            Devices
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 8,
    paddingVertical: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#eee",
  },
  activeFilter: {
    backgroundColor: "black",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "black",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  image: {
    width: "100%",
    height: 100,
    marginBottom: 8,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 13,
    color: "green",
  },
  cartIcon: {
    backgroundColor: "black",
    padding: 6,
    borderRadius: 6,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingRight: 12,
  },
  icon: {
    color: "#000",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  badge: {
  position: "absolute",
  top: -5,
  right: -10,
  backgroundColor: "red",
  borderRadius: 10,
  paddingHorizontal: 5,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1,
},
badgeText: {
  color: "white",
  fontSize: 10,
  fontWeight: "bold",
},
});

export default ShoppingScreen;
