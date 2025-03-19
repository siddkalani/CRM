import AsyncStorage from "@react-native-async-storage/async-storage";

const useLogoutOnTokenExpire = (navigation) => {
  const logout = async () => {
    try {
      await AsyncStorage.clear();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });

      console.log("User logged out due to token expiration.");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1]; // Get payload part of the token
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(atob(base64)); // Decode Base64
      return decodedPayload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const monitorToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found.");
        return;
      }

      console.log("User Token:", token); // Debugging token

      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) {
        console.error("Invalid token structure.");
        return;
      }

      console.log("Decoded Token:", decoded); // Debugging decoded token

      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const remainingTime = decoded.exp - currentTime;

      if (remainingTime > 0) {
        console.log(`Token will expire in ${remainingTime} seconds.`);
        setTimeout(() => logout(), remainingTime * 1000); // Set logout timeout
      } else {
        console.log("Token already expired.");
        logout();
      }
    } catch (error) {
      console.error("Error monitoring token:", error);
    }
  };

  return { monitorToken, logout };
};

export default useLogoutOnTokenExpire;
