# 🚧 Bloqueios no Backend — Pendências para o time de Backend

> Documentação dos endpoints/funcionalidades que o frontend precisa mas o backend ainda não possui.
> Criado em: Junho 2026

---

## 1. 🔴 `isActive` no update de worker

**Endpoint:** `PUT /api/admin/workers/:publicId`

**Problema:** O schema `updateWorkerSchema` no backend **não possui** o campo `isActive`, então o frontend não consegue ativar/desativar workers.

**Arquivo backend:** `src/modules/admin/admin.shemas.ts` — `updateWorkerSchema`

**Mudança necessária:**
```typescript
// Adicionar no updateWorkerSchema:
isActive: z.boolean().optional(),
```

**Arquivo frontend afetado:** `app/admin/src/services/employeeService.ts` — função `toggleEmployeeStatus` lança erro:
```
"toggleEmployeeStatus is not available via API — mock only"
```

**Uso no frontend:** Botão de block/unblock nos cards de funcionário (páginas Staff e Dashboard).

---

## 2. 🔴 Inventory / Inventário — API inexistente

**Problema:** O frontend tem uma página de inventário completa (códigos, unidades kg/L/un, status Low Stock/Out of Stock), mas **não existe nenhum endpoint** no backend.

**Arquivos frontend afetados:**
- `app/admin/src/services/inventoryService.ts` — 100% mock
- `app/admin/src/hooks/useInventoryItems.ts` — 100% mock
- `app/admin/src/pages/content/Inventory.tsx` — usa dados mock
- `app/admin/src/components/WidgetInventoryAlerts.tsx` — widget no Dashboard

**Solução possível A — Criar tabela `inventory` no banco:**
```typescript
// Endpoints necessários:
GET    /api/admin/inventory          // Listar todos os itens
POST   /api/admin/inventory          // Criar item
PUT    /api/admin/inventory/:id      // Atualizar item
DELETE /api/admin/inventory/:id      // Remover item
```

**Solução possível B — Adaptar o frontend para usar stock dos produtos:**
O backend já tem `GET/PATCH /api/admin/products/:publicId/stock`. O frontend de inventário poderia ser adaptado para usar esses dados em vez de entidades separadas de inventário.

---

## 3. 🟡 Customers / Clientes — API inexistente

**Problema:** A página Staff exibe uma seção "Customers" com lista de clientes registrados, mas **não existe endpoint** para admin listar/gerenciar clientes.

**Arquivos frontend afetados:**
- `app/admin/src/services/customerService.ts` — 100% mock
- `app/admin/src/hooks/useCustomers.ts` — 100% mock
- `app/admin/src/pages/content/Staff.tsx` — seção Customers
- `app/admin/src/pages/Perfil.tsx` — exibe customers

**Endpoint necessário:**
```typescript
GET    /api/admin/users              // Listar todos os clientes (com paginação?)
```

**Schema de resposta esperado (similar ao UserResponseSchema):**
```typescript
{ data: Array<{ publicId, name, email, profile: { fullName, phone, avatarImage, createdAt, updatedAt }, createdAt, updatedAt }> }
```

---

## 4. 🟡 Analytics / Dashboard — API inexistente

**Problema:** O Dashboard e a página Analytics exibem cards e gráficos, mas **não existe endpoint** de dashboard/analytics.

**Arquivos frontend afetados:**
- `app/admin/src/services/analyticsService.ts` — 100% mock
- `app/admin/src/pages/content/Dashboard.tsx` — usa analytics
- `app/admin/src/pages/content/Analytics.tsx` — página dedicada

**Endpoint necessário:**
```typescript
GET /api/admin/dashboard
```

**Schema de resposta esperado:**
```typescript
{
  cards: [
    { id: "orders", title: "Total Order", value: number, delta?: string, trend?: "up"|"down" },
    { id: "sales", title: "Total Sales", value: string, delta?: string, trend?: "up"|"down" },
    { id: "deliveries", title: "Pending Deliveries", value: number },
    { id: "users", title: "Total Customers", value: number, delta?: string, trend?: "up"|"down" },
    { id: "hours", title: "Total bank of hours", value: string },
    { id: "stock", title: "Total Low/Out Stock", value: number },
  ],
  chart: {
    title: string,
    data: number[],       // 12 meses
    labels: string[],     // ["Jan", "Feb", ...]
    seriesLabel: string,
  }
}
```

---

## 5. 🟢 Upload de imagem — fluxo parcial

**Problema:** O endpoint `POST /api/admin/products/:publicId/image` existe e funciona, mas o `MenuItemFormPanel` no frontend coleta a imagem e nunca envia para esse endpoint.

**Status:** O `menuService.ts` já tem a função `uploadProductImage(publicId, file)` implementada. O `MenuContext` já chama o upload após criar/editar um produto. **Pendência: verificar se o backend está aceitando o campo `avatar` no multipart/form-data** (conforme definido no swagger).

---

## 📋 Prioridades sugeridas

| Prioridade | Item | Esforço estimado |
|---|---|---|
| 🔴 Crítico | `isActive` no worker update | 1 hora |
| 🔴 Crítico | Inventory API (criar tabela + endpoints) | 4-8 horas |
| 🟡 Médio | Customers listing endpoint | 2-4 horas |
| 🟡 Médio | Analytics/Dashboard endpoint | 4-6 horas |
| 🟢 Baixo | Validar upload de imagem | 1 hora |
