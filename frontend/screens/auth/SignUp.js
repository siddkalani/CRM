import React, { useState } from "react";
import {
  StatusBar,
  Pressable,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../constants/constant";

const ReusableSignUpScreen = ({
  onSignUpPress,               // Callback: optional if parent handles extra logic
  onForgotPasswordPress,       // Typically not needed on sign-up
  onLoginPress,                // Callback or navigation function to go to Login
  isLoading: parentIsLoading = false, // If parent manages loading, you can use this

  // UI / style / text props
  backgroundImageSource,
  gradientColors = ["#0000FF", "#0000FF", "#87CEFA"],
  containerStyle,
  titleText = "Create Account!",
  subtitleText = "Sign up to get started",
  signUpButtonText = "Sign Up",
  loginText = "Login",
  placeholders = {
    name: "Enter your name",
    email: "Enter email",
    password: "Password",
    confirmPassword: "Confirm Password",
  },
}) => {
  const navigation = useNavigation();

  // Local states for input fields and errors
  const [name, setName] = useState("");               // Will be sent as username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // (Optional) local loading state if you want to manage it here
  // If you only want to use parent's isLoading, just omit this local state.
  const [isLoading, setIsLoading] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Handle sign-up action
  const handleSignUp = async () => {
    // Basic client-side validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setErrorMessage("");
      setIsLoading(true);

      // Send POST request to your backend endpoint
      // NOTE: Replace "localhost" with your machine's IP
      //       if you're testing on a real device (instead of an emulator).
      const response = await fetch(`${BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,   // your backend expects `username`
          email: email,     // your backend expects `email`
          password: password,  // your backend expects `password`
        }),
      });

      // If response is not OK, parse the error message
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Sign up failed, please try again.");
        return;
      }

      // On success, parse the response
      const data = await response.json();
      // If your API returns a token or user object, you can store it if needed, e.g.:
      // await AsyncStorage.setItem("token", data.token);

      // Optionally navigate to login screen or main screen
      // Here, we'll navigate back to Login so the user can log in:
      navigation.navigate("LogIn");

      // If a parent component passed onSignUpPress for additional steps, call it:
      onSignUpPress && onSignUpPress(name, email, password, setErrorMessage);

    } catch (error) {
      console.error("Sign up error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={`flex-1 bg-[#F4F5F9] ${containerStyle}`}
    >
      <SafeAreaView className="flex-1">
        <StatusBar translucent backgroundColor="transparent" />

        {/* Background Image */}
        <Image
          source={
            backgroundImageSource
              ? backgroundImageSource
              : require("../../assets/splash.jpg")
          }
          className="absolute w-full h-full object-cover"
        />

        {/* Foreground Content */}
        <View className="absolute bottom-0 w-full bg-[#F4F5F9] rounded-t-3xl px-4 py-6">
          {/* Titles */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-black">{titleText}</Text>
            <Text className="text-base text-[#868889] mt-[-4px]">
              {subtitleText}
            </Text>
          </View>

          {/* Input Fields */}
          <View className="my-2">
            {/* Name Input */}
            <View className="flex-row items-center bg-white p-2.5 rounded-lg mb-3">
              <Ionicons name="person-outline" size={20} color="gray" />
              <TextInput
                placeholder={placeholders.name}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                className="flex-1 ml-2 text-black"
              />
            </View>

            {/* Email Input */}
            <View className="flex-row items-center bg-white p-2.5 rounded-lg mb-3">
              <Ionicons name="mail-outline" size={20} color="gray" />
              <TextInput
                placeholder={placeholders.email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-2 text-black"
              />
            </View>

            {/* Password Input */}
            <View className="flex-row items-center bg-white p-2.5 rounded-lg mb-3">
              <Ionicons name="lock-closed-outline" size={20} color="gray" />
              <TextInput
                placeholder={placeholders.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                className="flex-1 ml-2 text-black"
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View className="flex-row items-center bg-white p-2.5 rounded-lg mb-3">
              <Ionicons name="lock-closed-outline" size={20} color="gray" />
              <TextInput
                placeholder={placeholders.confirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isPasswordVisible}
                className="flex-1 ml-2 text-black"
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
          {errorMessage ? (
            <Text className="text-red-500 text-xs mt-1">{errorMessage}</Text>
          ) : null}

          {/* Sign Up Button */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 1 }}
            end={{ x: 1.9, y: 0 }}
            className="rounded-xl mb-4 overflow-hidden"
          >
            <Pressable
              onPress={handleSignUp}
              disabled={isLoading || parentIsLoading}
              className="p-3 items-center rounded-lg"
            >
              {(isLoading || parentIsLoading) ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {signUpButtonText}
                </Text>
              )}
            </Pressable>
          </LinearGradient>

          {/* Navigate to Login */}
          <View className="flex-row justify-center">
            <Text className="text-[#868889] text-sm">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() =>
                onLoginPress
                  ? onLoginPress()
                  : navigation.navigate("LogIn")
              }
            >
              <Text className="text-[#0070FF] text-sm font-semibold">
                {loginText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ReusableSignUpScreen;
