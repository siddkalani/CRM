import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Retrieve token from storage
        const userToken = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");

        console.log("User Token:", userToken);
        console.log("User id:", userId);

        // If we have a token, navigate to Main
        if (userToken && userId) {
          navigation.replace("Main");
        } else {
          // Otherwise, navigate to Intro / Login / Auth Stack
          navigation.replace("LogIn");
        }
      } catch (error) {
        console.log("Error checking token:", error);
        // If something goes wrong, also route to Intro
        navigation.replace("LogIn");
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
};

export default AuthLoadingScreen;
