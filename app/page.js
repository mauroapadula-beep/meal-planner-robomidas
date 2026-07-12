'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { principalsData, sidesData } from '../data/mealsData'

const DAY_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTH_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function getP(id) { return principalsData.find(p => p.id === String(id)) || null }
function getS(id) { return sidesData.find(s => s.id === String(id)) || null }

// ── Meal selector cell ──────────────────────────────────────────────────
function MealCell({ id, list, onChange, label, colorAccent, noSideLabel }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const item = list ? list.find(x => x.id === String(id)) : null
  const filtered = search.trim()
    ? list.filter(x => x.name.toLowerCase().includes(search.toLowerCase()))
    : list

  function close() { setOpen(false); setSearch('') }

  return (
    <div style={{ position: 'relative' }}>
      {/* Transparent backdrop — clicking outside the dropdown closes it */}
      {open && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
        />
      )}

      {/* Trigger row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '12px 14px', borderRadius: '10px', border: `2px solid ${open ? colorAccent : '#e2e8f0'}`,
          backgroundColor: open ? '#f8fafc' : '#fff', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
          position: 'relative', zIndex: open ? 201 : 1
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: colorAccent, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>{label}</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: id ? '#0f172a' : '#94a3b8', lineHeight: 1.3, fontStyle: id ? 'normal' : 'italic' }}>
            {item ? item.name : (noSideLabel ? 'Sin acompañamiento' : '— Sin asignar —')}
          </div>
          {item && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.kcal} kcal</div>}
        </div>
        <span style={{ color: '#94a3b8', fontSize: '14px', flexShrink: 0 }}>✏️</span>
      </div>

      {/* Dropdown — above backdrop */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: '4px',
          backgroundColor: '#fff', border: '2px solid ' + colorAccent, borderRadius: '10px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.16)'
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              autoFocus
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Buscar plato..."
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {noSideLabel && !search && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onChange(null); close() }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderBottom: '1px solid #f1f5f9', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                Sin acompañamiento
              </button>
            )}
            {filtered.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Sin resultados para "{search}"</div>
            )}
            {filtered.map(x => (
              <button
                key={x.id}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onChange(x.id); close() }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                  border: 'none', borderBottom: '1px solid #f1f5f9',
                  backgroundColor: x.id === String(id) ? '#eff6ff' : 'transparent',
                  cursor: 'pointer', fontSize: '13px', color: '#0f172a'
                }}>
                <span style={{ fontWeight: x.id === String(id) ? 'bold' : 'normal' }}>{x.name}</span>
                <span style={{ color: '#94a3b8', marginLeft: '6px', fontSize: '11px' }}>{x.kcal} kcal</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Task row (owner view — no check-off) ─────────────────────────────────
function TaskRow({ task, onMoveUp, onMoveDown, canUp, canDown, onRemove, onRollover }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
      borderRadius: '10px', border: '2px solid #e2e8f0', backgroundColor: '#fff'
    }}>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{task.text}</span>
      <span style={{ fontSize: '12px', color: '#64748b', flexShrink: 0, fontWeight: 'bold' }}>{task.minutes} min</span>
      {onRollover && (
        <button onClick={onRollover} title="Posponer al día siguiente"
          style={{ padding: '4px 9px', border: '1px solid #ffedd5', borderRadius: '6px', backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>↩ Posponer</button>
      )}
      <button onClick={onRemove} title="Eliminar del día"
        style={{ padding: '4px 8px', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>✕</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
        <button onClick={onMoveUp} disabled={!canUp}
          style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#fff', cursor: canUp ? 'pointer' : 'default', fontSize: '10px', color: canUp ? '#475569' : '#e2e8f0' }}>▲</button>
        <button onClick={onMoveDown} disabled={!canDown}
          style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#fff', cursor: canDown ? 'pointer' : 'default', fontSize: '10px', color: canDown ? '#475569' : '#e2e8f0' }}>▼</button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function TodayPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Today's date
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] // 'YYYY-MM-DD'
  const dayNum = today.getDate() // 1–31
  const dayName = DAY_ES[today.getDay()]
  const dateLabel = `${dayName}, ${dayNum} de ${MONTH_ES[today.getMonth()]} ${today.getFullYear()}`

  // Meals state
  const [meals, setMeals] = useState(null) // { lunch_principal_id, lunch_side_id, dinner_principal_id, dinner_side_id }
  const [mealsSaved, setMealsSaved] = useState(false)

  // Tasks state
  const [tasks, setTasks] = useState([]) // [{ id, text, minutes }] ordered
  const [taskSearch, setTaskSearch] = useState('')
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskMin, setNewTaskMin] = useState(30)
  const [showAddTask, setShowAddTask] = useState(false)
  const [shiftHours, setShiftHours] = useState(3)
  const [shiftStart, setShiftStart] = useState('13:30')
  const [removedTaskIds, setRemovedTaskIds] = useState(() => { try { const raw = localStorage.getItem('home_removed_tasks'); const all = raw ? JSON.parse(raw) : {}; return all[new Date().toISOString().split('T')[0]] || [] } catch { return [] } })
  const [lunchSideOverride, setLunchSideOverride] = useState(false)
  const [dinnerSideOverride, setDinnerSideOverride] = useState(false)

  // ── Auth check ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login')
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load meals ──
  useEffect(() => {
    if (!user) return
    function loadMeals() {
      try {
        const plan = JSON.parse(localStorage.getItem('robomidas_custom_monthly_plan') || '{}')
        const dayData = plan[String(dayNum)]
        setMeals(dayData || { lunch_principal_id: null, lunch_side_id: null, dinner_principal_id: null, dinner_side_id: null })
      } catch (e) {
        setMeals({ lunch_principal_id: null, lunch_side_id: null, dinner_principal_id: null, dinner_side_id: null })
      }
    }
    loadMeals()
    window.addEventListener('storage', loadMeals)
    return () => window.removeEventListener('storage', loadMeals)
  }, [user, dayNum])

  // ── Load tasks ──
  useEffect(() => {
    if (!user) return
    try {
      // Load shift config
      const cachedHours = localStorage.getItem('mastery_shift_hours')
      const cachedStart = localStorage.getItem('mastery_start_time')
      if (cachedHours) setShiftHours(Number(cachedHours))
      if (cachedStart) setShiftStart(cachedStart)

      // Load rules
      const rawRules = localStorage.getItem('matrix_mastery_rules_v2')
      const allRules = rawRules ? JSON.parse(rawRules) : []

      // Load custom order for today
      const rawOrder = localStorage.getItem('mastery_task_custom_order')
      const customOrder = rawOrder ? JSON.parse(rawOrder) : {}
      const todayOrderKey = `${todayStr}_order`
      const todayOrder = customOrder[todayOrderKey] || null // array of rule ids

      // Load custom text overrides
      const rawTexts = localStorage.getItem('mastery_daily_texts')
      const textOverrides = rawTexts ? JSON.parse(rawTexts) : {}

      // Filter rules for today: dayOverrides[dayName] > 0
      let todayRules = allRules
        .filter(rule => {
          const rank = rule.dayOverrides?.[dayName]
          return rank && rank > 0
        })
        .map(rule => ({
          id: rule.id,
          text: textOverrides[`${todayStr}_${rule.id}`] || rule.text,
          minutes: rule.minutes,
          category: rule.category,
          rank: rule.dayOverrides[dayName]
        }))

      // Load one-day custom tasks added from the home page
      const rawExtra = localStorage.getItem('home_extra_tasks')
      const extraTasks = rawExtra ? JSON.parse(rawExtra) : {}
      const todayExtra = extraTasks[todayStr] || []

      // Load removed task ids for today
      const rawRemoved = localStorage.getItem('home_removed_tasks')
      const removedAll = rawRemoved ? JSON.parse(rawRemoved) : {}
      const todayRemoved = removedAll[todayStr] || []
      setRemovedTaskIds(todayRemoved)

      // Combine: sorted matrix rules + today's extra tasks, minus removed
      let baseTasks = [...todayRules].sort((a, b) => a.rank - b.rank)
      const allTasks = [...baseTasks, ...todayExtra].filter(t => !todayRemoved.includes(t.id))

      // Apply saved order if exists
      if (todayOrder && todayOrder.length > 0) {
        const ordered = []
        todayOrder.forEach(id => {
          const found = allTasks.find(t => t.id === id)
          if (found) ordered.push(found)
        })
        allTasks.forEach(t => { if (!ordered.find(o => o.id === t.id)) ordered.push(t) })
        setTasks(ordered)
      } else {
        setTasks(allTasks)
      }
    } catch (e) {
      console.error('Error loading tasks:', e)
      setTasks([])
    }
    window.addEventListener('storage', loadTasksFn)
    return () => window.removeEventListener('storage', loadTasksFn)
    function loadTasksFn() {
      try {
        const rawRules = localStorage.getItem('matrix_mastery_rules_v2')
        const allRules = rawRules ? JSON.parse(rawRules) : []
        const rawTexts = localStorage.getItem('mastery_daily_texts')
        const textOverrides = rawTexts ? JSON.parse(rawTexts) : {}
        const rawRemoved = localStorage.getItem('home_removed_tasks')
        const removedAll = rawRemoved ? JSON.parse(rawRemoved) : {}
        const todayRemoved = removedAll[todayStr] || []
        const rawExtra = localStorage.getItem('home_extra_tasks')
        const extraTasks = rawExtra ? JSON.parse(rawExtra) : {}
        const todayExtra = extraTasks[todayStr] || []
        let todayRules = allRules.filter(rule => { const rank = rule.dayOverrides?.[dayName]; return rank && rank > 0 })
          .map(rule => ({ id: rule.id, text: textOverrides[`${todayStr}_${rule.id}`] || rule.text, minutes: rule.minutes, category: rule.category, rank: rule.dayOverrides[dayName] }))
        const allT = [...todayRules.sort((a, b) => a.rank - b.rank), ...todayExtra].filter(t => !todayRemoved.includes(t.id))
        setTasks(allT)
      } catch (e) { console.error(e) }
    }
  }, [user, todayStr, dayName])

  // ── Persist meal changes ──
  const NO_SIDE_KCAL = 880 // same threshold as the plan generator
  function saveMealChange(field, newId) {
    let updated = { ...meals, [field]: newId }
    // Auto-clear side if switching principal to a complete meal
    if (field === 'lunch_principal_id') {
      const p = getP(newId)
      if (p && p.kcal >= NO_SIDE_KCAL) { updated.lunch_side_id = null; setLunchSideOverride(false) }
    }
    if (field === 'dinner_principal_id') {
      const p = getP(newId)
      if (p && p.kcal >= NO_SIDE_KCAL) { updated.dinner_side_id = null; setDinnerSideOverride(false) }
    }
    setMeals(updated)
    setMealsSaved(false)
    // Write back to monthly plan
    try {
      const plan = JSON.parse(localStorage.getItem('robomidas_custom_monthly_plan') || '{}')
      plan[String(dayNum)] = updated
      localStorage.setItem('robomidas_custom_monthly_plan', JSON.stringify(plan))
      // Notify other open pages (cook, matrix) to reload
      window.dispatchEvent(new Event('storage'))
      setMealsSaved(true)
      setTimeout(() => setMealsSaved(false), 2000)
    } catch (e) { console.error(e) }
  }

  // ── Add a one-day custom task ──
  function addCustomTask() {
    if (!newTaskText.trim()) return
    const newTask = { id: `home-${Date.now()}`, text: newTaskText.trim(), minutes: Number(newTaskMin) || 30, isExtra: true }
    const updated = [...tasks, newTask]
    setTasks(updated)
    // Persist to home_extra_tasks
    try {
      const raw = localStorage.getItem('home_extra_tasks')
      const all = raw ? JSON.parse(raw) : {}
      all[todayStr] = [...(all[todayStr] || []), newTask]
      localStorage.setItem('home_extra_tasks', JSON.stringify(all))
    } catch (e) { console.error(e) }
    setNewTaskText('')
    setNewTaskMin(30)
    setShowAddTask(false)
  }

  // ── Move task ──
  function moveTask(idx, dir) {
    const newTasks = [...tasks]
    const target = idx + dir
    if (target < 0 || target >= newTasks.length) return
    ;[newTasks[idx], newTasks[target]] = [newTasks[target], newTasks[idx]]
    setTasks(newTasks)
    // Persist order
    try {
      const rawOrder = localStorage.getItem('mastery_task_custom_order')
      const customOrder = rawOrder ? JSON.parse(rawOrder) : {}
      customOrder[`${todayStr}_order`] = newTasks.map(t => t.id)
      localStorage.setItem('mastery_task_custom_order', JSON.stringify(customOrder))
    } catch (e) { console.error(e) }
  }

  // ── Remove task from today ──
  function removeTaskToday(taskId) {
    const updated = [...removedTaskIds, taskId]
    setRemovedTaskIds(updated)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try {
      const raw = localStorage.getItem('home_removed_tasks')
      const all = raw ? JSON.parse(raw) : {}
      all[todayStr] = updated
      localStorage.setItem('home_removed_tasks', JSON.stringify(all))
    } catch (e) { console.error(e) }
  }

  // ── Rollover task to tomorrow ──
  function rolloverTask(task) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const rolledTask = { id: `rolled-${Date.now()}-${task.id}`, text: `↩ ${task.text}`, minutes: task.minutes }
    try {
      const raw = localStorage.getItem('home_extra_tasks')
      const all = raw ? JSON.parse(raw) : {}
      all[tomorrowStr] = [...(all[tomorrowStr] || []), rolledTask]
      localStorage.setItem('home_extra_tasks', JSON.stringify(all))
    } catch (e) { console.error(e) }
    removeTaskToday(task.id)
  }

  // ── Calorie totals + side-visibility rules ──
  const lp = meals ? getP(meals.lunch_principal_id) : null
  const ls = meals ? getS(meals.lunch_side_id) : null
  const dp = meals ? getP(meals.dinner_principal_id) : null
  const ds = meals ? getS(meals.dinner_side_id) : null
  // A complete meal (≥880 kcal) never needs a side
  const showLunchSide  = !lp || lp.kcal < NO_SIDE_KCAL || lunchSideOverride
  const showDinnerSide = !dp || dp.kcal < NO_SIDE_KCAL || dinnerSideOverride
  const totalKcal = (lp?.kcal || 0) + (showLunchSide ? (ls?.kcal || 0) : 0) + (dp?.kcal || 0) + (showDinnerSide ? (ds?.kcal || 0) : 0)
  const totalTaskMin = tasks.reduce((s, t) => s + (t.minutes || 0), 0)
  const shiftTotalMin = shiftHours * 60
  const remainingMin = Math.max(0, shiftTotalMin - totalTaskMin)
  const usedPct = shiftTotalMin > 0 ? Math.min(100, (totalTaskMin / shiftTotalMin) * 100) : 0
  const visibleTasks = taskSearch.trim() ? tasks.filter(t => t.text.toLowerCase().includes(taskSearch.toLowerCase())) : tasks

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '16px', color: '#94a3b8' }}>
        Cargando...
      </div>
    )
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: 'bold', color: '#0f172a' }}>
            ¡Hola, {userName}! 👋
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>{dateLabel}</p>
        </div>
        {totalKcal > 0 && (
          <div style={{ textAlign: 'center', backgroundColor: totalKcal < 1750 ? '#fff7ed' : totalKcal > 1850 ? '#fef2f2' : '#f0fdf4', border: `2px solid ${totalKcal < 1750 ? '#fed7aa' : totalKcal > 1850 ? '#fecaca' : '#bbf7d0'}`, borderRadius: '12px', padding: '12px 20px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: totalKcal < 1750 ? '#c2410c' : totalKcal > 1850 ? '#dc2626' : '#16a34a' }}>{totalKcal} kcal</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>TOTAL DÍA</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

        {/* ── LEFT: Meals ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>🍽️ Comidas de hoy</h2>
            {mealsSaved && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>✅ Guardado</span>}
            {!meals && <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sin plan generado para este mes</span>}
          </div>

          {meals && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ALMUERZO */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <div style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '14px 14px 0 0' }}>
                  <span style={{ fontSize: '18px' }}>☀️</span>
                  <span style={{ fontWeight: 'bold', color: '#1d4ed8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Almuerzo</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>
                    {(lp?.kcal || 0) + (ls?.kcal || 0)} kcal
                  </span>
                </div>
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <MealCell
                    id={meals.lunch_principal_id} list={principalsData}
                    onChange={id => saveMealChange('lunch_principal_id', id)}
                    label="Principal" colorAccent="#1d4ed8"
                  />
                  {showLunchSide ? (
                    <MealCell
                      id={meals.lunch_side_id} list={sidesData}
                      onChange={id => saveMealChange('lunch_side_id', id)}
                      label="Guarnición" colorAccent="#0891b2" noSideLabel
                    />
                  ) : (
                    <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Plato completo — sin guarnición</span>
                      <button onClick={() => setLunchSideOverride(true)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#3b82f6', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>+ Agregar guarnición</button>
                    </div>
                  )}
                </div>
              </div>

              {/* CENA */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <div style={{ backgroundColor: '#faf5ff', borderBottom: '1px solid #e9d5ff', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '14px 14px 0 0' }}>
                  <span style={{ fontSize: '18px' }}>🌙</span>
                  <span style={{ fontWeight: 'bold', color: '#7e22ce', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cena</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9333ea', fontWeight: 'bold' }}>
                    {(dp?.kcal || 0) + (showDinnerSide ? (ds?.kcal || 0) : 0)} kcal
                  </span>
                </div>
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <MealCell
                    id={meals.dinner_principal_id} list={principalsData}
                    onChange={id => saveMealChange('dinner_principal_id', id)}
                    label="Principal" colorAccent="#7e22ce"
                  />
                  {showDinnerSide ? (
                    <MealCell
                      id={meals.dinner_side_id} list={sidesData}
                      onChange={id => saveMealChange('dinner_side_id', id)}
                      label="Guarnición" colorAccent="#9333ea" noSideLabel
                    />
                  ) : (
                    <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Plato completo — sin guarnición</span>
                      <button onClick={() => setDinnerSideOverride(true)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#3b82f6', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>+ Agregar guarnición</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {!meals && (
            <div style={{ backgroundColor: '#fff', border: '1px dashed #cbd5e1', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>📅</p>
              <p style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#64748b', fontWeight: 'bold' }}>Sin plan para hoy</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Generá un plan mensual en la sección <strong>Plan</strong> para ver tus comidas aquí.</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Tasks ── */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>🎯 Tareas del día</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Turno: {shiftStart} · {shiftHours}h</span>
            </div>

            {/* Time budget bar */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{totalTaskMin} min</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Asignados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: remainingMin === 0 ? '#dc2626' : '#16a34a' }}>{remainingMin} min</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Disponibles</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>{shiftTotalMin} min</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Turno total</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${usedPct}%`, height: '100%', borderRadius: '4px', transition: 'width 0.4s',
                  backgroundColor: usedPct >= 100 ? '#dc2626' : usedPct >= 85 ? '#f59e0b' : '#2563eb'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>0</span>
                <span style={{ fontSize: '10px', color: usedPct >= 100 ? '#dc2626' : '#64748b', fontWeight: usedPct >= 100 ? 'bold' : 'normal' }}>
                  {usedPct >= 100 ? '⚠️ Turno completo' : `${Math.round(usedPct)}% ocupado`}
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{shiftTotalMin} min</span>
              </div>
            </div>
          </div>

          {/* Search + Add row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text" value={taskSearch} onChange={e => setTaskSearch(e.target.value)}
              placeholder="🔍 Buscar tarea..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
            />
            <button onClick={() => setShowAddTask(!showAddTask)}
              style={{ padding: '8px 14px', borderRadius: '9px', border: '2px solid #e2e8f0', backgroundColor: showAddTask ? '#eff6ff' : '#fff', color: showAddTask ? '#2563eb' : '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              ➕ Nueva
            </button>
          </div>

          {/* Add new task form */}
          {showAddTask && (
            <div style={{ backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', padding: '14px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#1d4ed8', textTransform: 'uppercase' }}>Nueva tarea para hoy</p>
              <input
                type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                placeholder="Descripción de la tarea..."
                onKeyDown={e => { if (e.key === 'Enter') addCustomTask() }}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Duración (min):</label>
                <input
                  type="number" value={newTaskMin} onChange={e => setNewTaskMin(e.target.value)}
                  min={1} max={480}
                  style={{ width: '70px', padding: '7px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={addCustomTask}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  Agregar
                </button>
                <button onClick={() => setShowAddTask(false)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <div style={{ backgroundColor: '#fff', border: '1px dashed #cbd5e1', borderRadius: '14px', padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '28px', margin: '0 0 8px 0' }}>📋</p>
              <p style={{ fontSize: '13px', margin: 0 }}>No hay tareas programadas para {dayName}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {visibleTasks.length === 0 && taskSearch && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Sin resultados para "{taskSearch}"</div>
              )}
              {visibleTasks.map((task, idx) => {
                const realIdx = tasks.findIndex(t => t.id === task.id)
                return (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onMoveUp={() => moveTask(realIdx, -1)}
                    onMoveDown={() => moveTask(realIdx, 1)}
                    canUp={realIdx > 0}
                    canDown={realIdx < tasks.length - 1}
                    onRemove={() => removeTaskToday(task.id)}
                    onRollover={() => rolloverTask(task)}
                  />
                )
              })}
            </div>
          )}

          {/* Profile summary card */}
          {user && (
            <div style={{ marginTop: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>👤</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{userName}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</div>
                </div>
              </div>
              {user.user_metadata?.goal && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {user.user_metadata.goal && <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '3px 9px', borderRadius: '99px', color: '#475569' }}>🎯 {user.user_metadata.goal}</span>}
                  {user.user_metadata.activity && <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '3px 9px', borderRadius: '99px', color: '#475569' }}>⚡ {user.user_metadata.activity}</span>}
                  {user.user_metadata.min_kcal && <span style={{ fontSize: '11px', backgroundColor: '#f0fdf4', padding: '3px 9px', borderRadius: '99px', color: '#16a34a' }}>{user.user_metadata.min_kcal}–{user.user_metadata.max_kcal} kcal</span>}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
