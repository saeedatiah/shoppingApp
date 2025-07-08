import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { CartProvider } from "./context/CartContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types/RootStackParamList";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/Login";
import ShoppingScreen from "./screens/ShoppingScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Shopping"
            component={ShoppingScreen}
            options={{ headerTitle: "Home" }}
          />
          <Stack.Screen //first modified screen "Login" 
            name="Login"
            component={Login}
            options={{ title: "" }}

          />
          <Stack.Screen
            name="CartScreen"
            component={CartScreen}
            options={{ title: "Cart" }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: "Checkout" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
