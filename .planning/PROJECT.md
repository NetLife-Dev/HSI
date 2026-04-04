# HSI — HostSemImposto

## What This Is

HSI é um sistema de booking proprietário instalado individualmente na VPS de cada cliente via EasyPanel com Nixpacks. Não é um SaaS. Cada anfitrião recebe sua própria instância com URL personalizado, identidade visual exclusiva e banco de dados isolado — um canal de venda direta com experiência de marca completamente própria, eliminando dependência de OTAs (Airbnb, Booking.com) e reduzindo exposição tributária criada pela reforma tributária brasileira de 2024.

O sistema tem duas faces: (1) a face pública — cinematográfica, imersiva, nível hotel boutique de luxo para o hóspede; (2) o painel admin — limpo, funcional e eficiente para o anfitrião gerenciar tudo.

## Core Value

O hóspede deve ter uma experiência imersiva de descoberta e reserva tão boa quanto Airbnb, mas com a identidade de marca completamente própria do anfitrião — sem nenhuma referência a OTAs.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Sistema de autenticação com e-mail/senha e magic link (NextAuth v5)
- [ ] Painel admin com sidebar colapsável, dark mode, notificações in-app
- [ ] Dashboard com KPIs em tempo real (reservas, faturamento, ocupação, check-ins)
- [ ] Gestão completa de imóveis (CRUD, galeria Cloudinary, precificação, disponibilidade)
- [ ] Calendário de disponibilidade com bloqueio manual e sync via iCal
- [ ] Página pública imersiva de cada imóvel (hero cinematográfico, galeria editorial, widget cotação)
- [ ] Página inicial pública com hero, busca por datas, listagem de imóveis
- [ ] Fluxo de booking online com cotação dinâmica e checkout via Stripe
- [ ] Stripe: criação dinâmica de produto+preço por reserva, webhooks para confirmação
- [ ] E-mails transacionais via Resend + React Email (confirmação, voucher PDF, notificações)
- [ ] CRM de hóspedes com histórico, tags, pipeline kanban
- [ ] Módulo financeiro com fluxo de caixa, relatórios e gerador de propostas
- [ ] Sistema de usuários com tipos owner/staff e permissões granulares
- [ ] Audit log de todas as ações sensíveis
- [ ] Rate limiting em endpoints públicos e sensíveis
- [ ] Configurações de instância (identidade visual, Stripe, Resend, política de cancelamento)
- [ ] Sincronização iCal bidirecional com outras plataformas (exporta e importa)
- [ ] Prisma Studio como interface visual do banco (dev/ops tool)

### Out of Scope

- Marketplace multi-anfitrião — não é um SaaS/marketplace, cada instância é isolada por cliente
- App mobile nativo — web-first, responsivo
- Chat em tempo real com hóspedes — WhatsApp externo é suficiente para v1
- Sistema de avaliações com moderação — depoimentos são inseridos manualmente pelo admin em v1
- Múltiplas moedas — apenas BRL para v1

## Context

**Problema de negócio:** A reforma tributária brasileira de 2024 enquadra anfitriões com 3+ imóveis e faturamento acima de R$240k/ano na categoria de prestadores de serviços hoteleiros. Anfitriões precisam de um canal de venda direto para reduzir dependência de OTAs e ter mais controle sobre sua operação fiscal.

**Modelo de entrega:** Cada cliente recebe uma instância isolada no seu próprio EasyPanel. O HSI é um produto de software vendido como instalação, não como assinatura SaaS. As variáveis de ambiente de cada cliente (Stripe keys, Resend, Cloudinary, etc.) são configuradas individualmente no EasyPanel.

**Referências de produto para a face pública:** Apple.com, Airbnb (funcionalidade), hotéis boutique de luxo, sites premiados Awwwards.

**Referências de produto para o admin:** Linear.app, Vercel.com, Craft.do.

**Tipografia:** Geist (interface) + Instrument Serif (display/headings imóveis). Paleta quase monocromática com um único acento (#0071e3 — azul Apple). Dark mode como padrão no admin.

## Constraints

- **Tech Stack**: Next.js 15 (App Router, Server Components, Server Actions), TypeScript strict, PostgreSQL, Drizzle ORM, NextAuth v5, Tailwind v4, Shadcn/ui (primitivos apenas), Framer Motion, Stripe, Resend, Cloudinary, Zod, DOMPurify — sem exceções
- **Deploy**: EasyPanel + Nixpacks — sem Dockerfile, sem configuração manual de servidor
- **Banco**: Drizzle ORM exclusivamente para todas as queries em runtime; Prisma apenas para Prisma Studio (ferramenta visual, dev/ops)
- **Segurança**: Validação Zod em toda Server Action, DOMPurify no rich text antes de salvar, magic bytes validation em uploads, CSP headers, rate limiting, webhook Stripe verificado por assinatura
- **Pagamentos**: Criação dinâmica de produto+preço no Stripe por reserva (nunca produtos pré-cadastrados); valor calculado exclusivamente no servidor
- **Performance**: Animações apenas com transform/opacity (Framer Motion spring physics); imagens via Cloudinary com transformações responsivas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drizzle para runtime + Prisma Studio para inspeção visual | Drizzle é type-safe e performante; Prisma Studio resolve a necessidade operacional de inspecionar/editar dados sem SQL manual | — Pending |
| Stripe dinâmico por reserva (sem produtos fixos) | Cada reserva tem valor único calculado no servidor; não faz sentido ter SKUs pré-cadastrados | — Pending |
| NextAuth v5 com adapter Drizzle | Integra nativamente com o banco existente; suporte a magic link e email/senha sem dependência externa | — Pending |
| EasyPanel + Nixpacks sem Dockerfile | Zero configuração de infra para o cliente; Nixpacks detecta Next.js automaticamente; EasyPanel gerencia SSL e proxy | — Pending |
| Instância isolada por cliente (não SaaS multi-tenant) | Banco de dados isolado garante separação total de dados; mais simples do que multi-tenancy; alinhado com posicionamento do produto | — Pending |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**Após cada transição de fase** (via `/gsd:transition`):
1. Requirements invalidados? → Mover para Out of Scope com motivo
2. Requirements validados? → Mover para Validated com referência da fase
3. Novos requirements emergiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se derivou

**Após cada milestone** (via `/gsd:complete-milestone`):
1. Revisão completa de todas as seções
2. Core Value check — ainda a prioridade certa?
3. Auditoria de Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual

---
*Last updated: 2026-04-04 after initialization*
