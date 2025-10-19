# 8. Testing Reality

## Current Test Coverage

### Unit Tests
- **Status:** ❌ Inexistentes
- **Cobertura:** 0%
- **Ferramentas:** Não configuradas

### Integration Tests
- **Status:** ❌ Inexistentes
- **Cobertura:** 0%
- **Ferramentas:** Não configuradas

### E2E Tests (End-to-End)
- **Status:** ❌ Inexistentes
- **Cobertura:** 0%
- **Ferramentas:** Não configuradas

### Manual Testing
- **Status:** ✅ Método primário atual
- **Processo:** Feedback direto do testador ao Dev/PM
- **Ferramentas:** Páginas de debug em `dev/` (ver estrutura)

---

## Manual Testing Infrastructure

### Debug Pages

Páginas HTML criadas para auxiliar testes manuais:

| Página | Propósito |
|--------|----------|
| `dev/test-supabase.html` | Testar conexão e operações Supabase |
| `dev/debug-auth.html` | Debug de fluxo de autenticação |
| `dev/test-auth.html` | Testar mecanismos de auth |
| `dev/debug-session.html` | Verificar sessão do usuário |
| `dev/test-auth-session.html` | Testes de session persistence |
| `dev/test-profile-save.html` | Testar salvamento de perfil |
| `dev/check-supabase-config.html` | Verificar configuração Supabase |

### Processo Manual Atual

1. **Setup:** Abrir página de debug local
2. **Teste:** Executar ações manualmente (click, input, etc)
3. **Validação:** Verificar resultado no console/página
4. **Feedback:** Comunicar resultado ao Dev/PM
5. **Iteração:** Repetir para diferentes cenários

### Pontos de Falha Comuns

- **Falha de Network:** Sem conexão com Supabase
- **Auth Expirada:** Token JWT expirou
- **Phantom não conectado:** Wallet não disponível
- **Estado inconsistente:** Cache desatualizado

---

## Recommended Testing Strategy Going Forward

### Phase 1: Unit Tests (História 1.7 do PRD)

**Framework:** Vitest (recomendado para Vite)

**Cobertura recomendada:**
- `src/services/authService.js` - 80%+
- `src/services/profileService.js` - 80%+
- `src/services/walletService.js` - 70%+ (com mocks de blockchain)
- `src/utils/*` - 90%+

**Exemplo:**

```javascript
// __tests__/authService.test.js
import { describe, it, expect, vi } from 'vitest';
import { loginUser } from '../src/services/authService.js';

describe('authService', () => {
  it('should login user with valid credentials', async () => {
    const result = await loginUser('user@example.com', 'password');
    expect(result.user).toBeDefined();
  });

  it('should throw error with invalid credentials', async () => {
    expect(() => loginUser('user@example.com', 'wrong')).toThrow();
  });
});
```

### Phase 2: Integration Tests (Pós-refatoração)

**Framework:** Playwright ou Cypress

**Cobertura:**
- Login flow (email + OAuth)
- Profile management
- Dashboard data loading
- Wallet connection

**Exemplo:**

```javascript
// e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test('user can login and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'user@test.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Phase 3: E2E Tests (Completo)

**Framework:** Playwright + fixtures de dados

**Cobertura completa:**
- Fluxo do usuário desde login até gameplay
- Integração com Solana
- Save/load de game state

---

## Testing Best Practices for This Project

### 1. Mock External Dependencies

```javascript
// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ data: [] }) }) }),
    auth: { signIn: vi.fn() }
  })
}));

// Mock Solana
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(),
  PublicKey: vi.fn()
}));
```

### 2. Teste Isolamento

Cada teste deve:
- Ser independente
- Não compartilhar estado
- Limpar após execução

### 3. Fixtures de Dados

Criar dados padrão para testes:

```javascript
// __fixtures__/user.json
{
  "id": "test-user-123",
  "email": "test@example.com",
  "profile": { "username": "testuser" }
}
```

### 4. Testes de Regressão

Antes de merge em main:
- Todos os testes unitários passam
- Testes de integração em preview passam
- Testes manuais completos executados

---

## Testing Checklist (Manual)

### Login Flow

- [ ] Login com email/senha funciona
- [ ] Login com OAuth (Google) funciona
- [ ] Erro com credenciais erradas
- [ ] Redirect para dashboard após login
- [ ] Token refresh automático
- [ ] Logout funciona
- [ ] Session persiste após reload

### Dashboard

- [ ] Dados do usuário carregam
- [ ] Naves NFT aparecem (se conectado wallet)
- [ ] Leaderboard funciona
- [ ] Stats e progress bars carregam

### Profile

- [ ] Dados do perfil exibem corretamente
- [ ] Edição de campos funciona
- [ ] Upload de avatar funciona
- [ ] Salvamento de perfil funciona
- [ ] Mensagens de erro tratadas

### Wallet Integration

- [ ] Phantom detectado
- [ ] Conexão com wallet funciona
- [ ] NFTs listados corretamente
- [ ] Desconectar do wallet funciona
- [ ] Erro se Phantom não instalado

### Game

- [ ] Jogo carrega
- [ ] Entrada do usuário funciona (mouse, teclado)
- [ ] Colisões funcionam
- [ ] UI do jogo exibe corretamente
- [ ] Save de progresso funciona
- [ ] Audio/sounds funcionam (se ativado)

### Performance

- [ ] Tempo de carregamento aceitável (<3s)
- [ ] Sem lag durante gameplay
- [ ] Sem vazamento de memória (dev tools)
- [ ] Responsive em mobile

### Error Cases

- [ ] Sem conexão com internet - erro amigável
- [ ] Supabase offline - retry automático
- [ ] Solana RPC offline - fallback ou erro
- [ ] Token expirado - refresh ou re-login

---

## Tools for Testing

### Unit Testing
- **Vitest:** Framework lightweight para Vite
- **npm:** `npm install -D vitest`

### E2E Testing
- **Playwright:** Cross-browser E2E
- **Cypress:** Developer-friendly E2E
- **npm:** `npm install -D @playwright/test`

### Performance Testing
- **Lighthouse:** Google Chrome built-in
- **WebPageTest:** Online tool

### Manual Testing Tools
- **Browser DevTools:** Console, Network, Performance tabs
- **Postman:** Testar APIs (se houver)
- **Charles/Fiddler:** Proxy para debug de network
