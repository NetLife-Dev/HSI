# Requirements: HSI — HostSemImposto

**Defined:** 2026-04-04
**Core Value:** O hóspede reserva diretamente com o anfitrião numa experiência imersiva de marca própria — tão boa quanto Airbnb, sem depender de OTA.

---

## v1 Requirements

### Foundation & Auth

- [ ] **AUTH-01**: Admin pode fazer login com e-mail + senha (bcrypt hash)
- [ ] **AUTH-02**: Admin pode fazer login via magic link enviado por e-mail (Resend)
- [ ] **AUTH-03**: Admin pode recuperar senha via token temporário com expiração
- [ ] **AUTH-04**: Sessão persiste entre refreshes de browser (NextAuth v5, database session strategy)
- [ ] **AUTH-05**: Todas as rotas `/admin/*` são protegidas por middleware — redirect para login se não autenticado
- [ ] **AUTH-06**: Webhook do Stripe em `/api/webhooks/stripe` é excluído do middleware de auth
- [ ] **AUTH-07**: Owner pode convidar colaboradores (staff) por e-mail
- [ ] **AUTH-08**: Permissões de staff são configuráveis por módulo (visualizar / editar / sem acesso)

### Admin Layout & UX

- [ ] **ADMIN-01**: Painel admin tem sidebar colapsável com navegação por módulo
- [ ] **ADMIN-02**: Dark mode é o padrão do admin com alternância para light mode
- [ ] **ADMIN-03**: Em mobile, sidebar se transforma em navegação inferior
- [ ] **ADMIN-04**: Header inclui perfil do usuário e central de notificações in-app
- [ ] **ADMIN-05**: Notificações in-app: nova reserva, pagamento confirmado, check-in do dia, check-out sem confirmação

### Dashboard

- [ ] **DASH-01**: Dashboard exibe KPIs em tempo real: reservas ativas, faturamento do mês, taxa de ocupação, próximos check-ins
- [ ] **DASH-02**: Gráfico de receita mensal dos últimos 12 meses
- [ ] **DASH-03**: Gráfico de taxa de ocupação por imóvel
- [ ] **DASH-04**: Lista das próximas reservas com ações rápidas (confirmar, ver detalhe)
- [ ] **DASH-05**: Alertas críticos: reservas aguardando pagamento e check-outs do dia

### Property Management

- [ ] **PROP-01**: Admin pode criar imóvel com nome, descrição rich text, localização (endereço + coordenadas), capacidade, quartos, banheiros, camas
- [ ] **PROP-02**: Admin pode configurar lista de comodidades a partir de lista dinâmica com ícones (WiFi, piscina, churrasqueira, AC, pets, etc.)
- [ ] **PROP-03**: Admin pode definir regras da propriedade em texto livre
- [ ] **PROP-04**: Imóvel tem status: ativo / inativo / em manutenção
- [ ] **PROP-05**: Admin pode marcar imóvel como destaque (aparece primeiro na listagem pública)
- [ ] **PROP-06**: Admin pode fazer upload múltiplo de imagens via Cloudinary com assinatura gerada no servidor
- [ ] **PROP-07**: Imagens passam por validação de magic bytes no servidor antes do upload (JPEG/PNG/WebP, max 10MB)
- [ ] **PROP-08**: Admin pode reordenar imagens por drag-and-drop e definir imagem capa
- [ ] **PROP-09**: Admin pode organizar imagens por ambiente (sala, quartos, cozinha, área externa)
- [ ] **PROP-10**: Admin pode incorporar vídeo de apresentação via YouTube

### Pricing

- [ ] **PRICE-01**: Imóvel tem valor base por noite
- [ ] **PRICE-02**: Admin pode configurar períodos de temporada com valores diferenciados
- [ ] **PRICE-03**: Admin pode configurar taxa de limpeza fixa por reserva
- [ ] **PRICE-04**: Admin pode configurar descontos progressivos para estadias longas (7, 14, 28 noites)
- [ ] **PRICE-05**: Admin pode configurar número mínimo de noites por reserva
- [ ] **PRICE-06**: Todos os valores monetários são armazenados como inteiros em centavos

### Availability & Calendar

- [ ] **AVAIL-01**: Admin pode bloquear datas manualmente (manutenção, uso próprio) no calendário
- [ ] **AVAIL-02**: Sistema exporta feed iCal (.ics) de disponibilidade por imóvel (para importar no Airbnb/Booking)
- [ ] **AVAIL-03**: Admin pode configurar URLs de feeds iCal externos (Airbnb, Booking.com) para importar
- [ ] **AVAIL-04**: Sincronização de iCal externo ocorre automaticamente a cada 30 minutos
- [ ] **AVAIL-05**: Bloqueios importados de iCal exibem a origem (ex: "Airbnb", "Booking.com")
- [ ] **AVAIL-06**: Verificação de disponibilidade ocorre com lock de transação no servidor imediatamente antes de criar a Checkout Session do Stripe

### Public Face — Homepage

- [ ] **PUB-01**: Página inicial pública com hero em tela cheia (vídeo ou foto de alta qualidade)
- [ ] **PUB-02**: Seção de busca na homepage: datas + número de hóspedes
- [ ] **PUB-03**: Listagem visual dos imóveis disponíveis com cards fotográficos
- [ ] **PUB-04**: Seção narrativa sobre a experiência de se hospedar
- [ ] **PUB-05**: Depoimentos de hóspedes na homepage
- [ ] **PUB-06**: CTA flutuante no mobile

### Public Face — Property Page

- [ ] **PAGE-01**: Hero cinematográfico em tela cheia com galeria em parallax ou vídeo em loop mudo
- [ ] **PAGE-02**: Nome do imóvel com tipografia grande (Instrument Serif) sobre o hero
- [ ] **PAGE-03**: Botão flutuante "Verificar disponibilidade" surge após o primeiro scroll
- [ ] **PAGE-04**: Seção de overview: capacidade, quartos, banheiros em ícones; avaliação; localização
- [ ] **PAGE-05**: Galeria interativa com layout assimétrico estilo editorial (não grade uniforme)
- [ ] **PAGE-06**: Lightbox em tela cheia ao clicar imagem — navegação por setas, teclado, swipe mobile
- [ ] **PAGE-07**: Seção descritiva: história do imóvel em tipografia refinada com revelação em scroll
- [ ] **PAGE-08**: Comodidades em grid com ícones agrupados por categoria, expansão animada
- [ ] **PAGE-09**: Widget de cotação no desktop fixo na lateral direita durante o scroll
- [ ] **PAGE-10**: Widget de cotação: seleção de datas em calendário interativo com cotação dinâmica
- [ ] **PAGE-11**: Cotação mostra breakdown completo: diárias × valor + taxa de limpeza + total
- [ ] **PAGE-12**: Hóspede preenche: nome, e-mail, WhatsApp, número de hóspedes antes de reservar
- [ ] **PAGE-13**: Mapa interativo com localização do imóvel e pontos de interesse próximos
- [ ] **PAGE-14**: Seção de regras e informações: horários check-in/check-out, regras da casa, política de cancelamento
- [ ] **PAGE-15**: Depoimentos de hóspedes em cards com carrossel no mobile
- [ ] **PAGE-16**: Callout "reservando direto você economiza X%" em destaque no widget

### Booking Flow & Stripe

- [ ] **BOOK-01**: Ao clicar "Reservar", Server Action verifica disponibilidade com lock de transação
- [ ] **BOOK-02**: Valor da reserva é calculado exclusivamente no servidor (nunca confiando em valor enviado pelo cliente)
- [ ] **BOOK-03**: Cálculo considera: preço base por noite, temporada aplicável, descontos de estadia longa, taxa de limpeza
- [ ] **BOOK-04**: Server Action cria Product dinâmico no Stripe com nome descritivo (imóvel + período + hóspede)
- [ ] **BOOK-05**: Server Action cria Price vinculado ao produto, tipo one_time, em BRL, valor em centavos
- [ ] **BOOK-06**: Server Action cria Checkout Session com metadados da reserva (ID reserva, ID imóvel, ID hóspede)
- [ ] **BOOK-07**: Checkout Session inclui success_url e cancel_url; customer_email pré-preenchido
- [ ] **BOOK-08**: ID da Checkout Session é salvo na reserva; status atualizado para "aguardando pagamento"
- [ ] **BOOK-09**: Hóspede é redirecionado para Stripe Checkout
- [ ] **BOOK-10**: Stripe Checkout aceita cartão de crédito e Pix (via EBANX/Stripe Brazil)
- [ ] **BOOK-11**: Webhook `/api/webhooks/stripe` recebe `checkout.session.completed` e confirma a reserva
- [ ] **BOOK-12**: Webhook verifica assinatura Stripe antes de qualquer processamento; rejeita sem assinatura com 400
- [ ] **BOOK-13**: Processamento de webhook é idempotente (tabela de eventos processados)
- [ ] **BOOK-14**: Após confirmação: status da reserva → "confirmada", PaymentIntent ID salvo
- [ ] **BOOK-15**: Rate limiting: máximo 5 tentativas de criar reserva por IP por hora

### Reservation Status & Lifecycle

- [ ] **RES-01**: Status de reserva: pendente → aguardando pagamento → confirmada → em hospedagem → concluída → cancelada
- [ ] **RES-02**: Cada reserva tem timeline de auditoria com todos os eventos registrados
- [ ] **RES-03**: Admin pode confirmar reserva manualmente, cancelar, marcar check-in, marcar check-out
- [ ] **RES-04**: Admin pode visualizar reservas com filtros: status, imóvel, período, hóspede
- [ ] **RES-05**: Admin pode buscar reservas por nome, e-mail ou código de reserva
- [ ] **RES-06**: Admin pode visualizar reservas em formato de calendário mensal por imóvel

### Email & Documents

- [ ] **EMAIL-01**: Após confirmação de pagamento, hóspede recebe e-mail de confirmação com voucher PDF
- [ ] **EMAIL-02**: Após confirmação de pagamento, admin recebe notificação de nova reserva
- [ ] **EMAIL-03**: Admin pode gerar e reenviar voucher PDF de qualquer reserva a qualquer momento
- [ ] **EMAIL-04**: Rate limiting para magic link: máximo 3 por e-mail por hora
- [ ] **EMAIL-05**: Rate limiting para login: máximo 10 tentativas por IP em 15 minutos

### Guest CRM

- [ ] **CRM-01**: Cadastro de hóspede: nome, e-mail, telefone, CPF, cidade de origem, data de nascimento
- [ ] **CRM-02**: Cada hóspede tem histórico completo de reservas
- [ ] **CRM-03**: Admin pode adicionar observações internas e tags por hóspede
- [ ] **CRM-04**: Lista de hóspedes exportável em CSV
- [ ] **CRM-05**: Pipeline kanban: lead → contato feito → proposta enviada → reserva confirmada → concluído
- [ ] **CRM-06**: Cards do kanban exibem nome, imóvel de interesse, datas pretendidas, valor estimado
- [ ] **CRM-07**: Cards são arrastáveis entre colunas do kanban
- [ ] **CRM-08**: Ação de converter card em reserva disponível com um clique

### Financial

- [ ] **FIN-01**: Fluxo de caixa registra automaticamente entradas de reservas confirmadas (via webhook)
- [ ] **FIN-02**: Admin pode lançar saídas manualmente com categorias (manutenção, limpeza, comissão, outros)
- [ ] **FIN-03**: Saldo calculado e projetado mensalmente com filtros por período e imóvel
- [ ] **FIN-04**: Relatório de receita por imóvel: mensal, trimestral, anual
- [ ] **FIN-05**: Relatório de taxa de ocupação, ticket médio, comparativo entre períodos
- [ ] **FIN-06**: Relatórios exportáveis em PDF e CSV
- [ ] **FIN-07**: Gerador de propostas comerciais com logo, dados do imóvel, período, valor, validade
- [ ] **FIN-08**: Proposta pode ser enviada por e-mail diretamente pelo admin
- [ ] **FIN-09**: Histórico de propostas por hóspede com status (enviada / aceita / recusada)
- [ ] **FIN-10**: Rate limiting para envio de propostas: máximo 20 por usuário autenticado por hora

### Instance Settings

- [ ] **SET-01**: Admin pode configurar identidade visual: nome do negócio, logo, favicon, cor de acento primária
- [ ] **SET-02**: Admin pode configurar informações de contato público: WhatsApp, Instagram
- [ ] **SET-03**: Admin pode definir política de cancelamento via editor rich text
- [ ] **SET-04**: Admin pode configurar integração com Stripe (chaves da conta do anfitrião)
- [ ] **SET-05**: Admin pode configurar e-mail via Resend (chave de API, e-mail remetente)

### Security & Compliance

- [ ] **SEC-01**: Toda Server Action valida input com Zod antes de qualquer processamento
- [ ] **SEC-02**: Rich text (descrições de imóveis) é sanitizado com DOMPurify antes de salvar no banco
- [ ] **SEC-03**: DOMPurify usa allowlist restrita: apenas tags estruturais básicas; proíbe todos os atributos de evento
- [ ] **SEC-04**: Toda Server Action do admin verifica sessão e permissão antes de qualquer lógica
- [ ] **SEC-05**: Queries sempre incluem condição de ID do usuário autenticado (tenant isolation)
- [ ] **SEC-06**: Headers de segurança aplicados em todas as respostas (CSP, X-Frame-Options, HSTS, etc.)
- [ ] **SEC-07**: CSP restringe scripts a própria origem + Stripe; imagens a própria origem + Cloudinary; frames a Stripe
- [ ] **SEC-08**: Upload de imagem valida magic bytes reais do arquivo no servidor antes do envio ao Cloudinary
- [ ] **SEC-09**: Uploads no Cloudinary são assinados com signature gerada no servidor; API secret nunca exposta ao cliente
- [ ] **SEC-10**: Audit log registra: login/tentativas, criação/cancelamento de reservas, CRUD de imóveis, mudanças de preço, exclusões, permissões de staff
- [ ] **SEC-11**: Audit log inclui: ID usuário, tipo ação, recurso afetado, metadados, IP, user agent

### Deployment & Ops

- [x] **OPS-01**: Projeto configurado com `output: 'standalone'` no next.config.ts para deploy em container *(completed: 01-01)*
- [x] **OPS-02**: Migrations do Drizzle são executadas automaticamente no startup antes de iniciar o servidor
- [x] **OPS-03**: `NEXT_PUBLIC_*` variáveis de ambiente documentadas para configuração no EasyPanel antes do primeiro build *(completed: 01-01)*
- [x] **OPS-04**: Prisma Studio disponível para inspeção visual do banco via túnel SSH (nunca exposto publicamente) *(completed: 01-01)*
- [x] **OPS-05**: Prisma é dependência de desenvolvimento apenas (`devDependencies`); não afeta build de produção *(completed: 01-01)*

---

## v2 Requirements

### Enhancements

- **PIX-02**: Parcelamento de cartão (installments) via Stripe Brazil
- **SYNC-02**: Webhook bidirecional com Airbnb (via API oficial — requer aprovação do parceiro)
- **REVIEW-01**: Sistema de avaliações de hóspedes com moderação pelo admin
- **CHAT-01**: Mensageria interna entre admin e hóspede
- **MULTI-01**: Suporte a múltiplos usuários admin com SSO (para grupos hoteleiros maiores)
- **ANALYTICS-01**: Integração com Google Analytics / Plausible para a face pública
- **WHATSAPP-01**: Notificações automáticas via WhatsApp API (Twilio ou Z-API)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Marketplace multi-anfitrião | Cada instância é isolada — não é SaaS/marketplace; arquitetura de single-tenant |
| App mobile nativo (iOS/Android) | Web-first e responsivo resolve v1; mobile nativo é custo/tempo desproporcional |
| Chat em tempo real com hóspedes | WhatsApp externo + botão de contato resolve v1 sem complexidade de websockets |
| Boleto bancário | Baixa conversão, alto custo operacional, Pix é superior em todos os aspectos |
| Sistema de avaliações com moderação | Moderação adiciona complexidade significativa; depoimentos inseridos manualmente pelo admin em v1 |
| Múltiplas moedas | Apenas BRL para v1; conversão de moeda é risco operacional sem demanda clara |
| Precificação dinâmica automática (revenue management) | Alta complexidade algorítmica; fora do alcance de v1 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01..08 | Phase 1 | Pending |
| ADMIN-01..05 | Phase 1 | Pending |
| DASH-01..05 | Phase 1 | Pending |
| OPS-01..05 | Phase 1 | Pending |
| SEC-01..11 | Phase 1 (foundation) + Phase 5 | Pending |
| PROP-01..10 | Phase 2 | Pending |
| PRICE-01..06 | Phase 2 | Pending |
| PUB-01..06 | Phase 2 | Pending |
| PAGE-01..16 | Phase 2 | Pending |
| AVAIL-01..06 | Phase 3 | Pending |
| BOOK-01..15 | Phase 3 | Pending |
| RES-01..06 | Phase 3 | Pending |
| EMAIL-01..05 | Phase 3 | Pending |
| CRM-01..08 | Phase 4 | Pending |
| FIN-01..10 | Phase 4 | Pending |
| SET-01..05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 92 total
- Mapped to phases: 92
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-04 after initial definition*
