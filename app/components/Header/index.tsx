import { MaterialIcons } from '@expo/vector-icons';
import { Box, HStack, Image, Pressable, Text } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface HeaderProps {
  titulo: string;
  onMenuPress: () => void;
  onLogoPress: () => void;
}

export const Header = ({ titulo, onMenuPress, onLogoPress }: HeaderProps) => {
  // Estrelinha sutil animada ao lado do título (sem background)
  const sparkle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0, duration: 1100, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ])
    ).start();
  }, [sparkle]);

  return (
    <HStack 
      px={4} 
      py={3} 
      justifyContent="space-between" 
      alignItems="center"
      bg="#27272A"
    >
      <Pressable onPress={onLogoPress} flexDirection="row" alignItems="center">
        <Image
          source={require('../../../assets/images/coruja.png')}
          alt="Logo"
          size={20}
          mr={2}
          resizeMode="contain"
        />
        <Box position="relative">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            {titulo}
          </Text>
          {/* Estrelinha animada sutil ao lado do texto */}
          <Animated.View
            style={{
              position: 'absolute',
              right: -14,
              top: -6,
              transform: [
                { translateY: sparkle.interpolate({ inputRange: [0, 1], outputRange: [2, -2] }) },
                { rotate: sparkle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] }) },
              ],
              opacity: sparkle,
            }}
          >
            <MaterialIcons name="auto-awesome" size={14} color="#a78bfa" />
          </Animated.View>
        </Box>
      </Pressable>

      <Pressable 
        onPress={onMenuPress}
        p={2}
        borderRadius="full"
        _pressed={{
          bg: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <MaterialIcons name="menu" size={24} color="white" />
      </Pressable>
    </HStack>
  );
};
