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

const ReusableLoginScreen = ({
  onLoginPress,                // Callback function to handle login
  onForgotPasswordPress,       // Callback function for forgot password
  onSignUpPress,               // Callback function for sign up
  isLoading = false,           // Loading state from parent
  backgroundImageSource,       // Image source for background
 gradientColors = ["#0000FF", "#0000FF", "#87CEFA"],
  containerStyle,              // Optional style overrides
  titleText = "Welcome Back!",
  subtitleText = "Log in or Sign up",
  loginButtonText = "Login",
  signUpText = "Sign Up",
  placeholders = { email: "Enter email", password: "Password" },
}) => {
  // Local state
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Handle login action
  const handleLogin = () => {
    // Local validation
    if (!email || !password) {
      setErrorMessage("Please enter an email and password.");
      return;
    }
    setErrorMessage("");
    navigation.navigate('Main')
    onLoginPress && onLoginPress(email, password, setErrorMessage);
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
            source={require("../../assets/splash.jpg")}
            className="absolute w-full h-full object-cover"
          />
   

        {/* Foreground Content */}
        <View className="absolute bottom-0 w-full bg-[#F4F5F9] rounded-t-3xl px-4 py-6">
          {/* Titles */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-black">{titleText}</Text>
            <Text className="text-base text-[#868889] mt-[-4px]">{subtitleText}</Text>
          </View>

          {/* Input Fields */}
          <View className="my-2">
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
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="text-red-500 text-xs mt-1">{errorMessage}</Text>
          ) : null}

          {/* Forgot Password */}
          <TouchableOpacity onPress={onForgotPasswordPress} className="self-end mt-4 mb-4">
            <Text className="text-[#0070FF] text-sm">Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 1 }}
            end={{ x: 1.9, y: 0 }}
            className="rounded-xl mb-4 overflow-hidden"
          >
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className="p-3 items-center rounded-lg"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-semibold">{loginButtonText}</Text>
              )}
            </Pressable>
          </LinearGradient>

          {/* Sign Up */}
          <View className="flex-row justify-center">
            <Text className="text-[#868889] text-sm">Don’t have an account? </Text>
            <TouchableOpacity onPress={()=>{navigation.navigate('SignUp')}}>
              <Text className="text-[#0070FF] text-sm font-semibold">{signUpText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ReusableLoginScreen;
