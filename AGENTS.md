# Regras do Projeto Gwent Classic / Rules for Gwent Classic Workspace

Este documento define regras permanentes e obrigatórias para qualquer agente de IA trabalhando neste workspace.

---

## 1. Nome do Projeto (Project Title)
- O nome oficial e estrito do projeto é **"Gwent Classic"**.
- **NUNCA** adicione palavras adicionais, subtítulos, slogans ou prefixos/sufixos ao título do projeto nos releases, executáveis ou cabeçalhos principais (ex: use apenas `Gwent Classic`, nunca `Gwent Classic - The Witcher 3 Edition` ou similar).

---

## 2. Atualização Obrigatória de Versão (Mandatory Version Bumping)
- **REGRA FUNDAMENTAL**: Sempre que houver qualquer atualização de código, adição de funcionalidade ou correção de problemas/bugs, a versão do jogo **DEVE SER INCREMENTADA** (bump de versão semântica `vX.Y.Z` e incremento de `versionCode`).
- Todos os seguintes arquivos devem ser mantidos sincronizados com a nova versão:
  1. `version.json`: Atualizar `version`, `versionCode`, `releaseDate` e listar as alterações detalhadas no array `changelog`.
  2. `package.json`: Atualizar o campo `"version"`.
  3. `common.js`: Atualizar `InGameUpdater.CURRENT_VERSION` e `InGameUpdater.CURRENT_VERSION_CODE`.
  4. `android/app/build.gradle`: Atualizar `versionCode` e `versionName`.

---

## 3. Nomenclatura e Terminologia Oficial
- **Modo Exploração (Exploration Mode)**:
  - O modo de mapa e campanha pelo Continente chama-se exclusivamente **Modo Exploração** (em inglês: *Exploration Mode*, espanhol: *Modo Exploración*, polonês: *Tryb Eksploracji*).
  - Nunca utilizar "Modo História" ou "Story Mode".
- **Partida Rápida de Gwent (Quick Gwent Match)**:
  - O botão de duelo contra a IA no menu principal chama-se **"Partida Rápida de Gwent"** (em inglês: *Quick Gwent Match*).

---

## 4. Pipeline de Build e Sincronização Mobile / PC
- Sempre que arquivos de frontend (`index.html`, `*.js`, `*.css`, `img/`, `music/`, etc.) forem alterados:
  1. Rodar `node scripts/build-mobile.js` (ou `npm run cap:copy`) para atualizar a pasta `www/` e os assets do Android.
  2. Para builds Android: compilar o APK via `cd android && .\gradlew.bat assembleDebug` e copiar o APK final para a raiz do repositório como `GwentClassic.apk`.
  3. Para builds PC: gerar o pacote portátil `GwentClassic-PC.zip` contendo todos os recursos necessários e o `GwentClassic.exe`.
  4. Ao publicar releases no GitHub: incluir sempre `GwentClassic.apk`, `GwentClassic-PC.zip` e `GwentClassic.exe` com a tag correspondente (`vX.Y.Z`) e título estrito "Gwent Classic".

