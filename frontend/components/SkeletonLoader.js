// components/SkeletonLoader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const SkeletonLoader = ({ width, height, borderRadius = 4, style }) => {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#e0e0e0',
          marginVertical: 6,
        },
        style,
      ]}
    />
  );
};

export default SkeletonLoader;
