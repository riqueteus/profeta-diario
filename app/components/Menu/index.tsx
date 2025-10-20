import { MaterialIcons } from '@expo/vector-icons';
import { Box, Divider, HStack, IconButton, Pressable, Text, VStack } from 'native-base';
import React from 'react';

interface MenuItem {
  tema: string;
  emoji: string;
  bg: string;
  border: string;
  disabled?: boolean;
}

interface MenuProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSelecionarTema: (tema: string) => void;
  aoSair: () => void | Promise<void>;
  sairDesabilitado?: boolean;
}

export const Menu = ({ aberto, aoFechar, aoSelecionarTema, aoSair, sairDesabilitado = false }: MenuProps) => {
  if (!aberto) return null;

  const temas: MenuItem[] = [
    { tema: 'Economia', emoji: '💰', bg: 'green.900', border: 'green.600' },
    { tema: 'Cultura', emoji: '🎭', bg: 'amber.900', border: 'amber.600' },
    { tema: 'Tecnologia', emoji: '💻', bg: 'blue.900', border: 'blue.600' },
    { tema: 'Política', emoji: '🏛️', bg: 'red.900', border: 'red.600' },
  ];

  // Ícones iguais aos da Home
  const getIconePorTema = (tema: string): keyof typeof MaterialIcons.glyphMap => {
    switch (tema) {
      case 'Economia':
        return 'savings';
      case 'Cultura':
        return 'theater-comedy';
      case 'Tecnologia':
        return 'memory';
      case 'Política':
        return 'gavel';
      default:
        return 'stars';
    }
  };

  // Removido efeito de magia ao lado do texto a pedido do usuário

  const aoPressionarFavoritos = () => {
    aoFechar();
    aoSelecionarTema('Favoritos');
  };

  const aoSelecionarTemaInterno = (tema: string, disabled?: boolean) => {
    if (disabled) return;
    aoFechar();
    aoSelecionarTema(tema);
  };

  const aoConfirmarSair = async () => {
    aoFechar();
    try {
      await aoSair();
    } catch (error) {
      // erro tratado pela tela superior se necessário
    }
  };

  return (
    <>
      <Pressable 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0} 
        bg="rgba(0,0,0,0.5)" 
        onPress={aoFechar} 
        zIndex={999}
      />
      
      <Box 
        position="absolute" 
        right={0} 
        top={0} 
        bottom={0} 
        width="80%" 
        bg="#27272A"
        zIndex={1000}
        shadow={5}
      >
        <IconButton
          position="absolute"
          right={4}
          top={4}
          zIndex={1001}
          onPress={aoFechar}
          icon={<MaterialIcons name="close" size={24} color="white" />}
          borderRadius="full"
          _pressed={{
            bg: 'rgba(255, 255, 255, 0.1)'
          }}
        />

        <VStack space={4} p={4} mt={12}>
          {/* Seção de Perfil */}
          <VStack space={2}>
            <Text fontSize="md" color="gray.400" px={2}>PERFIL</Text>
            <Pressable 
              p={2}
              bg="#A1A1AA" 
              borderRadius={32}
              borderLeftWidth={12}
              borderLeftColor="#E4E4E7"
              onPress={aoPressionarFavoritos}
              _pressed={{
                bg: '#E4E4E7'
              }}
            >
              <HStack space={3} alignItems="center">
                <MaterialIcons name="favorite" size={20} color="#ffffff" />
                <Text color="white" fontSize="md" fontWeight="medium">Favoritos</Text>
              </HStack>
            </Pressable>
          </VStack>

          <Divider my={2} bg="gray.700" />

          {/* Seção de Temas */}
          <VStack space={4}>
            <Text fontSize="md" color="gray.400" px={2}>TEMAS</Text>
            {temas.map(({ tema, emoji, bg, border, disabled = false }) => (
              <Pressable 
                key={tema}
                p={2}
                bg={bg}
                borderRadius={32}
                borderLeftWidth={12}
                borderLeftColor={border}
                onPress={() => aoSelecionarTemaInterno(tema, disabled)}
                opacity={disabled ? 0.5 : 1}
                _pressed={{
                  opacity: 0.8
                }}
              >
                <HStack space={2} alignItems="center">
                  <MaterialIcons name={getIconePorTema(tema)} size={20} color="#ffffff" />
                  <Text color="white" fontSize="md" fontWeight="medium">{tema}</Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>

          <Divider my={2} bg="gray.700" />

          {/* Botão Sair - estilo igual aos temas */}
          <Pressable 
            p={2}
            mt={3}
            onPress={aoConfirmarSair}
            isDisabled={sairDesabilitado}
            bg={sairDesabilitado ? 'gray.400' : 'gray.600'}
            borderRadius={32}
            borderLeftWidth={12}
            borderLeftColor={sairDesabilitado ? 'gray.300' : 'gray.400'}
            opacity={sairDesabilitado ? 0.5 : 1}
            _pressed={{ opacity: 0.8 }}
          >
            <HStack space={2} alignItems="center">
              <MaterialIcons name="logout" size={20} color="#ffffff" />
              <Text color="white" fontSize="md" fontWeight="medium">Sair</Text>
            </HStack>
          </Pressable>
        </VStack>
      </Box>
    </>
  );
};
