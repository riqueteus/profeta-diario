import { Center, NativeBaseProvider, Spinner } from 'native-base';
import React from 'react';
import { ProvedorDeAutenticacao, useAutenticacao } from './context/AuthContext';
import TelaInicial from './pages/TelaInicial';
import TelaLogada from './pages/TelaLogada';

const AppNavigator = () => {
  const { user, inicializando } = useAutenticacao();

  if (inicializando) {
    return (
      <Center flex={1} bg="#27272A">
        <Spinner color="white" accessibilityLabel="Carregando aplicativo" size="lg" />
      </Center>
    );
  }

  return user ? <TelaLogada /> : <TelaInicial />;
};

export default function Index() {
  return (
    <NativeBaseProvider>
      <ProvedorDeAutenticacao>
        <AppNavigator />
      </ProvedorDeAutenticacao>
    </NativeBaseProvider>
  );
}
