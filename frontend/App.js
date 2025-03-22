import React from "react";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./navigation/AppNavigator";
import { Provider } from "react-redux";
import { store } from "././store/store";
import useLogoutOnTokenExpire from "./screens/auth/Logout";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";

import "./global.css";
import { VoiceProvider } from "./context/VoiceContext";
export default function App() {
  const navigationRef = useNavigationContainerRef();
  const { monitorToken } = useLogoutOnTokenExpire(navigationRef);
  React.useEffect(() => {
    monitorToken();
  }, []);
  return (
    <>
      <VoiceProvider>
        <Provider store={store}>
          <StatusBar style="auto" />
          <AppNavigator />
        </Provider>
      </VoiceProvider>
    </>
  );
}
