---
status: testing
phase: 01-foundation-infraestrutura
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
  - 01-05-SUMMARY.md
started: 2026-04-05T21:30:00Z
updated: 2026-04-05T21:30:00Z
---

## Current Test

number: 3
name: Admin Shell — Dark Mode & Sidebar
expected: |
  Após login no dashboard, o painel deve estar em dark mode por padrão.
  Sidebar visível à esquerda no desktop. Clique no ícone de colapso — ela deve encolher
  de ~240px para ~64px mostrando apenas ícones. Recarregue a página: sidebar deve lembrar
  o estado colapsado (persiste via localStorage).
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill qualquer servidor rodando. Inicie a aplicação do zero com `npm run dev`. O servidor inicia sem erros no terminal, as migrations rodam automaticamente (deve aparecer "Migrations completed" ou similar nos logs), e acessar http://localhost:3000 retorna uma resposta (mesmo que seja página vazia).
result: pass
notes: Servidor iniciou em /tmp/hsi (Linux filesystem — necessário por WSL2/OneDrive Bus error). Migrations aplicadas com sucesso. HTTP 200 em localhost:3000.

### 2. Credentials Login → Admin Dashboard
expected: Acesse /login, insira e-mail e senha de um admin cadastrado, clique em entrar. Deve redirecionar para /admin/dashboard com o shell do painel visível — sidebar à esquerda, header no topo, e 4 cards KPI em estado de skeleton (loading).
result: issue
reported: "Redirecionou para /admin/dashboard e o painel apareceu, mas com 3 erros de console: (1) asChild prop não reconhecido em TooltipTrigger/Sidebar.tsx; (2) button aninhado dentro de button em Header.tsx DropdownMenuTrigger wrapping Button; (3) hydration error por button>button"
severity: minor

### 3. Admin Shell — Dark Mode & Sidebar
expected: Após o login no dashboard, o painel deve estar em dark mode por padrão. A sidebar deve estar visível à esquerda em desktop. Clique no ícone de colapso da sidebar — ela deve encolher de ~240px para ~64px mostrando apenas ícones. Recarregue a página: a sidebar deve lembrar o estado colapsado (estado persiste via localStorage).
result: [pending]

### 4. Theme Toggle
expected: No header do admin, há um botão de alternar tema (ícone Sol ou Lua). Clique nele — o painel deve mudar de dark para light mode. Clique novamente — deve voltar para dark. A troca deve ser instantânea sem flash.
result: [pending]

### 5. Mobile Bottom Navigation
expected: Acesse /admin/dashboard em tela mobile (ou use DevTools para simular mobile). A sidebar lateral deve desaparecer e aparecer uma barra de navegação fixa na parte inferior da tela com 5 ícones de navegação.
result: [pending]

### 6. Route Protection — Redirect sem Sessão
expected: Faça logout (ou abra uma aba anônima). Tente acessar diretamente http://localhost:3000/admin/dashboard. Deve redirecionar imediatamente para /login — nunca mostrar o painel sem autenticação.
result: [pending]

### 7. Magic Link Login
expected: Na página /login, use o formulário de magic link (não o de senha). Insira um e-mail admin válido e clique em "Enviar link". Acesse o e-mail recebido, clique no link. Deve abrir o browser e criar uma sessão, redirecionando para /admin/dashboard. Feche e reabra o browser, acesse /admin/dashboard — a sessão deve persistir sem pedir login novamente.
result: [pending]

### 8. Rate Limiting no Login
expected: Na página /login, tente fazer login com senha errada 10 vezes seguidas com o mesmo IP. Na 11ª tentativa, deve receber uma mensagem de erro indicando que excedeu o limite de tentativas — mesmo que a senha estivesse correta, o acesso seria bloqueado por 15 minutos.
result: [pending]

### 9. Security Headers na Resposta
expected: Abra o DevTools (Network), acesse qualquer página da aplicação e inspecione os headers de resposta. Deve incluir: `Content-Security-Policy` (com 'self' e domínios do Stripe/Cloudinary), `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`.
result: [pending]

### 10. Stripe Webhook Não Bloqueado pelo Middleware
expected: Execute `curl -X POST http://localhost:3000/api/webhooks/stripe -d '{}'` (ou use Postman/Insomnia). A resposta deve ser qualquer código HTTP exceto 302 redirect. O middleware de auth não deve interceptar rotas /api/webhooks/*.
result: [pending]

### 11. Audit Log — Login com IP e UserAgent
expected: Após fazer login com credenciais, acesse o banco de dados (Drizzle Studio ou psql) e consulte a tabela `audit_log`. Deve haver um registro de login com: action = 'LOGIN_SUCCESS', ipAddress preenchido (não nulo), userAgent preenchido (não nulo), e createdAt com o timestamp do login.
result: [pending]

## Summary

total: 11
passed: 1
issues: 1
skipped: 0
blocked: 0
pending: 9

## Gaps

- truth: "Dashboard abre sem erros de console — sidebar e header renderizam corretamente"
  status: failed
  reason: "User reported: 3 erros de console — (1) asChild prop passado para DOM em TooltipTrigger/Sidebar.tsx; (2) button>button aninhado em Header.tsx DropdownMenuTrigger wrapping Button component; (3) hydration error consequente"
  severity: minor
  test: 2
  artifacts:
    - src/components/ui/tooltip.tsx:25 — TooltipPrimitive.Trigger recebe asChild mas Base UI não suporta
    - src/components/ui/dropdown-menu.tsx:18 — DropdownMenuTrigger wraps Button (button>button)
    - src/components/admin/Header.tsx:52-53 — DropdownMenuTrigger>Button causa nesting inválido
    - src/components/admin/Sidebar.tsx:73 — TooltipTrigger com asChild em Base UI
  missing:
    - Corrigir TooltipTrigger para não passar asChild ao DOM
    - Corrigir Header.tsx: remover Button dentro de DropdownMenuTrigger (usar div/span ou asChild corretamente)
