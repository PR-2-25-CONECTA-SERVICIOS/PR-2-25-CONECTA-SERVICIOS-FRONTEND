import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from "react-native";

interface Props {
  children: string;
  speed?: number;   // velocidad del movimiento
  style?: any;
}

export default function MarqueeText({ children, speed = 40, style }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const startAnimation = () => {
    translateX.setValue(containerWidth);

    Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: ((textWidth + containerWidth) / speed) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    if (textWidth > containerWidth && containerWidth > 0) startAnimation();
  }, [textWidth, containerWidth]);

  return (
    <View
      style={{ overflow: "hidden", maxWidth: "100%" }}
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.Text
        style={[
          style,
          styles.text,
          {
            transform: [{ translateX }],
          },
        ]}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {children + "   •   "}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    // 👇 Esto reemplaza whiteSpace sin causar errores
    includeFontPadding: false,
  },
});
