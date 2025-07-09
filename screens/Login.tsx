import React from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, Animated, Easing } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import FormikInput from "../components/ui/FormikInput";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CartScreen"
>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

const LoginScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Welcome back! 👋", "You've successfully logged in.");
      navigation.navigate("Shopping");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate("Shopping");
    Alert.alert("Guest Mode", "You're browsing as a guest");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={['#e6f5f3', '#d1f0ed']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative elements */}
      <Animatable.View 
        animation="fadeIn"
        duration={1500}
        style={[styles.circle, styles.circleTop]}
      />
      <Animatable.View 
        animation="fadeIn"
        duration={1500}
        delay={300}
        style={[styles.circle, styles.circleBottom]}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <Animatable.View 
          animation="bounceIn"
          duration={1000}
          delay={400}
          style={styles.headerContainer}
        >
          <Image
            source={require("../assets/LazyWait-logo.webp")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>
        </Animatable.View>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) => handleLogin(values.email, values.password)}
        >
          {({ handleSubmit }) => (
            <Animatable.View 
              animation="fadeInUp"
              duration={800}
              delay={600}
              style={styles.formContainer}
            >
              <FormikInput
                name="email"
                label="Email Address"
                placeholder="your@email.com"
                type="email"
                icon="email"
                containerStyle={styles.inputContainer}
              />

              <FormikInput
                name="password"
                label="Password"
                placeholder="••••••••"
                type="password"
                icon="lock"
                containerStyle={styles.inputContainer}
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleSubmit}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#029687', '#02b8a8']}
                  style={styles.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginButtonText}>Log In</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.guestButton}
                onPress={handleGuestLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Signup")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
        </Formik>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f5f3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#029687',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#029687',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    height: 55,
    marginBottom: 20,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ecf0f1',
  },
  dividerText: {
    color: '#7f8c8d',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  guestButton: {
    borderWidth: 2,
    borderColor: '#029687',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  guestButtonText: {
    color: '#029687',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  signupLink: {
    color: '#029687',
    fontWeight: 'bold',
    fontSize: 14,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(2, 150, 135, 0.1)',
  },
  circleTop: {
    width: 300,
    height: 300,
    top: -150,
    right: -100,
  },
  circleBottom: {
    width: 400,
    height: 400,
    bottom: -200,
    left: -100,
    backgroundColor: 'rgba(243, 181, 69, 0.1)',
  },
});

export default LoginScreen;