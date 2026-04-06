# ROADMAP — HSI (HostSemImposto)

**Projeto:** Sistema de booking self-hosted para anfitriões brasileiros de temporada
**Milestone:** v1 — Canal de venda direta completo
**Gerado em:** 2026-04-04
**Granularidade:** Standard (5 fases)

---

## Milestone Summary

HSI precisa entregar um único resultado para existir: **o hóspede completa uma reserva e paga diretamente ao anfitrião, sem intermediário**. Todo o resto — CRM, financeiro, segurança endurecida — é extensão e polimento desse núcleo.

A ordem das fases é ditada pela cadeia de dependências, não por preferência. Sem fundação não há auth. Sem auth e imóveis não há face pública. Sem face pública não há motor de booking. Sem booking não há nada para sincronizar ou gerenciar financeiramente. As Fases 1, 2 e 3 são estritamente sequenciais. As Fases 4 e 5 podem se sobrepor parcialmente após a Fase 3 estar completa.

---

## Cadeia de Dependências

```
Fase 1 (Foundation)
  └─► Fase 2 (Imóveis + Face Pública)
        └─► Fase 3 (Motor de Booking) ─────► VALOR CORE ENTREGUE
                    └─► Fase 4 (Operações: iCal, CRM, Financeiro)
                    └─► Fase 5 (Segurança, Staff, Polimento)
```

**Por que essa ordem é inegociável:**
- O schema do banco e o config de deploy precisam existir antes de qualquer feature
- Um imóvel precisa existir antes que o motor de booking possa cotar ou reservar
- O motor de booking precisa estar completo e testado antes de sincronizar calendários externos (iCal importa datas que conflitam com reservas reais)
- Gestão financeira depende de dados reais de reservas confirmadas para ter significado
- Endurecimento de segurança e sistema de staff são polimento profissional — críticos, mas não bloqueiam a entrega do valor core

---

## Phases

- [x] **Phase 1: Foundation & Infraestrutura** — Scaffolding, schema, auth, shell admin, deploy config
- [ ] **Phase 2: Gestão de Imóveis & Face Pública** — CRUD de imóveis, Cloudinary, homepage e página de imóvel sem booking
- [ ] **Phase 3: Motor de Booking** — Disponibilidade, cotação, Stripe, confirmação por e-mail e voucher PDF
- [ ] **Phase 4: Operações — iCal, CRM & Financeiro** — Sync com OTAs, CRM de hóspedes, financeiro, configurações
- [ ] **Phase 5: Segurança, Staff & Polimento** — Audit completo, sistema de staff, notificações, rate limiting endurecido

---

## Phase Details

### Phase 1: Foundation & Infraestrutura

**Goal**: O projeto existe, faz deploy no EasyPanel sem erros, e o admin consegue fazer login — nada mais, nada menos. Tudo o que vem depois depende de este alicerce estar correto.

**Por que primeiro:** Auth incorreto, schema equivocado ou config de deploy errado são defeitos retroativos que custam caro para corrigir. O bug do middleware interceptando webhooks do Stripe (que causa 3 dias de retries sem nenhuma reserva confirmada), a estratégia de sessão por banco (necessária para revogação imediata de staff), e o `output: 'standalone'` para Nixpacks — tudo isso precisa estar certo antes que qualquer feature seja construída em cima.

**Depends on**: Nada (primeira fase)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, SEC-04, SEC-05, SEC-06, SEC-07, SEC-10, SEC-11

**Key Deliverables**:
- Projeto Next.js 15 com Turbopack, TypeScript strict, Tailwind v4, shadcn/ui configurados
- Schema Drizzle completo (todas as tabelas: auth, properties, bookings, availability, guests, financial, audit) com migrations automáticas no startup
- NextAuth v5 com Drizzle adapter — providers credentials (bcrypt) + magic link (Resend), database session strategy
- `middleware.ts` com matcher explícito excluindo `/api/webhooks/*` e `/api/ical/*` desde o primeiro commit
- Re-validação de sessão (`await auth()`) em toda Server Action/Route Handler sensível (defesa contra CVE-2025-29927)
- Shell admin: sidebar colapsável, dark mode como padrão, alternância light/dark, navegação mobile por bottom nav, header com perfil e central de notificações (shell vazio)
- Dashboard KPI com shells das seções (dados reais virão com bookings, mas os cards, gráficos e seção de alertas existem estruturalmente)
- Config EasyPanel: `output: 'standalone'` no `next.config.ts`, `PRISMA_GENERATE_SKIP_AUTOINSTALL=true`, documentação de todas as `NEXT_PUBLIC_*` vars que devem ser configuradas antes do primeiro build
- Infraestrutura de rate limiting (in-memory token bucket) — sem Redis, Map-based, adequado para processo único
- Infraestrutura de audit log: tabela `audit_log` (BIGSERIAL PK, indexes em entity e user), helper `logAction()` fire-and-forget
- Headers de segurança: CSP (scripts da própria origem + Stripe, imagens da própria origem + Cloudinary, frames apenas Stripe), X-Frame-Options, HSTS
- Prisma como `devDependency` para Prisma Studio; schema Prisma sincronizado via `db pull` após cada migration Drizzle

**Success Criteria** (o que deve ser VERDADE ao final desta fase):
1. Admin abre o browser, acessa `/login`, faz login com e-mail + senha e é redirecionado para `/admin/dashboard` com o shell do painel visível
2. Admin faz login via magic link (recebe e-mail, clica no link) e a sessão persiste após fechar e reabrir o browser
3. Qualquer tentativa de acessar `/admin/*` sem sessão ativa redireciona imediatamente para `/login` — sem exceção
4. O projeto faz build e deploy no EasyPanel com Nixpacks sem erro, servindo corretamente a rota raiz `/` (mesmo que ainda sem conteúdo público)
5. Um `console.log` no webhook do Stripe em `/api/webhooks/stripe` recebe chamadas externas sem ser redirecionado pelo middleware de auth
6. O audit log registra login bem-sucedido com IP, user agent e timestamp consultável no banco

**Complexity**: High (fundação crítica — erros aqui se propagam em cascata)

**UI hint**: yes

---

### Phase 2: Gestão de Imóveis & Face Pública

**Goal**: O admin cadastra um imóvel completo com fotos, precificação e regras. O hóspede acessa a homepage pública e a página do imóvel com experiência cinematográfica — sem conseguir reservar ainda, mas com toda a apresentação visual e editorial.

**Por que segundo:** Imóveis são o dado de base para tudo: cotação usa preço do imóvel, disponibilidade pertence ao imóvel, booking referencia o imóvel. Sem pelo menos um imóvel cadastrado e completo, o motor de booking não tem dado para operar. A face pública é construída junto pois usa exatamente os mesmos dados do imóvel — construir os dois juntos elimina re-trabalho.

**Depends on**: Fase 1

**Requirements**: PROP-01, PROP-02, PROP-03, PROP-04, PROP-05, PROP-06, PROP-07, PROP-08, PROP-09, PROP-10, PRICE-01, PRICE-02, PRICE-03, PRICE-04, PRICE-05, PRICE-06, PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06, PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08, PAGE-13, PAGE-14, PAGE-15, SEC-01, SEC-02, SEC-03, SEC-08, SEC-09

**Key Deliverables**:
- CRUD completo de imóveis: nome, descrição rich text (Tiptap), localização (endereço + coordenadas), capacidade, quartos, banheiros, camas; status (ativo/inativo/manutenção); flag destaque
- DOMPurify v2.x aplicado à descrição rich text antes de salvar (allowlist restrita: tags estruturais básicas, sem atributos de evento)
- Gestão de comodidades via lista dinâmica com ícones (JSONB no banco, nunca join table)
- Upload múltiplo de imagens via Cloudinary: signature gerada no servidor (endpoint `/api/upload/signature` auth-gated), magic bytes validation (JPEG/PNG/WebP, max 10MB) antes do envio ao Cloudinary
- Reordenação por drag-and-drop, definição de imagem capa, organização por ambiente (sala, quartos, etc.)
- Incorporação de vídeo YouTube por URL
- Precificação: valor base/noite, períodos de temporada com preços diferenciados, taxa de limpeza, descontos progressivos por estadia longa (7/14/28 noites), mínimo de noites — todos os valores em centavos inteiros
- Homepage pública: hero full-screen (vídeo ou foto), busca por datas + hóspedes, cards fotográficos dos imóveis, seção narrativa, depoimentos, CTA flutuante no mobile
- Página de imóvel: hero cinematográfico com parallax, nome em Instrument Serif, galeria assimétrica editorial, lightbox com navegação por teclado/swipe, seção descritiva com scroll reveal, comodidades em grid com categorias, mapa interativo, regras e políticas, depoimentos, botão flutuante pós-scroll
- Widget de cotação no desktop (sidebar fixa durante scroll) — sem funcionalidade de reserva ainda: renderiza a UI mas o botão "Reservar" não está conectado
- Animações com Framer Motion (Motion v12 de `motion/react`): scroll reveals, spring physics — exclusivamente `transform` e `opacity`, nunca propriedades que causam layout reflow
- Sistema de design: Geist (interface) + Instrument Serif (display), paleta monocromática com acento #0071e3

**Success Criteria** (o que deve ser VERDADE ao final desta fase):
1. Admin cria um imóvel com todos os campos, faz upload de 5 imagens, reordena por drag-and-drop e salva — sem erro, sem exposição do `CLOUDINARY_API_SECRET` no cliente
2. Admin configura períodos de temporada com preços diferentes e descontos por estadia longa para um imóvel
3. Hóspede abre a homepage em um browser, vê o hero em tela cheia, navega pelos cards de imóveis e acessa a página de um imóvel específico — a experiência visual está completa e responsiva no mobile
4. Na página do imóvel, o hóspede rola a página, vê a galeria assimétrica, clica em uma foto e abre o lightbox com navegação por setas e teclado
5. Um LLM ou ferramenta de auditoria não consegue extrair texto script ou atributos de evento da descrição do imóvel salva — a sanitização DOMPurify está funcionando
6. O build de produção não inclui `@prisma/client` no bundle (Prisma é `devDependency` apenas)

**Complexity**: High (o design cinematográfico exige fidelidade visual alta; Cloudinary tem pontos críticos de segurança)

**UI hint**: yes

---

### Phase 3: Motor de Booking

**Goal**: O hóspede seleciona datas, vê a cotação completa com breakdown, preenche seus dados, paga via Stripe (cartão ou Pix) e recebe o e-mail de confirmação com voucher PDF. O admin vê a reserva confirmada no painel com timeline de auditoria.

**Por que terceiro:** Esta é a entrega do valor core do produto inteiro. Sem esta fase, o HSI é apenas um site bonito. A fase entrega o loop completo e indivisível: cotação → checkout → pagamento → confirmação → e-mail + PDF. Entregar parcialmente (aceitar dinheiro sem confirmar, ou confirmar sem enviar e-mail) é pior do que não entregar — cria confusão e perda de confiança do hóspede.

**Depends on**: Fase 2

**Requirements**: AVAIL-01, AVAIL-06, BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-07, BOOK-08, BOOK-09, BOOK-10, BOOK-11, BOOK-12, BOOK-13, BOOK-14, BOOK-15, RES-01, RES-02, RES-03, RES-04, RES-05, RES-06, EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04, EMAIL-05, PAGE-09, PAGE-10, PAGE-11, PAGE-12, PAGE-16

**Key Deliverables**:
- Modelo de disponibilidade: tabela `blocked_dates` com date-range rows; admin pode bloquear datas manualmente no calendário (manutenção, uso próprio)
- Função `calculateBookingPrice(propertyId, checkIn, checkOut)` server-only: aplica preço base, temporada aplicável, descontos progressivos, taxa de limpeza — retorna breakdown completo em centavos; nunca confia em preço enviado pelo cliente
- `QuoteWidget` como Client Component: seleção de datas em calendário interativo, cotação dinâmica em tempo real mostrando diárias × valor + taxa de limpeza + total; callout "reservando direto você economiza X%" comparando com estimativa OTA (total × 1.15)
- Formulário do hóspede: nome, e-mail, WhatsApp, número de hóspedes
- Server Action `createCheckoutSession`: (1) re-verifica disponibilidade com `SELECT ... FOR UPDATE` em transação Drizzle para prevenir race conditions, (2) recalcula preço server-side ignorando qualquer dado do cliente, (3) INSERT booking com status `awaiting_payment`, (4) INSERT blocked_dates com source `booking` (hold otimista), (5) cria Product dinâmico no Stripe, (6) cria Price `one_time` em BRL em centavos, (7) cria Checkout Session com metadados (`booking_id`, `property_id`), success_url, cancel_url, customer_email pré-preenchido; (8) salva session_id no booking; (9) redireciona para Stripe Checkout
- Stripe Checkout aceita cartão de crédito e Pix via EBANX/Stripe Brazil
- Webhook handler `/api/webhooks/stripe`: (1) `await request.text()` como operação absoluta imediata — nunca `.json()` antes; (2) `stripe.webhooks.constructEvent()` — rejeita com 400 sem assinatura válida; (3) idempotency check via tabela `processed_webhook_events`; (4) trata `checkout.session.completed` → status booking `confirmed`, PaymentIntent ID salvo; (5) trata `checkout.session.expired` → blocked_dates removido, booking cancelado; (6) INSERT em `processed_webhook_events`; (7) retorna 200
- Rate limiting: máximo 5 tentativas de criar reserva por IP por hora (in-memory bucket)
- Rate limiting para magic link: máximo 3 por e-mail por hora; login: máximo 10 tentativas por IP em 15 minutos
- Templates React Email em pt-BR: e-mail de confirmação para hóspede + notificação para admin
- Voucher PDF com `@react-pdf/renderer` (sem Puppeteer): dados do imóvel, período, hóspede, total, QR code — gerado e enviado como anexo no e-mail de confirmação via Resend
- Admin pode re-gerar e reenviar voucher de qualquer reserva
- Views admin de reservas: lista com filtros (status, imóvel, período, hóspede), busca por nome/e-mail/código, visualização em calendário mensal por imóvel, detalhe com timeline de auditoria, ações manuais (confirmar, cancelar, check-in, check-out)
- Lifecycle completo: pendente → aguardando pagamento → confirmada → em hospedagem → concluída → cancelada

**Success Criteria** (o que deve ser VERDADE ao final desta fase):
1. Hóspede seleciona datas disponíveis no widget, vê o breakdown completo da cotação (diárias + taxa de limpeza + total) e o callout de economia vs OTA
2. Hóspede preenche dados, clica "Reservar" e é redirecionado para Stripe Checkout — o valor na página do Stripe corresponde exatamente ao calculado no servidor, e o e-mail está pré-preenchido
3. Após pagamento no Stripe (cartão ou Pix), o webhook confirma a reserva em até 30 segundos, o hóspede recebe e-mail de confirmação com voucher PDF em anexo, e o admin recebe notificação de nova reserva
4. Tentativa de reservar datas já ocupadas retorna erro imediatamente — mesmo se duas tentativas chegam simultaneamente (race condition protegida por `FOR UPDATE`)
5. Enviar o webhook duas vezes com o mesmo `stripe_event_id` produz exatamente o mesmo resultado que enviar uma vez — idempotência verificada
6. Admin visualiza a reserva confirmada no painel com todos os eventos do lifecycle registrados na timeline de auditoria

**Complexity**: High (integração Stripe com múltiplos pontos críticos; concorrência na disponibilidade; PDF gerado e enviado por e-mail — todos devem funcionar juntos)

**UI hint**: yes

---

### Phase 4: Operações — iCal, CRM & Financeiro

**Goal**: Admin sincroniza calendários com Airbnb e Booking.com bidirecional, gerencia hóspedes numa pipeline kanban, acompanha o fluxo de caixa e configura a identidade visual da instância.

**Por que quarto:** iCal, CRM e financeiro só fazem sentido com dados reais de reservas. Um anfitrião não precisa de pipeline kanban antes de receber a primeira reserva. A sincronização iCal depende do feed de export (que lista reservas confirmadas do Fase 3) para ser bidirecional. O módulo financeiro é construído sobre as transações criadas automaticamente pelo webhook do Fase 3.

**Depends on**: Fase 3

**Requirements**: AVAIL-02, AVAIL-03, AVAIL-04, AVAIL-05, CRM-01, CRM-02, CRM-03, CRM-04, CRM-05, CRM-06, CRM-07, CRM-08, FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, FIN-06, FIN-07, FIN-08, FIN-09, FIN-10, SET-01, SET-02, SET-03, SET-04, SET-05

**Key Deliverables**:
- Endpoint público `/api/ical/[propertyId]` retornando feed `.ics` com reservas confirmadas (Content-Type: `text/calendar`, UUID no path para obscuridade); para importar no Airbnb/Booking.com
- iCal import: admin configura URLs de feeds externos (Airbnb, Booking.com, VRBO) por imóvel; parser `node-ical` faz fetch, parseia VEVENT blocks, faz upsert em `blocked_dates` com `source: 'ical:{feed_id}'`, exibe origem nos bloqueios; fix Airbnb off-by-one: para eventos `DATE` (sem hora), adicionar 1 dia ao `DTEND`; dedup por `ical_uid`; reservas confirmadas do HSI têm precedência sobre bloqueios iCal em caso de conflito — gera notificação admin
- Scheduler `node-cron` inicializado em `instrumentation.ts` (gated `NEXT_RUNTIME === 'nodejs'`): sincronização a cada 30 minutos automática
- CRM de hóspedes: perfil completo (nome, e-mail, telefone, CPF opcional, cidade de origem, data de nascimento), histórico de reservas, observações internas, tags; lista exportável em CSV
- Pipeline kanban: colunas lead → contato feito → proposta enviada → reserva confirmada → concluído; cards mostram nome, imóvel de interesse, datas, valor estimado; drag-and-drop entre colunas; botão "Converter em reserva" em um clique
- Dashboard financeiro: fluxo de caixa com entradas automáticas de reservas confirmadas (via webhook) e saídas manuais por categoria (manutenção, limpeza, comissão, outros); saldo calculado e projetado mensalmente; filtros por período e imóvel
- Relatórios: receita por imóvel (mensal/trimestral/anual), taxa de ocupação, ticket médio, RevPAR, comparativo entre períodos; exportação em PDF e CSV
- Gerador de propostas comerciais em PDF (`@react-pdf/renderer`): logo, dados do imóvel, período, valor, validade; envio direto por e-mail do admin; histórico de propostas com status (enviada/aceita/recusada); rate limiting: máximo 20 por usuário autenticado por hora
- Configurações de instância: identidade visual (nome do negócio, logo, favicon, cor de acento primária), contatos públicos (WhatsApp, Instagram), política de cancelamento via rich text, integração Stripe (chaves do anfitrião), Resend (chave API, e-mail remetente)

**Success Criteria** (o que deve ser VERDADE ao final desta fase):
1. Admin abre a URL do feed iCal no Airbnb como "Importar calendário" e as reservas confirmadas aparecem bloqueadas no calendário do Airbnb
2. Admin adiciona URL do feed iCal do Airbnb; em até 30 minutos (na próxima execução do cron) os bloqueios aparecem no calendário admin com a origem "Airbnb" visível; datas off-by-one do Airbnb estão corrigidas
3. Uma reserva confirmada via Stripe aparece automaticamente no fluxo de caixa como entrada, sem ação manual do admin
4. Admin arrasta um card de lead para "Proposta enviada" no kanban, clica em "Converter em reserva" e a reserva aparece no módulo de reservas
5. Admin acessa Configurações, troca o logo e a cor de acento, e a homepage pública reflete as mudanças após re-validação de cache

**Complexity**: Medium (iCal tem pontos específicos de atenção como o off-by-one do Airbnb; a lógica de negócio de CRM e financeiro é direta dado o schema já existente)

**UI hint**: yes

---

### Phase 5: Segurança, Staff & Polimento

**Goal**: Auditoria completa de segurança, sistema de usuários staff com permissões granulares, notificações in-app operacionais, rate limiting endurecido em todos os endpoints sensíveis, e checklist de deploy para produção.

**Por que quinto:** Segurança completa e sistema de staff são polimento profissional — um anfitrião solo consegue usar o produto sem isso, mas um anfitrião com equipe (recepcionista, gerente de reservas, financeiro) precisa de controle granular. Rate limiting de segurança (PostgreSQL-backed para endpoints de login e booking) era inadequado com in-memory apenas para múltiplas instâncias, mas para a instância única atual a in-memory é suficiente até este ponto. O endurecimento completo fecha o produto para entrega production-ready.

**Depends on**: Fase 3 (para ter dados reais nos testes de segurança); Fase 4 recomendado mas não estritamente necessário

**Requirements**: AUTH-07, AUTH-08, ADMIN-05, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, BOOK-15, EMAIL-04, EMAIL-05, FIN-10

**Key Deliverables**:
- Fluxo de convite de staff: owner envia convite por e-mail, staff cria senha via token temporário com expiração, conta ativada
- Sistema de permissões granulares por módulo: owner pode configurar para cada staff membro — visualizar / editar / sem acesso — para cada módulo (imóveis, reservas, hóspedes, financeiro, configurações)
- Toda Server Action do admin verifica sessão E permissão antes de qualquer lógica — não apenas middleware
- Notificações in-app funcionais: nova reserva recebida, pagamento confirmado, check-in do dia, check-out sem confirmação — centralizadas no header do admin (shell foi criado na Fase 1, aqui recebe os eventos reais)
- Auditoria de DOMPurify: revisão da allowlist configurada, teste com payloads XSS conhecidos
- Auditoria de CSP: verificar que nenhum script externo não autorizado consegue executar, que o frame Stripe funciona corretamente, que Cloudinary para imagens está permitido
- Verificação de CORS: nenhum endpoint sensível aceita requisições cross-origin não autorizadas
- Rate limiting endurecido (revisão completa): login (10/15min por IP), booking creation (5/hora por IP), magic link (3/hora por e-mail), envio de propostas (20/hora por usuário), todos auditados e testados
- Core Web Vitals na face pública: LCP < 2.5s, CLS < 0.1, INP < 200ms — auditar animações Framer Motion para garantir que apenas `transform` e `opacity` são usadas
- Checklist de deploy para produção: todas as `NEXT_PUBLIC_*` vars documentadas, `PRISMA_GENERATE_SKIP_AUTOINSTALL=true`, migrations automáticas no startup, Prisma Studio via túnel SSH (nunca exposto publicamente), configuração de alertas no EasyPanel

**Success Criteria** (o que deve ser VERDADE ao final desta fase):
1. Owner convida staff por e-mail; staff acessa o painel e só consegue ver os módulos para os quais tem permissão — tentativa de acessar módulo sem permissão retorna 403
2. Um script de ataque XSS inserido no campo de descrição de imóvel é completamente neutralizado — a tag `<script>` não aparece no HTML renderizado
3. Fazer 11 tentativas de login em menos de 15 minutos resulta em bloqueio com mensagem clara — a 12a tentativa é rejeitada mesmo com credenciais corretas
4. Uma nova reserva confirmada aparece como notificação in-app no header do admin sem necessidade de recarregar a página
5. Lighthouse na página pública do imóvel marca Performance >= 85 com LCP < 2.5s em conexão simulada de 4G

**Complexity**: Medium (segurança é meticulosa mas não introduz novas integrações; o sistema de permissões tem complexidade de produto mas schema já existe)

**UI hint**: yes

---

## Progress Table

| Fase | Planos Completos | Status | Concluída |
|------|-----------------|--------|-----------|
| 1. Foundation & Infraestrutura | 5/5 | ✅ Complete | 2026-04-05 |
| 2. Gestão de Imóveis & Face Pública | 5/5 | ✅ Complete | 2026-04-05 |
| 3. Motor de Booking | 4/4 | ✅ Complete | 2026-04-06 |
| 4. Operações — iCal, CRM & Financeiro | 4/4 | ✅ Complete | 2026-04-06 |
| 5. Segurança, Staff & Polimento | 1/? | 🔄 In Progress | - |

---

## Coverage Validation

**Total de requirements v1:** 92
**Mapeados:** 92
**Não mapeados:** 0

### Mapa de cobertura por fase

| Requirement | Fase |
|-------------|------|
| AUTH-01..06 | Fase 1 |
| AUTH-07..08 | Fase 5 |
| ADMIN-01..04 | Fase 1 |
| ADMIN-05 | Fase 5 |
| DASH-01..05 | Fase 1 |
| OPS-01..05 | Fase 1 |
| SEC-04..07 | Fase 1 |
| SEC-10..11 | Fase 1 |
| PROP-01..10 | Fase 2 |
| PRICE-01..06 | Fase 2 |
| PUB-01..06 | Fase 2 |
| PAGE-01..08 | Fase 2 |
| PAGE-13..15 | Fase 2 |
| SEC-01..03 | Fase 2 |
| SEC-08..09 | Fase 2 |
| AVAIL-01 | Fase 3 |
| AVAIL-06 | Fase 3 |
| BOOK-01..15 | Fase 3 |
| RES-01..06 | Fase 3 |
| EMAIL-01..05 | Fase 3 |
| PAGE-09..12 | Fase 3 |
| PAGE-16 | Fase 3 |
| AVAIL-02..05 | Fase 4 |
| CRM-01..08 | Fase 4 |
| FIN-01..10 | Fase 4 |
| SET-01..05 | Fase 4 |
| SEC-01..03 (revisão/auditoria) | Fase 5 |
| SEC-04..11 (auditoria completa) | Fase 5 |
| BOOK-15 (auditoria rate limit) | Fase 5 |
| EMAIL-04..05 (auditoria rate limit) | Fase 5 |
| FIN-10 (auditoria rate limit) | Fase 5 |
| AUTH-07..08 | Fase 5 |
| ADMIN-05 | Fase 5 |

> Nota sobre SEC-01..11: os requirements de segurança são implementados na fase onde o feature correspondente é construído (ex: SEC-08/09 Cloudinary na Fase 2, SEC-01 Zod em todas as Server Actions a partir da Fase 1), e revisados/auditados completamente na Fase 5. Não há duplicação — a auditoria da Fase 5 confirma e complementa a implementação inicial.

---

## Pitfalls Críticos por Fase

Extraídos da pesquisa de arquitetura para referência rápida durante o planejamento de cada fase.

| Fase | Pitfall | Consequência se ignorado |
|------|---------|--------------------------|
| 1 | Middleware NÃO exclui `/api/webhooks/*` do matcher | Stripe retries por 3 dias, nenhuma reserva confirmada |
| 1 | Colunas customizadas em `users` sem nullable/default | Drizzle adapter falha em `NOT NULL` inserts |
| 1 | `NEXT_PUBLIC_*` vars não configuradas antes do primeiro build | Variáveis ignoradas até rebuild completo; Stripe URLs quebradas |
| 2 | `CLOUDINARY_API_SECRET` com prefixo `NEXT_PUBLIC_` | Secret exposto ao cliente, quota esgotada por terceiros |
| 3 | `request.json()` antes da verificação de assinatura Stripe | Todos os webhooks rejeitados com 400; nenhuma reserva confirmada |
| 3 | Webhook sem handler para `checkout.session.expired` | Datas bloqueadas para sempre mesmo sem pagamento |
| 3 | Webhook processado duas vezes (sem idempotência) | Dupla confirmação de reserva, duplo e-mail ao hóspede |
| 3 | `drizzle-kit push` em produção | Bypass do histórico de migrations; risco de perda de dados |
| 4 | iCal import sem fix Airbnb off-by-one (`DTEND` +1 dia) | Datas erradas em todos os bloqueios vindos do Airbnb |
| 5 | Rate limiting in-memory para login/booking em produção | Reinício do processo reseta contadores; janela de ataque após deploy |

---

*ROADMAP gerado em: 2026-04-04*
*Próximo passo: `/gsd:plan-phase 1`*
