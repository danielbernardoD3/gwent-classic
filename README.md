# ⚔️ Gwent Classic: Enhanced Edition

<p align="center">
  <img src="https://user-images.githubusercontent.com/26311830/116256903-f1599b00-a7b6-11eb-84a1-16dcb5c9bfc6.jpg" alt="Gwent Classic Cover" width="850">
</p>

<p align="center">
  <b>A experiência definitiva e autêntica de Gwent de The Witcher 3: Wild Hunt diretamente no seu PC ou navegador!</b>
  <br>
  <i>Com Multiplayer Online P2P (Modo Versus), Campanha do Continente (Modo Exploração), Duelos contra IA, Conquistas, Suporte a Gamepad e Launcher Nativo.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Web-blue.svg" alt="Platform">
  <img src="https://img.shields.io/badge/Multiplayer-WebRTC%20P2P-orange.svg" alt="Multiplayer">
  <img src="https://img.shields.io/badge/DLCs-Hearts%20of%20Stone%20%2B%20Blood%20%26%20Wine-darkred.svg" alt="DLCs">
  <img src="https://img.shields.io/badge/Faction-Skellige%20Included-green.svg" alt="Skellige">
  <img src="https://img.shields.io/badge/Gamepad-Full%20Support-purple.svg" alt="Gamepad">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

---

## 📜 Sobre o Projeto

**Gwent Classic: Enhanced Edition** é uma recriação fiel e aprimorada do consagrado jogo de cartas de *The Witcher 3: Wild Hunt*. O projeto foi expandido para além de um simples jogo de cartas, transformando-se em uma plataforma completa com **campanha narrativa para um jogador**, **modo multijogador competitivo em tempo real** e interface 100% ambientada no universo do bruxo Geralt de Rívia.

---

## 🌟 Principais Recursos

### ⚔️ 1. Modo Versus (PvP Multiplayer Online P2P)
* **Conexão Direta WebRTC (PeerJS):** Jogue contra amigos à distância sem necessidade de instalação de servidores dedicados.
* **Sistema de Salas Simplificado:** Crie uma sala com 1 clique, compartilhe o código de sala de 5 dígitos e comece o duelo.
* **Temporizadores de Partida:**
  * ⏱️ **30 Segundos para Troca Inicial (Mulligan):** Selecione estrategicamente até 2 cartas para devolver ao baralho.
  * ⏱️ **1:00 Minuto por Turno:** Relógio regressivo com HUD visual integrado.
  * 🤖 **Auto-Play Inteligente Anti-AFK:** Se o tempo esgotar, o jogo realiza automaticamente a melhor jogada disponível (ou passa a vez com segurança se não houver jogadas).
* **Árbitro Autoritário (`TURN_SYNC` & Anti-Softlock):** O jogador anfitrião (Host) atua como árbitro da partida, garantindo que os turnos, contadores de cartas, placares e transições de rodada permaneçam 100% sincronizados entre ambos os clientes.
* **Painel de Pré-Jogo & Customização:** Edite seu baralho no Lobby, selecione seu Nickname personalizado e defina o status de "Pronto".
* **Desistir (Forfeit) & Revanche:** Botão para conceder a vitória com elegância e sistema de revanche imediata no pós-jogo.

---

### 🗺️ 2. Modo Exploração (Campanha do Continente)
* **Mapa 4K Interativo do Continente:** Viaje por regiões lendárias como Pomar Branco, Velen, Novigrad, Ilhas Skellige, Kaer Morhen e Toussaint.
* **Progressão com Duelos Canônicos:** Enfrente personagens icônicos da saga (Barão Sanguinário, Dijkstra, Soothsayer, Madame Sasha, etc.).
* **Recompensas & Desbloqueios:** Conquiste cartas raras de líderes e heróis ao derrotar adversários no mapa.
* **Diálogos e Ambientação:** Contextualização imersiva para cada encontro de cartas.

---

### 🤖 3. Partida Rápida vs IA Aprimorada
* Enfrente a inteligência artificial com tomada de decisão ponderada: gestão de espiões, iscas, queimaduras (*Scorch*), clima e habilidades de líder.
* Suporte completo para todas as 5 facções.

---

### 🃏 4. Montador de Baralhos Completo (Deck Builder)
* **Todas as Cartas Originais:** Inclui todas as cartas do jogo base e das expansões *Hearts of Stone* e *Blood and Wine*.
* **Facção Skellige & Carta Carpeado (Roach):** Deck de Skellige completo com habilidades de Berserker, Mardroeme e a carta de Carpeado da atualização *Next-Gen*.
* **Importação e Exportação JSON:** Salve e compartilhe suas listas de baralhos personalizadas.

---

### 🏆 5. Conquistas & Estatísticas
* Mais de 30 conquistas personalizadas com som e notificação no estilo *The Witcher*.
* Registro persistente de partidas ganhas, histórico de pontuação e recordes.

---

### 🎮 6. Suporte a Controles (Gamepad)
* Navegação completa pelo tabuleiro, menus e seleção de cartas utilizando controles de **Xbox**, **PlayStation** ou controles genéricos via Gamepad API nativa.

---

### 🌐 7. Internacionalização (i18n)
* Interface totalmente traduzida e comutada dinamicamente entre **Português (Brasil)** e **Inglês**.

---

### 🖥️ 8. Launcher Standalone para Windows
* Executável nativo (`GwentClassic.exe`) construído em C# com **Microsoft WebView2**, permitindo jogar em janela limpa ou tela cheia sem barras de navegador.

---

## 📁 Estrutura de Arquivos do Projeto

```text
gwent-classic/
├── GwentClassic.exe               # Launcher executável standalone para Windows
├── index.html                     # Interface principal do jogo
├── style.css                      # Estilos visuais do tabuleiro e cartas
├── menu.css                       # Estilização do Menu Principal
├── versus.css                     # Interface do Modo Versus e Temporizadores
├── story.css                      # Estilização do Modo Exploração e Mapa 4K
├── gwent.js                       # Motor central das regras do jogo Gwent
├── versus.js                      # Sistema P2P WebRTC, Árbitro e Timers do PvP
├── story.js                       # Mecânicas de progressão do Modo Exploração
├── story_data.js                  # Dados de missões, diálogos e nós do mapa
├── abilities.js                   # Implementação de todas as habilidades de cartas
├── cards.js                       # Definição e catálogo completo de cartas
├── factions.js                    # Regras e passivas de cada facção
├── gamepad.js                     # Controlador de suporte a joystick/gamepad
├── achievements.js                # Sistema de conquistas
├── i18n.js                        # Textos e traduções (PT-BR / EN-US)
├── launcher_source/               # Código-fonte em C# do Launcher Windows
├── img/                           # Ilustrações de cartas, tabuleiros, ícones e UI
├── music/                         # Trilhas sonoras originais locais
└── sfx/                           # Efeitos sonoros de interface e cartas
```

---

## 🚀 Como Executar

### Opção 1: Executável Windows (Recomendado)
1. Dê um duplo clique no arquivo `GwentClassic.exe`.
2. O jogo abrirá em uma janela nativa com aceleração de hardware via WebView2.
3. Pressione `F11` a qualquer momento para alternar o modo **Tela Cheia**.

### Opção 2: Pelo Navegador
1. Para que o áudio, os assets locais e o WebRTC funcionem sem restrições de segurança do navegador (CORS), execute o jogo através de um servidor local:
   * Dê dois cliques em `iniciar_servidor_web.bat`, ou
   * Execute no terminal dentro da pasta:
     ```bash
     npx serve -l 8080 .
     ```
2. Acesse no navegador: `http://localhost:8080`
3. Pressione `F11` para jogar em tela cheia.

---

## ⚔️ Como Jogar o Modo Versus (Multiplayer)

1. No Menu Principal, selecione **Modo Versus**.
2. **Jogador 1 (Host):**
   * Digite seu Nickname.
   * Clique em **Criar Sala**. Um código de sala será gerado (ex: `GW-4921`).
   * Passe o código para o seu amigo.
3. **Jogador 2 (Convidado):**
   * Digite seu Nickname.
   * Vá na aba **Entrar na Sala**, digite o código e clique em **Conectar**.
4. Ambos os jogadores organizam seus baralhos no botão **Personalizar Baralho** e clicam em **⚔ PRONTO**.
5. O Host clica em **Iniciar Partida** e o duelo começa!

---

## 🔮 Futuro: Integração como Mod para The Witcher 3 (REDkit)

O projeto foi arquitetado com padrões modulares que viabilizam sua integração futura ao jogo original *The Witcher 3: Wild Hunt* por meio da ferramenta oficial **REDkit**, criando uma opção dedicada de *"Only Gwent Mode"* no menu do jogo.

---

## 📜 Licença e Créditos

* As ilustrações, efeitos sonoros, músicas e universo de Gwent são de propriedade intelectual da **CD PROJEKT RED**.
* Este projeto é desenvolvido para fins educacionais e de preservação da comunidade de fãs do universo de *The Witcher*.
* Código-base original: MIT License.
