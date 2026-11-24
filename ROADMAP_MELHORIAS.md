# ⚔️ Gwent Classic — Roadmap de Melhorias e Qualidade de Vida (QoL)

Este documento reúne e organiza todas as propostas de melhorias, recursos de qualidade de vida, polimento visual, sonoro e novos modos de jogo planejados para o **Gwent Classic**, estruturados em ordem crescente de complexidade de implementação (**do mais simples ao mais complexo**).

---

## 🟢 TIER 1: Simples / Rápida Implementação (Quick Wins & QoL Imediato)

Recursos diretos que trazem benefício imediato ao jogador sem exigir reestruturações profundas no motor do jogo.

### 1.1 Indicador de Diferença de Pontos no Placar do Duelo `[✓ IMPLEMENTADO]`
* **Objetivo**: Exibir um pequeno badge próximo ao placar numérico dos jogadores indicando a margem de pontos atual.
* **Comportamento**:
  * Configuração opcional no menu de Configurações (padrão desligada: `false`).
  * Se o jogador estiver liderando: exibir em verde (ex: `+12`).
  * Se o jogador estiver atrás: exibir em vermelho/coral (ex: `-7`).
  * Em caso de empate: `0` em dourado/âmbar.
* **Impacto**: Decisão tática rápida e precisa ao avaliar se vale a pena usar o botão **Passar** ou gastar mais uma carta.
* **Arquivos Envolvidos**: `gwent.js` (`Board.prototype.updateScoreDiff()`), `index.html` (`#score-diff-badge`), `versus.css`, `menu.js`.

### 1.2 Velocidade do Jogo / Fast Forward nas Configurações `[✓ IMPLEMENTADO]`
* **Objetivo**: Permitir que o jogador personalize a velocidade de animações e tempos de espera da Inteligência Artificial.
* **Opções**: Slider de `1.0x` a `2.0x` (com incremento de 0.1x), padrão `1.0x`.
  * `1.0x`: Velocidade clássica original.
  * `1.5x`: Transições e tempos de espera ágeis.
  * `2.0x`: Ritmo ultra-rápido para veteranos.
* **Impacto**: Acelera tempos de transição de cartas (`translate`), delays de `sleep` e decisões da IA sem desincronizar o jogo.
* **Arquivos Envolvidos**: `Settings` / `GameSpeed`, `gwent.js` (`sleep()`, `translate()`, `fade()`), `menu.js`, `index.html`.

### 1.3 Notificação Toast de Conquista Desbloqueada em Tempo Real `[✓ EXISTENTE]`
* **Status**: Sistema já implementado nativamente no canto superior direito da tela ao atingir as metas.

---

## 🟡 TIER 2: Média Complexidade (Imersão Audiovisual & Navegação do Mapa)

Recursos que elevam a atmosfera do jogo a um nível AAA, adicionando camadas táteis, sonoras e novos controles de navegação.

### 2.1 Histórico / Indicador da Última Carta Jogada (Last Played Card Preview)
* **Objetivo**: Manter um pequeno card/thumbnail ou ícone flutuante sutil mostrando a última carta jogada pelo adversário.
* **Motivação**: Quando a IA usa um Espião ou Médico que desencadeia compras ou ressurreições sucessivas, o jogador muitas vezes perde o que aconteceu na primeira jogada.
* **Comportamento**: Passar o mouse ou focar no controle sobre esse indicador abre a descrição completa da carta jogada.
* **Arquivos Envolvidos**: `gwent.js` (`Player.playCard()`, `UI.showLastPlayed()`), `versus.css`.

### 2.2 Efeitos Visuais de Impacto (VFX) nas Cartas Especiais
* **Objetivo**: Tornar os momentos decisivos do duelo mais dramáticos e visualmente satisfatórios:
  * **Queimar (Scorch)**: Brasas e partículas de fogo subindo das cartas de maior força antes de serem enviadas ao cemitério.
  * **Chifre do Comandante**: Feixe dourado brilhante percorrendo a fileira beneficiada ao dobrar o poder das tropas.
  * **Clima (Geada, Nevoeiro, Chuva)**: Efeito de névoa translúcida ou gotas de orvalho mais dinâmicas sobre a fileira afetada.
* **Arquivos Envolvidos**: `abilities.js`, `style.css` (animações GPU CSS3/Canvas), `gwent.js`.

### 2.3 Sons de Ambiência Dinâmicos por Tabuleiro (Tavern Chatter & Natureza)
* **Objetivo**: Adicionar uma trilha de ambiência ambiente em volume sutil (mixada junto com as músicas da Jukebox):
  * **Tabuleiro Clássico e Madeira**: Murmúrio de pessoas conversando ao fundo, canecas batendo e estalos de lareira.
  * **Tabuleiro de Pedra e Real**: Vento exterior suave, chuva ao longe ou aplausos corteses de plateia nobre.
* **Impacto**: Sensação autêntica de estar dentro de uma taverna em Novigrad ou no acampamento militar de Velen.
* **Arquivos Envolvidos**: `gwent.js` (`MusicManager`, `AudioManager`), arquivos de áudio em loop leve.

### 2.4 Guia Miraculoso no Mapa (Rastreador de Cartas por Região)
* **Objetivo**: No Modo Exploração, adicionar um sumário por região no Compêndio de Cartas:
  * *Pomar Branco: 6 / 6 cartas coletadas (100% ✓)*
  * *Velen & Novigrad: 38 / 62 cartas*
  * *Ilhas de Skellige: 12 / 44 cartas*
  * *Toussaint: 0 / 25 cartas*
* **Impacto**: Atende diretamente aos jogadores complecionistas que buscam a conquista de reunir todas as 216 cartas do Continente.
* **Arquivos Envolvidos**: `story.js` (`StoryMode.getRegionCollectionStats()`), `story_data.js`, `index.html` (`#story-compendium-modal`).

### 2.5 Viagem Rápida entre Regiões no Mapa (Fast Travel)
* **Objetivo**: Permitir alternar rapidamente a visão da câmera para os grandes polos do Continente com transição suave de zoom (sem precisar arrastar manualmente o mapa por longas distâncias).
* **Controles**: Botões de região no HUD superior ou atalhos de controle (`LB / RB`).
* **Arquivos Envolvidos**: `story.js` (`StoryMode.panToLocation()`), `gamepad.js`.

---

## 🔴 TIER 3: Alta Complexidade (Novos Modos de Jogo & Mecânicas Avançadas)

Expansões substanciais que introduzem novas maneiras de jogar ou infraestrutura avançada de partida.

### 3.1 Modo Duelo Local (Pass 'n Play / 2 Jogadores no Mesmo Dispositivo)
* **Objetivo**: Jogar contra um amigo localmente no mesmo computador, tablet ou celular.
* **Mecânica**:
  * O Jogador 1 escolhe sua facção e líder; o Jogador 2 escolhe a sua.
  * Durante a partida, quando o turno termina, surge uma tela de transição opaca:  
    *"Passe o controle / dispositivo para [Nome do Jogador 2]"*.
  * Isso oculta a mão secreta das cartas e permite partidas no sofá sem internet e sem precisar de dois aparelhos.
* **Arquivos Envolvidos**: `menu.js`, `gwent.js` (`Game.startHotseatGame()`, `PlayerLocalController`), `index.html`.

### 3.2 Modo Arena / Draft de Taverna
* **Objetivo**: Um modo de desafio estilo roguelike/arena:
  * O jogador não usa seu baralho pré-construído; em vez disso, o jogo apresenta escolhas de 3 cartas aleatórias por vez até formar um baralho de 22 cartas com facções mistas.
  * O objetivo é vencer até 5 duelos consecutivos contra adversários cada vez mais fortes sem perder mais de 2 vezes.
  * Recompensas: Grande quantia de coroas e cartas raras para a campanha.
* **Arquivos Envolvidos**: Novo módulo `draft.js`, nova tela de interface `draft.css`, `story.js`.

### 3.3 Modo Espectador no Versus P2P
* **Objetivo**: Permitir que uma terceira pessoa assista a um duelo entre dois jogadores inserindo o código da sala como Espectador (`GW-XXXX-OBS`).
* **Mecânica**: O Host replica os pacotes de ação de jogadas e pontuação para os clientes espectadores em modo somente leitura (sem revelar as cartas da mão dos duelistas até serem baixadas no campo).
* **Arquivos Envolvidos**: `versus.js` (`ControllerPeer`), `index.html` (`#versus-lobby-modal`).

### 3.4 Gravador e Reprodutor de Partidas (Replay System)
* **Objetivo**: Salvar o histórico de ações de um duelo marcante em um pequeno arquivo JSON de replay (`.gwent-replay`).
* **Mecânica**: Permite reproduzir a partida passo a passo (com botões de Pausar, Voltar lance, Avançar lance) para estudar táticas ou compartilhar jogadas épicas com outros jogadores.
* **Arquivos Envolvidos**: `gwent.js` (`MatchReplayManager`), `debugger.js`.

---

## 📋 Quadro Resumo de Prioridades para Lançamento

| Recurso | Categoria | Complexidade | Prioridade Recomendada |
| :--- | :--- | :---: | :---: |
| **Velocidade da IA (1x / 1.5x / 2x)** | Qualidade de Vida | Baixa | ⭐⭐⭐ (Essencial) |
| **Diferença de Pontos no Placar** | HUD / Duelo | Baixa | ⭐⭐⭐ (Essencial) |
| **Toast de Conquista Desbloqueada** | Feedback / UX | Baixa | ⭐⭐⭐ (Essencial) |
| **Última Carta Jogada** | Duelo | Média | ⭐⭐ (Muito Desejável) |
| **Rastreador de Cartas por Região** | Campanha | Média | ⭐⭐ (Muito Desejável) |
| **VFX de Queimar e Chifre** | Imersão | Média | ⭐⭐ (Polimento) |
| **Ambiência Sonora Dinâmica** | Áudio | Média | ⭐ (Opcional) |
| **Viagem Rápida no Mapa** | Campanha | Média | ⭐ (Opcional) |
| **Modo Duelo Local (Pass 'n Play)** | Modo de Jogo | Alta | 🚀 (Pós-Release v1.1) |
| **Modo Arena / Draft** | Modo de Jogo | Alta | 🚀 (Pós-Release v1.2) |
| **Espectador Versus / Replay** | Multiplayer | Muito Alta | 🚀 (Futuro) |

---
*Documento gerado e integrado ao projeto Gwent Classic para preservação e planejamento contínuo de atualizações.*
