import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Checkout"
>;

const CheckoutScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { items: cartItems, total, clearCart } = useContext(CartContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleCheckout = async () => {
    if (!name || !email || !phone || !address) {
      Alert.alert("خطأ", "يرجى تعبئة جميع الحقول");
      return;
    }

    try {
      await addDoc(collection(db, "shopping_carts"), {
        name,
        email,
        phone,
        address,
        items: cartItems,
        total,
        createdAt: serverTimestamp(),
      });

      clearCart();
      Alert.alert("تم", "تم إرسال طلبك بنجاح");
      navigation.navigate("Shopping");
    } catch (error) {
      console.error("Checkout Error:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء إرسال الطلب");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>معلومات الدفع</Text>

      <TextInput
        style={styles.input}
        placeholder="الاسم"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="الإيميل"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="رقم الجوال"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="العنوان"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.total}>الإجمالي: {total.toLocaleString()} ر.س</Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <Text style={styles.buttonText}>إتمام الطلب</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  total: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2196f3",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
