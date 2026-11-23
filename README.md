![Capa do Protocolo Aurora — Laboratório de decisões com IA](dist/assets/capa-protocolo-aurora.jpg)

# Protocolo Aurora

Jogo narrativo para estudantes de mestrado explorarem criatividade, autoria, automação, curadoria pedagógica e planejamento com inteligência artificial.

Base de estudo: **Guia de estudos da Aula 11 — Laboratório Criativo de Inteligência Artificial para Mídias Multiplataformas**, de 17 de novembro de 2026, fornecido pelo docente. O guia integral está disponível dentro do jogo. As saídas de IA, os personagens, os números e as fontes do caso Aurora são fictícios.

## Jogar

**[Abrir o jogo](https://glauberlasantiago.github.io/protocolo-aurora-aula11/)**

O percurso tem seis salas, com consulta livre ao guia, devolutivas comentadas e possibilidade de revisar decisões:

1. Composição de um prompt contextualizado.
2. Inspeção de pseudocódigo e revisão de permissões.
3. Investigação de distorções em uma cadeia de sínteses.
4. Curadoria de uma oficina e preservação da autonomia intelectual.
5. Distribuição de entregas em uma EAP.
6. Revisão de cronograma diante de restrições de capacidade e disponibilidade.

Duração sugerida: 25 a 40 minutos. Cada participante percorre as salas e emite seu próprio comprovante. O teclado permite navegar com Tab e acionar controles com Enter ou Espaço. Os efeitos sonoros podem ser desligados. Não há narração, cronômetro ou exigência de nota mínima.

## Comprovante e relatório PDF

Ao concluir as seis salas, o participante pode baixar um PDF com nome, data, identificador da partida, escolhas finais, devolutivas e quantidade de rodadas de revisão. A reflexão pessoal é facultativa.

O arquivo é gerado no próprio navegador, sem servidor de estudantes. **É um comprovante de participação autogerado pelo jogo, sem assinatura ou validação institucional**, sem carga horária atribuída e sem consulta pública de autenticidade. A pontuação é didática e não equivale a nota ou certificação de domínio. Para uso como evidência no AVA, o estudante pode anexar o PDF conforme a orientação do docente.

Na emissão do PDF, o campo opcional “Nome da sua dupla” permite registrar a pessoa com quem a atividade foi realizada. Essa informação aparece no comprovante e no relatório; cada estudante emite e entrega seu próprio arquivo. O aplicativo não oferece modalidade de grupo.

## Privacidade

Nome, nome da dupla (quando informado), escolhas e reflexão são armazenados no `localStorage` do navegador e no PDF baixado. Não há chamadas a APIs de IA, banco de dados de participantes ou telemetria do jogo. O serviço de hospedagem pode manter seus registros técnicos usuais. Limpar os dados do navegador pode apagar o progresso. Os efeitos usam a preferência local `edutec-sfx-enabled`, independente de narração.

## Executar e verificar localmente

Não há dependências de instalação ou etapa de compilação.

```sh
python -m http.server 8766 --directory dist
node tests/verify.mjs
node tests/verify-guide.mjs
```

Também é possível abrir `dist/index.html` diretamente em um navegador; a persistência em URLs `file:` depende do navegador. A opção recomendada para a turma é o link do GitHub Pages.

## Publicação

O workflow `.github/workflows/pages.yml` verifica o JavaScript e os cenários do jogo, empacota `dist` e publica no GitHub Pages após alterações na branch `main`.

Os arquivos editáveis são `dist/app.js`, `dist/style.css`, `dist/pdf.js`, `dist/guide.js` e `dist/index.html`. O PDF usa fontes padrão do formato PDF para o texto em português.

O guia integral preserva a estrutura HTML do anexo em `content/guia-aula-11.html`, incluindo tabelas, diagramas, quadros e respostas expansíveis. Após uma alteração nesse arquivo, regenere o módulo com `python scripts/prepare-guide.py` (requer BeautifulSoup somente no ambiente de edição). A execução do jogo permanece sem dependências externas.

## Capa

Arte de abertura criada com geração de imagens por IA para este jogo. A mesma capa aparece no início do jogo, neste README e nos metadados de compartilhamento do GitHub Pages.

[Arquivo da capa](dist/assets/capa-protocolo-aurora.jpg) · [Prompt de criação](artwork/capa-prompt.txt)
