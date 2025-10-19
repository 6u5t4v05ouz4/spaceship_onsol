# 9. Technical Debt and Known Issues

## Critical Technical Debt

### 1. ❌ Ausência de Testes Automatizados

**Severidade:** 🔴 **CRÍTICA**

**Descrição:**
O projeto depende exclusivamente de testes manuais, aumentando significativamente o risco de regressões ao fazer mudanças no código.

**Impacto:**
- Impossível validar rapidamente se mudanças quebram funcionalidades existentes
- Maior tempo para debugging e correções
- Risco de bugs em produção

**Identificado por:** PO (confirmado na documentação)

**Plano de Mitigação:** História 1.7 do PRD - Introdução de Testes Unitários

---

### 2. ⚠️ Estrutura Organizacional Deficiente

**Severidade:** 🔴 **CRÍTICA**

**Descrição:**
- Múltiplos arquivos HTML na raiz (`index.html`, `game.html`, `dashboard.html`, etc.)
- Mistura de responsabilidades (site + jogo no mesmo repositório)
- Falta de separação clara entre camadas (UI, lógica de negócio, dados)

**Impacto:**
- Difícil de navegar e manter o código
- Aumenta tempo de onboarding para novos devs
- Dificulta a adição de novas funcionalidades
- Potencial para conflitos de nomenclatura e espaço de nomes

**Plano de Mitigação:** Épico 1 do PRD (refatoração estrutural)

---

### 3. 🔐 Segurança RLS Complexa

**Severidade:** 🟠 **ALTA**

**Descrição:**
Múltiplos arquivos de fix RLS indicam complexidade iterativa nas políticas de Row Level Security:
- `database-rls-policies.sql`
- `apply-rls-fix.sql`
- `fix-user-profiles-rls.sql`

**Impacto:**
- Difícil de entender as políticas RLS atuais
- Risco de vulnerabilidades de segurança
- Difícil manter a segurança durante refatorações

**Recomendações:**
- Documentar todas as políticas RLS
- Revisão de segurança antes de fazer mudanças no DB
- Testes de segurança (verificar que usuários não acessam dados de outros)

---

## Known Issues

### Issue 1: Bug de Redirect OAuth em Desenvolvimento

**Status:** 🟡 **PENDENTE CORREÇÃO**

**Descrição:**
Login via OAuth em ambiente de desenvolvimento (`localhost:3000`) redirecionava para a URL de produção da Vercel em vez de permanecer no localhost.

**Root Cause:**
Lógica de redirect em `vite.config.js` ou `dev-server.cjs` não considerava o ambiente dev corretamente.

**Localização:** 
- Histórico: PRD - História 1.3 (bugfix identificado)
- Arquivo afetado: `vite.config.js`, `dev-server.cjs`

**Workaround Atual:** (TBD - investigar como está sendo contornado)

**Será Corrigido:** História 1.3 do PRD

---

### Issue 2: Múltiplos Pontos de Entrada HTML

**Status:** 🟡 **PENDENTE REFATORAÇÃO**

**Descrição:**
Arquivo backup/antigos sugerem tentativas de unificação que não foram completadas:
- `index-unified.html` (attempt at unification)
- `index-backup.html` (backup)
- `index-duplicated.html` (?)
- `soon-duplicated.html` (?)

**Impacto:**
- Confusão sobre qual HTML é a verdadeira entrada
- Múltiplas versões podem ficar desincronizadas
- Dificuldade em manutenção

**Será Corrigido:** História 1.1 do PRD (criar roteamento único)

---

### Issue 3: Código Legado/Desuso

**Status:** 🔴 **IDENTIFICADO**

**Descrição:**
Presença de código potencialmente desuso:
- `src/config-legacy.js` (sugerido por "legacy" no nome)
- `js/` pasta (parece vazia)
- Múltiplos arquivos `.html` de backup em `backup/`

**Impacto:**
- Confusão sobre qual código está ativo
- Risco de manutenção de código morto
- Aumenta tamanho do repositório desnecessariamente

**Recomendação:**
- Audit de código ativo vs inativo
- Remover código definitivamente ou arquivar em branches antigos

---

## Workarounds and Gotchas

### Workaround 1: Configuração de Redirect OAuth

**Situação:**
`vite.config.js` contém lógica customizada complexa para gerenciar redirects OAuth em desenvolvimento local.

**Código Relevante:**
```javascript
// vite.config.js
server: {
  proxy: {
    '/auth': { target: 'http://localhost:5000' }
  }
}
```

**Nota:** Lógica adicional em `dev-server.cjs`

**Gotcha:** 
- Mudar essa configuração pode quebrar OAuth em dev
- Requer testes cuidadosos em ambiente de dev

---

### Workaround 2: RLS Policies Críticas

**Situação:**
Segurança depende fortemente das políticas RLS do Supabase.

**Gotcha:**
- Alterações no schema do DB **DEVEM** considerar o impacto nas RLS
- Teste inadequado pode resultar em brechas de segurança
- Um usuário pode acessar dados de outro se RLS mal configurada

**Checklist antes de mudanças de DB:**
- [ ] Revisar políticas RLS afetadas
- [ ] Testar que usuário A não acessa dados de usuário B
- [ ] Testar que operações não autorizadas são bloqueadas
- [ ] Documentar qualquer mudança nas RLS

---

### Workaround 3: Assets e Configuração em Múltiplas Pastas

**Situação:**
Assets estão em múltiplas localizações:
- `public/assets/` (principal)
- `src/assets/` (possível, para CSS/modules)
- `fonts/` (root level)
- `static/` (em dist/ após build)

**Gotcha:**
- Diferentes assets podem estar em diferentes localizações
- Build pode não incluir todos os assets esperados
- Vite configuration precisa mapear corretamente

---

## Technical Debt Prioritization

### Must Fix (Bloqueadores)

1. **Teste de Ausência** - Introduzir testes unitários (Fase 1)
2. **Estrutura HTML Múltipla** - Consolidar em SPA com roteador (Fase 1)
3. **Bug OAuth Redirect** - Corrigir para dev funcionar corretamente (Fase 1)

### Should Fix (Próximos)

4. **RLS Documentação** - Documentar políticas de segurança
5. **Código Legado** - Limpar arquivos desuso
6. **Performance** - Análise Lighthouse e otimizações

### Nice to Have (Futuro)

7. **TypeScript Migration** - Adicionar type safety
8. **Error Tracking** - Sentry ou similar
9. **Feature Flags** - Para deploy mais seguro

---

## Monitoring Technical Debt

### Metrics

- **Test Coverage:** Começar em 0%, meta 80%+ para histórias críticas
- **Lines of Code:** Reduzir duplication via refatoração
- **Build Size:** Monitorar bundle size
- **Performance:** Manter Lighthouse score acima de 90

### Review Cadence

- **Semanal:** Revisar novos issues encontrados
- **Mensal:** Revisitar backlog de technical debt
- **Trimestral:** Planejar refatoração de larga escala

---

## Resources for Addressing Debt

### Documentation
- `docs/architecture/` - Esta documentação
- `docs/prd/` - Plano detalhado da refatoração

### Tools
- **Linting:** ESLint configurado em `eslint.config.mjs`
- **Type Checking:** Considerar TypeScript gradualmente
- **Testing:** Vitest (História 1.7)
- **Code Coverage:** nyc ou c8 (com Vitest)

### External References
- Supabase RLS Best Practices: https://supabase.com/docs/guides/auth/row-level-security
- Phaser Best Practices: https://phaser.io/tutorials
- Vite Performance: https://vitejs.dev/guide/performance.html
