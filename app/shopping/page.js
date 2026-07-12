'use client'
import { useState, useEffect } from 'react'
import { mealPlanByDate } from '../../data/mealPlanByDate'
import { ingredientsByMealName } from '../../data/principalIngredients'

const todayStr = () => new Date().toISOString().split('T')[0]
const addDays = (dateStr, n) => { const d = new Date(dateStr + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }
const formatDate = (str) => { const d = new Date(str + 'T00:00:00'); return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) }

const CARD = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }

export default function ShoppingPage() {
  const [rangeStart, setRangeStart] = useState(todayStr())
  const [rangeEnd, setRangeEnd] = useState(addDays(todayStr(), 6))
  const [deductFreezer, setDeductFreezer] = useState(false)
  const [deductPantry, setDeductPantry] = useState(true)
  const [freezerStock, setFreezerStock] = useState([])
  const [pantryStock, setPantryStock] = useState([])
  const [shoppingList, setShoppingList] = useState(null)

  useEffect(() => {
    const f = localStorage.getItem('cook_freezer_stock_v2')
    if (f) { try { setFreezerStock(JSON.parse(f)) } catch (e) {} }
    const p = localStorage.getItem('cook_pantry_stock_v1')
    if (p) { try { setPantryStock(JSON.parse(p)) } catch (e) {} }
  }, [])

  const pantryLowItems = pantryStock.filter(p => p.currentQty <= p.minQty)

  const generateShoppingList = () => {
    const frozenPrincipals = new Set(freezerStock.filter(f => f.category === 'principal').map(f => f.name))
    const frozenRaw = {}
    if (deductFreezer) { freezerStock.filter(f => f.category === 'raw').forEach(f => { frozenRaw[f.name] = (frozenRaw[f.name] || 0) + f.qty }) }
    const pantryAvailable = {}
    if (deductPantry) { pantryStock.forEach(p => { pantryAvailable[p.name] = (pantryAvailable[p.name] || 0) + p.currentQty }) }

    const totals = {}
    let d = rangeStart
    while (d <= rangeEnd) {
      const plan = mealPlanByDate[d]
      if (plan) {
        const meals = [plan.lunch?.principal, plan.dinner?.principal].filter(Boolean)
        meals.forEach(mealName => {
          if (deductFreezer && frozenPrincipals.has(mealName)) return
          const ings = ingredientsByMealName[mealName] || []
          ings.forEach(ing => {
            const key = `${ing.name}__${ing.unit}`
            if (!totals[key]) totals[key] = { name: ing.name, unit: ing.unit, qty: 0 }
            totals[key].qty += ing.qty
          })
        })
      }
      d = addDays(d, 1)
    }

    let list = Object.values(totals).sort((a, b) => a.name.localeCompare(b.name))
    if (deductFreezer) { list = list.map(item => { const v = frozenRaw[item.name] || 0; return v > 0 ? { ...item, qty: Math.max(0, item.qty - v), fromFreezer: v } : item }) }
    if (deductPantry) { list = list.map(item => { const v = pantryAvailable[item.name] || 0; return v > 0 ? { ...item, qty: Math.max(0, item.qty - v), fromPantry: v } : item }) }

    const reorderItems = pantryLowItems.map(p => {
      const needed = Math.max(0, p.targetQty - p.currentQty)
      const exists = list.find(l => l.name === p.name)
      if (!exists && needed > 0) return { name: p.name, unit: p.unit, qty: needed, currentStock: p.currentQty, minQty: p.minQty }
      return null
    }).filter(Boolean)

    const skippedMeals = deductFreezer ? [...frozenPrincipals].filter(m => {
      let found = false; let d2 = rangeStart
      while (d2 <= rangeEnd) { const pl = mealPlanByDate[d2]; if (pl && (pl.lunch?.principal === m || pl.dinner?.principal === m)) { found = true; break }; d2 = addDays(d2, 1) }; return found
    }) : []

    setShoppingList({ items: list, reorderItems, skippedMeals })
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ ...CARD, marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 'bold' }}>🛒 Lista de Compras</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Generá la lista de ingredientes para el rango de fechas del plan</p>
      </div>

      <div style={{ ...CARD, marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold' }}>🗓️ Rango de fechas</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div><label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '3px' }}>DESDE</label><input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} /></div>
          <div><label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '3px' }}>HASTA</label><input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} /></div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
            {[['7 días', 6], ['14 días', 13], ['30 días', 29]].map(([label, n]) => (
              <button key={label} onClick={() => { setRangeStart(todayStr()); setRangeEnd(addDays(todayStr(), n)) }} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#fff' }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={deductFreezer} onChange={e => setDeductFreezer(e.target.checked)} style={{ width: '15px', height: '15px' }} />
            ❄️ Descontar freezer ({freezerStock.length} items)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={deductPantry} onChange={e => setDeductPantry(e.target.checked)} style={{ width: '15px', height: '15px' }} />
            🏪 Descontar alacena ({pantryStock.length} items{pantryLowItems.length > 0 ? `, ⚠️ ${pantryLowItems.length} bajo mínimo` : ''})
          </label>
          <button onClick={generateShoppingList} style={{ padding: '9px 22px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>⚡ Generar Lista</button>
        </div>
      </div>

      {shoppingList && (
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>🛒 {formatDate(rangeStart)} → {formatDate(rangeEnd)}</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{shoppingList.items.filter(i => i.qty > 0).length} ingredientes a comprar</span>
          </div>

          {shoppingList.skippedMeals.length > 0 && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534' }}>❄️ Comidas cubiertas por freezer (ingredientes omitidos):</span>
              <ul style={{ margin: '4px 0 0 0', padding: '0 0 0 16px' }}>{shoppingList.skippedMeals.map((m, i) => <li key={i} style={{ fontSize: '12px', color: '#166534' }}>{m}</li>)}</ul>
            </div>
          )}

          {shoppingList.reorderItems?.length > 0 && (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>⚠️ Alacena bajo mínimo — Reponer:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '6px' }}>
                {shoppingList.reorderItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fde68a' }}>
                    <span style={{ fontSize: '12px', color: '#92400e', fontWeight: '500' }}>🏪 {item.name} <span style={{ color: '#d97706', fontSize: '10px' }}>(tiene: {item.currentStock} {item.unit})</span></span>
                    <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#92400e', fontSize: '12px' }}>+{Math.ceil(item.qty)} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shoppingList.items.filter(i => i.qty > 0).length === 0 && !shoppingList.reorderItems?.length ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Todo cubierto por freezer y alacena 🎉</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '8px' }}>
              {shoppingList.items.filter(i => i.qty > 0).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {item.fromFreezer > 0 && <span style={{ fontSize: '10px', color: '#0891b2', backgroundColor: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>-{item.fromFreezer}{item.unit} ❄️</span>}
                    {item.fromPantry > 0 && <span style={{ fontSize: '10px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '1px 5px', borderRadius: '4px' }}>-{item.fromPantry}{item.unit} 🏪</span>}
                    <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#0f172a', fontSize: '13px' }}>{Math.ceil(item.qty)} {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
