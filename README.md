# Campeonato Pro Clubs

Site do campeonato de Pro Clubs (EA FC 26): Next.js 15 (App Router) + Tailwind v4 no
front-end, Supabase (Postgres + Auth + Storage + Realtime) no back-end.

## O que já está pronto

**Site público**
- `/` — início, com a partida em destaque (ao vivo ou próxima), prévia da classificação,
  artilharia e últimos resultados
- `/classificacao` — tabela completa dos Grupos A e B
- `/chaveamento` — semifinais (MD3) e Grande Final (MD7)
- `/resultados` — próximos jogos e histórico de resultados
- `/resultados/[id]` — detalhe de uma partida com estatísticas de cada jogador
- `/times` e `/times/[id]` — elenco e estatísticas de cada time
- `/artilharia` — artilheiros e líderes de assistência
- `/regulamento` — regulamento oficial (já preenchido com as regras que você enviou)

**Painel administrativo** (`/admin`, login com Supabase Auth)
- CRUD de times (nome, nome curto, grupo, escudo — upload de imagem)
- CRUD de jogadores por time (nome, posição, camisa, goleiro)
- Sorteio dos 8 times em Grupo A/B + geração automática dos confrontos da fase de grupos
- Geração das semifinais (MD3) a partir da classificação e da Grande Final (MD7) a partir
  dos vencedores
- Adição de jogos dentro de uma série (jogo 1, 2, 3... conforme o formato MD1/3/5/7)
- Lançamento de placar, prorrogação/pênaltis e W.O.
- Lançamento das estatísticas de cada jogador por partida (gols, assistências, nota)
- Marcar uma partida como "ao vivo" e destacá-la na home

O placar da série (quem está ganhando o MD3/MD7) e a classificação dos grupos são
calculados automaticamente no banco (trigger + views) sempre que você salva um resultado.

## Passo a passo para colocar no ar

### 1. Criar o projeto no Supabase
1. Crie uma conta/projeto em supabase.com.
2. No **SQL Editor**, cole e rode o conteúdo inteiro de `supabase/schema.sql`. Isso cria
   todas as tabelas, views, o trigger de atualização de série, as políticas de segurança
   (RLS) e o bucket de storage para os escudos.
3. Em **Authentication > Users**, crie o usuário do administrador (e-mail + senha) que vai
   logar no painel `/admin`. Não é preciso criar cadastro público — só você (organizador)
   usa essa conta.
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.

### 2. Configurar o projeto Next.js
```bash
npm install
cp .env.local.example .env.local
```
Edite `.env.local` com a URL e a chave anon copiadas no passo anterior:
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Rodar localmente
```bash
npm run dev
```
Acesse `http://localhost:3000` para o site público e
`http://localhost:3000/admin/login` para o painel (use o e-mail/senha criados no passo 1).

### 4. Publicar
O jeito mais simples é a Vercel: importe o repositório, adicione as
duas variáveis de ambiente do passo 2 e faça o deploy.

## Fluxo de uso do painel

1. **Times** → cadastre os 8 clubes (nome, escudo) e o elenco de cada um.
2. **Confrontos** → clique em "Sortear grupos" (só funciona com exatamente 8 times
   cadastrados). Isso sorteia o Grupo A/B e já cria os 12 jogos de turno único da fase de
   grupos.
3. **Resultados** → conforme os jogos acontecem, abra cada partida, lance o placar e as
   estatísticas de cada jogador. Use "Marcar como ao vivo" antes de começar um jogo para
   ele aparecer em destaque na home.
4. Quando a fase de grupos terminar, volte em **Confrontos** e clique em "Gerar
   semifinais" — o sistema usa a classificação atual (1ºA x 2ºB, 1ºB x 2ºA) e cria as
   séries em MD3.
5. Dentro de cada série (semifinal ou final), use o botão "Jogo N" para adicionar o
   próximo jogo do confronto conforme for sendo necessário (até 3 jogos numa MD3, até 7
   numa MD7).
6. Quando as duas semifinais tiverem vencedor, clique em "Gerar final" para criar a
   Grande Final em MD7.

## Estrutura do projeto

```
src/
  app/                    # rotas (App Router)
    admin/                # painel administrativo (protegido por middleware)
    ...                   # páginas públicas
  components/
    site/                 # componentes do site público (crest, placar, etc.)
    ui/                   # primitivos visuais (Panel, badges, títulos)
  lib/
    actions/              # Server Actions (mutações: teams, players, tournament, matches)
    supabase/             # clientes Supabase (browser, server, middleware)
    data.ts               # leituras usadas pelas páginas públicas
    types.ts              # tipos compartilhados
supabase/
  schema.sql              # schema completo do banco (rode no SQL Editor do Supabase)
```

## Observações técnicas

- Autenticação: apenas usuários autenticados (o organizador) podem gravar dados; a
  leitura é pública para qualquer visitante, via Row Level Security no Postgres.
- Os escudos dos times são enviados para o bucket público `team-logos` no Supabase
  Storage.
- O placar de uma série MD1/MD3/MD5/MD7 e o time vencedor são recalculados
  automaticamente por um trigger no banco sempre que uma partida é marcada como
  finalizada — não é preciso fazer essa conta manualmente no front-end.
- Para atualização em tempo real do placar ao vivo, o Realtime do Supabase já está
  habilitado nas tabelas `matches`, `series` e `player_match_stats`; hoje as páginas
  públicas usam revalidação a cada 15–60s, e dá para trocar por um listener Realtime
  no cliente se quiser atualização instantânea.
