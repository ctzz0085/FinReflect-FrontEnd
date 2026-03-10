# ToggleTabs & Balance Fetching Architecture

## Web App Pattern (expense-ui/ToggleTabs.jsx)
- `activeTab` + `refreshKey` managed in ToggleTabs (central controller)
- `triggerRefresh()` increments refreshKey → all child components with refreshKey prop re-fetch
- Tab switch: `setActiveTab("income/expense")` + `triggerRefresh()`
- Add transaction: `onRefresh()` → `triggerRefresh()`

---

## Mobile App Equivalent (TabContext.js)

| Web (ToggleTabs.jsx) | Mobile (TabContext.js) |
|---|---|
| `const [activeTab, setActiveTab] = useState("")` | `const { activeTab } = useTab()` |
| `setActiveTab("income"); triggerRefresh()` | `switchTab('income')` |
| `const [refreshKey, setRefreshKey] = useState(0)` | `const { refreshKey } = useTab()` |
| `triggerRefresh()` | `triggerRefresh()` |

**Provider chain in `app/_layout.tsx`:**
```
<AuthProvider>
  <TabProvider>       ← globally accessible
    <AppNavigator />
  </TabProvider>
</AuthProvider>
```

---

## Balance Fetching Flow

### 1. Initial Load
```
Component mounts → fetchBalance() → GET /expense/getBalance
```

### 2. Tab Switch
```
switchTab('income') → setActiveTab + triggerRefresh()
→ refreshKey++ → useEffect([activeTab]) runs
→ reset form (selectedCategory, amount, categories)
→ loadCategories() for correct tab
→ fetchBalance()
```

### 3. Add Transaction
```
handlePay() success → triggerRefresh() → refreshKey++
→ fetchBalance() → balance updates
```

---

## API Payload Formats (CRITICAL)

### Income (`POST /income/addIncome`)
```javascript
{
  amount: Number(amount),
  description: "Income added from mobile",
  date: new Date().toISOString().replace('Z', ''),  // uses `date`
  category: { name: selectedCategory.name },
}
```

### Expense (`POST /expense/addExpense`)
```javascript
{
  amount: Number(amount),
  category: { name: selectedCategory.name },
  description: "Expense added from mobile",
  timestamp: new Date().toISOString(),              // uses `timestamp`
}
```

---

## Component Refresh Chain

| Event | Trigger | Effect |
|---|---|---|
| Tab Switch | `switchTab()` | reset form + reload categories + refreshKey++ |
| Add Income | `triggerRefresh()` | refreshKey++ → balance re-fetches |
| Add Expense | `triggerRefresh()` | refreshKey++ → balance re-fetches |

---

## Key File Locations

| File | Purpose |
|---|---|
| `src/context/TabContext.js` | Global activeTab + refreshKey state |
| `src/context/AuthContext.js` | Global user/auth state |
| `app/_layout.tsx` | Root provider chain |
| `src/screens/dashboard/DashboardScreen.js` | Uses `useTab()` hook |
| `src/screens/transactions/ManageTransactionsScreen.js` | Local activeTab (different concern) |
| `src/api/transactions.js` | All API methods |
| `src/api/client.js` | Axios client (baseURL: http://localhost:8090/) |
