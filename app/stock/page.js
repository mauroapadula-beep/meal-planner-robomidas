'use client'
import { useState, useEffect } from 'react'
import { ingredientsByMealName } from '../../data/principalIngredients'

const todayStr = () => new Date().toISOString().split('T')[0]

const CARD = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }

const PANTRY_CATEGORIES = {
  granos: '🌾 Granos/Pastas',
  aceites: '🫙 Aceites/Condimentos',
  enlatados: '🥫 Enlatados',
  especias: '🧂 Especias',
  lacteos: '🥛 Lácteos',
  otros: '📦 Otros',
}

const ALL_PRINCIPALS = [
  'Milanesa de calabacin a la napolitana','Calabacin en rodaja a la napolitana','Tarta masa de avena de jamon y queso',
  'Tarta masa de avena de panceta y maiz','Tarta masa de polenta de pollo y acelga','Cubos pollo salteado con chauchas',
  'Curry de pollo y garbanzos','Curry de pollo y remolacha','Pollo al pimenton Mima','Berengenas al horno a la napolitana',
  'Pastel de carne y zapallitos','Zapallitos rellenos de carne de res','Carne de cerdo a la olla del horno con verduras',
  'Pollo a la olla del horno con verduras','Carne de res a la olla del horno con verduras','Carne de res a presion con verduras',
  'Pollo a presion con chauchas','Pollo spicy salteado con cebolla','Soufle de zapallitos','Carne de cerdo al horno limon, especias',
  'Pastel de papas de carne de res','Caponatta de berenjenas','Lasagna tradicional con salsa bolognesa de res',
  'Lasagna de zuchinins con salsa bolognesa de pollo','Canelones de carne de rez con salsa filetto',
  'Canelones de pollo con salsa filetto','Canelones de pollo y choclo','Chow fan de camarones','Bao de cerdo',
  'Ramen de pollo','Lomitos con Papas Fritas','Omelette de jamon y queso','Bifes de pollo a la plancha',
  'Salchichas y huevos duros','Hamburguesa de res','Carbonada de cerdo','Bifes de cerdo salteados con cebolla',
  'Milanesas de soja a la napolitana','Bifes de cerdo a la plancha','Pescado y verduras al horno',
  'Costeletas de cerdo a la plancha','Chorizos al horno','Polenta con salsa bolognesa de res','Polenta gratin',
  'Salteado chino de pollo','Milanesas de berenjena','Chow mien','Fideos con salsa bolognesa de pollo',
  'Pechugas a la olla del horno con hierbas y gengibre','Tortilla de papas','Empanadas de pollo','Empanadas de cerdo',
  'Empanadas de pescado','Fajitas de res','Pescado gratin con verduras','Filet de pescado a la plancha',
  'Casuela de pollo','Pizza jamon y huevo','Pizza de pollo spicy','Pollo a la holla del horno con papas',
  'Cerdo a la holla del horno con verduras','Pollo y cebollas a la leche','Carbonada de res','Carbonada de pollo',
  'Lasagna de zuchinins','Osobuco al limon','Albondigas de cerdo','Albondigas de pollo','Albondigas de res',
  'Pastel de Pollo','Soufle de calabaza','Pastel de papas de pollo','Milanesas de zucchini','Pollo a la crema de verdeo',
  'Pollo tandoori marinado con yogur y especias','Niños envueltos de carne con salsa de tomate filetto',
  'Carne de cerdo a la mostaza y miel','Bifes de Cerdo salteado con jengibre ajo y cebolla de verdeo',
  'Ravioles de verdura con salsa scarparo','Empanadas de capresse','Bao de cerdo camaron repollo y verdeo gengibre',
  'Tortillas de lentejas','Soufflé de queso','Soufflé de brócoli con bechamel','Locro','Humita en olla',
  'Guiso de mondongo con garbanzos tomate y chorizo','Guiso de porotos alubias y chorizos','Bifes de cerdo',
  'Hamburguesas de pollo','Hamburguesas de cerdo','Curry de lentejas rojas y vegetales con jengibre rallado',
  'Sushi','Brochettes de carne','Pastel de papas con base de lenteja','Hamburguesa de garbanzos remolacha',
  'Hamburguesa de hongos portobello','Tortilla de acelga, espinaca, queso gratin','Soufle de zapallitos, panceta, morron',
  'Lasagna de masa, salsa carne bolognesa','Tarta de pescado','Tarta de verduras','Canelones de carne y acelga',
  'Canelones de pollo y zanahoria','Canelones de choclo y pollo','Arroz chino salteado','Risotto',
  'Sorrentinos de jamón y queso con salsa rosa','Gnocchis de papa con salsa estofado de res',
  'Tortilla de zucchini cebolla morada y queso provoleta','Hamburguesas de lentejas zanahoria rallada y avena',
  'Pastel de choclo y carne picada dulce tradicional','Omelette de espinacas',
]

const ALL_SIDES = [
  'Ensalada mixta','Arroz blanco','Puré de papas','Papas al horno','Ensalada de remolacha',
  'Ensalada de zanahoria rallada','Brócoli al vapor','Coliflor gratinada','Chauchas salteadas',
  'Zapallitos salteados','Calabaza asada','Espinaca salteada','Ensalada capresse',
  'Tomates asados','Acelga rehogada',
]

const ALL_RAW_INGREDIENTS = [...new Set(
  Object.values(ingredientsByMealName).flat().map(i => i.name)
)].sort()

function FreezerItem({ f, onDelete }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{f.name}</span>
        {f.note && <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>— {f.note}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8' }}>{f.qty} {f.qtyUnit || 'porciones'}</span>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{f.addedAt}</span>
        <button onClick={() => onDelete(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '0 2px' }}>✕</button>
      </div>
    </div>
  )
}

function getPantryStatus(item) {
  if (item.currentQty <= 0) return { label: 'Sin stock', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '🔴' }
  if (item.currentQty <= item.minQty) return { label: 'Stock bajo', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⚠️' }
  if (item.currentQty < item.targetQty) return { label: 'Mediano', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '🟡' }
  return { label: 'OK', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' }
}

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('freezer')

  // --- Freezer ---
  const [freezerStock, setFreezerStock] = useState([])
  const [newType, setNewType] = useState('principal')
  const [newSubtype, setNewSubtype] = useState('complete')
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState(1)
  const [newQtyUnit, setNewQtyUnit] = useState('porciones')
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    try { const s = localStorage.getItem('cook_freezer_stock_v2'); if (s) setFreezerStock(JSON.parse(s)) } catch {}
  }, [])
  const saveFreezer = (arr) => { setFreezerStock(arr); localStorage.setItem('cook_freezer_stock_v2', JSON.stringify(arr)) }
  const handleAddFreezer = () => {
    if (!newName.trim()) return
    saveFreezer([...freezerStock, { id: Date.now(), type: newType, subtype: newType !== 'raw' ? newSubtype : null, name: newName.trim(), qty: newQty, qtyUnit: newQtyUnit, note: newNote.trim(), addedAt: todayStr() }])
    setNewName(''); setNewQty(1); setNewQtyUnit('porciones'); setNewNote('')
  }
  const handleDeleteFreezer = (id) => saveFreezer(freezerStock.filter(f => f.id !== id))

  // --- Pantry ---
  const [pantryStock, setPantryStock] = useState([])
  const [pantryName, setPantryName] = useState('')
  const [pantryUnit, setPantryUnit] = useState('g')
  const [pantryCurrent, setPantryCurrent] = useState(0)
  const [pantryMin, setPantryMin] = useState(0)
  const [pantryTarget, setPantryTarget] = useState(0)
  const [pantryCategory, setPantryCategory] = useState('otros')
  const [pantryUseDropdown, setPantryUseDropdown] = useState(true)

  useEffect(() => {
    try { const s = localStorage.getItem('cook_pantry_stock_v1'); if (s) setPantryStock(JSON.parse(s)) } catch {}
  }, [])
  const savePantry = (arr) => { setPantryStock(arr); localStorage.setItem('cook_pantry_stock_v1', JSON.stringify(arr)) }
  const handleAddPantry = () => {
    if (!pantryName.trim()) return
    savePantry([...pantryStock, { id: Date.now(), name: pantryName.trim(), unit: pantryUnit, currentQty: Number(pantryCurrent), minQty: Number(pantryMin), targetQty: Number(pantryTarget), category: pantryCategory }])
    setPantryName(''); setPantryCurrent(0); setPantryMin(0); setPantryTarget(0)
  }
  const handleDeletePantry = (id) => savePantry(pantryStock.filter(p => p.id !== id))
  const handlePantryQtyChange = (id, val) => savePantry(pantryStock.map(p => p.id === id ? { ...p, currentQty: Number(val) } : p))
  const handlePantryMinChange = (id, val) => savePantry(pantryStock.map(p => p.id === id ? { ...p, minQty: Number(val) } : p))
  const handlePantryTargetChange = (id, val) => savePantry(pantryStock.map(p => p.id === id ? { ...p, targetQty: Number(val) } : p))

  const pantryLowItems = pantryStock.filter(p => p.currentQty <= p.minQty)

  const TAB = (active) => ({
    padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
    backgroundColor: active ? '#0f172a' : '#f1f5f9', color: active ? '#fff' : '#64748b',
  })

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      <div style={{ ...CARD, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: 'bold', color: '#0f172a' }}>📦 Stock</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Freezer y alacena — inventario de cocina</p>
        </div>
        {pantryLowItems.length > 0 && (
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400e' }}>⚠️ {pantryLowItems.length} ítem(s) bajo mínimo en alacena</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button style={TAB(activeTab === 'freezer')} onClick={() => setActiveTab('freezer')}>❄️ Stock Freezer</button>
        <button style={TAB(activeTab === 'pantry')} onClick={() => setActiveTab('pantry')}>
          🏪 Alacena{pantryLowItems.length > 0 ? ` ⚠️${pantryLowItems.length}` : ''}
        </button>
      </div>

      {/* ===== FREEZER ===== */}
      {activeTab === 'freezer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...CARD }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>➕ Agregar al Freezer</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>TIPO</label>
                <select value={newType} onChange={e => { setNewType(e.target.value); setNewName(''); setNewSubtype('complete') }} style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="principal">Principal</option>
                  <option value="side">Guarnición</option>
                  <option value="raw">Ingrediente crudo</option>
                </select>
              </div>
              {newType !== 'raw' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>TIPO</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setNewSubtype('complete')} style={{ padding: '7px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: newSubtype === 'complete' ? '#1d4ed8' : '#f1f5f9', color: newSubtype === 'complete' ? '#fff' : '#64748b' }}>🍽️ Completo</button>
                    <button onClick={() => setNewSubtype('minuta')} style={{ padding: '7px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: newSubtype === 'minuta' ? '#7e22ce' : '#f1f5f9', color: newSubtype === 'minuta' ? '#fff' : '#64748b' }}>⚡ Minuta</button>
                  </div>
                </div>
              )}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>NOMBRE</label>
                {newType === 'principal' ? (
                  <select value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="">Seleccionar plato...</option>
                    {ALL_PRINCIPALS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : newType === 'side' ? (
                  <select value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="">Seleccionar guarnición...</option>
                    {ALL_SIDES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <select value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="">Seleccionar ingrediente...</option>
                    {ALL_RAW_INGREDIENTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>CANTIDAD</label>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input type="number" value={newQty} onChange={e => setNewQty(Number(e.target.value))} min={1} style={{ width: '70px', padding: '7px 8px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  <select value={newQtyUnit} onChange={e => setNewQtyUnit(e.target.value)} style={{ padding: '7px 6px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    <option value="porciones">porciones</option>
                    <option value="u">unidades</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>NOTA</label>
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Opcional..." style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <button onClick={handleAddFreezer} style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Agregar</button>
            </div>
          </div>

          {freezerStock.length === 0 ? (
            <div style={{ ...CARD, textAlign: 'center', color: '#94a3b8', padding: '50px' }}>
              <p style={{ fontSize: '40px', margin: '0 0 8px 0' }}>❄️</p>
              <p style={{ margin: 0, fontSize: '15px' }}>El freezer está vacío.</p>
            </div>
          ) : (
            ['principal', 'side', 'raw'].map(type => {
              const items = freezerStock.filter(f => f.type === type)
              if (!items.length) return null
              const typeLabels = { principal: '🍽️ Principales', side: '🥗 Guarniciones', raw: '🥩 Ingredientes crudos' }
              // Group principals and sides by subtype
              const completeItems = items.filter(f => !f.subtype || f.subtype === 'complete')
              const minutaItems = items.filter(f => f.subtype === 'minuta')
              return (
                <div key={type} style={{ ...CARD }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{typeLabels[type]}</h4>
                  {/* For principal/side: group by subtype. For raw: flat list */}
                  {type === 'raw' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {items.map(f => <FreezerItem key={f.id} f={f} onDelete={handleDeleteFreezer} />)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {completeItems.length > 0 && (
                        <div>
                          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '5px' }}>🍽️ COMPLETO <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>({completeItems.length})</span></p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {completeItems.map(f => <FreezerItem key={f.id} f={f} onDelete={handleDeleteFreezer} />)}
                          </div>
                        </div>
                      )}
                      {minutaItems.length > 0 && (
                        <div>
                          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold', color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '5px' }}>⚡ MINUTA <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>({minutaItems.length})</span></p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {minutaItems.map(f => <FreezerItem key={f.id} f={f} onDelete={handleDeleteFreezer} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ===== PANTRY (ALACENA) ===== */}
      {activeTab === 'pantry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pantryLowItems.length > 0 && (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: '#92400e' }}>⚠️ Stock bajo: {pantryLowItems.map(p => p.name).join(', ')}</p>
            </div>
          )}

          <div style={{ ...CARD }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>➕ Agregar a la Alacena</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: '180px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  INGREDIENTE
                  <button onClick={() => setPantryUseDropdown(!pantryUseDropdown)} style={{ marginLeft: '6px', fontSize: '10px', background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '1px 6px', cursor: 'pointer' }}>{pantryUseDropdown ? 'texto libre' : 'lista'}</button>
                </label>
                {pantryUseDropdown ? (
                  <select value={pantryName} onChange={e => setPantryName(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="">Seleccionar...</option>
                    {ALL_RAW_INGREDIENTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <input type="text" value={pantryName} onChange={e => setPantryName(e.target.value)} placeholder="Nombre del ingrediente" style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                )}
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>UNIDAD</label>
                <select value={pantryUnit} onChange={e => setPantryUnit(e.target.value)} style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option>g</option><option>kg</option><option>ml</option><option>l</option><option>u</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>STOCK ACTUAL</label>
                <input type="number" value={pantryCurrent} onChange={e => setPantryCurrent(e.target.value)} min={0} style={{ width: '80px', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>MÍNIMO</label>
                <input type="number" value={pantryMin} onChange={e => setPantryMin(e.target.value)} min={0} style={{ width: '80px', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>OBJETIVO</label>
                <input type="number" value={pantryTarget} onChange={e => setPantryTarget(e.target.value)} min={0} style={{ width: '80px', padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>CATEGORÍA</label>
                <select value={pantryCategory} onChange={e => setPantryCategory(e.target.value)} style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  {Object.entries(PANTRY_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <button onClick={handleAddPantry} style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Agregar</button>
            </div>
          </div>

          {pantryStock.length === 0 ? (
            <div style={{ ...CARD, textAlign: 'center', color: '#94a3b8', padding: '50px' }}>
              <p style={{ fontSize: '40px', margin: '0 0 8px 0' }}>🏪</p>
              <p style={{ margin: 0, fontSize: '15px' }}>La alacena está vacía. Agregá ingredientes para hacer seguimiento de tu stock.</p>
            </div>
          ) : (
            Object.entries(PANTRY_CATEGORIES).map(([catKey, catLabel]) => {
              const items = pantryStock.filter(p => p.category === catKey)
              if (!items.length) return null
              return (
                <div key={catKey} style={{ ...CARD }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{catLabel}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {items.map(p => {
                      const st = getPantryStatus(p)
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', backgroundColor: st.bg, borderRadius: '8px', border: `1px solid ${st.border}`, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', flex: 1, minWidth: '120px' }}>{p.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Actual:</span>
                            <input type="number" value={p.currentQty} onChange={e => handlePantryQtyChange(p.id, e.target.value)} style={{ width: '64px', padding: '3px 6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }} />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{p.unit}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Mín:</span>
                            <input type="number" value={p.minQty} onChange={e => handlePantryMinChange(p.id, e.target.value)} style={{ width: '56px', padding: '3px 6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Obj:</span>
                            <input type="number" value={p.targetQty} onChange={e => handlePantryTargetChange(p.id, e.target.value)} style={{ width: '56px', padding: '3px 6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: st.color, backgroundColor: 'white', border: `1px solid ${st.border}`, borderRadius: '5px', padding: '2px 8px', whiteSpace: 'nowrap' }}>{st.icon} {st.label}</span>
                          <button onClick={() => handleDeletePantry(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '0 2px', marginLeft: 'auto' }}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
