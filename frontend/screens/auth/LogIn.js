import React, { useState } from "react";
import {
  StatusBar,
  Pressable,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

// Optional: If you need iOS safe area handling
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// You can define props for custom headings, placeholders, colors, etc.
const ReusableLoginScreen = ({
  onLoginPress,                // callback function to handle login
  onForgotPasswordPress,       // callback function for forgot password
  onSignUpPress,               // callback function for sign up
  isLoading = false,           // loading state from parent
  backgroundImageSource,       // pass in an image source for background
  gradientColors = ["#2b054c", "#2b054c", "#bcffd0"], // default gradient
  containerStyle,              // optional style overrides
  titleText = "Welcome Back!",
  subtitleText = "Log in or Sign up",
  loginButtonText = "Login",
  signUpText = "Sign Up",
  placeholders = { email: "Enter email", password: "Password" },
}) => {
  // Local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // const { top, bottom } = useSafeAreaInsets(); // if needed

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = () => {
    // You can do local validation here, then call the passed callback
    if (!email || !password) {
      setErrorMessage("Please enter an email and password.");
      return;
    }
    setErrorMessage("");
    onLoginPress && onLoginPress(email, password, setErrorMessage);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.flexContainer, containerStyle]}
    >
      <SafeAreaView style={styles.flexContainer}>
        <StatusBar translucent backgroundColor="transparent" />

        {/* Background image if provided */}
        {backgroundImageSource && (
          <Image
            source={require('../../assets/splash.jpg')}
            style={styles.backgroundImage}
          />
        )}

        {/* Foreground content */}
        <View style={styles.bottomContainer}>
          {/* Titles */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{titleText}</Text>
            <Text style={styles.subtitle}>{subtitleText}</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputsWrapper}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="gray" />
              <TextInput
                placeholder={placeholders.email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="gray" />
              <TextInput
                placeholder={placeholders.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {!!errorMessage && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={onForgotPasswordPress}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 1 }}
            end={{ x: 1.9, y: 0 }}
            style={styles.loginButtonGradient}
          >
            <Pressable
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>{loginButtonText}</Text>
              )}
            </Pressable>
          </LinearGradient>

          {/* Sign Up */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpPrompt}>
              Don’t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={onSignUpPress}>
              <Text style={styles.signUpText}>{signUpText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ReusableLoginScreen;

// -------------------------- STYLES --------------------------------
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#F4F5F9",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#F4F5F9",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#868889",
    marginTop: -4,
  },
  inputsWrapper: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    color: "#000",
  },
  errorMessage: {
    color: "red",
    fontSize: 13,
    marginTop: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: "#0070FF",
    fontSize: 14,
  },
  loginButtonGradient: {
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButton: {
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signUpPrompt: {
    color: "#868889",
    fontSize: 14,
  },
  signUpText: {
    color: "#0070FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
