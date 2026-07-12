'use client';

import { useEffect, useState, useMemo } from 'react'
import { mealCookTimes } from '../../data/mealCookTimes'
import { principalsData, sidesData } from '../../data/mealsData'


const daysOfWeekES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function Full7DayMatrixMasteryEngine() {
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0])
  const [dayName, setDayName] = useState(() => ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date().getDay()])
  const [dayNumber, setDayNumber] = useState(2)
  const [completedTaskLog, setCompletedTaskLog] = useState({})
  const [absentDates, setAbsentDates] = useState({})
  const [backlogPool, setBacklogPool] = useState([])
  const [shiftHours, setShiftHours] = useState(3)
  const [startTime, setStartTime] = useState('13:30')
  const [taskCustomOrder, setTaskCustomOrder] = useState({})
  const [dailyDurationOverrides, setDailyDurationOverrides] = useState({})
  const [dailyTextOverrides, setDailyTextOverrides] = useState({})
  const [customRules, setCustomRules] = useState([
    { id: 'rule-laundry', text: 'Lavar/Colgar ropa', type: 'daily', allowedDays: daysOfWeekES, intervalDays: 0, minutes: 20, category: 'laundry', dayOverrides: { 'Domingo': 0, 'Lunes': 1, 'Martes': 1, 'Miércoles': 1, 'Jueves': 1, 'Viernes': 1, 'Sábado': 0 } },
    { id: 'rule-dishes', text: 'Lavar platos', type: 'daily', allowedDays: daysOfWeekES, intervalDays: 0, minutes: 20, category: 'general', dayOverrides: { 'Domingo': 0, 'Lunes': 2, 'Martes': 2, 'Miércoles': 2, 'Jueves': 2, 'Viernes': 2, 'Sábado': 0 } },
    { id: 'rule-lunch', text: 'Cocinar almuerzo', type: 'daily', allowedDays: daysOfWeekES, intervalDays: 0, minutes: 30, category: 'general', dayOverrides: { 'Domingo': 0, 'Lunes': 3, 'Martes': 3, 'Miércoles': 3, 'Jueves': 3, 'Viernes': 3, 'Sábado': 0 } },
    { id: 'rule-sweep', text: 'Barrer pisos', type: 'weekly', allowedDays: ['Martes', 'Miércoles', 'Jueves'], intervalDays: 0, minutes: 30, category: 'general', dayOverrides: { 'Domingo': 0, 'Lunes': 0, 'Martes': 5, 'Miércoles': 2, 'Jueves': 5, 'Viernes': 0, 'Sábado': 0 } },
    { id: 'rule-mopping', text: 'Mopear pisos', type: 'weekly', allowedDays: ['Viernes', 'Lunes'], intervalDays: 0, minutes: 40, category: 'general', dayOverrides: { 'Domingo': 0, 'Lunes': 6, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 4, 'Sábado': 0 } },
    { id: 'rule-bathroom-deep', text: 'Limpieza profunda de baños', type: 'weekly', allowedDays: ['Lunes', 'Viernes'], intervalDays: 0, minutes: 40, category: 'cleaning', dayOverrides: { 'Domingo': 0, 'Lunes': 7, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 1, 'Sábado': 0 } }
  ])
  const [newChoreText, setNewChoreText] = useState('')
  const [newChoreType, setNewChoreType] = useState('daily')
  const [newChoreCategory, setNewChoreCategory] = useState('general')
  const [customIntervalDays, setCustomIntervalDays] = useState(30)
  const [customIntervalStartDate, setCustomIntervalStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newChoreMinutes, setNewChoreMinutes] = useState(30)
  const [newDayOverrides, setNewDayOverrides] = useState({ 'Domingo': 0, 'Lunes': 1, 'Martes': 1, 'Miércoles': 1, 'Jueves': 1, 'Viernes': 1, 'Sábado': 0 })
  const [expandedDayDurations, setExpandedDayDurations] = useState({})
  const [addRuleOpen, setAddRuleOpen] = useState(false)
  const [expandedRuleCards, setExpandedRuleCards] = useState({})
  const [fillRules, setFillRules] = useState(() => { try { return JSON.parse(localStorage.getItem('matrix_fill_rules') || 'null') || { autoFillEnabled: true, autoFillMinThreshold: 10, autoTrimEnabled: true, showDecisionsLog: false } } catch { return { autoFillEnabled: true, autoFillMinThreshold: 10, autoTrimEnabled: true, showDecisionsLog: false } } })
  const [rulesPanelOpen, setRulesPanelOpen] = useState(false)
  const [highlightedTaskId, setHighlightedTaskId] = useState(null)
  function saveFillRules(updated) { setFillRules(updated); localStorage.setItem('matrix_fill_rules', JSON.stringify(updated)) }
  const [smartRules, setSmartRules] = useState(() => { try { return JSON.parse(localStorage.getItem('matrix_smart_rules') || '[]') } catch { return [] } })
  const [editingSmartRuleId, setEditingSmartRuleId] = useState(null)
  const [draftRule, setDraftRule] = useState(null)
  const [panelSections, setPanelSections] = useState({ suggestions: true, smartRules: false, filler: false, config: false })
  function toggleSection(k) { setPanelSections(p => ({ ...p, [k]: !p[k] })) }
  function saveSmartRuleDraft() { if (!draftRule?.name?.trim()) return; const u = editingSmartRuleId === 'new' ? [...smartRules, draftRule] : smartRules.map(r => r.id === draftRule.id ? draftRule : r); setSmartRules(u); localStorage.setItem('matrix_smart_rules', JSON.stringify(u)); setEditingSmartRuleId(null); setDraftRule(null) }
  function deleteSmartRule(id) { const u = smartRules.filter(r => r.id !== id); setSmartRules(u); localStorage.setItem('matrix_smart_rules', JSON.stringify(u)) }
  function toggleSmartRuleEnabled(id) { const u = smartRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r); setSmartRules(u); localStorage.setItem('matrix_smart_rules', JSON.stringify(u)) }
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [taskDropOpen, setTaskDropOpen] = useState(false)
  const [condTaskSearches, setCondTaskSearches] = useState({})
  const [openCondDrop, setOpenCondDrop] = useState(null)
  const [actSuppressSearch, setActSuppressSearch] = useState('')
  const [actSuppressDrop, setActSuppressDrop] = useState(false)
  function startNewSmartRule() { setDraftRule({ id: `sr-${Date.now()}`, name: '', enabled: true, logic: 'AND', conditions: [{ id: `c-${Date.now()}`, type: 'days', operator: 'is', value: 'Lunes,Martes,Miércoles,Jueves,Viernes' }, { id: `c2-${Date.now()}`, type: 'freeTime', operator: '>=', value: '20' }], action: { type: 'fill_shift', taskText: '', minutes: 15 } }); setEditingSmartRuleId('new'); setTaskSearchQuery(''); setTaskDropOpen(false); setCondTaskSearches({}); setOpenCondDrop(null); setActSuppressSearch(''); setActSuppressDrop(false); setPanelSections(p => ({ ...p, smartRules: true })) }
  function startEditSmartRule(r) { setDraftRule(JSON.parse(JSON.stringify(r))); setEditingSmartRuleId(r.id); setTaskSearchQuery(r.action?.taskText || ''); setTaskDropOpen(false); setCondTaskSearches({}); setOpenCondDrop(null); setActSuppressSearch(customRules.find(x => x.id === r.action?.taskId)?.text || ''); setActSuppressDrop(false); setPanelSections(p => ({ ...p, smartRules: true })) }
  function addCond() { setDraftRule(d => ({ ...d, conditions: [...d.conditions, { id: `c-${Date.now()}`, type: 'days', operator: 'is', value: 'Lunes,Martes,Miércoles,Jueves,Viernes' }] })) }
  function removeCond(cid) { setDraftRule(d => ({ ...d, conditions: d.conditions.filter(c => c.id !== cid) })) }
  function updateCond(cid, field, val) { setDraftRule(d => ({ ...d, conditions: d.conditions.map(c => c.id === cid ? { ...c, [field]: val } : c) })) }
  function toggleDayInCond(cid, dayStr) { setDraftRule(d => ({ ...d, conditions: d.conditions.map(c => { if (c.id !== cid) return c; const current = (c.value || '').split(',').filter(Boolean); const next = current.includes(dayStr) ? current.filter(x => x !== dayStr) : [...current, dayStr]; return { ...c, value: next.join(',') } }) })) }
  function updateDraftAction(field, val) { setDraftRule(d => ({ ...d, action: { ...d.action, [field]: val } })) }
  const [fillerPool, setFillerPool] = useState([])
  const [newFillerRuleId, setNewFillerRuleId] = useState('')
  const [newFillerMinutes, setNewFillerMinutes] = useState(15)
  const [taskAssignmentLog, setTaskAssignmentLog] = useState(() => { try { return JSON.parse(localStorage.getItem('mastery_assignment_log') || '{}') } catch { return {} } })

  useEffect(() => {
    const cachedBacklog = localStorage.getItem('mastery_backlog_pool')
    if (cachedBacklog) { try { setBacklogPool(JSON.parse(cachedBacklog)) } catch (e) { console.error(e) } }
    const cachedStart = localStorage.getItem('mastery_start_time')
    const cachedHours = localStorage.getItem('mastery_shift_hours')
    if (cachedStart) setStartTime(cachedStart)
    if (cachedHours) setShiftHours(Number(cachedHours))
    const cachedRules = localStorage.getItem('matrix_mastery_rules_v2')
    if (cachedRules) { try { setCustomRules(JSON.parse(cachedRules)) } catch (e) { console.error(e) } }
    const cachedDailyDurations = localStorage.getItem('mastery_daily_durations')
    if (cachedDailyDurations) { try { setDailyDurationOverrides(JSON.parse(cachedDailyDurations)) } catch (e) { console.error(e) } }
    const cachedDailyTexts = localStorage.getItem('mastery_daily_texts')
    if (cachedDailyTexts) { try { setDailyTextOverrides(JSON.parse(cachedDailyTexts)) } catch (e) { console.error(e) } }
    const cachedLog = localStorage.getItem('mastery_completed_log')
    if (cachedLog) { try { setCompletedTaskLog(JSON.parse(cachedLog)) } catch (e) { console.error(e) } }
    const cachedFiller = localStorage.getItem('mastery_filler_pool')
    if (cachedFiller) { try { setFillerPool(JSON.parse(cachedFiller)) } catch (e) { console.error(e) } }
  }, [])

  useEffect(() => {
    if (!selectedDateStr) return
    const dateObj = new Date(selectedDateStr + 'T00:00:00')
    setDayName(daysOfWeekES[dateObj.getDay()])
    const dayOfMonth = dateObj.getDate()
    setDayNumber(dayOfMonth <= 30 ? dayOfMonth : (dayOfMonth % 30) || 1)
  }, [selectedDateStr])

  // ── Load meal plan from localStorage (same source as Home + Cook) ──
  useEffect(() => {
    function loadMeal() {
      try {
        const raw = localStorage.getItem('robomidas_custom_monthly_plan')
        if (!raw) { setTodayMeal(null); return }
        const monthly = JSON.parse(raw)
        const dayOfMonth = new Date(selectedDateStr + 'T00:00:00').getDate()
        const dayData = monthly[String(dayOfMonth)]
        if (!dayData) { setTodayMeal(null); return }
        const lp = principalsData.find(p => p.id === String(dayData.lunch_principal_id))
        const ls = sidesData.find(s => s.id === String(dayData.lunch_side_id))
        const dp = principalsData.find(p => p.id === String(dayData.dinner_principal_id))
        const ds = sidesData.find(s => s.id === String(dayData.dinner_side_id))
        setTodayMeal({
          lunch:  { principal: lp?.name || null, side: ls?.name || null },
          dinner: { principal: dp?.name || null, side: ds?.name || null },
        })
      } catch (e) { setTodayMeal(null) }
    }
    loadMeal()
    // Also re-load if another tab/page updates localStorage
    window.addEventListener('storage', loadMeal)
    return () => window.removeEventListener('storage', loadMeal)
  }, [selectedDateStr])

  const updateStartTimeAndPersist = (val) => { setStartTime(val); localStorage.setItem('mastery_start_time', val) }
  const updateShiftHoursAndPersist = (val) => { const num = Number(val) || 0; setShiftHours(num); localStorage.setItem('mastery_shift_hours', num.toString()) }
  const handleDailyDurationChange = (originalId, minutesVal) => { const numericMinutes = Math.max(0, parseInt(minutesVal) || 0); const overrideKey = `${selectedDateStr}_${originalId}`; const updated = { ...dailyDurationOverrides, [overrideKey]: numericMinutes }; setDailyDurationOverrides(updated); localStorage.setItem('mastery_daily_durations', JSON.stringify(updated)) }
  const handleDailyTextChange = (originalId, textVal) => { const overrideKey = `${selectedDateStr}_${originalId}`; const updated = { ...dailyTextOverrides, [overrideKey]: textVal }; setDailyTextOverrides(updated); localStorage.setItem('mastery_daily_texts', JSON.stringify(updated)) }
  const updateMasterRuleProperty = (id, propertyKey, value) => { const updatedRules = customRules.map(rule => { if (rule.id === id) { let parsedValue = value; if (['minutes', 'intervalDays'].includes(propertyKey)) { parsedValue = parseInt(value) || 0 }; return { ...rule, [propertyKey]: parsedValue } }; return rule }); setCustomRules(updatedRules); localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRules)) }
  const updateMasterRuleMatrixDay = (ruleId, targetDayStr, rankValue) => { const updatedRules = customRules.map(rule => { if (rule.id === ruleId) { const freshDayOverrides = { ...rule.dayOverrides, [targetDayStr]: parseInt(rankValue) || 0 }; const newlyDiscoveredDays = Object.keys(freshDayOverrides).filter(d => freshDayOverrides[d] > 0); return { ...rule, dayOverrides: freshDayOverrides, allowedDays: newlyDiscoveredDays.length > 0 ? newlyDiscoveredDays : rule.allowedDays } }; return rule }); setCustomRules(updatedRules); localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRules)) }

  function handleAddRule(e) {
    e.preventDefault()
    if (!newChoreText.trim()) return
    const autoAllowedDays = Object.keys(newDayOverrides).filter(d => newDayOverrides[d] > 0)
    const newRule = { id: `custom-rule-${Date.now()}`, text: newChoreText, type: newChoreType, category: newChoreCategory, allowedDays: autoAllowedDays.length > 0 ? autoAllowedDays : daysOfWeekES, intervalDays: newChoreType === 'interval' ? Number(customIntervalDays) || 30 : 0, intervalStartDate: newChoreType === 'interval' ? customIntervalStartDate : null, minutes: Number(newChoreMinutes) || 30, dayOverrides: { ...newDayOverrides } }
    const updatedRulesList = [...customRules, newRule]
    setCustomRules(updatedRulesList)
    localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRulesList))
    setNewChoreText('')
    setNewDayOverrides({ 'Domingo': 0, 'Lunes': 1, 'Martes': 1, 'Miércoles': 1, 'Jueves': 1, 'Viernes': 1, 'Sábado': 0 })
  }

  function handleDeleteRule(id) { const updatedRulesList = customRules.filter(r => r.id !== id); setCustomRules(updatedRulesList); localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRulesList)) }
  const updateRuleDayDuration = (ruleId, dayStr, minutes) => { const updatedRules = customRules.map(rule => { if (rule.id === ruleId) { const newDayDurations = { ...(rule.dayDurations || {}), [dayStr]: parseInt(minutes) || 0 }; return { ...rule, dayDurations: newDayDurations } }; return rule }); setCustomRules(updatedRules); localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRules)) }
  const toggleDayDurationsExpanded = (ruleId) => { setExpandedDayDurations(prev => ({ ...prev, [ruleId]: !prev[ruleId] })) }
  function handleAddFiller(e) { e.preventDefault(); if (!newFillerRuleId) return; const rule = customRules.find(r => r.id === newFillerRuleId); if (!rule) return; if (fillerPool.some(f => f.ruleId === newFillerRuleId)) return; const item = { id: `filler-${Date.now()}`, ruleId: newFillerRuleId, text: rule.text, minutes: Number(newFillerMinutes) || rule.minutes }; const updated = [...fillerPool, item]; setFillerPool(updated); localStorage.setItem('mastery_filler_pool', JSON.stringify(updated)); setNewFillerRuleId(''); setNewFillerMinutes(15) }
  function handleDeleteFiller(id) { const updated = fillerPool.filter(f => f.id !== id); setFillerPool(updated); localStorage.setItem('mastery_filler_pool', JSON.stringify(updated)) }
  function useFillerTask(filler) { const instanceId = `filler-${Date.now()}-${filler.id}`; const item = { id: instanceId, originalId: filler.id, label: filler.text, duration: filler.minutes, type: 'general', computedActiveWeight: 9, targetDate: selectedDateStr }; setBacklogPool(prev => { const updated = [...prev, item]; localStorage.setItem('mastery_backlog_pool', JSON.stringify(updated)); return updated }) }

  function handleClearAllStorage() { window.localStorage.clear(); window.location.reload() }

  const toggleTaskCheck = (key) => setCompletedTaskLog(prev => ({ ...prev, [key]: !prev[key] }))

  function triggerManualTaskRollover(taskItem) {
    if (taskItem.displayLabel.includes('🔄 Rollover:')) return
    const rule = customRules.find(r => r.id === (taskItem.originalId || taskItem.id))
    const nextDate = new Date(selectedDateStr + 'T00:00:00')
    nextDate.setDate(nextDate.getDate() + 1)
    if (rule && rule.type !== 'interval') {
      let guard = 0
      while ((rule.dayOverrides?.[daysOfWeekES[nextDate.getDay()]] ?? 0) === 0 && guard < 7) {
        nextDate.setDate(nextDate.getDate() + 1)
        guard++
      }
    }
    const nextDateStr = nextDate.toISOString().split('T')[0]
    const instanceId = `rolled-${Date.now()}-${taskItem.originalId || taskItem.id}`
    const rolledItem = { id: instanceId, originalId: taskItem.originalId || taskItem.id, label: `🔄 Rollover: ${taskItem.displayLabel.replace('🔄 Rollover: ', '')}`, duration: taskItem.duration, type: taskItem.type, computedActiveWeight: taskItem.computedActiveWeight, targetDate: nextDateStr }
    setBacklogPool(prev => { const updated = [...prev, rolledItem]; localStorage.setItem('mastery_backlog_pool', JSON.stringify(updated)); return updated })
    const key = `hidden-${selectedDateStr}-${taskItem.originalId}`
    setCompletedTaskLog(prev => { const updated = { ...prev, [key]: true }; localStorage.setItem('mastery_completed_log', JSON.stringify(updated)); return updated })
  }

  function toggleAbsenceState() { setAbsentDates(prev => ({ ...prev, [selectedDateStr]: !absentDates[selectedDateStr] })) }
  function restoreSkippedTask(originalId) { const key = `hidden-${selectedDateStr}-${originalId}`; setCompletedTaskLog(prev => { const updated = { ...prev }; delete updated[key]; localStorage.setItem('mastery_completed_log', JSON.stringify(updated)); return updated }) }

  function moveTaskPriorityUp(originalId, currentIndex, list) { if (currentIndex === 0) return; const nextOrderMap = { ...taskCustomOrder }; list.forEach((item, idx) => { if (nextOrderMap[item.originalId] === undefined) nextOrderMap[item.originalId] = item.computedActiveWeight * 100 + idx }); const currentItemLabel = list[currentIndex].originalId; const aboveItemLabel = list[currentIndex - 1].originalId; nextOrderMap[currentItemLabel] = nextOrderMap[aboveItemLabel] - 1; setTaskCustomOrder(nextOrderMap) }
  function moveTaskPriorityDown(originalId, currentIndex, list) { if (currentIndex === list.length - 1) return; const nextOrderMap = { ...taskCustomOrder }; list.forEach((item, idx) => { if (nextOrderMap[item.originalId] === undefined) nextOrderMap[item.originalId] = item.computedActiveWeight * 100 + idx }); const currentItemLabel = list[currentIndex].originalId; const belowItemLabel = list[currentIndex + 1].originalId; nextOrderMap[currentItemLabel] = nextOrderMap[belowItemLabel] + 1; setTaskCustomOrder(nextOrderMap) }

  const [todayMeal, setTodayMeal] = useState(null)
  const lunchLabel = todayMeal ? (todayMeal.lunch.principal ? (todayMeal.lunch.side ? `${todayMeal.lunch.principal} + ${todayMeal.lunch.side}` : todayMeal.lunch.principal) : 'Leftovers Shift') : 'Leftovers Shift'
  const dinnerLabel = todayMeal ? (todayMeal.dinner.principal ? (todayMeal.dinner.side ? `${todayMeal.dinner.principal} + ${todayMeal.dinner.side}` : todayMeal.dinner.principal) : null) : null

  const compileBaseTasksBeforePacking = () => {
    let list = []
    customRules.forEach(rule => {
      let isMatch = false
      if (rule.type === 'interval') {
        const startDate = rule.intervalStartDate || selectedDateStr
        const msPerDay = 86400000
        const daysSince = Math.round((new Date(selectedDateStr + 'T00:00:00') - new Date(startDate + 'T00:00:00')) / msPerDay)
        if (daysSince >= 0 && Number(rule.intervalDays) > 0 && daysSince % Number(rule.intervalDays) === 0) isMatch = true
      } else { const todayWeightValue = rule.dayOverrides?.[dayName] ?? 0; if (todayWeightValue > 0) isMatch = true }
      if (isMatch) {
        const finalActiveWeight = rule.dayOverrides?.[dayName] || 5
        const perDayDuration = rule.dayDurations?.[dayName]
        const savedDuration = dailyDurationOverrides[`${selectedDateStr}_${rule.id}`]
        const savedText = dailyTextOverrides[`${selectedDateStr}_${rule.id}`]
        let finalLabel = savedText !== undefined ? savedText : rule.text
        if (rule.id === 'rule-lunch' && todayMeal) { finalLabel = `${savedText !== undefined ? savedText : 'Cocinar almuerzo'}: ${lunchLabel}` }
        if (dinnerLabel && savedText === undefined && rule.text.toLowerCase().includes('cena')) { finalLabel = `${rule.text}: ${dinnerLabel}` }
        const autoLunchTime = (rule.id === 'rule-lunch' && todayMeal?.lunch?.principal) ? (mealCookTimes[todayMeal.lunch.principal] || null) : null
        const autoDinnerTime = (dinnerLabel && rule.text.toLowerCase().includes('cena') && todayMeal?.dinner?.principal) ? (mealCookTimes[todayMeal.dinner.principal] || null) : null
        const autoTime = autoLunchTime || autoDinnerTime
        const isCookingTask = rule.id === 'rule-lunch' || rule.text.toLowerCase().includes('cena') || rule.text.toLowerCase().includes('almuerzo')
        list.push({ originalId: rule.id, displayLabel: finalLabel, duration: savedDuration !== undefined ? savedDuration : (perDayDuration !== undefined ? perDayDuration : (autoTime !== null ? autoTime : rule.minutes)), type: rule.category, computedActiveWeight: finalActiveWeight, mustInclude: isCookingTask })
      }
    })
    return list
  }

  const shiftEndTimeStr = (() => {
    if (!startTime) return '--:--'
    const [hours, minutes] = startTime.split(':').map(Number)
    const endTracker = new Date()
    endTracker.setHours(hours, minutes, 0, 0)
    endTracker.setMinutes(endTracker.getMinutes() + (shiftHours * 60))
    return endTracker.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  })()

  // ── Helper: check if a task was done OR assigned on any date in a window ──
  // "done" = checkbox ticked; "assigned" = appeared in roadmap (past days only, not today, to avoid feedback loops)
  function wasTaskDoneInWindow(originalId, windowType) {
    const anchor = new Date(selectedDateStr + 'T00:00:00')
    let start = new Date(anchor)
    if (windowType === 'this_week') { const dow = anchor.getDay(); start.setDate(anchor.getDate() - (dow === 0 ? 6 : dow - 1)) }
    else if (windowType === 'last_7_days') { start.setDate(anchor.getDate() - 6) }
    else if (windowType === 'last_14_days') { start.setDate(anchor.getDate() - 13) }
    else if (windowType === 'last_30_days') { start.setDate(anchor.getDate() - 29) }
    const cur = new Date(start)
    while (cur <= anchor) {
      const ds = cur.toISOString().split('T')[0]
      const isToday = ds === selectedDateStr
      // Check checkbox completion (any date including today)
      const checked = Object.entries(completedTaskLog).some(([k, v]) => v === true && k.startsWith('item-') && k.includes(ds) && k.endsWith('-' + originalId))
      // Check roadmap assignment (past days only — today excluded to avoid suppressing task before it's recorded)
      const assigned = !isToday && (taskAssignmentLog[ds] || []).includes(originalId)
      if (checked || assigned) return true
      cur.setDate(cur.getDate() + 1)
    }
    return false
  }

  // ── Suppression: evaluate suppress_task smart rules before packing ──
  const suppressedTaskIds = useMemo(() => {
    const ids = new Set()
    smartRules.filter(r => r.enabled && r.action?.type === 'suppress_task' && r.action?.taskId).forEach(r => {
      // 1. Check the action's built-in suppressWindow: was the task done in that window?
      const suppressWindow = r.action.suppressWindow || 'this_week'
      const taskWasDone = wasTaskDoneInWindow(r.action.taskId, suppressWindow)
      if (!taskWasDone) return // task not done in window → never suppress regardless of conditions
      // 2. Evaluate any extra conditions (day filters, etc.) — these gate the suppression further
      const results = (r.conditions || []).map(c => {
        if (c.type === 'days') { const sel = (c.value || '').split(',').filter(Boolean); const m = sel.length === 0 || sel.includes(dayName); return c.operator === 'is' ? m : !m }
        if (c.type === 'day') return c.operator === 'is' ? dayName === c.value : dayName !== c.value
        if (c.type === 'taskHistory') { const [tid, win] = (c.value || '').split('|'); const done = wasTaskDoneInWindow(tid || r.action.taskId, win || 'this_week'); return c.operator === 'done_in' ? done : !done }
        if (c.type === 'freeTime' || c.type === 'overtime' || c.type === 'taskCount') return true // can't evaluate pre-pack; allow
        return true
      })
      const conditionsPass = r.conditions.length === 0 || (r.logic === 'AND' ? results.every(Boolean) : results.some(Boolean))
      if (conditionsPass) ids.add(r.action.taskId)
    })
    return ids
  }, [smartRules, dayName, selectedDateStr, completedTaskLog, taskAssignmentLog])

  const { activeUnpackedList, packedTimeline, totalMinutesNeeded, skippedBacklogItems, manuallySkippedToday } = useMemo(() => {
    if (absentDates[selectedDateStr]) { return { activeUnpackedList: [], packedTimeline: [], totalMinutesNeeded: 0, skippedBacklogItems: [], manuallySkippedToday: [] } }
    const base = compileBaseTasksBeforePacking()
    const back = backlogPool.filter(b => { if (b.targetDate !== selectedDateStr) return false; const originRule = customRules.find(r => r.id === b.originalId); if (originRule && originRule.type !== 'interval' && (originRule.dayOverrides?.[dayName] ?? 0) === 0) return false; return true }).map(b => { const savedDuration = dailyDurationOverrides[`${selectedDateStr}_${b.originalId}`]; const savedText = dailyTextOverrides[`${selectedDateStr}_${b.originalId}`]; return { originalId: b.originalId, displayLabel: savedText !== undefined ? savedText : b.label, duration: savedDuration !== undefined ? savedDuration : b.duration, type: b.type, isFromBacklog: true, computedActiveWeight: b.computedActiveWeight ?? 5 } })
    const allItems = [...base, ...back].filter(item => !suppressedTaskIds.has(item.originalId))
    const manuallySkippedToday = allItems.filter(item => completedTaskLog[`hidden-${selectedDateStr}-${item.originalId}`])

    const primaryPool = allItems.filter(item => !completedTaskLog[`hidden-${selectedDateStr}-${item.originalId}`]).sort((a, b) => { const hasCustomA = taskCustomOrder[a.originalId] !== undefined; const hasCustomB = taskCustomOrder[b.originalId] !== undefined; if (hasCustomA || hasCustomB) { const orderA = hasCustomA ? taskCustomOrder[a.originalId] : (a.computedActiveWeight * 100); const orderB = hasCustomB ? taskCustomOrder[b.originalId] : (b.computedActiveWeight * 100); return orderA - orderB } return a.computedActiveWeight - b.computedActiveWeight })
    const totalMaxMinutesAllowed = shiftHours * 60
    let packed = [], currentCumulativeMinutes = 0, skipped = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    let baseTimeTracker = new Date()
    baseTimeTracker.setHours(startHour, startMin, 0, 0)
    primaryPool.forEach((item) => { const prospectiveMinutes = currentCumulativeMinutes + item.duration; if (prospectiveMinutes > totalMaxMinutesAllowed && !item.mustInclude) { skipped.push(item) } else { const itemStartStr = baseTimeTracker.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); baseTimeTracker.setMinutes(baseTimeTracker.getMinutes() + item.duration); const itemEndStr = baseTimeTracker.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); currentCumulativeMinutes += item.duration; packed.push({ ...item, timeBlock: `${itemStartStr} - ${itemEndStr}` }) } })

    // ── Auto-apply non-suppress smart rules directly into the packed timeline ──
    smartRules.filter(r => r.enabled && r.action?.type !== 'suppress_task').forEach(r => {
      const available = Math.max(0, totalMaxMinutesAllowed - currentCumulativeMinutes)
      const overtime = Math.max(0, currentCumulativeMinutes - totalMaxMinutesAllowed)
      const results = (r.conditions || []).map(c => {
        if (c.type === 'days') { const sel = (c.value||'').split(',').filter(Boolean); const m = sel.length===0||sel.includes(dayName); return c.operator==='is'?m:!m }
        if (c.type === 'day') return c.operator==='is'?dayName===c.value:dayName!==c.value
        if (c.type === 'freeTime') { const v=Number(c.value); return c.operator==='>='?available>=v:c.operator==='<='?available<=v:c.operator==='>'?available>v:available<v }
        if (c.type === 'overtime') { const v=Number(c.value); return c.operator==='>='?overtime>=v:overtime>v }
        if (c.type === 'taskCount') { const cnt=packed.length; return c.operator==='>='?cnt>=Number(c.value):cnt<=Number(c.value) }
        if (c.type === 'taskHistory') { const [tid,win]=(c.value||'').split('|'); const done=wasTaskDoneInWindow(tid,win||'this_week'); return c.operator==='done_in'?done:!done }
        return true
      })
      const triggered = r.logic==='AND'?results.every(Boolean):results.some(Boolean)
      if (!triggered) return
      const a = r.action
      if ((a.type==='fill_shift'||a.type==='suggest_task') && a.taskText) {
        const dur = a.type==='fill_shift' ? available : Number(a.minutes)||15
        if (dur <= 0) return
        const id = `autosr-${r.id}`
        const tS = baseTimeTracker.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})
        baseTimeTracker.setMinutes(baseTimeTracker.getMinutes()+dur)
        const tE = baseTimeTracker.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})
        currentCumulativeMinutes += dur
        packed.push({ originalId: id, displayLabel: a.taskText, duration: dur, type:'general', computedActiveWeight:9, mustInclude:false, timeBlock:`${tS} - ${tE}`, isAutoInjected:true })
      }
      if (a.type==='extend_last' && packed.length>0) {
        const ext = Math.min(Number(a.minutes)||0, available)
        if (ext<=0) return
        const last = packed[packed.length-1]
        last.duration += ext
        currentCumulativeMinutes += ext
        const newEnd = new Date(baseTimeTracker); newEnd.setMinutes(newEnd.getMinutes()+ext)
        const parts = last.timeBlock.split(' - ')
        last.timeBlock = `${parts[0]} - ${newEnd.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})}`
        baseTimeTracker = newEnd
      }
    })

    return { activeUnpackedList: primaryPool, packedTimeline: packed, totalMinutesNeeded: currentCumulativeMinutes, skippedBacklogItems: skipped, manuallySkippedToday }
  }, [completedTaskLog, backlogPool, selectedDateStr, absentDates, taskCustomOrder, dailyDurationOverrides, dailyTextOverrides, customRules, shiftHours, startTime, dayName, dayNumber, todayMeal, suppressedTaskIds, smartRules, taskAssignmentLog])

  // ── Record which tasks were assigned to the roadmap on each date (used by suppression) ──
  useEffect(() => {
    if (!selectedDateStr || packedTimeline.length === 0) return
    const ids = packedTimeline.map(t => t.originalId)
    setTaskAssignmentLog(prev => {
      const existing = prev[selectedDateStr] || []
      const same = existing.length === ids.length && ids.every((id, i) => existing[i] === id)
      if (same) return prev
      const updated = { ...prev, [selectedDateStr]: ids }
      localStorage.setItem('mastery_assignment_log', JSON.stringify(updated))
      return updated
    })
  }, [packedTimeline, selectedDateStr])

  const decisionsLog = useMemo(() => {
    if (absentDates[selectedDateStr]) return []
    return customRules.map(rule => {
      let isMatch = false; let reason = ''
      if (rule.type === 'interval') {
        const startDate = rule.intervalStartDate || selectedDateStr
        const msPerDay = 86400000
        const daysSince = Math.round((new Date(selectedDateStr + 'T00:00:00') - new Date(startDate + 'T00:00:00')) / msPerDay)
        if (daysSince < 0) { reason = `No comenzó — inicio el ${rule.intervalStartDate}` }
        else if (!Number(rule.intervalDays)) { reason = 'Intervalo no configurado' }
        else if (daysSince % Number(rule.intervalDays) === 0) { isMatch = true; reason = `Toca hoy — c/${rule.intervalDays}d · día ${daysSince} desde inicio` }
        else { const next = Number(rule.intervalDays) - (daysSince % Number(rule.intervalDays)); reason = `Próxima en ${next} días — c/${rule.intervalDays}d` }
      } else {
        const w = rule.dayOverrides?.[dayName] ?? 0
        if (w > 0) { isMatch = true; reason = `${rule.type === 'daily' ? 'Diaria' : 'Semanal'} · Rango ${w} para ${dayName}` }
        else { reason = `Sin rango para ${dayName} (Off)` }
      }
      const inPacked = packedTimeline.some(p => p.originalId === rule.id)
      const inSkipped = skippedBacklogItems.some(s => s.originalId === rule.id)
      let status = 'off'
      if (isMatch) { if (inSkipped) { status = 'overflow'; reason = `Turno lleno — no entró (${rule.minutes} min)` } else if (inPacked) { status = 'included' } else { status = 'included' } }
      return { id: rule.id, text: rule.text, minutes: rule.minutes, status, reason }
    })
  }, [customRules, selectedDateStr, dayName, absentDates, packedTimeline, skippedBacklogItems])

  const suggestions = useMemo(() => {
    const shiftTotalMin = shiftHours * 60
    const available = shiftTotalMin - totalMinutesNeeded
    const overtime = Math.max(0, -available)
    const result = []
    if (available > 0 && fillRules.autoFillEnabled && available >= (fillRules.autoFillMinThreshold || 10)) {
      const fitsTask = skippedBacklogItems.find(s => s.duration <= available)
      if (fitsTask) result.push({ type: 'add_task', icon: '➕', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', taskId: fitsTask.originalId, label: fitsTask.displayLabel, minutes: fitsTask.duration, freeMin: available, text: `Agregar "${fitsTask.displayLabel}" (${fitsTask.duration} min) — encaja en los ${available} min libres`, action: 'Agregar' })
      if (packedTimeline.length > 0) { const last = packedTimeline[packedTimeline.length - 1]; result.push({ type: 'extend_task', icon: '⏩', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', taskId: last.originalId, label: last.displayLabel, minutes: last.duration + available, freeMin: available, text: `Extender "${last.displayLabel}" +${available} min → ${last.duration + available} min (turno exacto)`, action: 'Aplicar' }) }
    }
    if (overtime > 0 && fillRules.autoTrimEnabled) {
      const lowestRanked = [...packedTimeline].sort((a, b) => b.computedActiveWeight - a.computedActiveWeight)[0]
      if (lowestRanked) { const newMin = Math.max(5, lowestRanked.duration - overtime); result.push({ type: 'trim_task', icon: '✂️', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', taskId: lowestRanked.originalId, label: lowestRanked.displayLabel, minutes: newMin, freeMin: 0, text: `Recortar "${lowestRanked.displayLabel}" de ${lowestRanked.duration}→${newMin} min para eliminar ${overtime} min de overtime`, action: 'Recortar' }) }
    }
    return result
  }, [packedTimeline, skippedBacklogItems, totalMinutesNeeded, shiftHours, fillRules])

  const smartSuggestions = useMemo(() => {
    const shiftTotalMin = shiftHours * 60
    const available = Math.max(0, shiftTotalMin - totalMinutesNeeded)
    const overtime = Math.max(0, totalMinutesNeeded - shiftTotalMin)
    return smartRules.filter(r => r.enabled).map(r => {
      const WEEKDAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes']
      const WEEKEND = ['Sábado','Domingo']
      const results = (r.conditions || []).map(c => {
        if (c.type === 'day') return c.operator === 'is' ? dayName === c.value : dayName !== c.value
        if (c.type === 'days') { const sel = (c.value || '').split(',').filter(Boolean); const match = sel.length === 0 || sel.includes(dayName); return c.operator === 'is' ? match : !match }
        if (c.type === 'dayGroup') { const inWeekday = WEEKDAYS.includes(dayName); const inWeekend = WEEKEND.includes(dayName); const match = c.value === 'weekday' ? inWeekday : c.value === 'weekend' ? inWeekend : true; return c.operator === 'is' ? match : !match }
        if (c.type === 'taskHistory') { const [tid, win] = (c.value || '').split('|'); const done = wasTaskDoneInWindow(tid, win || 'this_week'); return c.operator === 'done_in' ? done : !done }
        if (c.type === 'freeTime') { const v = Number(c.value); return c.operator === '>=' ? available >= v : c.operator === '<=' ? available <= v : c.operator === '>' ? available > v : available < v }
        if (c.type === 'overtime') { const v = Number(c.value); return c.operator === '>=' ? overtime >= v : overtime > v }
        if (c.type === 'taskCount') { const count = packedTimeline.length; return c.operator === '>=' ? count >= Number(c.value) : count <= Number(c.value) }
        return false
      })
      const triggered = r.logic === 'AND' ? results.every(Boolean) : results.some(Boolean)
      if (!triggered) return null
      const a = r.action
      if (a.type === 'suggest_task') return { type: 'smart_task', icon: '🎯', color: '#7e22ce', bg: '#faf5ff', border: '#e9d5ff', taskId: `smart-${r.id}`, label: a.taskText, minutes: Number(a.minutes), text: `[${r.name}] → Agregar "${a.taskText}" (${a.minutes} min)`, action: 'Agregar' }
      if (a.type === 'fill_shift' && available > 0) return { type: 'smart_task', icon: '🎯', color: '#7e22ce', bg: '#faf5ff', border: '#e9d5ff', taskId: `smart-${r.id}`, label: a.taskText, minutes: available, text: `[${r.name}] → Agregar "${a.taskText}" (${available} min — hasta fin de turno)`, action: 'Agregar' }
      if (a.type === 'extend_last' && packedTimeline.length > 0) { const last = packedTimeline[packedTimeline.length - 1]; return { type: 'extend_task', icon: '⏩', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', taskId: last.originalId, label: last.displayLabel, minutes: last.duration + Number(a.minutes), text: `[${r.name}] → Extender "${last.displayLabel}" +${a.minutes} min`, action: 'Aplicar' } }
      return null
    }).filter(Boolean)
  }, [smartRules, dayName, totalMinutesNeeded, shiftHours, packedTimeline])

  function handleApplySuggestion(s) {
    if (s.type === 'smart_task') {
      const instanceId = `smart-${Date.now()}`
      const item = { id: instanceId, originalId: instanceId, label: s.label, duration: s.minutes, type: 'general', computedActiveWeight: 9, targetDate: selectedDateStr }
      setBacklogPool(prev => { const updated = [...prev, item]; localStorage.setItem('mastery_backlog_pool', JSON.stringify(updated)); return updated })
      setHighlightedTaskId(instanceId)
    } else if (s.type === 'extend_task' || s.type === 'trim_task') {
      const key = `${selectedDateStr}_${s.taskId}`
      const updated = { ...dailyDurationOverrides, [key]: s.minutes }
      setDailyDurationOverrides(updated)
      localStorage.setItem('mastery_daily_durations', JSON.stringify(updated))
      setHighlightedTaskId(s.taskId)
    }
    setTimeout(() => setHighlightedTaskId(null), 3000)
  }

  const motorPanelJsx = (() => {
      const allSuggestions = [...suggestions, ...smartSuggestions]
      return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>🧠 Reglas sobre Tareas — {dayName}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{decisionsLog.filter(d => d.status === 'included').length} inc · {decisionsLog.filter(d => d.status === 'off').length} off</span>
            </div>
          </div>
          {true && <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer', backgroundColor: panelSections.smartRules ? '#faf5ff' : '#fff' }} onClick={() => toggleSection('smartRules')}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b21a8' }}>🎯 REGLAS ({smartRules.length})</span>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <button type="button" onClick={e => { e.stopPropagation(); startNewSmartRule() }} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #d8b4fe', backgroundColor: '#7e22ce', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ Nueva</button>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.smartRules ? '▲' : '▼'}</span>
                </div>
              </div>
              {panelSections.smartRules && <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {smartRules.length === 0 && editingSmartRuleId !== 'new' && <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sin reglas. Cliqueá "+ Nueva".</span>}
                {smartRules.map(r => (
                  editingSmartRuleId === r.id && draftRule ? null : (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '5px', backgroundColor: r.enabled ? '#faf5ff' : '#f8fafc', border: `1px solid ${r.enabled ? '#e9d5ff' : '#e2e8f0'}` }}>
                      <input type="checkbox" checked={r.enabled} onChange={() => toggleSmartRuleEnabled(r.id)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a' }}>{r.name || '(sin nombre)'}</div>
                        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '1px' }}>
                          {(r.conditions || []).map((c, ci) => { const daysAbbr = (c.value || '').split(',').filter(Boolean).map(d => d.slice(0,2)).join('/'); const [thTaskId, thWin] = (c.value || '').split('|'); const thName = customRules.find(x => x.id === thTaskId)?.text || thTaskId; const winLabel = {'today':'hoy','this_week':'esta sem.','last_7_days':'7d','last_14_days':'14d','last_30_days':'30d'}[thWin] || thWin; const label = c.type === 'taskHistory' ? `"${thName}" ${c.operator === 'done_in' ? 'hecha en' : 'NO hecha en'} ${winLabel}` : c.type === 'days' ? `días [${daysAbbr || 'ninguno'}]` : c.type === 'day' ? `día=${c.value}` : c.type === 'freeTime' ? `libre${c.operator}${c.value}m` : c.type === 'overtime' ? `overtime${c.operator}${c.value}m` : `tareas${c.operator}${c.value}`; return <span key={c.id}>{ci > 0 && <strong> {r.logic} </strong>}{label}</span> })}
                          {' → '}<strong>{r.action?.type === 'suppress_task' ? `🚫 excluir "${r.action.taskText || r.action.taskId}" hasta ${{ 'today':'mañana','this_week':'sem. siguiente','last_7_days':'7d','last_14_days':'14d','last_30_days':'30d' }[r.action.suppressWindow || 'this_week']}` : r.action?.type === 'suggest_task' ? `"${r.action.taskText}"` : r.action?.type === 'fill_shift' ? `"${r.action.taskText}" (fin turno)` : `+${r.action?.minutes}m última`}</strong>
                        </div>
                      </div>
                      <button type="button" onClick={() => startEditSmartRule(r)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #d8b4fe', backgroundColor: '#fff', color: '#7e22ce', fontSize: '10px', cursor: 'pointer' }}>✏️</button>
                      <button type="button" onClick={() => deleteSmartRule(r.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                  )
                ))}
                {draftRule && (editingSmartRuleId === 'new' || editingSmartRuleId) && (
                  <div style={{ border: '2px solid #a855f7', borderRadius: '7px', padding: '10px', backgroundColor: '#fdf4ff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input placeholder="Nombre de la regla" value={draftRule.name} onChange={e => setDraftRule(d => ({ ...d, name: e.target.value }))} style={{ flex: 1, minWidth: '120px', padding: '4px 7px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }} />
                      <select value={draftRule.logic} onChange={e => setDraftRule(d => ({ ...d, logic: e.target.value }))} style={{ padding: '4px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '10px', backgroundColor: '#fff' }}>
                        <option value="AND">Todas (AND)</option><option value="OR">Alguna (OR)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#7e22ce', textTransform: 'uppercase' }}>SI…</span>
                      {draftRule.conditions.map((c, ci) => (
                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '6px 8px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #e9d5ff' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {ci > 0 && <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#7e22ce', minWidth: '22px' }}>{draftRule.logic}</span>}
                            <select value={c.type} onChange={e => { const t = e.target.value; const dv = t === 'days' ? 'Lunes,Martes,Miércoles,Jueves,Viernes' : t === 'day' ? 'Lunes' : t === 'taskHistory' ? '|this_week' : '20'; const op = (t === 'day' || t === 'days') ? 'is' : t === 'taskHistory' ? 'done_in' : '>='; updateCond(c.id, 'type', t); updateCond(c.id, 'value', dv); updateCond(c.id, 'operator', op) }} style={{ flex: 1, padding: '2px 4px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                              <option value="days">Días de la semana</option>
                              <option value="day">Día exacto</option>
                              <option value="freeTime">Libre (min)</option>
                              <option value="overtime">Overtime</option>
                              <option value="taskCount">Nº tareas</option>
                              <option value="taskHistory">Historial de tarea</option>
                            </select>
                            {(c.type === 'day' || c.type === 'days') && (
                              <select value={c.operator} onChange={e => updateCond(c.id, 'operator', e.target.value)} style={{ padding: '2px 4px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                                <option value="is">incluye</option><option value="is not">excluye</option>
                              </select>
                            )}
                            {c.type === 'taskHistory' && (
                              <select value={c.operator} onChange={e => updateCond(c.id, 'operator', e.target.value)} style={{ padding: '2px 4px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                                <option value="done_in">fue realizada</option>
                                <option value="not_done_in">NO fue realizada</option>
                              </select>
                            )}
                            {(c.type === 'freeTime' || c.type === 'overtime' || c.type === 'taskCount') && (
                              <select value={c.operator} onChange={e => updateCond(c.id, 'operator', e.target.value)} style={{ padding: '2px 4px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                                <option value=">=">≥</option><option value="<=">≤</option><option value=">">{'>'}</option><option value="<">{'<'}</option>
                              </select>
                            )}
                            {(c.type === 'freeTime' || c.type === 'overtime' || c.type === 'taskCount') && (
                              <input type="number" min="0" value={c.value} onChange={e => updateCond(c.id, 'value', e.target.value)} style={{ width: '48px', padding: '2px 4px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', textAlign: 'center' }} />
                            )}
                            {c.type === 'day' && (
                              <select value={c.value} onChange={e => updateCond(c.id, 'value', e.target.value)} style={{ padding: '2px 4px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                                {['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            )}
                            {draftRule.conditions.length > 1 && <button type="button" onClick={() => removeCond(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto' }}>✕</button>}
                          </div>
                          {c.type === 'days' && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', paddingTop: '2px' }}>
                              {['Do','Lu','Ma','Mi','Ju','Vi','Sá'].map((abbr, i) => { const full = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][i]; const sel = (c.value || '').split(',').filter(Boolean); const checked = sel.includes(full); return (
                                <label key={full} style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '2px 5px', borderRadius: '3px', backgroundColor: checked ? '#7e22ce' : '#f3f4f6', border: `1px solid ${checked ? '#7e22ce' : '#d1d5db'}` }}>
                                  <input type="checkbox" checked={checked} onChange={() => toggleDayInCond(c.id, full)} style={{ display: 'none' }} />
                                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: checked ? '#fff' : '#374151' }}>{abbr}</span>
                                </label>
                              )})}
                            </div>
                          )}
                          {c.type === 'taskHistory' && (() => {
                            const parts = (c.value || '').split('|')
                            const taskId = parts[0] || ''
                            const win = parts[1] || 'this_week'
                            const taskName = customRules.find(r => r.id === taskId)?.text || taskId
                            const cq = condTaskSearches[c.id] !== undefined ? condTaskSearches[c.id] : taskName
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '3px' }}>
                                <div style={{ position: 'relative' }}>
                                  <input
                                    placeholder="Buscar tarea..."
                                    value={cq}
                                    onChange={e => { setCondTaskSearches(p => ({ ...p, [c.id]: e.target.value })); setOpenCondDrop(c.id) }}
                                    onFocus={() => { setCondTaskSearches(p => ({ ...p, [c.id]: taskName })); setOpenCondDrop(c.id) }}
                                    onBlur={() => setTimeout(() => setOpenCondDrop(null), 150)}
                                    style={{ width: '100%', padding: '3px 6px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', boxSizing: 'border-box' }}
                                  />
                                  {openCondDrop === c.id && (() => {
                                    const q = (cq || '').toLowerCase()
                                    const m = customRules.filter(r => r.text.toLowerCase().includes(q))
                                    return m.length > 0 ? (
                                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60, backgroundColor: '#fff', border: '1px solid #d8b4fe', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '140px', overflowY: 'auto' }}>
                                        {m.map(r => (
                                          <div key={r.id} onMouseDown={() => { updateCond(c.id, 'value', r.id + '|' + win); setCondTaskSearches(p => ({ ...p, [c.id]: r.text })); setOpenCondDrop(null) }} style={{ padding: '5px 8px', fontSize: '10px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#1e293b' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#faf5ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor='#fff'}>
                                            {r.text} <span style={{ color: '#94a3b8' }}>({r.minutes}m)</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null
                                  })()}
                                </div>
                                <select value={win} onChange={e => updateCond(c.id, 'value', taskId + '|' + e.target.value)} style={{ padding: '2px 5px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                                  <option value="today">Hoy</option>
                                  <option value="this_week">Esta semana (L–D)</option>
                                  <option value="last_7_days">Últimos 7 días</option>
                                  <option value="last_14_days">Últimos 14 días</option>
                                  <option value="last_30_days">Últimos 30 días</option>
                                </select>
                              </div>
                            )
                          })()}
                        </div>
                      ))}
                      <button type="button" onClick={addCond} style={{ alignSelf: 'flex-start', padding: '2px 8px', borderRadius: '3px', border: '1px dashed #a855f7', backgroundColor: '#fff', color: '#7e22ce', fontSize: '10px', cursor: 'pointer' }}>+ Cond.</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#7e22ce', textTransform: 'uppercase' }}>ENTONCES…</span>
                      <select value={draftRule.action.type} onChange={e => updateDraftAction('type', e.target.value)} style={{ padding: '3px 6px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                        <option value="suggest_task">➕ Agregar tarea (min fijos)</option>
                        <option value="fill_shift">⏱ Agregar tarea (hasta fin de turno)</option>
                        <option value="extend_last">⏩ Extender última tarea</option>
                        <option value="suppress_task">🚫 No asignar tarea</option>
                      </select>
                      {(draftRule.action.type === 'suggest_task' || draftRule.action.type === 'fill_shift') && (
                        <div style={{ position: 'relative' }}>
                          <input
                            placeholder="Buscar tarea existente o escribir nombre..."
                            value={taskSearchQuery}
                            onChange={e => { setTaskSearchQuery(e.target.value); updateDraftAction('taskText', e.target.value); setTaskDropOpen(true) }}
                            onFocus={() => setTaskDropOpen(true)}
                            onBlur={() => setTimeout(() => setTaskDropOpen(false), 150)}
                            style={{ width: '100%', padding: '4px 7px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '10px', boxSizing: 'border-box' }}
                          />
                          {taskDropOpen && (() => {
                            const q = taskSearchQuery.toLowerCase()
                            const matches = customRules.filter(r => r.text.toLowerCase().includes(q))
                            return matches.length > 0 ? (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid #d8b4fe', borderRadius: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '160px', overflowY: 'auto' }}>
                                {matches.map(r => (
                                  <div key={r.id} onMouseDown={() => { updateDraftAction('taskText', r.text); setTaskSearchQuery(r.text); setTaskDropOpen(false) }} style={{ padding: '6px 10px', fontSize: '11px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#1e293b' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
                                    {r.text} <span style={{ fontSize: '9px', color: '#94a3b8' }}>({r.minutes} min · {r.type})</span>
                                  </div>
                                ))}
                              </div>
                            ) : null
                          })()}
                          {draftRule.action.type === 'fill_shift' && <div style={{ fontSize: '9px', color: '#7e22ce', fontWeight: 'bold', marginTop: '3px' }}>⏱ Duración = minutos libres del turno</div>}
                        </div>
                      )}
                      {draftRule.action.type === 'suggest_task' && (
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <input type="number" min="5" step="5" value={draftRule.action.minutes} onChange={e => updateDraftAction('minutes', e.target.value)} style={{ width: '50px', padding: '3px 5px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', textAlign: 'center' }} />
                          <span style={{ fontSize: '9px', color: '#64748b' }}>min fijos</span>
                        </div>
                      )}
                      {draftRule.action.type === 'extend_last' && (
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>+</span>
                          <input type="number" min="5" step="5" value={draftRule.action.minutes} onChange={e => updateDraftAction('minutes', e.target.value)} style={{ width: '46px', padding: '3px 5px', border: '1px solid #d8b4fe', borderRadius: '3px', fontSize: '10px', textAlign: 'center' }} />
                          <span style={{ fontSize: '9px', color: '#64748b' }}>min a última tarea</span>
                        </div>
                      )}
                      {draftRule.action.type === 'suppress_task' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              placeholder="Buscar tarea a suprimir..."
                              value={actSuppressSearch}
                              onChange={e => { setActSuppressSearch(e.target.value); setActSuppressDrop(true) }}
                              onFocus={() => setActSuppressDrop(true)}
                              onBlur={() => setTimeout(() => setActSuppressDrop(false), 150)}
                              style={{ width: '100%', padding: '4px 7px', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '10px', boxSizing: 'border-box', backgroundColor: '#fef2f2' }}
                            />
                            {actSuppressDrop && (() => {
                              const q = actSuppressSearch.toLowerCase()
                              const m = customRules.filter(r => r.text.toLowerCase().includes(q))
                              return m.length > 0 ? (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60, backgroundColor: '#fff', border: '1px solid #fca5a5', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '140px', overflowY: 'auto' }}>
                                  {m.map(r => (
                                    <div key={r.id} onMouseDown={() => { updateDraftAction('taskId', r.id); updateDraftAction('taskText', r.text); setActSuppressSearch(r.text); setActSuppressDrop(false) }} style={{ padding: '5px 8px', fontSize: '10px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#1e293b' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#fef2f2'} onMouseLeave={e => e.currentTarget.style.backgroundColor='#fff'}>
                                      🚫 {r.text} <span style={{ color: '#94a3b8' }}>({r.minutes}m)</span>
                                    </div>
                                  ))}
                                </div>
                              ) : null
                            })()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', fontWeight: '600' }}>Hasta:</span>
                            <select value={draftRule.action.suppressWindow || 'this_week'} onChange={e => updateDraftAction('suppressWindow', e.target.value)} style={{ flex: 1, padding: '3px 6px', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '10px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 'bold' }}>
                              <option value="today">Mañana (solo hoy no la asigna)</option>
                              <option value="this_week">Semana siguiente (L–D actual)</option>
                              <option value="last_7_days">7 días después de realizarla</option>
                              <option value="last_14_days">14 días después de realizarla</option>
                              <option value="last_30_days">30 días después de realizarla</option>
                            </select>
                          </div>
                          {draftRule.action.taskId && <div style={{ fontSize: '9px', color: '#dc2626', fontWeight: 'bold', padding: '3px 6px', backgroundColor: '#fef2f2', borderRadius: '3px', border: '1px solid #fca5a5' }}>🚫 Se excluirá automáticamente del roadmap {({'today':'por el resto de hoy','this_week':'hasta el lunes de la semana siguiente','last_7_days':'por 7 días desde que se realizó','last_14_days':'por 14 días desde que se realizó','last_30_days':'por 30 días desde que se realizó'})[draftRule.action.suppressWindow || 'this_week']}.</div>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={saveSmartRuleDraft} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#7e22ce', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>✓ Guardar</button>
                      <button type="button" onClick={() => { setEditingSmartRuleId(null); setDraftRule(null) }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #d8b4fe', backgroundColor: '#fff', color: '#7e22ce', fontSize: '10px', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>}
            </div>
            <div style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer', backgroundColor: panelSections.filler ? '#f0fdf4' : '#fff' }} onClick={() => toggleSection('filler')}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534' }}>✨ FILLER ({fillerPool.length}) {(shiftHours * 60 - totalMinutesNeeded) > 0 && <span style={{ fontWeight: 'normal', color: '#16a34a' }}>· {shiftHours * 60 - totalMinutesNeeded}m libres</span>}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.filler ? '▲' : '▼'}</span>
              </div>
              {panelSections.filler && <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(shiftHours * 60 - totalMinutesNeeded) > 0 && !absentDates[selectedDateStr] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {fillerPool.filter(f => f.minutes <= (shiftHours * 60 - totalMinutesNeeded)).map(f => (
                      <div key={`use-${f.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#1e293b' }}>{f.text} <span style={{ color: '#64748b' }}>({f.minutes}m)</span></span>
                        <button type="button" onClick={() => useFillerTask(f)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ Hoy</button>
                      </div>
                    ))}
                    {fillerPool.filter(f => f.minutes <= (shiftHours * 60 - totalMinutesNeeded)).length === 0 && <span style={{ fontSize: '10px', color: '#64748b' }}>Ninguna encaja.</span>}
                  </div>
                )}
                <form onSubmit={handleAddFiller} style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={newFillerRuleId} onChange={e => { setNewFillerRuleId(e.target.value); const r = customRules.find(x => x.id === e.target.value); if (r) setNewFillerMinutes(r.minutes) }} style={{ flex: 1, minWidth: '120px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}>
                    <option value="">— Agregar al pool —</option>
                    {customRules.filter(r => !fillerPool.some(f => f.ruleId === r.id)).map(r => <option key={r.id} value={r.id}>{r.text}</option>)}
                  </select>
                  <input type="number" min="1" step="5" value={newFillerMinutes} onChange={e => setNewFillerMinutes(Number(e.target.value))} style={{ width: '46px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }} />
                  <button type="submit" style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                </form>
                {fillerPool.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#1e293b' }}>{f.text} <span style={{ color: '#94a3b8' }}>({f.minutes}m)</span></span>
                    <button type="button" onClick={() => handleDeleteFiller(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>✕</button>
                  </div>
                ))}
                {fillerPool.length === 0 && <span style={{ fontSize: '10px', color: '#94a3b8' }}>Sin tareas en pool.</span>}
              </div>}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer', backgroundColor: panelSections.config ? '#f8fafc' : '#fff' }} onClick={() => toggleSection('config')}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>⚙️ CONFIG</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.config ? '▲' : '▼'}</span>
              </div>
              {panelSections.config && <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={fillRules.autoFillEnabled} onChange={e => saveFillRules({ ...fillRules, autoFillEnabled: e.target.checked })} />
                    Sugerir si libre ≥
                  </label>
                  <input type="number" min="5" max="120" value={fillRules.autoFillMinThreshold} onChange={e => saveFillRules({ ...fillRules, autoFillMinThreshold: Number(e.target.value) })} style={{ width: '44px', padding: '2px 5px', fontSize: '10px', border: '1px solid #cbd5e1', borderRadius: '3px', textAlign: 'center' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>min</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={fillRules.autoTrimEnabled} onChange={e => saveFillRules({ ...fillRules, autoTrimEnabled: e.target.checked })} />
                  Recorte si overtime
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={fillRules.showDecisionsLog} onChange={e => saveFillRules({ ...fillRules, showDecisionsLog: e.target.checked })} />
                  Log de decisiones
                </label>
                {fillRules.showDecisionsLog && <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                  {decisionsLog.map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 7px', borderRadius: '4px', backgroundColor: d.status === 'included' ? '#f0fdf4' : d.status === 'overflow' ? '#fef2f2' : '#f8fafc', border: `1px solid ${d.status === 'included' ? '#bbf7d0' : d.status === 'overflow' ? '#fca5a5' : '#e2e8f0'}` }}>
                      <span style={{ fontSize: '10px' }}>{d.status === 'included' ? '✅' : d.status === 'overflow' ? '⛔' : '⭕'}</span>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: '#0f172a', flex: 1 }}>{d.text}</span>
                      <span style={{ fontSize: '9px', color: '#64748b' }}>{d.reason}</span>
                    </div>
                  ))}
                </div>}
              </div>}
            </div>
          </div>}
          {skippedBacklogItems.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#c2410c', textTransform: 'uppercase' }}>⏭️ Tareas Diferidas ({skippedBacklogItems.length})</span>
              <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#7c2d12' }}>Exceden el límite del turno y fueron diferidas automáticamente.</p>
              {skippedBacklogItems.map((item, idx) => (
                <div key={idx} style={{ padding: '6px 10px', backgroundColor: '#fff7ed', borderRadius: '6px', border: '1px solid #ffedd5', fontSize: '11px', color: '#9a3412', fontWeight: '500' }}>
                  <strong>[Rank {item.computedActiveWeight}]</strong> {item.displayLabel} ({item.duration} min)
                </div>
              ))}
            </div>
          )}
        </div>
      )
    })()

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', maxWidth: '1750px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>⚙️ Absolute 7-Day Matrix Control Hub</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>Every day of the week features its own completely independent rank value with absolute fallback settings.</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div><label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '4px' }}>📅 SELECT DATE</label><input type="date" value={selectedDateStr} onChange={e => setSelectedDateStr(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#fff' }} /></div>
          <div><label style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '4px' }}>🛫 START HOUR</label><input type="time" value={startTime} onChange={e => updateStartTimeAndPersist(e.target.value)} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#fff' }} /></div>
          <div><label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>⏱️ SHIFT HOURS</label><input type="number" step="0.5" value={shiftHours} onChange={e => updateShiftHoursAndPersist(e.target.value)} style={{ padding: '6px', width: '50px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#fff' }} /></div>
          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '15px', textAlign: 'center' }}><label style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7', display: 'block', marginBottom: '4px' }}>🛬 SHIFT END</label><span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: absentDates[selectedDateStr] ? '#94a3b8' : '#0284c7', display: 'block', marginTop: '4px' }}>{absentDates[selectedDateStr] ? '--:--' : `${shiftEndTimeStr} HS`}</span></div>
        </div>
      </div>

      <div style={{ backgroundColor: absentDates[selectedDateStr] ? '#fef2f2' : '#fff', border: '1px solid', borderColor: absentDates[selectedDateStr] ? '#fca5a5' : '#e2e8f0', padding: '16px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><strong style={{ fontSize: '14px', color: absentDates[selectedDateStr] ? '#991b1b' : '#334155' }}>👤 Scheduled Attendance Status:</strong><span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}>Active tracking day maps to: {dayName} (Menu Plan Matrix Day {dayNumber})</span></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleAbsenceState} style={{ backgroundColor: absentDates[selectedDateStr] ? '#ef4444' : '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Toggle Absence</button>
          <button onClick={handleClearAllStorage} style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Reset Cache</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', textTransform: 'uppercase', color: '#1e293b', fontWeight: 'bold' }}>🎯 Today's Tasks</h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#64748b' }}>Sorting vectors track active day ranks absolutely. Tap arrows to handle standalone variations.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeUnpackedList.map((item, idx) => (
                <div key={`order-${item.originalId}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }} title={item.displayLabel}>{idx + 1}. {item.displayLabel}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => moveTaskPriorityUp(item.originalId, idx, activeUnpackedList)} disabled={idx === 0} style={{ padding: '4px 6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', borderRadius: '4px' }}>▲</button>
                    <button type="button" onClick={() => moveTaskPriorityDown(item.originalId, idx, activeUnpackedList)} disabled={idx === activeUnpackedList.length - 1} style={{ padding: '4px 6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: idx === activeUnpackedList.length - 1 ? 'not-allowed' : 'pointer', borderRadius: '4px' }}>▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ─── Unified Engine Panel (left column) ─── */}
          {motorPanelJsx}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>⏱️ Optimized Hourly Roadmap — {selectedDateStr} ({dayName})</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 'bold', color: '#166534' }}>☀️ ALMUERZO: {lunchLabel}</div>
                {dinnerLabel && <div style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', fontSize: '12px', fontWeight: 'bold', color: '#6b21a8' }}>🌙 CENA: {dinnerLabel}</div>}
              </div>
            </div>
            {/* Time budget bar */}
            {(() => {
              const shiftTotalMin = shiftHours * 60
              const overtime = Math.max(0, totalMinutesNeeded - shiftTotalMin)
              const available = Math.max(0, shiftTotalMin - totalMinutesNeeded)
              const usedPct = shiftTotalMin > 0 ? Math.min(100, (totalMinutesNeeded / shiftTotalMin) * 100) : 100
              const isOver = overtime > 0
              return (
                <div style={{ backgroundColor: isOver ? '#fef2f2' : '#f8fafc', border: `1px solid ${isOver ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalMinutesNeeded} min</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em' }}>ASIGNADOS</div>
                    </div>
                    {isOver ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>+{overtime} min</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626', letterSpacing: '0.05em' }}>OVERTIME</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>{available} min</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em' }}>DISPONIBLES</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#475569' }}>{shiftTotalMin} min</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em' }}>TURNO TOTAL</div>
                    </div>
                  </div>
                  <div style={{ position: 'relative', height: '10px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${usedPct}%`, borderRadius: '999px', backgroundColor: isOver ? '#dc2626' : '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                    <span>0</span>
                    {isOver && <span style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ Turno excedido por {overtime} min — editá una tarea para ajustar</span>}
                    {!isOver && available === 0 && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⚠️ Turno completo</span>}
                    <span>{shiftTotalMin} min</span>
                  </div>
                </div>
              )
            })()}
            {/* ─── Unified Engine Panel — now rendered in left column ─── */}
            {false && (() => { return (
                <div style={{ marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', backgroundColor: '#f8fafc', cursor: 'pointer', borderBottom: rulesPanelOpen ? '1px solid #e2e8f0' : 'none' }} onClick={() => setRulesPanelOpen(p => !p)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>🧠 Motor — {dayName}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{decisionsLog.filter(d => d.status === 'included').length} incluidas · {decisionsLog.filter(d => d.status === 'off').length} off</span>
                      <span style={{ fontSize: '10px', color: '#7e22ce' }}>{smartRules.length} reglas condicionales</span>
                      {allSuggestions.length > 0 && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '1px 8px' }}>⚡ {allSuggestions.length} sugerencia{allSuggestions.length > 1 ? 's' : ''}</span>}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rulesPanelOpen ? '▲' : '▼'}</span>
                  </div>

                  {rulesPanelOpen && <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* ── SUGGESTIONS ── */}
                    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', cursor: 'pointer', backgroundColor: panelSections.suggestions ? '#fffbeb' : '#fff' }} onClick={() => toggleSection('suggestions')}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e' }}>⚡ SUGERENCIAS ({allSuggestions.length})</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.suggestions ? '▲' : '▼'}</span>
                      </div>
                      {panelSections.suggestions && <div style={{ padding: '8px 14px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {allSuggestions.length === 0 && <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sin sugerencias para hoy. El turno está optimizado.</span>}
                        {allSuggestions.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: '6px', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: s.color, flex: 1 }}>{s.icon} {s.text}</span>
                            <button type="button" onClick={() => handleApplySuggestion(s)} style={{ padding: '4px 12px', borderRadius: '5px', border: 'none', backgroundColor: s.color, color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>{s.action}</button>
                          </div>
                        ))}
                      </div>}
                    </div>

                    {/* ── SMART CONDITIONAL RULES ── */}
                    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', cursor: 'pointer', backgroundColor: panelSections.smartRules ? '#faf5ff' : '#fff' }} onClick={() => toggleSection('smartRules')}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b21a8' }}>🎯 REGLAS CONDICIONALES ({smartRules.length})</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button type="button" onClick={e => { e.stopPropagation(); startNewSmartRule() }} style={{ padding: '2px 10px', borderRadius: '4px', border: '1px solid #d8b4fe', backgroundColor: '#7e22ce', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ Nueva</button>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.smartRules ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {panelSections.smartRules && <div style={{ padding: '8px 14px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

                        {/* Existing rules list */}
                        {smartRules.length === 0 && editingSmartRuleId !== 'new' && <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sin reglas condicionales. Cliqueá "+ Nueva" para agregar.</span>}
                        {smartRules.map(r => (
                          editingSmartRuleId === r.id && draftRule ? null : (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', backgroundColor: r.enabled ? '#faf5ff' : '#f8fafc', border: `1px solid ${r.enabled ? '#e9d5ff' : '#e2e8f0'}` }}>
                              <input type="checkbox" checked={r.enabled} onChange={() => toggleSmartRuleEnabled(r.id)} title="Activar/desactivar" />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>{r.name || '(sin nombre)'}</div>
                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                  {(r.conditions || []).map((c, ci) => {
                                    const label = c.type === 'day' ? `día ${c.operator === 'is' ? '=' : '≠'} ${c.value}` : c.type === 'freeTime' ? `libre ${c.operator} ${c.value} min` : c.type === 'overtime' ? `overtime ${c.operator} ${c.value} min` : `tareas ${c.operator} ${c.value}`
                                    return <span key={c.id}>{ci > 0 && <strong> {r.logic} </strong>}{label}</span>
                                  })}
                                  {' → '}
                                  <strong>{r.action?.type === 'suggest_task' ? `"${r.action.taskText}" (${r.action.minutes} min)` : `extender última +${r.action?.minutes} min`}</strong>
                                </div>
                              </div>
                              <button type="button" onClick={() => startEditSmartRule(r)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #d8b4fe', backgroundColor: '#fff', color: '#7e22ce', fontSize: '10px', cursor: 'pointer' }}>✏️</button>
                              <button type="button" onClick={() => deleteSmartRule(r.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                            </div>
                          )
                        ))}

                        {/* Editor (new or editing) */}
                        {draftRule && (editingSmartRuleId === 'new' || editingSmartRuleId) && (
                          <div style={{ border: '2px solid #a855f7', borderRadius: '8px', padding: '12px', backgroundColor: '#fdf4ff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input placeholder="Nombre de la regla" value={draftRule.name} onChange={e => setDraftRule(d => ({ ...d, name: e.target.value }))} style={{ flex: 1, minWidth: '160px', padding: '5px 8px', border: '1px solid #d8b4fe', borderRadius: '5px', fontSize: '12px', fontWeight: '600' }} />
                              <select value={draftRule.logic} onChange={e => setDraftRule(d => ({ ...d, logic: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #d8b4fe', borderRadius: '5px', fontSize: '11px', backgroundColor: '#fff' }}>
                                <option value="AND">Todas (AND)</option>
                                <option value="OR">Alguna (OR)</option>
                              </select>
                            </div>

                            {/* Conditions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce', textTransform: 'uppercase' }}>SI…</span>
                              {draftRule.conditions.map((c, ci) => (
                                <div key={c.id} style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  {ci > 0 && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce', minWidth: '28px' }}>{draftRule.logic}</span>}
                                  <select value={c.type} onChange={e => updateCond(c.id, 'type', e.target.value)} style={{ padding: '3px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' }}>
                                    <option value="day">Día de la semana</option>
                                    <option value="freeTime">Tiempo libre (min)</option>
                                    <option value="overtime">Overtime (min)</option>
                                    <option value="taskCount">Cantidad de tareas</option>
                                  </select>
                                  <select value={c.operator} onChange={e => updateCond(c.id, 'operator', e.target.value)} style={{ padding: '3px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' }}>
                                    {c.type === 'day' ? <><option value="is">es</option><option value="is not">no es</option></> : <><option value=">=">≥</option><option value="<=">≤</option><option value=">">{'>'}</option><option value="<">{'<'}</option></>}
                                  </select>
                                  {c.type === 'day'
                                    ? <select value={c.value} onChange={e => updateCond(c.id, 'value', e.target.value)} style={{ padding: '3px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' }}>
                                        {['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(d => <option key={d} value={d}>{d}</option>)}
                                      </select>
                                    : <input type="number" min="0" value={c.value} onChange={e => updateCond(c.id, 'value', e.target.value)} style={{ width: '60px', padding: '3px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }} />
                                  }
                                  {draftRule.conditions.length > 1 && <button type="button" onClick={() => removeCond(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✕</button>}
                                </div>
                              ))}
                              <button type="button" onClick={addCond} style={{ alignSelf: 'flex-start', padding: '3px 10px', borderRadius: '4px', border: '1px dashed #a855f7', backgroundColor: '#fff', color: '#7e22ce', fontSize: '10px', cursor: 'pointer' }}>+ Agregar condición</button>
                            </div>

                            {/* Action */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce', textTransform: 'uppercase' }}>ENTONCES…</span>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <select value={draftRule.action.type} onChange={e => updateDraftAction('type', e.target.value)} style={{ padding: '4px 8px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' }}>
                                  <option value="suggest_task">Sugerir tarea nueva</option>
                                  <option value="extend_last">Extender última tarea</option>
                                </select>
                                {draftRule.action.type === 'suggest_task' && <>
                                  <input placeholder="Nombre de la tarea" value={draftRule.action.taskText || ''} onChange={e => updateDraftAction('taskText', e.target.value)} style={{ flex: 1, minWidth: '140px', padding: '4px 8px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px' }} />
                                  <input type="number" min="5" step="5" value={draftRule.action.minutes} onChange={e => updateDraftAction('minutes', e.target.value)} style={{ width: '55px', padding: '4px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }} />
                                  <span style={{ fontSize: '10px', color: '#64748b' }}>min</span>
                                </>}
                                {draftRule.action.type === 'extend_last' && <>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>+</span>
                                  <input type="number" min="5" step="5" value={draftRule.action.minutes} onChange={e => updateDraftAction('minutes', e.target.value)} style={{ width: '55px', padding: '4px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }} />
                                  <span style={{ fontSize: '10px', color: '#64748b' }}>min a última tarea</span>
                                </>}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" onClick={saveSmartRuleDraft} style={{ padding: '5px 16px', borderRadius: '5px', border: 'none', backgroundColor: '#7e22ce', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>✓ Guardar regla</button>
                              <button type="button" onClick={() => { setEditingSmartRuleId(null); setDraftRule(null) }} style={{ padding: '5px 14px', borderRadius: '5px', border: '1px solid #d8b4fe', backgroundColor: '#fff', color: '#7e22ce', fontSize: '11px', cursor: 'pointer' }}>Cancelar</button>
                            </div>
                          </div>
                        )}
                      </div>}
                    </div>

                    {/* ── FILLER POOL ── */}
                    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', cursor: 'pointer', backgroundColor: panelSections.filler ? '#f0fdf4' : '#fff' }} onClick={() => toggleSection('filler')}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534' }}>✨ FILLER POOL ({fillerPool.length}) {(shiftHours * 60 - totalMinutesNeeded) > 0 && <span style={{ color: '#16a34a', fontWeight: 'normal' }}>· {shiftHours * 60 - totalMinutesNeeded} min libres</span>}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.filler ? '▲' : '▼'}</span>
                      </div>
                      {panelSections.filler && <div style={{ padding: '8px 14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(shiftHours * 60 - totalMinutesNeeded) > 0 && !absentDates[selectedDateStr] && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {fillerPool.filter(f => f.minutes <= (shiftHours * 60 - totalMinutesNeeded)).map(f => (
                              <div key={`use-${f.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#f0fdf4', borderRadius: '5px', border: '1px solid #bbf7d0' }}>
                                <span style={{ fontSize: '12px', color: '#1e293b' }}>{f.text} <span style={{ color: '#64748b' }}>({f.minutes} min)</span></span>
                                <button type="button" onClick={() => useFillerTask(f)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+ Hoy</button>
                              </div>
                            ))}
                            {fillerPool.filter(f => f.minutes <= (shiftHours * 60 - totalMinutesNeeded)).length === 0 && <span style={{ fontSize: '11px', color: '#64748b' }}>Ninguna tarea del pool encaja en los {shiftHours * 60 - totalMinutesNeeded} min libres.</span>}
                          </div>
                        )}
                        <form onSubmit={handleAddFiller} style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select value={newFillerRuleId} onChange={e => { setNewFillerRuleId(e.target.value); const r = customRules.find(x => x.id === e.target.value); if (r) setNewFillerMinutes(r.minutes) }} style={{ flex: 1, minWidth: '160px', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px' }}>
                            <option value="">— Agregar tarea al pool —</option>
                            {customRules.filter(r => !fillerPool.some(f => f.ruleId === r.id)).map(r => <option key={r.id} value={r.id}>{r.text}</option>)}
                          </select>
                          <input type="number" min="1" step="5" value={newFillerMinutes} onChange={e => setNewFillerMinutes(Number(e.target.value))} style={{ width: '55px', padding: '5px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px', textAlign: 'center' }} />
                          <span style={{ fontSize: '11px', color: '#64748b' }}>min</span>
                          <button type="submit" style={{ padding: '5px 12px', borderRadius: '5px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                        </form>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {fillerPool.map(f => (
                            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', backgroundColor: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '12px', color: '#1e293b' }}>{f.text} <span style={{ color: '#94a3b8' }}>({f.minutes} min)</span></span>
                              <button type="button" onClick={() => handleDeleteFiller(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                            </div>
                          ))}
                          {fillerPool.length === 0 && <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sin tareas en el pool todavía.</span>}
                        </div>
                      </div>}
                    </div>

                    {/* ── CONFIG ── */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', cursor: 'pointer', backgroundColor: panelSections.config ? '#f8fafc' : '#fff' }} onClick={() => toggleSection('config')}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>⚙️ CONFIGURACIÓN DEL MOTOR</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{panelSections.config ? '▲' : '▼'}</span>
                      </div>
                      {panelSections.config && <div style={{ padding: '8px 14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                            <input type="checkbox" checked={fillRules.autoFillEnabled} onChange={e => saveFillRules({ ...fillRules, autoFillEnabled: e.target.checked })} />
                            Sugerir relleno si libre ≥
                          </label>
                          <input type="number" min="5" max="120" value={fillRules.autoFillMinThreshold} onChange={e => saveFillRules({ ...fillRules, autoFillMinThreshold: Number(e.target.value) })} style={{ width: '50px', padding: '2px 6px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>min</span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={fillRules.autoTrimEnabled} onChange={e => saveFillRules({ ...fillRules, autoTrimEnabled: e.target.checked })} />
                          Sugerir recorte si hay overtime (menor rango primero)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={fillRules.showDecisionsLog} onChange={e => saveFillRules({ ...fillRules, showDecisionsLog: e.target.checked })} />
                          Mostrar log de decisiones del motor
                        </label>
                        {fillRules.showDecisionsLog && <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                          {decisionsLog.map(d => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '4px', backgroundColor: d.status === 'included' ? '#f0fdf4' : d.status === 'overflow' ? '#fef2f2' : '#f8fafc', border: `1px solid ${d.status === 'included' ? '#bbf7d0' : d.status === 'overflow' ? '#fca5a5' : '#e2e8f0'}` }}>
                              <span style={{ fontSize: '11px' }}>{d.status === 'included' ? '✅' : d.status === 'overflow' ? '⛔' : '⭕'}</span>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', minWidth: '130px' }}>{d.text}</span>
                              <span style={{ fontSize: '10px', color: '#64748b', flex: 1 }}>{d.reason}</span>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{d.minutes} min</span>
                            </div>
                          ))}
                        </div>}
                      </div>}
                    </div>

                  </div>}
                </div>
              )
            })()}
            <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packedTimeline.map((item, idx) => {
                const itemKey = `item-${selectedDateStr}-${idx}-${item.originalId}`
                const isChecked = !!completedTaskLog[itemKey]
                return (
                  <div key={itemKey} style={{ display: 'grid', gridTemplateColumns: '110px 35px 1fr 115px auto', gap: '12px', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: highlightedTaskId === item.originalId ? '2px solid #f59e0b' : '1px solid #edf2f7', backgroundColor: highlightedTaskId === item.originalId ? '#fffbeb' : isChecked ? '#f8fafc' : '#fff', opacity: isChecked ? 0.5 : 1, transition: 'background-color 0.3s, border-color 0.3s' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: '#334155' }}>{item.timeBlock}</span>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleTaskCheck(itemKey)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="text" value={item.displayLabel} onChange={(e) => handleDailyTextChange(item.originalId, e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '500', fontSize: '13px' }} />
                      <select value={item.computedActiveWeight} onChange={(e) => { const newRank = parseInt(e.target.value); updateMasterRuleMatrixDay(item.originalId, dayName, newRank) }} style={{ fontSize: '9px', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                        {Array.from({ length: 10 }).map((_, i) => <option key={i+1} value={i+1}>Rank {i+1}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                      <input type="number" min="0" step="5" value={item.duration} onChange={(e) => handleDailyDurationChange(item.originalId, e.target.value)} style={{ width: '40px', border: 'none', background: 'transparent', textAlign: 'right', fontSize: '12px' }} />
                      <span style={{ fontSize: '11px' }}>min</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <button type="button" onClick={() => triggerManualTaskRollover(item)} style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }} title="Pasar al día siguiente">↩ Posponer</button>
                      <button type="button" onClick={() => { const key = `hidden-${selectedDateStr}-${item.originalId}`; setCompletedTaskLog(prev => { const u = { ...prev, [key]: true }; localStorage.setItem('mastery_completed_log', JSON.stringify(u)); return u }) }} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} title="Eliminar del día">✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>📋 Master Task Rules Database Registry</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b' }}>Every single day possesses an explicit rank selector. Setting a day to <strong>Off</strong> excludes it from that day's operations entirely.</p>
            <div style={{ marginBottom: '24px' }}>
              <button type="button" onClick={() => setAddRuleOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: '1px solid #bfdbfe', backgroundColor: addRuleOpen ? '#eff6ff' : '#fff', color: '#2563eb', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                <span>➕ Agregar Tarea</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{addRuleOpen ? '▲' : '▼'}</span>
              </button>
              {addRuleOpen && <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginTop: '8px' }}>
              <form onSubmit={e => { handleAddRule(e); setAddRuleOpen(false) }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px', gap: '10px' }}>
                  <input type="text" placeholder="Description label text..." value={newChoreText} onChange={e => setNewChoreText(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                  <select value={newChoreType} onChange={e => setNewChoreType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}>
                    <option value="daily">Standard Run Mode</option>
                    <option value="interval">Custom Interval Loop</option>
                  </select>
                  <input type="number" placeholder="Mins" value={newChoreMinutes} onChange={e => setNewChoreMinutes(Number(e.target.value))} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }} />
                </div>
                <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>📅 Set Absolute Daily Ranks (Rank 1-10 / Pick 'Off' to disable chore for that day):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                    {daysOfWeekES.map(d => (
                      <div key={`matrix-form-v2-${d}`}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{d.slice(0,2)}</span>
                        <select value={newDayOverrides[d]} onChange={e => setNewDayOverrides({ ...newDayOverrides, [d]: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '4px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          <option value="0">Off</option>
                          {Array.from({ length: 10 }).map((_, i) => <option key={`f-m-opt-${i+1}`} value={i+1}>R {i+1}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                {newChoreType === 'interval' && (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1d4ed8' }}>🔄 CONFIGURACIÓN DE INTERVALO</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap' }}>Cada</label>
                        <input type="number" min="1" max="150" value={customIntervalDays} onChange={e => setCustomIntervalDays(Number(e.target.value))} style={{ padding: '5px 8px', width: '60px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #bfdbfe', borderRadius: '5px', fontSize: '13px' }} />
                        <label style={{ fontSize: '12px', color: '#475569' }}>días</label>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {[[7,'1 sem'],[14,'2 sem'],[21,'3 sem'],[30,'1 mes'],[45,'45d'],[60,'2 mes'],[90,'3 mes'],[120,'4 mes'],[150,'5 mes']].map(([d, label]) => (
                          <button key={d} type="button" onClick={() => setCustomIntervalDays(d)}
                            style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid', fontSize: '11px', cursor: 'pointer', fontWeight: customIntervalDays === d ? 'bold' : 'normal', backgroundColor: customIntervalDays === d ? '#2563eb' : '#fff', color: customIntervalDays === d ? '#fff' : '#475569', borderColor: customIntervalDays === d ? '#2563eb' : '#cbd5e1' }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap' }}>Fecha de inicio:</label>
                      <input type="date" value={customIntervalStartDate} onChange={e => setCustomIntervalStartDate(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #bfdbfe', borderRadius: '5px', fontSize: '12px' }} />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>La primera ejecución ocurre en esa fecha, luego cada {customIntervalDays} días.</span>
                    </div>
                  </div>
                )}
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end' }}>⚡ Save New Rule Card</button>
              </form>
              </div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {customRules.map(rule => (
                <div key={rule.id} style={{ borderRadius: '6px', backgroundColor: '#fff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {/* Header row — always visible */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', backgroundColor: rule.dayOverrides?.[dayName] > 0 ? '#eff6ff' : '#f8fafc' }}>
                    <button onClick={() => handleDeleteRule(rule.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>✕</button>
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: '600', color: '#0f172a', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.text}</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', flexShrink: 0 }}>{rule.minutes} min</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>{rule.type}</span>
                    {rule.type === 'interval' ? (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce', flexShrink: 0 }}>🔄 c/{rule.intervalDays || '?'}d</span>
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: rule.dayOverrides?.[dayName] > 0 ? '#2563eb' : '#94a3b8', flexShrink: 0 }}>{rule.dayOverrides?.[dayName] > 0 ? `R${rule.dayOverrides[dayName]} hoy` : 'off hoy'}</span>
                    )}
                    {expandedRuleCards[rule.id] ? (
                      <button type="button" onClick={() => setExpandedRuleCards(p => ({ ...p, [rule.id]: false }))} style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid #16a34a', backgroundColor: '#16a34a', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>✓ Guardar</button>
                    ) : (
                      <button type="button" onClick={() => setExpandedRuleCards(p => ({ ...p, [rule.id]: true }))} style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>✏️ Editar</button>
                    )}
                  </div>
                  {/* Expanded body — shown only when editing */}
                  {expandedRuleCards[rule.id] && <>
                  {/* Name / minutes / type row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <input type="text" value={rule.text} onChange={(e) => updateMasterRuleProperty(rule.id, 'text', e.target.value)} style={{ flex: 1, padding: '3px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', minWidth: 0 }} />
                    <input type="number" step="5" value={rule.minutes} onChange={(e) => updateMasterRuleProperty(rule.id, 'minutes', e.target.value)} style={{ width: '48px', padding: '3px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} />
                    <span style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>min</span>
                    <select value={rule.type} onChange={(e) => updateMasterRuleProperty(rule.id, 'type', e.target.value)} style={{ padding: '3px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="interval">interval</option>
                    </select>
                  </div>
                  {/* Interval config — shown only when type = interval */}
                  {rule.type === 'interval' && (
                    <div style={{ padding: '8px 10px', borderTop: '1px solid #e9d5ff', backgroundColor: '#faf5ff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce' }}>🔄 INTERVALO</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <label style={{ fontSize: '10px', color: '#64748b' }}>Cada</label>
                          <input type="number" min="1" max="150" value={rule.intervalDays || 30}
                            onChange={e => updateMasterRuleProperty(rule.id, 'intervalDays', e.target.value)}
                            style={{ width: '50px', padding: '2px 5px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #d8b4fe', borderRadius: '4px', textAlign: 'center' }} />
                          <label style={{ fontSize: '10px', color: '#64748b' }}>días</label>
                        </div>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {[[7,'1s'],[14,'2s'],[30,'1m'],[60,'2m'],[90,'3m'],[120,'4m'],[150,'5m']].map(([d, label]) => (
                            <button key={d} type="button"
                              onClick={() => updateMasterRuleProperty(rule.id, 'intervalDays', d)}
                              style={{ padding: '2px 6px', borderRadius: '3px', border: '1px solid', fontSize: '10px', cursor: 'pointer', fontWeight: (rule.intervalDays || 30) === d ? 'bold' : 'normal', backgroundColor: (rule.intervalDays || 30) === d ? '#7e22ce' : '#fff', color: (rule.intervalDays || 30) === d ? '#fff' : '#7e22ce', borderColor: '#d8b4fe' }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>📅 Inicio:</label>
                        <input type="date" value={rule.intervalStartDate || selectedDateStr}
                          onChange={e => updateMasterRuleProperty(rule.id, 'intervalStartDate', e.target.value)}
                          style={{ padding: '2px 6px', border: '1px solid #d8b4fe', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' }} />
                        {rule.intervalStartDate && (() => {
                          const msPerDay = 86400000
                          const daysSince = Math.round((new Date(selectedDateStr + 'T00:00:00') - new Date(rule.intervalStartDate + 'T00:00:00')) / msPerDay)
                          const daysUntilNext = daysSince < 0 ? Math.abs(daysSince) : (Number(rule.intervalDays) - (daysSince % Number(rule.intervalDays))) % Number(rule.intervalDays)
                          return <span style={{ fontSize: '10px', color: daysUntilNext === 0 ? '#16a34a' : '#64748b' }}>{daysUntilNext === 0 ? '✅ Hoy toca' : `Próxima en ${daysUntilNext} días`}</span>
                        })()}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '6px 8px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {daysOfWeekES.map(dayStr => {
                        const isCurrentActiveTarget = (dayName === dayStr)
                        const rankVal = rule.dayOverrides?.[dayStr] ?? 0
                        return (
                          <div key={`matrix-card-v2-${rule.id}-${dayStr}`} style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: isCurrentActiveTarget ? '#eff6ff' : '#f8fafc', border: isCurrentActiveTarget ? '1px solid #bfdbfe' : '1px solid #e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>
                            <span style={{ fontSize: '9px', color: isCurrentActiveTarget ? '#1e40af' : '#64748b', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{dayStr.slice(0, 2)}</span>
                            <select value={rankVal} onChange={e => updateMasterRuleMatrixDay(rule.id, dayStr, e.target.value)} style={{ padding: '1px 2px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '3px', backgroundColor: '#fff', color: rankVal > 0 ? '#2563eb' : '#94a3b8', width: '44px' }}>
                              <option value="0">Off</option>
                              {Array.from({ length: 10 }).map((_, rankIdx) => (
                                <option key={`cell-opt-${rankIdx+1}`} value={rankIdx+1}>R{rankIdx+1}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                    {expandedDayDurations[rule.id] && (
                      <div style={{ marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '4px' }}>⏱ Per-day durations (min)</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {daysOfWeekES.map(dayStr => (
                            <div key={`dur-${rule.id}-${dayStr}`} style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: dayName === dayStr ? '#eff6ff' : '#f8fafc', border: dayName === dayStr ? '1px solid #bfdbfe' : '1px solid #e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '9px', color: dayName === dayStr ? '#1e40af' : '#64748b', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{dayStr.slice(0, 2)}</span>
                              <input type="number" min="0" step="5" value={rule.dayDurations?.[dayStr] ?? rule.minutes} onChange={e => updateRuleDayDuration(rule.id, dayStr, e.target.value)} style={{ width: '38px', padding: '1px 3px', fontSize: '10px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '3px', backgroundColor: '#fff', color: '#0f172a' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  </>}
                </div>
              ))}
            </div>
          </div>

          {manuallySkippedToday.length > 0 && (
            <div style={{ backgroundColor: '#fefce8', border: '1px dashed #fde047', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', textTransform: 'uppercase', color: '#854d0e', fontWeight: 'bold' }}>↩️ TAREAS SALTADAS HOY — Click para restaurar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {manuallySkippedToday.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fde047', fontSize: '12px', color: '#854d0e', fontWeight: '500' }}>
                    <span>🚫 {item.displayLabel} ({item.duration} min)</span>
                    <button onClick={() => restoreSkippedTask(item.originalId)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>↩ Restaurar</button>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  )
}
