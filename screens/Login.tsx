import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import FormikInput from "../components/ui/FormikInput";

type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CartScreen"
>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Incorrect Email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Welcome back! 😊", "You have successfully logged in.");
      navigation.navigate("Shopping");
    } catch (error: any) {
      Alert.alert("Something Went Wrong ):", error.message);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate("Shopping");
    Alert.alert("Guest Access", "You're entering as a guest");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.backgroundShape}></View>
      <View style={styles.backgroundShape2}></View>

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/LazyWait-logo.webp")}
            style={styles.logo}
            accessibilityLabel="Company Logo"
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContent}>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={(values) => handleLogin(values.email, values.password)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <FormikInput
                  name="email"
                  label="Email"
                  placeholder="e.g. Norah@gmail.com"
                  type="email"
                  icon="email"
                />

                
                <FormikInput
                  name="password"
                  label="Password"
                  placeholder="Tip: Use uppercase, numbers, and !@#"
                  type="password"
                  icon="lock"
                />
                

                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.guestButton}
                  onPress={handleGuestLogin}
                >
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <Text style={styles.signupLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f5f3',
  },
  backgroundShape2: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 230,
    backgroundColor: '#F3B545',
    opacity: 0.0,
    borderRadius: 70,
    transform: [{ scaleX: 2 }, { scaleY: 1.5 }],
  },
  backgroundShape: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 200,
    backgroundColor: '#029687',
    opacity: 0.0,
    borderRadius: 110,
    transform: [{ scaleX: 2 }, { scaleY: 1.5 }],
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  formContent: {
    marginTop: 10, 
  },
  logo: {
    width: 250,
    height: 150,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    padding: 15,
    paddingLeft: 45,
    fontSize: 16,
    color: '#3F4346',
  },
  label: {
    color: '#3F4346',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  error: {
    color: '#F3B545',
    marginTop: 5,
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: '#029687',
    borderRadius: 70,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  guestButton: {
    backgroundColor: '#e6f5f3',
    borderRadius: 70,
    padding: 15,
    alignItems: 'center',
    borderColor: '#F3B545',
    borderWidth: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButtonText: {
    color: '#3F4346',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  signupText: {
    color: '#3F4346',
  },
  signupLink: {
    color: '#029687',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
