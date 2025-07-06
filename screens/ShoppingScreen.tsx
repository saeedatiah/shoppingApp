import React from "react";
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

type Product = {
  id: string;
  name: string;
  type: "license" | "device";
  price: number;
  image_url: string;
};

const ShoppingScreen = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeType, setActiveType] = React.useState<"license" | "device">(
    "license"
  );
  const layout = useWindowDimensions();

  React.useEffect(() => {
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

  //Card
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
      <Text style={styles.price}>{item.price.toLocaleString()} ر.س</Text>

      <TouchableOpacity style={styles.cartIcon}>
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
            licenses
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
            devices
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
  elevation: 3, // لأندرويد
  shadowColor: "#000", // للـ iOS
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
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
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
 
});

export default ShoppingScreen;
