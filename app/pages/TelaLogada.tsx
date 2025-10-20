import { Box, ScrollView, useToast } from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Menu } from '../components/Menu';
import { NewsScreen, Noticia } from '../components/NewsScreen';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { useAutenticacao } from '../context/AuthContext';
import { listarFavoritos, removerFavorito, salvarFavorito } from '../services/favorites';
import { fetchCulturaNewsPTBR, fetchEconomiaNewsPTBR, fetchPoliticaNewsPTBR, fetchTecnologiaNewsPTBR } from '../services/news';

const TelaLogada = () => {
  const toast = useToast();
  const { sairDaConta, carregando: carregandoAuth, user } = useAutenticacao();
  const uid = useMemo(() => user?.uid ?? null, [user]);
  const [telaAtual, setTelaAtual] = useState<'welcome' | 'noticias'>('welcome');
  const [temaAtual, setTemaAtual] = useState('Profeta Diário');
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [favoritos, setFavoritos] = useState<Noticia[]>([]);

  const abrirMenu = () => setMenuAberto(true);
  const fecharMenu = () => setMenuAberto(false);

  const voltarParaInicio = () => {
    setTelaAtual('welcome');
    setTemaAtual('Profeta Diário');
    fecharMenu();
  };

  function placeholder(titulo: string, descricao: string, tema: string, dataIso: string): Noticia {
    return { titulo, descricao, link: '', publicadoEm: dataIso, tema };
  }

  function gerarPlaceholdersPorTema(tema: string): Noticia[] {
    const agora = new Date().toISOString();
    switch (tema) {
      case 'Economia':
        return [
          placeholder('Juros em Debate', 'Discussões sobre a taxa de juros e seus impactos.', tema, agora),
          placeholder('Inflação Sobe', 'Índice de preços registra alta no mês.', tema, agora),
          placeholder('Câmbio Oscila', 'Moeda tem variação após novos dados.', tema, agora),
          placeholder('Mercado de Trabalho', 'Contratações crescem em setores específicos.', tema, agora),
        ];
      case 'Cultura':
        return [
          placeholder('Festival de Cinema', 'Mostra reúne produções independentes.', tema, agora),
          placeholder('Exposição de Arte', 'Obras contemporâneas em destaque.', tema, agora),
          placeholder('Música ao Vivo', 'Agenda cultural traz apresentações locais.', tema, agora),
        ];
      case 'Tecnologia':
        return [
          placeholder('IA nas Empresas', 'Adoção de IA acelera transformação digital.', tema, agora),
          placeholder('Segurança Digital', 'Boas práticas para proteger seus dados.', tema, agora),
          placeholder('Lançamento de Gadget', 'Novo dispositivo chega ao mercado.', tema, agora),
          placeholder('Cloud e Custos', 'Estratégias para otimizar gastos na nuvem.', tema, agora),
          placeholder('Dev Trends', 'Tendências para desenvolvedores em 2025.', tema, agora),
        ];
      case 'Política':
        return [
          placeholder('Reforma em Pauta', 'Projeto avança em comissões.', tema, agora),
          placeholder('Debate Aberto', 'Especialistas analisam cenários.', tema, agora),
          placeholder('Eleições e Propostas', 'Candidatos apresentam planos.', tema, agora),
          placeholder('Transparência Pública', 'Novas medidas de controle.', tema, agora),
          placeholder('Relações Internacionais', 'Acordos e negociações em foco.', tema, agora),
          placeholder('Orçamento Anual', 'Discussões sobre prioridades.', tema, agora),
        ];
      default:
        return [
          placeholder(`Notícia de ${tema}`, `Aqui estará uma notícia sobre ${tema.toLowerCase()}.`, tema, agora),
        ];
    }
  }

  const selecionarTema = useCallback(async (tema: string) => {
    setTemaAtual(tema);

    setTelaAtual('noticias');
    setCarregando(true);

    if (tema === 'Favoritos') {
      if (!uid) {
        setNoticias([
          { titulo: 'Nenhuma notícia favoritada', descricao: 'Entre com sua conta para favoritar notícias.', link: '', publicadoEm: new Date().toISOString(), tema: 'Favoritos' },
        ]);
        setCarregando(false);
        return;
      }
      try {
        const snapFavoritos = await listarFavoritos(uid);
        setFavoritos(snapFavoritos);
        setNoticias(snapFavoritos.length > 0 ? snapFavoritos : [
          { titulo: 'Nenhuma notícia favoritada', descricao: 'Suas notícias favoritas aparecerão aqui.', link: '', publicadoEm: new Date().toISOString(), tema: 'Favoritos' },
        ]);
      } catch (e) {
        setNoticias([
          { titulo: 'Erro ao carregar favoritos', descricao: 'Tente novamente mais tarde.', link: '', publicadoEm: new Date().toISOString(), tema: 'Favoritos' },
        ]);
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (tema === 'Cultura') {
      try {
        const lista = await fetchCulturaNewsPTBR();
        if (lista.length > 0) {
          setNoticias(lista);
        } else {
          setNoticias(gerarPlaceholdersPorTema(tema));
        }
      } catch (e) {
        setNoticias(gerarPlaceholdersPorTema(tema));
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (tema === 'Economia') {
      try {
        const lista = await fetchEconomiaNewsPTBR();
        setNoticias(lista.length > 0 ? lista : gerarPlaceholdersPorTema(tema));
      } catch (e) {
        setNoticias(gerarPlaceholdersPorTema(tema));
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (tema === 'Tecnologia') {
      try {
        const lista = await fetchTecnologiaNewsPTBR();
        setNoticias(lista.length > 0 ? lista : gerarPlaceholdersPorTema(tema));
      } catch (e) {
        setNoticias(gerarPlaceholdersPorTema(tema));
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (tema === 'Política') {
      try {
        const lista = await fetchPoliticaNewsPTBR();
        setNoticias(lista.length > 0 ? lista : gerarPlaceholdersPorTema(tema));
      } catch (e) {
        setNoticias(gerarPlaceholdersPorTema(tema));
      } finally {
        setCarregando(false);
      }
      return;
    }

    // Placeholders para demais temas (sem API ainda)
    setNoticias(gerarPlaceholdersPorTema(tema));
    setCarregando(false);
  }, [favoritos]);

  const mesmaNoticia = (a: Noticia, b: Noticia) => a.titulo === b.titulo;

  const aoAlternarFavorito = useCallback(async (noticia: Noticia) => {
    if (!uid) return;
    const exists = favoritos.some((f) => mesmaNoticia(f, noticia));
    try {
      if (exists) {
        await removerFavorito(uid, noticia);
        setFavoritos((prev) => prev.filter((f) => !mesmaNoticia(f, noticia)));
      } else {
        const email = user?.email ?? null;
        await salvarFavorito(uid, email, noticia);
        setFavoritos((prev) => [noticia, ...prev]);
      }
    } catch (e) {
      // erro silencioso; pode-se adicionar toast se necessário
    }
  }, [favoritos, uid, user?.email]);

  const sair = useCallback(async () => {
    try {
      await sairDaConta();
      voltarParaInicio();
    } catch (error) {
      if (!toast.isActive('logout-error')) {
        toast.show({
          id: 'logout-error',
          title: 'Não foi possível sair',
          description: 'Tente novamente em instantes.',
          placement: 'top',
          variant: 'solid',
          bg: 'red.600',
        });
      }
    }
  }, [sairDaConta, toast, voltarParaInicio]);

  const shouldShowToggle = !(temaAtual === 'Favoritos' && favoritos.length === 0);

  return (
    <Box flex={1} bg="#27272A" safeArea>
      {/* Header */}
      <Header 
        titulo={temaAtual}
        onMenuPress={abrirMenu}
        onLogoPress={voltarParaInicio}
      />

      {/* Conteúdo Principal */}
      <ScrollView 
        flex={1} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {telaAtual === 'welcome' ? (
          <WelcomeScreen />
        ) : (
          <NewsScreen 
            noticias={noticias}
            carregando={carregando}
            categoria={temaAtual}
            favoritos={favoritos}
            aoAlternarFavorito={shouldShowToggle ? aoAlternarFavorito : undefined}
          />
        )}
      </ScrollView>

      {/* Menu Lateral */}
      <Menu 
        aberto={menuAberto}
        aoFechar={fecharMenu}
        aoSelecionarTema={selecionarTema}
        aoSair={sair}
        sairDesabilitado={carregandoAuth}
      />
    </Box>
  );
};

export default TelaLogada;