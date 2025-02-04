import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { store } from '././store/store';
import './global.css'
export default function App() {
  return (
    <>
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppNavigator />
      </Provider>
    </>
  );
}
