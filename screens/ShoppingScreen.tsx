import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, useWindowDimensions, Animated } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useCart } from "../context/CartContext";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Product } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { LinearGradient } from "expo-linear-gradient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Shopping">;

const auth = getAuth();

const ShoppingScreen = () => {
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"license" | "device">("license");
  const layout = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickyHeaderHeight = 100;
  const headerHeight = 300;

  // Animation values
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [0, stickyHeaderHeight],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useLayoutEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    navigation.setOptions({
      headerTitle: "Store",
      headerBackground: () => (
        <LinearGradient
          colors={['#029687', '#02b8a8']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      ),
      headerTintColor: '#fff',
      headerRight: () => (
        <View style={styles.headerIcons}>
          {user ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.email?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Ionicons name="log-in-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ),
    });

    return () => unsubscribe();
  }, [navigation, items, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
          featured: Math.random() > 0.7
        }));
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => p.type === activeType);
  const featuredProducts = products.filter((p) => p.featured);

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetails", { product: item })}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        duration={200}
        style={styles.card}
      >
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.price}>
              {item.price?.toLocaleString?.() || 0} SAR
            </Text>
            <TouchableOpacity
              style={styles.cartIcon}
              onPress={(e) => {
                e.stopPropagation();
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image_url: item.image_url,
                });
              }}
            >
              <Ionicons name="cart" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );

  const HeaderContent = () => (
    <Animated.View style={[styles.headerContent, {
      transform: [{ translateY: headerTranslateY }],
      opacity: headerOpacity
    }]}>
      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <Animatable.View animation="fadeIn" style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <FlatList
            horizontal
            data={featuredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.featuredCard}
                onPress={() => navigation.navigate("ProductDetails", { product: item })}
              >
                <Image source={{ uri: item.image_url }} style={styles.featuredImage} />
                <View style={styles.featuredCardContent}>
                  <Text style={styles.featuredName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.featuredBottom}>
                    <Text style={styles.featuredPrice}>
                      {item.price?.toLocaleString?.() || 0} SAR
                    </Text>
                    <TouchableOpacity
                      style={styles.featuredCartIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image_url: item.image_url,
                        });
                      }}
                    >
                      <Ionicons name="cart" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </Animatable.View>
      )}

      {/* Promo Banner */}
      <Animatable.View 
        animation="fadeIn" 
        delay={300}
        style={styles.promoBanner}
      >
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(2, 150, 135, 0.8)', 'rgba(243, 181, 69, 0.8)']}
          style={styles.bannerOverlay}
        >
          <View style={styles.bannerContent}>
            <View style={styles.offerBadge}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }}
                style={styles.offerIcon}
                resizeMode="cover"
              />
              <Text style={styles.offerText}>SPECIAL OFFER</Text>
            </View>
            <Text style={styles.bannerText}>Limited Time Deals!</Text>
            <Text style={styles.bannerSubText}>Up to 50% OFF</Text>
          </View>
        </LinearGradient>
      </Animatable.View>
    </Animated.View>
  );

  const StickyHeader = () => (
    <Animated.View style={[styles.stickyHeader, { opacity: stickyHeaderOpacity }]}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeType === "license" && styles.activeFilter,
          ]}
          onPress={() => setActiveType("license")}
        >
          <Ionicons 
            name="key" 
            size={16} 
            color={activeType === "license" ? "#fff" : "#029687"} 
            style={styles.filterIcon}
          />
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
          <Ionicons 
            name="phone-portrait" 
            size={16} 
            color={activeType === "device" ? "#fff" : "#029687"} 
            style={styles.filterIcon}
          />
          <Text
            style={
              activeType === "device" ? styles.activeText : styles.inactiveText
            }
          >
            Devices
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const FilterBar = () => (
    <View style={styles.filterBar}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeType === "license" && styles.activeFilter,
          ]}
          onPress={() => setActiveType("license")}
        >
          <Ionicons 
            name="key" 
            size={16} 
            color={activeType === "license" ? "#fff" : "#029687"} 
            style={styles.filterIcon}
          />
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
          <Ionicons 
            name="phone-portrait" 
            size={16} 
            color={activeType === "device" ? "#fff" : "#029687"} 
            style={styles.filterIcon}
          />
          <Text
            style={
              activeType === "device" ? styles.activeText : styles.inactiveText
            }
          >
            Devices
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BottomNavigationBar = () => (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate("Shopping")}
      >
        <Ionicons name="home" size={24} color="#029687" />
        <Text style={styles.navButtonText}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate("CartScreen")}
      >
        <View style={{ position: "relative" }}>
          <Ionicons name="cart" size={24} color="#029687" />
          {items.length > 0 && (
            <View style={styles.bottomNavBadge}>
              <Text style={styles.bottomNavBadgeText}>{items.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.navButtonText}>Cart</Text>
      </TouchableOpacity>
      
      {user ? (
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate("PastInvoices")}
        >
          <MaterialIcons name="receipt" size={24} color="#029687" />
          <Text style={styles.navButtonText}>Invoices</Text>
        </TouchableOpacity>
      ) : null}
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Ionicons name="person" size={24} color="#029687" />
        <Text style={styles.navButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <HeaderContent />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        contentContainerStyle={[styles.productsContainer, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Text style={styles.productsTitle}>
            {activeType === "license" ? "Software Licenses" : "Devices"}
          </Text>
        }
        ListHeaderComponentStyle={styles.listHeader}
      />
      <StickyHeader />
      <FilterBar />
      <BottomNavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f8f7",
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "#f0f8f7",
  },
  listHeader: {
    backgroundColor: "#f0f8f7",
    paddingTop: 10,
  },
  featuredContainer: {
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    marginLeft: 3,
    width: 170,
    height: 220,
    overflow: 'hidden',
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(2, 150, 135, 0.1)",
  },
  featuredImage: {
    width: '100%',
    height: 120,
    backgroundColor: "#f8fcfc",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: "#fff",
  },
  featuredName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 6,
    lineHeight: 18,
  },
  featuredBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  featuredPrice: {
    fontSize: 14,
    color: "#029687",
    fontWeight: "800",
    textShadowColor: "rgba(2, 150, 135, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredCartIcon: {
    backgroundColor: "#F3B545",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#F3B545",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: "#F3B545",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 2,
    shadowColor: "#F3B545",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  featuredText: {
    color: "#2c3e50",
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  promoBanner: {
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    elevation: 10,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(2, 150, 135, 0.2)",
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  bannerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  offerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  offerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  offerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bannerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1,
    marginBottom: 5,
    textAlign: 'center',
  },
  bannerSubText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: "#2c3e50",
    marginLeft: 20,
    marginBottom: 12,
    marginTop: 8,
    textShadowColor: "rgba(44, 62, 80, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#f0f8f7',
    zIndex: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 150, 135, 0.1)',
  },
  filterBar: {
    backgroundColor: '#f0f8f7',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 150, 135, 0.1)',
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#e6f5f3",
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    minWidth: 110,
    justifyContent: 'center',
  },
  filterIcon: {
    marginRight: 6,
  },
  activeFilter: {
    backgroundColor: "#029687",
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderColor: '#029687',
  },
  activeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  inactiveText: {
    color: "#3F4346",
    fontSize: 14,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: "#2c3e50",
    marginLeft: 20,
    marginBottom: 15,
    textShadowColor: "rgba(44, 62, 80, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardContainer: {
    width: '50%',
    padding: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#029687",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(2, 150, 135, 0.1)",
    height: 250,
  },
  imageContainer: {
    height: 130,
    backgroundColor: "#f8fcfc",
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 12,
    height: 120,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 10,
    lineHeight: 20,
    height: 40,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    color: "#029687",
    fontWeight: "800",
    textShadowColor: "rgba(2, 150, 135, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cartIcon: {
    backgroundColor: "#F3B545",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#F3B545",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingRight: 15,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3B545",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: "#3F4346",
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#F3B545",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: "#3F4346",
    fontSize: 10,
    fontWeight: "bold",
  },
  productsContainer: {
    paddingHorizontal: 5,
    paddingBottom: 80,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  navButtonText: {
    fontSize: 12,
    color: '#029687',
    marginTop: 5,
  },
  bottomNavBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F3B545',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ShoppingScreen;