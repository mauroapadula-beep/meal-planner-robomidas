'use client'
import { useState, useEffect, useMemo } from 'react'
import { ingredientsByMealName } from '../../data/principalIngredients'
import { principalsData, sidesData } from '../../data/mealsData'
import { mealCookTimes } from '../../data/mealCookTimes'
import { masterIngredientsSorted, ingredientByName, ingredientCategories, categoryLabels } from '../../data/masterIngredients'

const todayStr = () => new Date().toISOString().split('T')[0]
const formatDate = (str) => { const d = new Date(str + 'T00:00:00'); return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }

const CARD = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyg-MQ5S8q2qGDmkp2RhnniZlt700M3WyY4lxn-2qVg0aWybH1xXAdQr6Hod9LsjtbW/exec'

// Minuta (quick) principals — fast to cook, ≤35 min
const MINUTA_PRINCIPALS = new Set([
  'Omelette de jamon y queso','Bifes de pollo a la plancha','Salchichas y huevos duros',
  'Hamburguesa de res','Bifes de cerdo salteados con cebolla','Bifes de cerdo a la plancha',
  'Filet de pescado a la plancha','Costeletas de cerdo a la plancha','Bifes de cerdo',
  'Hamburguesas de pollo','Hamburguesas de cerdo','Lomitos con Papas Fritas',
  'Pollo spicy salteado con cebolla','Bifes de Cerdo salteado con jengibre ajo y cebolla de verdeo',
  'Hamburguesa de garbanzos remolacha','Hamburguesa de hongos portobello',
  'Tortilla de zucchini cebolla morada y queso provoleta','Omelette de espinacas',
  'Hamburguesas de lentejas zanahoria rallada y avena','Tortillas de lentejas',
  'Milanesa de calabacin a la napolitana','Milanesas de berenjena','Milanesas de zucchini',
  'Milanesas de soja a la napolitana','Arroz chino salteado','Salteado chino de pollo',
  'Cubos pollo salteado con chauchas','Brochettes de carne',
])

// Minuta (quick) sides — simple, no cooking required
const MINUTA_SIDES = new Set([
  'Ensalada mixta','Arroz blanco','Ensalada de remolacha','Ensalada de zanahoria rallada',
  'Ensalada capresse','Tomates asados',
])

const STATIC_PRINCIPALS = Object.entries(ingredientsByMealName).map(([name, ings]) => ({
  id: `static-p-${name}`, name, type: 'principal',
  subtype: MINUTA_PRINCIPALS.has(name) ? 'minuta' : 'complete',
  ingredients: ings.map(i => ({ ...i })),
  cookTime: mealCookTimes[name] || null, isStatic: true,
}))

const STATIC_SIDES = [
  'Ensalada mixta','Arroz blanco','Puré de papas','Papas al horno','Ensalada de remolacha',
  'Ensalada de zanahoria rallada','Brócoli al vapor','Coliflor gratinada','Chauchas salteadas',
  'Zapallitos salteados','Calabaza asada','Espinaca salteada','Ensalada capresse',
  'Tomates asados','Acelga rehogada',
].map(name => ({ id: `static-s-${name}`, name, type: 'side', subtype: MINUTA_SIDES.has(name) ? 'minuta' : 'complete', ingredients: [], cookTime: null, isStatic: true }))

const ALL_STATIC = [...STATIC_PRINCIPALS, ...STATIC_SIDES]
const NEW_ING_SENTINEL = '__new__'

// One ingredient row in the form
function IngRow({ ing, idx, onChange, onRemove, extraIngredients }) {
  const allOptions = [...masterIngredientsSorted, ...extraIngredients]
  const [showNew, setShowNew] = useState(false)

  const handleSelect = (val) => {
    const master = allOptions.find(o => o.name === val)
    onChange(idx, 'name', val)
    if (master) onChange(idx, 'unit', master.unit)
  }

  const openNew = () => {
    onChange(idx, 'name', '')
    onChange(idx, 'category', '')
    setShowNew(true)
  }

  const closeNew = () => {
    setShowNew(false)
    onChange(idx, 'name', '')
  }

  const selectedVal = (!showNew && allOptions.find(o => o.name === ing.name)) ? ing.name : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Ingredient selector OR new ingredient text input */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          {!showNew ? (
            <select
              value={selectedVal}
              onChange={e => handleSelect(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
            >
              <option value="">— select ingredient —</option>
              {Object.keys(categoryLabels).map(cat => {
                const catItems = allOptions.filter(o => o.category === cat)
                if (!catItems.length) return null
                return (
                  <optgroup key={cat} label={categoryLabels[cat]}>
                    {catItems.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                  </optgroup>
                )
              })}
            </select>
          ) : (
            <input
              autoFocus
              type="text"
              value={ing.name}
              onChange={e => onChange(idx, 'name', e.target.value)}
              placeholder="New ingredient name..."
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '2px solid #f59e0b', fontSize: '13px', backgroundColor: '#fffbeb', boxSizing: 'border-box' }}
            />
          )}
        </div>

        {/* Qty */}
        <input
          type="number" value={ing.qty} onChange={e => onChange(idx, 'qty', e.target.value)}
          placeholder="Qty" min={0}
          style={{ width: '65px', padding: '7px 8px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        />

        {/* Unit */}
        <select
          value={ing.unit} onChange={e => onChange(idx, 'unit', e.target.value)}
          style={{ padding: '7px 6px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '12px' }}
        >
          <option>g</option><option>kg</option><option>ml</option><option>l</option><option>u</option>
          <option>porciones</option><option>cdas</option><option>cditas</option>
        </select>

        {/* New ingredient toggle button */}
        {!showNew ? (
          <button
            onClick={openNew}
            title="Add new ingredient not in the list"
            style={{ padding: '6px 10px', borderRadius: '7px', border: '1px dashed #f59e0b', backgroundColor: '#fffbeb', color: '#d97706', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >➕ New</button>
        ) : (
          <button
            onClick={closeNew}
            title="Back to list"
            style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >← List</button>
        )}

        {/* Remove row */}
        <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px', padding: '2px', flexShrink: 0 }}>✕</button>
      </div>

      {/* New ingredient extra fields: category */}
      {showNew && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '4px', paddingBottom: '4px', borderLeft: '3px solid #f59e0b', marginLeft: '2px' }}>
          <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold', whiteSpace: 'nowrap' }}>⚠️ NEW</span>
          <select
            value={ing.category || ''}
            onChange={e => onChange(idx, 'category', e.target.value)}
            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #f59e0b', fontSize: '12px', backgroundColor: '#fffbeb' }}
          >
            <option value="">Category (required)...</option>
            {ingredientCategories.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
          </select>
          <span style={{ fontSize: '10px', color: '#92400e' }}>Will be added to <strong>7-Ingredients</strong> sheet on save</span>
        </div>
      )}
    </div>
  )
}

function IngredientGrid({ ingredients }) {
  if (!ingredients || ingredients.length === 0) return <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>No ingredients recorded yet.</p>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '5px' }}>
      {ingredients.map((ing, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '13px', color: '#334155' }}>{ing.name}</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace', flexShrink: 0, marginLeft: '8px' }}>{ing.qty} {ing.unit}</span>
        </div>
      ))}
    </div>
  )
}

function MealCard({ emoji, slot, mealName, sideName, accentColor, accentBg, accentBorder, customRecipes }) {
  const staticIngredients = mealName ? ingredientsByMealName[mealName] : null
  const customRecipe = mealName ? customRecipes.find(r => r.name === mealName) : null
  const ingredients = customRecipe?.ingredients?.length ? customRecipe.ingredients : staticIngredients
  const prepTime = customRecipe?.prepTime || null
  const cookTime = customRecipe?.cookTime || mealCookTimes[mealName] || null
  return (
    <div style={{ ...CARD, borderLeft: `4px solid ${accentColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: accentColor, backgroundColor: accentBg, border: `1px solid ${accentBorder}`, borderRadius: '5px', padding: '3px 10px', display: 'inline-block', marginBottom: '8px' }}>{emoji} {slot}</span>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1.25 }}>{mealName || <span style={{ color: '#94a3b8' }}>No plan for today</span>}</h2>
          {sideName && <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>🥗 Side: <strong>{sideName}</strong></p>}
        </div>
        {(prepTime || cookTime) && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
            {prepTime && (
              <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d', display: 'block' }}>{prepTime}'</span>
                <span style={{ fontSize: '9px', color: '#15803d', fontWeight: 'bold' }}>🥄 PREP</span>
              </div>
            )}
            {cookTime && (
              <div style={{ textAlign: 'center', backgroundColor: accentBg, border: `1px solid ${accentBorder}`, borderRadius: '10px', padding: '8px 12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: accentColor, display: 'block' }}>{cookTime}'</span>
                <span style={{ fontSize: '9px', color: accentColor, fontWeight: 'bold' }}>{prepTime ? '🔥 COOK' : '⏱ TOTAL'}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {ingredients && ingredients.length > 0 && (
        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ingredients</p>
          <IngredientGrid ingredients={ingredients} />
        </div>
      )}
      {mealName && !ingredients && (
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#f59e0b', backgroundColor: '#fffbeb', padding: '8px 12px', borderRadius: '6px' }}>⚠️ Recipe not found in database</p>
      )}
    </div>
  )
}

const EMPTY_ING = () => ({ name: '', qty: '', unit: 'g', category: '' })

export default function CookPage() {
  const [mainTab, setMainTab] = useState('hoy')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [plan, setPlan] = useState(null)

  // Resolve today's (or selected date's) meals from localStorage plan
  useEffect(() => {
    function loadPlan() {
      try {
        const raw = localStorage.getItem('robomidas_custom_monthly_plan')
        if (!raw) { setPlan(null); return }
        const monthly = JSON.parse(raw)
        const dayNum = new Date(selectedDate + 'T00:00:00').getDate()
        const dayData = monthly[String(dayNum)]
        if (!dayData) { setPlan(null); return }
        const lp = principalsData.find(p => p.id === String(dayData.lunch_principal_id))
        const ls = sidesData.find(s => s.id === String(dayData.lunch_side_id))
        const dp = principalsData.find(p => p.id === String(dayData.dinner_principal_id))
        const ds = sidesData.find(s => s.id === String(dayData.dinner_side_id))
        setPlan({
          lunch:  { principal: lp?.name || null, side: ls?.name || null },
          dinner: { principal: dp?.name || null, side: ds?.name || null },
        })
      } catch (e) { setPlan(null) }
    }
    loadPlan()
    window.addEventListener('storage', loadPlan)
    return () => window.removeEventListener('storage', loadPlan)
  }, [selectedDate])

  // Extra ingredients added by user this session (before sheet syncs)
  const [extraIngredients, setExtraIngredients] = useState([])

  // Custom recipes (localStorage)
  const [customRecipes, setCustomRecipes] = useState([])
  useEffect(() => {
    try { const s = localStorage.getItem('custom_recipes_v1'); if (s) setCustomRecipes(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('extra_ingredients_v1'); if (s) setExtraIngredients(JSON.parse(s)) } catch {}
  }, [])
  const saveCustomRecipes = (arr) => { setCustomRecipes(arr); localStorage.setItem('custom_recipes_v1', JSON.stringify(arr)) }
  const saveExtraIngredients = (arr) => { setExtraIngredients(arr); localStorage.setItem('extra_ingredients_v1', JSON.stringify(arr)) }

  // Recipe list
  const allRecipes = useMemo(() => {
    const customNames = new Set(customRecipes.map(r => r.name))
    return [...customRecipes, ...ALL_STATIC.filter(r => !customNames.has(r.name))]
  }, [customRecipes])

  // Search
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [subtypeFilter, setSubtypeFilter] = useState('all')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)

  const showResults = typeFilter !== 'all' || search.trim().length >= 1
  const filtered = useMemo(() => {
    if (!showResults) return []
    const q = search.toLowerCase().trim()
    return allRecipes.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (q && !r.name.toLowerCase().includes(q) && !r.ingredients?.some(i => i.name?.toLowerCase().includes(q))) return false
      return true
    })
  }, [allRecipes, search, typeFilter, showResults])

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('principal')
  const [formSubtype, setFormSubtype] = useState('complete')
  const [formPrepTime, setFormPrepTime] = useState('')
  const [formCookTime, setFormCookTime] = useState('')
  const [formIngredients, setFormIngredients] = useState([EMPTY_ING()])
  const [editingId, setEditingId] = useState(null)

  // Ingredientes tab state
  const [ingSearch, setIngSearch] = useState('')
  const [newIngName, setNewIngName] = useState('')
  const [newIngUnit, setNewIngUnit] = useState('g')
  const [newIngCategory, setNewIngCategory] = useState('')
  const [ingSyncStatus, setIngSyncStatus] = useState(null)

  const handleIngChange = (idx, field, val) => setFormIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, [field]: val } : ing))
  const addIngRow = () => setFormIngredients(prev => [...prev, EMPTY_ING()])
  const removeIngRow = (idx) => setFormIngredients(prev => prev.filter((_, i) => i !== idx))

  const openEdit = (recipe) => {
    setFormName(recipe.name)
    setFormType(recipe.type)
    setFormSubtype(recipe.subtype || 'complete')
    setFormPrepTime(recipe.prepTime || '')
    setFormCookTime(recipe.cookTime || '')
    setFormIngredients(recipe.ingredients?.length ? recipe.ingredients.map(i => ({ ...i, category: i.category || '' })) : [EMPTY_ING()])
    setEditingId(recipe.isStatic ? null : recipe.id)
    setShowForm(true); setSelectedRecipe(null); setSyncStatus(null)
  }

  const openNew = () => {
    setFormName(''); setFormType('principal'); setFormSubtype('complete'); setFormPrepTime(''); setFormCookTime(''); setFormIngredients([EMPTY_ING()]); setEditingId(null)
    setShowForm(true); setSelectedRecipe(null); setSyncStatus(null)
  }

  const closeForm = () => { setShowForm(false); setSyncStatus(null) }

  const callScript = async (payload) => {
    try {
      await fetch(APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) })
      return true
    } catch { return false }
  }

  const handleSaveRecipe = async () => {
    if (!formName.trim()) return
    setSyncStatus('syncing')

    const ings = formIngredients.filter(i => String(i.name).trim())

    // Detect new ingredients not in master list or extra list
    const allKnown = [...masterIngredientsSorted, ...extraIngredients]
    const newIngs = ings.filter(i => i.name && !allKnown.find(o => o.name === i.name))

    // Save new ingredients locally + sync to sheet
    if (newIngs.length > 0) {
      const updated = [...extraIngredients, ...newIngs.map(i => ({ name: i.name, unit: i.unit, category: i.category || 'almacen' }))]
      saveExtraIngredients(updated)
      for (const ni of newIngs) {
        await callScript({ action: 'saveIngredient', ingredient: { name: ni.name, unit: ni.unit, category: ni.category || 'almacen' } })
      }
    }

    const recipe = {
      id: editingId || `custom-${Date.now()}`,
      name: formName.trim(), type: formType, subtype: formSubtype,
      prepTime: formPrepTime ? Number(formPrepTime) : null,
      cookTime: formCookTime ? Number(formCookTime) : null,
      ingredients: ings, isStatic: false,
      updatedAt: new Date().toISOString(),
    }
    const updated = editingId
      ? customRecipes.map(r => r.id === editingId ? recipe : r)
      : [recipe, ...customRecipes.filter(r => r.name !== recipe.name)]
    saveCustomRecipes(updated)

    const ok = await callScript({ action: 'saveRecipe', recipe })
    setSyncStatus(ok ? 'ok' : 'error')
    setSelectedRecipe(recipe); setShowForm(false)
  }

  const handleSaveIngredient = async () => {
    if (!newIngName.trim() || !newIngCategory) return
    setIngSyncStatus('syncing')
    const ing = { name: newIngName.trim(), unit: newIngUnit, category: newIngCategory }
    const updated = [...extraIngredients, ing]
    saveExtraIngredients(updated)
    const ok = await callScript({ action: 'saveIngredient', ingredient: ing })
    setIngSyncStatus(ok ? 'ok' : 'error')
    if (ok) { setNewIngName(''); setNewIngUnit('g'); setNewIngCategory('') }
  }

  const handleDelete = (id) => {
    if (!confirm('Delete this custom recipe? The original from the spreadsheet will be restored.')) return
    saveCustomRecipes(customRecipes.filter(r => r.id !== id))
    setSelectedRecipe(null)
  }

  const TAB_BTN = (active) => ({
    padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
    backgroundColor: active ? '#0f172a' : '#f1f5f9', color: active ? '#fff' : '#64748b',
  })

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      <div style={{ ...CARD, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: 'bold', color: '#0f172a' }}>👩‍🍳 Modo Cocina</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Today's recipes · Recipe library</p>
        </div>
        {mainTab === 'hoy' && (
          <div style={{ textAlign: 'right' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '4px' }}>📅 DATE</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#fff' }} />
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{formatDate(selectedDate)}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button style={TAB_BTN(mainTab === 'hoy')} onClick={() => setMainTab('hoy')}>🍽️ Hoy</button>
        <button style={TAB_BTN(mainTab === 'recetas')} onClick={() => setMainTab('recetas')}>📖 Recetas</button>
        <button style={TAB_BTN(mainTab === 'ingredientes')} onClick={() => setMainTab('ingredientes')}>🧄 Ingredientes</button>
      </div>

      {/* ===== TODAY ===== */}
      {mainTab === 'hoy' && (
        plan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MealCard emoji="☀️" slot="ALMUERZO" mealName={plan.lunch?.principal} sideName={plan.lunch?.side} accentColor="#1d4ed8" accentBg="#eff6ff" accentBorder="#bfdbfe" customRecipes={customRecipes} />
            {plan.dinner?.principal && (
              <MealCard emoji="🌙" slot="CENA" mealName={plan.dinner?.principal} sideName={plan.dinner?.side} accentColor="#7e22ce" accentBg="#faf5ff" accentBorder="#e9d5ff" customRecipes={customRecipes} />
            )}
          </div>
        ) : (
          <div style={{ ...CARD, textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px 0' }}>📭</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0' }}>No plan for this day</p>
            <p style={{ fontSize: '13px', margin: 0 }}>No hay plan generado para este día. Generá el plan mensual en la sección <strong>Plan</strong>.</p>
          </div>
        )
      )}

      {/* ===== INGREDIENTES ===== */}
      {mainTab === 'ingredientes' && (() => {
        const allMasterOptions = [...masterIngredientsSorted, ...extraIngredients]
        const q = ingSearch.toLowerCase().trim()
        const filteredIngs = q ? allMasterOptions.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : allMasterOptions
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Left: search + list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...CARD, padding: '16px' }}>
                <input
                  autoFocus type="text" value={ingSearch} onChange={e => setIngSearch(e.target.value)}
                  placeholder="🔍 Search ingredients..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{filteredIngs.length} of {allMasterOptions.length} ingredients</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '70vh', overflowY: 'auto' }}>
                {Object.keys(categoryLabels).map(cat => {
                  const catItems = filteredIngs.filter(i => i.category === cat)
                  if (!catItems.length) return null
                  return (
                    <div key={cat}>
                      <p style={{ margin: '10px 0 4px 0', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{categoryLabels[cat]}</p>
                      {catItems.map(ing => (
                        <div key={ing.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '7px', backgroundColor: '#fff', border: '1px solid #f1f5f9', marginBottom: '2px' }}>
                          <span style={{ fontSize: '13px', color: '#334155' }}>{ing.name}</span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{ing.unit}</span>
                            {ing.id === undefined && <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#d97706', backgroundColor: '#fffbeb', padding: '1px 5px', borderRadius: '3px' }}>NEW</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
                {/* uncategorised extras */}
                {filteredIngs.filter(i => !categoryLabels[i.category]).map(ing => (
                  <div key={ing.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '7px', backgroundColor: '#fff', border: '1px solid #f1f5f9', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', color: '#334155' }}>{ing.name}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: add new ingredient form */}
            <div style={{ ...CARD }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>➕ Agregar nuevo ingrediente</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>El ingrediente se guardará en la lista maestra y se sincronizará con la hoja <strong>7-Ingredients</strong>.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>NOMBRE</label>
                  <input type="text" value={newIngName} onChange={e => { setNewIngName(e.target.value); setIngSyncStatus(null) }} placeholder="e.g. Carne de res en bifes" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>UNIDAD</label>
                    <select value={newIngUnit} onChange={e => setNewIngUnit(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option>g</option><option>kg</option><option>ml</option><option>l</option><option>u</option><option>porciones</option><option>cdas</option><option>cditas</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>CATEGORÍA</label>
                    <select value={newIngCategory} onChange={e => setNewIngCategory(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="">Seleccionar categoría...</option>
                      {ingredientCategories.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleSaveIngredient}
                  disabled={!newIngName.trim() || !newIngCategory || ingSyncStatus === 'syncing'}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: (!newIngName.trim() || !newIngCategory || ingSyncStatus === 'syncing') ? '#94a3b8' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: (!newIngName.trim() || !newIngCategory || ingSyncStatus === 'syncing') ? 'default' : 'pointer', fontSize: '14px' }}
                >
                  {ingSyncStatus === 'syncing' ? '⏳ Guardando...' : '💾 Guardar + Sync a Sheet'}
                </button>
              </div>
              {ingSyncStatus === 'ok' && <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#16a34a' }}>✅ Ingrediente guardado en Google Sheet y lista local</p>}
              {ingSyncStatus === 'error' && <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#dc2626' }}>⚠️ Guardado localmente — sync falló. Verificar Apps Script.</p>}
            </div>
          </div>
        )
      })()}

      {/* ===== RECIPES ===== */}
      {mainTab === 'recetas' && (() => {
        const completeItems = filtered.filter(r => !r.subtype || r.subtype === 'complete')
        const minutaItems   = filtered.filter(r => r.subtype === 'minuta')

        const RecipeBtn = (r) => (
          <button key={r.id} onClick={() => { setSelectedRecipe(r); setShowForm(false); setSyncStatus(null) }}
            style={{ textAlign: 'left', padding: '9px 14px', borderRadius: '8px', border: `2px solid ${selectedRecipe?.id === r.id ? '#2563eb' : '#e2e8f0'}`, backgroundColor: selectedRecipe?.id === r.id ? '#eff6ff' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', lineHeight: 1.3, flex: 1 }}>{r.name}</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
              {!r.isStatic && <span style={{ fontSize: '10px', color: '#d97706', fontWeight: 'bold' }}>✏️</span>}
              {r.prepTime && <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold' }}>🥄{r.prepTime}'</span>}
              {r.cookTime && <span style={{ fontSize: '11px', color: '#c2410c', fontWeight: 'bold' }}>🔥{r.cookTime}'</span>}
            </div>
          </button>
        )

        return (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>

            {/* LEFT — navigation only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['principal',   '🍽️', 'Principales',   '#1d4ed8', '#eff6ff', '#bfdbfe'],
                ['side',        '🥗', 'Guarniciones',  '#16a34a', '#f0fdf4', '#bbf7d0'],
                ['preparacion', '🧑‍🍳', 'Preparaciones', '#7e22ce', '#faf5ff', '#e9d5ff'],
              ].map(([val, emoji, label, activeColor, activeBg, activeBorder]) => (
                <button key={val}
                  onClick={() => { setTypeFilter(typeFilter === val ? 'all' : val); setSelectedRecipe(null); setShowForm(false); setSyncStatus(null); setSearch('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: `2px solid ${typeFilter === val ? activeBorder : '#e2e8f0'}`, backgroundColor: typeFilter === val ? activeBg : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '22px' }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: typeFilter === val ? activeColor : '#0f172a', display: 'block' }}>{label}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{allRecipes.filter(r => r.type === val).length} recetas</span>
                  </div>
                  {typeFilter === val && <span style={{ color: activeColor, fontSize: '14px' }}>◀</span>}
                </button>
              ))}

              <button onClick={openNew} style={{ padding: '11px', borderRadius: '10px', border: '2px dashed #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#2563eb', marginTop: '4px' }}>
                ➕ Nueva Receta
              </button>
            </div>

            {/* RIGHT — form/detail on top, recipe list below */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ---- FORM ---- */}
              {showForm && (
                <div style={{ ...CARD }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                    {editingId ? '✏️ Editar Receta' : '➕ Nueva Receta'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>NOMBRE</label>
                      <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Lasagna tradicional con salsa bolognesa de res" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>TIPO</label>
                        <select value={formType} onChange={e => setFormType(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                          <option value="principal">🍽️ Principal</option>
                          <option value="side">🥗 Guarnición</option>
                          <option value="preparacion">🧑‍🍳 Preparación</option>
                        </select>
                      </div>
                      {formType !== 'preparacion' && (
                        <div style={{ flex: 1, minWidth: '140px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>SUBTIPO</label>
                          <select value={formSubtype} onChange={e => setFormSubtype(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                            <option value="complete">🍽️ Completo (elaborado)</option>
                            <option value="minuta">⚡ Minuta (rápido)</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>🥄 PREP (min)</label>
                        <input type="number" value={formPrepTime} onChange={e => setFormPrepTime(e.target.value)} placeholder="20" min={0} style={{ width: '80px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>🔥 COOK (min)</label>
                        <input type="number" value={formCookTime} onChange={e => setFormCookTime(e.target.value)} placeholder="55" min={0} style={{ width: '80px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                    Ingredientes <span style={{ fontWeight: 'normal', color: '#94a3b8', textTransform: 'none' }}>— seleccionar de la lista o agregar nuevo</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {formIngredients.map((ing, idx) => (
                      <IngRow key={idx} ing={ing} idx={idx} onChange={handleIngChange} onRemove={removeIngRow} extraIngredients={extraIngredients} />
                    ))}
                  </div>
                  <button onClick={addIngRow} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', padding: '0', marginBottom: '18px' }}>+ Agregar ingrediente</button>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={handleSaveRecipe} disabled={syncStatus === 'syncing'} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: syncStatus === 'syncing' ? '#94a3b8' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: syncStatus === 'syncing' ? 'default' : 'pointer', fontSize: '14px' }}>
                      {syncStatus === 'syncing' ? '⏳ Guardando...' : '💾 Guardar + Sync a Sheet'}
                    </button>
                    <button onClick={closeForm} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>Cancelar</button>
                  </div>
                  {syncStatus === 'ok' && <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#16a34a' }}>✅ Guardado en Google Sheet</p>}
                  {syncStatus === 'error' && <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#dc2626' }}>⚠️ Guardado localmente — sync falló. Verificar Apps Script.</p>}
                </div>
              )}

              {/* ---- DETAIL ---- */}
              {selectedRecipe && !showForm && (
                <div style={{ ...CARD }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1, marginRight: '16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '5px', backgroundColor: selectedRecipe.type === 'principal' ? '#eff6ff' : selectedRecipe.type === 'side' ? '#f0fdf4' : '#faf5ff', color: selectedRecipe.type === 'principal' ? '#1d4ed8' : selectedRecipe.type === 'side' ? '#16a34a' : '#7e22ce' }}>
                          {selectedRecipe.type === 'principal' ? '🍽️ PRINCIPAL' : selectedRecipe.type === 'side' ? '🥗 GUARNICIÓN' : '🧑‍🍳 PREPARACIÓN'}
                        </span>
                        {selectedRecipe.subtype === 'minuta' && <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '5px', backgroundColor: '#fdf4ff', color: '#7e22ce' }}>⚡ MINUTA</span>}
                        {selectedRecipe.subtype !== 'minuta' && selectedRecipe.type !== 'preparacion' && <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '5px', backgroundColor: '#f8fafc', color: '#475569' }}>🍽️ COMPLETO</span>}
                        {!selectedRecipe.isStatic && <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '5px', backgroundColor: '#fffbeb', color: '#d97706' }}>✏️ EDITADA</span>}
                      </div>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1.3 }}>{selectedRecipe.name}</h2>
                    </div>
                    {(selectedRecipe.prepTime || selectedRecipe.cookTime) && (
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {selectedRecipe.prepTime && <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px' }}><span style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', display: 'block' }}>{selectedRecipe.prepTime}'</span><span style={{ fontSize: '10px', color: '#15803d', fontWeight: 'bold' }}>🥄 PREP</span></div>}
                        {selectedRecipe.cookTime && <div style={{ textAlign: 'center', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px 14px' }}><span style={{ fontSize: '20px', fontWeight: 'bold', color: '#c2410c', display: 'block' }}>{selectedRecipe.cookTime}'</span><span style={{ fontSize: '10px', color: '#c2410c', fontWeight: 'bold' }}>🔥 COOK</span></div>}
                      </div>
                    )}
                  </div>
                  {selectedRecipe.ingredients?.length > 0 ? (
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Ingredientes ({selectedRecipe.ingredients.length})</p>
                      <IngredientGrid ingredients={selectedRecipe.ingredients} />
                    </div>
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Sin ingredientes cargados. Hacé clic en Editar para agregarlos.</p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={() => openEdit(selectedRecipe)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>✏️ Editar</button>
                    {!selectedRecipe.isStatic && <button onClick={() => handleDelete(selectedRecipe.id)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>🗑️ Eliminar (restaurar original)</button>}
                  </div>
                  {syncStatus === 'ok' && <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#16a34a' }}>✅ Sincronizado con Google Sheet</p>}
                </div>
              )}

              {/* ---- EMPTY STATE (no category selected) ---- */}
              {!selectedRecipe && !showForm && typeFilter === 'all' && (
                <div style={{ ...CARD, textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
                  <p style={{ fontSize: '40px', margin: '0 0 10px 0' }}>📖</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#64748b' }}>Biblioteca de Recetas</p>
                  <p style={{ fontSize: '13px', margin: '0 0 20px 0' }}>Seleccioná una categoría a la izquierda para ver las recetas.</p>
                  <p style={{ fontSize: '12px', margin: 0, color: '#cbd5e1' }}>
                    {allRecipes.filter(r => r.type === 'principal').length} principales · {allRecipes.filter(r => r.type === 'side').length} guarniciones · {allRecipes.filter(r => r.type === 'preparacion').length} preparaciones
                  </p>
                </div>
              )}

              {/* ---- RECIPE LIST — below form/detail, shown when a category is selected ---- */}
              {showResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Search bar */}
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Buscar dentro de la categoría..."
                    style={{ width: '100%', padding: '9px 14px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />

                  {filtered.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', padding: '20px 0' }}>Sin resultados{search ? ` para "${search}"` : ''}</p>
                  )}

                  {/* COMPLETO section */}
                  {completeItems.length > 0 && (
                    <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#1e293b' }}>
                        <span style={{ fontSize: '16px' }}>🍽️</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completo — Elaborado</span>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#334155', color: '#94a3b8', padding: '2px 8px', borderRadius: '99px' }}>{completeItems.length}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '6px', padding: '10px' }}>
                        {completeItems.map(r => RecipeBtn(r))}
                      </div>
                    </div>
                  )}

                  {/* MINUTA section */}
                  {minutaItems.length > 0 && (
                    <div style={{ border: '2px solid #e9d5ff', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#7e22ce' }}>
                        <span style={{ fontSize: '16px' }}>⚡</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Minuta — Rápido</span>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#6b21a8', color: '#e9d5ff', padding: '2px 8px', borderRadius: '99px' }}>{minutaItems.length}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '6px', padding: '10px' }}>
                        {minutaItems.map(r => RecipeBtn(r))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )
      })()}
    </div>
  )
}
