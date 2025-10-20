import {
  Box,
  Button,
  Center,
  HStack,
  Image,
  Pressable,
  Text,
  VStack,
} from 'native-base';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAutenticacao } from '../context/AuthContext';

const MagicBadge: React.FC<{
  rotulo: string;
  corFundo: string;
  corBorda: string;
  corGlow: string;
  icone: keyof typeof MaterialIcons.glyphMap;
}> = ({ rotulo, corFundo, corBorda, corGlow, icone }) => {
  const pulse = useRef(new Animated.Value(0.6)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.6, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0, duration: 1200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse, sparkle]);

  const glowOpacity = pulse; 

  return (
    <Pressable
      accessibilityLabel={rotulo}
      _pressed={{ style: { transform: [{ scale: 0.98 }] } }}
      borderRadius="full"
    >
      <Box position="relative">
        {/* Glow externo */}
        <Animated.View
          style={{
            position: 'absolute',
            left: -6,
            right: -6,
            top: -6,
            bottom: -6,
            borderRadius: 999,
            backgroundColor: corGlow,
            opacity: glowOpacity.interpolate({ inputRange: [0.6, 1], outputRange: [0.15, 0.35] }),
          } as any}
        />

        {/* Conteúdo do badge */}
        <Box
          bg={corFundo}
          borderColor={corBorda}
          borderWidth={1}
          px={6}
          py={3}
          rounded="full"
          shadow={6}
        >
          <HStack space={2} alignItems="center">
            <MaterialIcons name={icone} size={18} color="white" />
            <Text color="white" fontWeight="semibold">
              {rotulo}
            </Text>
          </HStack>
        </Box>

        {/* Estrelinhas animadas */}
        <Animated.View
          style={{
            position: 'absolute',
            right: -4,
            top: -4,
            transform: [
              { translateY: sparkle.interpolate({ inputRange: [0, 1], outputRange: [4, -2] }) },
              { rotate: sparkle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] }) },
            ],
            opacity: sparkle,
          }}
        >
          <MaterialIcons name="auto-awesome" size={16} color={corGlow} />
        </Animated.View>
      </Box>
    </Pressable>
  );
};

const TelaInicial = () => {
  const { entrarComGoogle, carregando, erro } = useAutenticacao();

  const aoEntrarComGoogle = useCallback(async () => {
    try {
      await entrarComGoogle();
    } catch (authError) {
      console.error('Erro ao autenticar com Google', authError);
    }
  }, [entrarComGoogle]);

  const corujaImg = require('../../assets/images/coruja.png');


  return (
    <Box flex={1} bg="#27272A" safeArea>

      <Center padding={6}>

        <Image
          source={corujaImg}
          alt="Coruja voando"
          size="xl"
          resizeMode="contain"
          mb={2}
        />

        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          textAlign="center"
          padding={4}
        >
          Profeta Diário
        </Text>

        <Text
          fontSize="md"
          color="white"
          textAlign="center"
          lineHeight="md"
          padding={8}
        >
          A coruja chegou trazendo novidades.{'\n'}
          Conecte-se com o Google e descubra o{'\n'}
          que está acontecendo no mundo dos{'\n'}
          trouxas.
        </Text>

        {/* Badges de categorias com efeito de magia */}
        <VStack space={6} w="100%" alignItems="center">
          <HStack space={4} justifyContent="center">
            <MagicBadge rotulo="Economia" corFundo="green.700" corBorda="green.300" corGlow="#22c55e" icone="savings" />
            <MagicBadge rotulo="Cultura" corFundo="#8B4513" corBorda="#EAB308" corGlow="#fbbf24" icone="theater-comedy" />
          </HStack>
          <HStack space={4} justifyContent="center">
            <MagicBadge rotulo="Tecnologia" corFundo="blue.700" corBorda="blue.300" corGlow="#60a5fa" icone="memory" />
            <MagicBadge rotulo="Política" corFundo="red.700" corBorda="red.300" corGlow="#f87171" icone="gavel" />
          </HStack>
        </VStack>

        <Button
          onPress={aoEntrarComGoogle}
          bg="#E7E5E4"
          _pressed={{
            bg: '#D6D3D1',
            style: { transform: [{ scale: 0.98 }] },
          }}
          size="lg"
          mt={6}
          borderRadius="2xl"
          leftIcon={
            <Image
              source={require('../../assets/images/logoGoogle.png')}
              alt="Google Logo"
              size={5}
              mr={2}
            />
          }
          _text={{
            color: 'black',
            fontWeight: 'medium',
          }}
          px={6}
          isLoading={carregando}
          isDisabled={carregando}
        >
          Login com Google
        </Button>

        {erro ? (
          <Text mt={4} textAlign="center" color="rose.300">
            {erro}
          </Text>
        ) : null}
      </Center>
    </Box>
  );
};

export default TelaInicial;