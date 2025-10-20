import { MaterialIcons } from '@expo/vector-icons';
import { Box, Center, HStack, IconButton, Image, Pressable, Spinner, Text, VStack } from 'native-base';
import React from 'react';
import { Linking } from 'react-native';

export interface Noticia {
  titulo: string;
  descricao: string;
  link: string;
  urlDaImagem?: string;
  publicadoEm: string;
  tema?: string; // tema de origem para estilização em Favoritos
}

interface NewsScreenProps {
  noticias: Noticia[];
  carregando: boolean;
  categoria: string;
  favoritos?: Noticia[];
  aoAlternarFavorito?: (noticia: Noticia) => void;
}

function corDeFundoDaCategoria(categoria: string): string {
  switch (categoria) {
    case 'Economia':
      return 'green.900';
    case 'Cultura':
      return 'amber.900';
    case 'Tecnologia':
      return 'blue.900';
    case 'Política':
      return 'red.900';
    case 'Favoritos':
      return 'gray.200';
    default:
      return 'gray.200';
  }
}

function mesmaNoticia(a: Noticia, b: Noticia): boolean {
  return a.titulo === b.titulo;
}

function obterIdNoticia(noticia: Noticia): string {
  return noticia.titulo;
}

function fundoEscuro(bg: string): boolean {
  return bg.endsWith('.900');
}

export const NewsScreen = ({ noticias, carregando, categoria, favoritos = [], aoAlternarFavorito }: NewsScreenProps) => {
  if (carregando) {
    return (
      <Center flex={1} py={10}>
        <VStack space={4} alignItems="center">
          <Spinner size="lg" color="white" />
          <Text color="white">Carregando notícias de {categoria.toLowerCase()}...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack space={4} px={5} py={2}>
      {noticias.map((noticia) => {
        // Escolhe a cor por cartão: em Favoritos usa o tema original da notícia (se houver)
        const cardBg = categoria === 'Favoritos' && noticia.tema
          ? corDeFundoDaCategoria(noticia.tema)
          : corDeFundoDaCategoria(categoria);
        const dark = fundoEscuro(cardBg);
        const tituloColor = dark ? 'white' : 'black';
        const textoColor = dark ? 'gray.100' : 'gray.700';

        const isFavorita = favoritos.some((f) => mesmaNoticia(f, noticia));

        const targetUrl = noticia.link && noticia.link.trim().length > 0
          ? noticia.link
          : 'https://g1.globo.com/'; // fallback simples para teste

        const buttonBg = dark ? 'white' : 'blue.600';
        const buttonText = dark ? '#111827' : 'white';

        const isFavoritosPlaceholder = categoria === 'Favoritos' && noticia.titulo === 'Nenhuma notícia favoritada';

        return (
          <Box 
            key={obterIdNoticia(noticia)}
            bg={cardBg}
            p={4} 
            borderRadius="2xl"
            shadow={1}
          >
            <HStack justifyContent="space-between" alignItems="flex-start" space={2}>
              <VStack flex={1} space={2}>
                <Text fontSize="lg" fontWeight="bold" color={tituloColor}>
                  {noticia.titulo}
                </Text>
                {noticia.descricao && (
                  <Text color={textoColor}>
                    {noticia.descricao}
                  </Text>
                )}
                {!!noticia.urlDaImagem && (
                  <Image
                    source={{ uri: noticia.urlDaImagem }}
                    alt={noticia.titulo}
                    height={40}
                    borderRadius={12}
                    mt={1}
                  />
                )}
                {!isFavoritosPlaceholder && (
                  <Pressable
                    onPress={async () => {
                      const supported = await Linking.canOpenURL(targetUrl);
                      if (supported) {
                        await Linking.openURL(targetUrl);
                      }
                    }}
                    alignSelf="flex-start"
                    px={3}
                    py={1.5}
                    borderRadius={8}
                    bg={buttonBg}
                    _pressed={{ opacity: 0.8 }}
                  >
                    <Text color={buttonText} fontSize="sm" fontWeight="medium">
                      Ver detalhes
                    </Text>
                  </Pressable>
                )}
              </VStack>

              {!!aoAlternarFavorito && (
                <IconButton
                  onPress={() => aoAlternarFavorito(noticia)}
                  icon={
                    <MaterialIcons 
                      name={isFavorita ? 'favorite' : 'favorite-border'} 
                      size={22} 
                      color={isFavorita ? '#ef4444' : (dark ? '#ffffff' : '#111827')} 
                    />
                  }
                  _pressed={{ opacity: 0.7 }}
                  variant="ghost"
                  accessibilityLabel={isFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                />
              )}
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
};
