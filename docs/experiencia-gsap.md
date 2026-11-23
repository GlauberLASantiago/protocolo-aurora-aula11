# Experiência de uso com GSAP

## Tecnologia e diagnóstico

O aplicativo permanece estático: HTML, CSS e JavaScript puro, renderização por funções, estado salvo no navegador e PDF gerado localmente. Não há React, bundler, dependências de instalação ou servidor de estudantes. Portanto, `@gsap/react` não se aplica.

Os fluxos examinados foram: identificação, mapa, seis salas, seleção e revisão de decisões, EAP, cronograma, Biblioteca de bordo e emissão individual do PDF com dupla opcional. Capa, identidade violeta, conteúdo, regras de pontuação, sons e comprovante foram preservados.

A versão anterior recriava o conteúdo de `#app` a cada escolha. Isso reiniciava a animação CSS `.screen-enter`, mesmo sem troca de sala. Os itens da EAP e as marcações do cronograma apareciam diretamente na nova posição. Havia confetes na conclusão, sem relação com a próxima ação. Também havia botões sem nome acessível em telas pequenas, porque seu texto era ocultado por CSS.

## Quatro melhorias implementadas

1. **Continuidade entre telas e janelas.** Entrada de 7 px e opacidade discreta apenas em uma mudança real de tela ou sala. As escolhas na mesma sala não reiniciam a entrada. Janelas usam uma transição breve; na troca de abas da biblioteca, apenas a aba ativa recebe o destaque, sem animar a camada de texto do guia. Nenhum controle espera a animação acabar. Fechar uma janela permanece imediato.
2. **Devolutiva e conclusão.** A decisão avaliada recebe um destaque breve, e a primeira conclusão de uma sala realça a marca correspondente na navegação. O indicador de sala tem semântica de `progressbar` e se move entre as posições reais anterior e atual, sem inventar valores. Os confetes foram retirados; a conclusão mantém o foco no relatório e no comprovante. Não há contadores de pontuação animados.
3. **Reorganização da EAP.** O Flip relaciona cada entrega à sua identidade persistente (`data-flip-id`) e acompanha a mudança entre ramos. Novas entregas recebem uma entrada curta. São animadas as posições e escalas, preservando o fluxo do documento, sem retirar elementos para uma camada absoluta.
4. **Continuidade do cronograma.** A marca de cada entrega acompanha sua mudança de semana com Flip. As células preservam sua altura; bloqueios, valores e alertas de carga são atualizados imediatamente. A posição da rolagem horizontal e o foco no seletor são preservados após o redesenho.

Os efeitos duram aproximadamente 0,14 a 0,26 segundo. Não há animação contínua, parallax, rolagem artificial, repetição de entrada por caractere ou animação dos parágrafos do guia.

## Dependências e ciclo de vida

- GSAP **3.15.1**, apenas Core e **Flip**. Nenhum outro plugin é necessário.
- Origem: https://github.com/greensock/GSAP, revisão `5e6c35ff8eedea12d4f229129def635277d8b0f2`.
- Os arquivos minificados e seus avisos originais foram preservados. A aplicação não consulta CDN em execução.
- Referências: [plugins](https://gsap.com/docs/v3/Plugins/), [Flip.from](https://gsap.com/docs/v3/Plugins/Flip/static.from()/), [context/revert](https://gsap.com/docs/v3/GSAP/gsap.context()/).
- As animações são registradas em contextos locais. Contextos anteriores são revertidos antes de substituir o DOM; janelas retiram seus ouvintes ao fechar ou trocar o conteúdo.
- Mudança de preferência de movimento, redimensionamento e saída da página encerram as animações no estado final. A preferência é consultada antes de medir posições ou criar efeitos.
- O código não define `opacity:0` ou estado oculto em CSS como condição para funcionar. Um erro de efeito reverte o contexto e deixa a interface utilizável.

## Acessibilidade e disponibilidade

Foram preservados teclado, `aria-pressed`, textos de devolutiva, leitura das tabelas e rolagem nativa. As abas da biblioteca mantêm o foco após atualizar o conteúdo. Há restauração explícita de foco ao alternar o som, limpar escolhas, revisar uma decisão e concluir os formulários de identificação ou PDF.

Os botões do cabeçalho e da navegação têm nomes acessíveis mesmo quando seus textos visuais são ocultados no celular. A região do cronograma pode receber foco e ser rolada por teclado.

Se Core ou Flip não estiverem disponíveis, as atualizações continuam sem os respectivos efeitos. A página inicial contém conteúdo HTML e links de leitura antes dos scripts; `guia-aula-11.html` apresenta o anexo completo sem JavaScript, com suas três tabelas, diagramas e respostas expansíveis nativas.

## Verificação efetivamente realizada

- `node --check` nos arquivos editados; testes das seis salas, restrições de capacidade, dependências, prazo, revisão e PDF.
- Teste do guia: 13 seções, três tabelas reais, diagramas, seis respostas expansíveis e navegação preservados.
- Testes do movimento: entrada apenas em mudança real de tela, posição real no indicador, repetição, contextos locais, mudança de preferência, redimensionamento, limpeza de ouvintes, erro parcial e ausência de bibliotecas.
- No navegador, a preferência nativa por **movimento reduzido estava ativa**. Foi verificado que escolhas e mudanças da EAP funcionam no estado final, sem transformações animadas.
- Para testar o caminho de movimento normal, foi usada a prévia local `/?qa=motion-on`. Esse recurso de teste simula a preferência somente naquela página, sem alterar o computador ou o navegador. O código desse recurso fica em `tests/preview_server.py` e não é publicado em `dist`.
- Com GSAP real: reatribuições rápidas da EAP, mudanças repetidas de semana, navegação entre salas, devolutivas, conclusão, teclado Espaço, foco após revisão, som e alternância rápida de abas da biblioteca. Escape fechou a janela e devolveu o foco ao botão de origem. Não foram observados erros ou avisos do aplicativo nesses testes.
- Prévia móvel com 390 px e retorno ao tamanho desktop: sem transbordamento da página e sem transformações pendentes após redimensionar. A região do cronograma foi rolada por teclado até 120 px; após alterar a semana, permaneceu em 120 px com foco no seletor.
- Prévia sem scripts: a página manteve capa e links, e o guia abriu com três tabelas e nenhum script. Prévia sem as bibliotecas de movimento: os seletores continuaram funcionando.
- A conclusão abriu o relatório sem confetes. O formulário individual de comprovante preservou o campo opcional da dupla e gerou um PDF baixável de demonstração.

O teste móvel foi feito por redimensionamento de viewport, sem ensaio em aparelho físico nem benchmark de FPS. As escolhas de desempenho foram limitar o número de alvos, usar transformações, manter durações curtas e encerrar contextos inativos.

## Arquivos alterados ou adicionados

| Arquivo | Finalidade |
| --- | --- |
| `dist/app.js` | Pontos de integração, identidades de elementos, restauração de rolagem e foco, nomes acessíveis e retirada dos confetes. |
| `dist/motion.js` | Camada progressiva de GSAP, Flip e ciclo de vida dos contextos. |
| `dist/style.css` | Retirada de animações concorrentes, células estáveis e aparência final independente de movimento. |
| `dist/index.html` | Scripts locais versionados e conteúdo de leitura anterior ao JavaScript. |
| `dist/guia-aula-11.html` | Guia integral para leitura sem scripts. |
| `dist/vendor/gsap-3.15.1.min.js` | GSAP Core oficial. |
| `dist/vendor/Flip-3.15.1.min.js` | Plugin Flip oficial. |
| `dist/vendor/README.md` | Versão, origem fixa e documentação das dependências. |
| `scripts/prepare-guide.py` | Geração da rota de leitura sem scripts a partir do guia preservado. |
| `tests/verify-motion.mjs` | Regressões de ciclo de vida, preferências, falhas e leitura estática. |
| `tests/preview_server.py` | Prévia local e cenários controlados de falha e movimento normal. |
| `.github/workflows/pages.yml` | Verificação do novo código antes da publicação. |
| `README.md` | Execução, dependências locais e acesso ao relatório. |
| `docs/experiencia-gsap.md` | Diagnóstico, decisões e limites dos testes. |
