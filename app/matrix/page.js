'use client';

import { useEffect, useState, useMemo } from 'react'

const principalsData = [
  { id: '1', name: 'Tarta masa de polenta de pollo y acelga', kcal: 600, group: 'protein', tags: ['warm', 'batchable'] },
  { id: '3', name: 'Tarta masa de avena de jamon y queso', kcal: 600, group: 'protein', tags: ['warm', 'batchable'] },
  { id: '4', name: 'Tarta masa de avena de panceta y maiz', kcal: 610, group: 'grain', tags: ['warm', 'batchable'] },
  { id: '7', name: 'Curry de pollo y garbanzos', kcal: 880, group: 'protein', tags: ['warm', 'batchable'] },
  { id: '13', name: 'Carne de cerdo a la olla con verduras', kcal: 600, group: 'protein', tags: ['warm', 'batchable'] }
]

const daysOfWeekES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function Full7DayMatrixMasteryEngine() {
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-02')
  const [dayName, setDayName] = useState('Martes')
  const [dayNumber, setDayNumber] = useState(2)
  const [activePlan, setActivePlan] = useState({ 2: { lunch_principal_id: '1', dinner_principal_id: null } })
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
  const [customIntervalDays, setCustomIntervalDays] = useState(10)
  const [newChoreMinutes, setNewChoreMinutes] = useState(30)
  const [newDayOverrides, setNewDayOverrides] = useState({ 'Domingo': 0, 'Lunes': 1, 'Martes': 1, 'Miércoles': 1, 'Jueves': 1, 'Viernes': 1, 'Sábado': 0 })

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
  }, [])

  useEffect(() => {
    if (!selectedDateStr) return
    const dateObj = new Date(selectedDateStr + 'T00:00:00')
    setDayName(daysOfWeekES[dateObj.getDay()])
    const dayOfMonth = dateObj.getDate()
    setDayNumber(dayOfMonth <= 30 ? dayOfMonth : (dayOfMonth % 30) || 1)
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
    const newRule = { id: `custom-rule-${Date.now()}`, text: newChoreText, type: newChoreType, category: newChoreCategory, allowedDays: autoAllowedDays.length > 0 ? autoAllowedDays : daysOfWeekES, intervalDays: newChoreType === 'interval' ? Number(customIntervalDays) || 10 : 0, minutes: Number(newChoreMinutes) || 30, dayOverrides: { ...newDayOverrides } }
    const updatedRulesList = [...customRules, newRule]
    setCustomRules(updatedRulesList)
    localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRulesList))
    setNewChoreText('')
    setNewDayOverrides({ 'Domingo': 0, 'Lunes': 1, 'Martes': 1, 'Miércoles': 1, 'Jueves': 1, 'Viernes': 1, 'Sábado': 0 })
  }

  function handleDeleteRule(id) { const updatedRulesList = customRules.filter(r => r.id !== id); setCustomRules(updatedRulesList); localStorage.setItem('matrix_mastery_rules_v2', JSON.stringify(updatedRulesList)) }

  function handleClearAllStorage() { localStorage.removeItem('matrix_mastery_rules_v2'); localStorage.removeItem('mastery_backlog_pool'); localStorage.removeItem('mastery_completed_log'); localStorage.removeItem('mastery_daily_durations'); localStorage.removeItem('mastery_daily_texts'); window.location.reload() }

  const toggleTaskCheck = (key) => setCompletedTaskLog(prev => ({ ...prev, [key]: !prev[key] }))

  function triggerManualTaskRollover(taskItem) {
    if (taskItem.displayLabel.includes('🔄 Rollover:')) return
    const nextDate = new Date(selectedDateStr)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateStr = nextDate.toISOString().split('T')[0]
    const instanceId = `rolled-${Date.now()}-${taskItem.originalId || taskItem.id}`
    const rolledItem = { id: instanceId, originalId: taskItem.originalId || taskItem.id, label: `🔄 Rollover: ${taskItem.displayLabel.replace('🔄 Rollover: ', '')}`, duration: taskItem.duration, type: taskItem.type, computedActiveWeight: taskItem.computedActiveWeight, targetDate: nextDateStr }
    setBacklogPool(prev => { const updated = [...prev, rolledItem]; localStorage.setItem('mastery_backlog_pool', JSON.stringify(updated)); return updated })
    const key = `hidden-${selectedDateStr}-${taskItem.originalId}`
    setCompletedTaskLog(prev => { const updated = { ...prev, [key]: true }; localStorage.setItem('mastery_completed_log', JSON.stringify(updated)); return updated })
  }

  function toggleAbsenceState() { setAbsentDates(prev => ({ ...prev, [selectedDateStr]: !absentDates[selectedDateStr] })) }

  function moveTaskPriorityUp(originalId, currentIndex, list) { if (currentIndex === 0) return; const nextOrderMap = { ...taskCustomOrder }; list.forEach((item, idx) => { if (nextOrderMap[item.originalId] === undefined) nextOrderMap[item.originalId] = item.computedActiveWeight * 100 + idx }); const currentItemLabel = list[currentIndex].originalId; const aboveItemLabel = list[currentIndex - 1].originalId; nextOrderMap[currentItemLabel] = nextOrderMap[aboveItemLabel] - 1; setTaskCustomOrder(nextOrderMap) }
  function moveTaskPriorityDown(originalId, currentIndex, list) { if (currentIndex === list.length - 1) return; const nextOrderMap = { ...taskCustomOrder }; list.forEach((item, idx) => { if (nextOrderMap[item.originalId] === undefined) nextOrderMap[item.originalId] = item.computedActiveWeight * 100 + idx }); const currentItemLabel = list[currentIndex].originalId; const belowItemLabel = list[currentIndex + 1].originalId; nextOrderMap[currentItemLabel] = nextOrderMap[belowItemLabel] + 1; setTaskCustomOrder(nextOrderMap) }

  const resolveFoodItem = (id, dataset) => dataset.find(item => item.id === String(id)) || null
  const dayConfig = activePlan[dayNumber] || null
  const lunchP = dayConfig ? resolveFoodItem(dayConfig.lunch_principal_id, principalsData) : null

  const compileBaseTasksBeforePacking = () => {
    let list = []
    customRules.forEach(rule => {
      let isMatch = false
      if (rule.type === 'interval') { if (dayNumber % Number(rule.intervalDays) === 0) isMatch = true } else { const todayWeightValue = rule.dayOverrides?.[dayName] ?? 0; if (todayWeightValue > 0) isMatch = true }
      if (isMatch) {
        const finalActiveWeight = rule.dayOverrides?.[dayName] || 5
        const savedDuration = dailyDurationOverrides[`${selectedDateStr}_${rule.id}`]
        const savedText = dailyTextOverrides[`${selectedDateStr}_${rule.id}`]
        let finalLabel = savedText !== undefined ? savedText : rule.text
        if (rule.id === 'rule-lunch' && lunchP) { finalLabel = `${savedText !== undefined ? savedText : 'Cocinar almuerzo'}: ${lunchP.name}` }
        list.push({ originalId: rule.id, displayLabel: finalLabel, duration: savedDuration !== undefined ? savedDuration : rule.minutes, type: rule.category, computedActiveWeight: finalActiveWeight })
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

  const { activeUnpackedList, packedTimeline, totalMinutesNeeded, skippedBacklogItems } = useMemo(() => {
    if (absentDates[selectedDateStr]) { return { activeUnpackedList: [], packedTimeline: [], totalMinutesNeeded: 0, skippedBacklogItems: [] } }
    const base = compileBaseTasksBeforePacking()
    const back = backlogPool.filter(b => b.targetDate === selectedDateStr).map(b => { const savedDuration = dailyDurationOverrides[`${selectedDateStr}_${b.originalId}`]; const savedText = dailyTextOverrides[`${selectedDateStr}_${b.originalId}`]; return { originalId: b.originalId, displayLabel: savedText !== undefined ? savedText : b.label, duration: savedDuration !== undefined ? savedDuration : b.duration, type: b.type, isFromBacklog: true, computedActiveWeight: b.computedActiveWeight ?? 5 } })
    const primaryPool = [...base, ...back].filter(item => !completedTaskLog[`hidden-${selectedDateStr}-${item.originalId}`]).sort((a, b) => { const hasCustomA = taskCustomOrder[a.originalId] !== undefined; const hasCustomB = taskCustomOrder[b.originalId] !== undefined; if (hasCustomA || hasCustomB) { const orderA = hasCustomA ? taskCustomOrder[a.originalId] : (a.computedActiveWeight * 100); const orderB = hasCustomB ? taskCustomOrder[b.originalId] : (b.computedActiveWeight * 100); return orderA - orderB } return a.computedActiveWeight - b.computedActiveWeight })
    const totalMaxMinutesAllowed = shiftHours * 60
    let packed = [], currentCumulativeMinutes = 0, skipped = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    let baseTimeTracker = new Date()
    baseTimeTracker.setHours(startHour, startMin, 0, 0)
    primaryPool.forEach((item) => { const prospectiveMinutes = currentCumulativeMinutes + item.duration; if (prospectiveMinutes > totalMaxMinutesAllowed) { skipped.push(item) } else { const itemStartStr = baseTimeTracker.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); baseTimeTracker.setMinutes(baseTimeTracker.getMinutes() + item.duration); const itemEndStr = baseTimeTracker.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); currentCumulativeMinutes += item.duration; packed.push({ ...item, timeBlock: `${itemStartStr} - ${itemEndStr}` }) } })
    return { activeUnpackedList: primaryPool, packedTimeline: packed, totalMinutesNeeded: currentCumulativeMinutes, skippedBacklogItems: skipped }
  }, [completedTaskLog, backlogPool, selectedDateStr, absentDates, taskCustomOrder, dailyDurationOverrides, dailyTextOverrides, customRules, shiftHours, startTime])

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>⏱️ Optimized Hourly Roadmap — {selectedDateStr} ({dayName})</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>⏳ Total Time: {totalMinutesNeeded} / {shiftHours * 60} mins</div>
                <div style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 'bold', color: '#166534' }}>☀️ MENU ALMUERZO: {lunchP ? lunchP.name : 'Leftovers Shift'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packedTimeline.map((item, idx) => {
                const itemKey = `item-${selectedDateStr}-${idx}-${item.originalId}`
                const isChecked = !!completedTaskLog[itemKey]
                return (
                  <div key={itemKey} style={{ display: 'grid', gridTemplateColumns: '110px 35px 1fr 115px 105px', gap: '12px', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: '1px solid #edf2f7', backgroundColor: isChecked ? '#f8fafc' : '#fff', opacity: isChecked ? 0.5 : 1 }}>
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
                    <button type="button" onClick={() => triggerManualTaskRollover(item)} style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Skip Task</button>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>📋 Master Task Rules Database Registry</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b' }}>Every single day possesses an explicit rank selector. Setting a day to <strong>Off</strong> excludes it from that day's operations entirely.</p>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '12px' }}>➕ INJECT NEW CHORE RULE CARD</span>
              <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: 'fit-content' }}>
                    <span>Execute interval sequence once every </span>
                    <input type="number" min="1" value={customIntervalDays} onChange={e => setCustomIntervalDays(Number(e.target.value))} style={{ padding: '4px', width: '50px', textAlign: 'center', fontWeight: 'bold' }} />
                    <span> days cycle</span>
                  </div>
                )}
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end' }}>⚡ Save New Rule Card</button>
              </form>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {customRules.map(rule => (
                <div key={rule.id} style={{ borderRadius: '6px', backgroundColor: '#fff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', backgroundColor: rule.dayOverrides?.[dayName] > 0 ? '#eff6ff' : '#f8fafc' }}>
                    <button onClick={() => handleDeleteRule(rule.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>✕</button>
                    <input type="text" value={rule.text} onChange={(e) => updateMasterRuleProperty(rule.id, 'text', e.target.value)} style={{ flex: 1, padding: '3px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', minWidth: 0 }} />
                    <input type="number" step="5" value={rule.minutes} onChange={(e) => updateMasterRuleProperty(rule.id, 'minutes', e.target.value)} style={{ width: '48px', padding: '3px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} />
                    <span style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>min</span>
                    <select value={rule.type} onChange={(e) => updateMasterRuleProperty(rule.id, 'type', e.target.value)} style={{ padding: '3px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                      <option value="daily">daily</option>
                      <option value="interval">interval</option>
                    </select>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: rule.dayOverrides?.[dayName] > 0 ? '#2563eb' : '#94a3b8', flexShrink: 0 }}>{rule.dayOverrides?.[dayName] > 0 ? `R${rule.dayOverrides[dayName]} today` : 'off today'}</span>
                  </div>
                  <div style={{ padding: '6px 8px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                      {daysOfWeekES.map(dayStr => {
                        const isCurrentActiveTarget = (dayName === dayStr)
                        const rankVal = rule.dayOverrides?.[dayStr] ?? 0
                        return (
                          <div key={`matrix-card-v2-${rule.id}-${dayStr}`} style={{ backgroundColor: isCurrentActiveTarget ? '#eff6ff' : 'transparent', border: isCurrentActiveTarget ? '1px solid #bfdbfe' : '1px solid transparent', padding: '2px', borderRadius: '4px' }}>
                            <span style={{ fontSize: '9px', color: isCurrentActiveTarget ? '#1e40af' : '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>{dayStr.slice(0, 2)}</span>
                            <select value={rankVal} onChange={e => updateMasterRuleMatrixDay(rule.id, dayStr, e.target.value)} style={{ width: '100%', padding: '2px', fontSize: '10px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '3px', backgroundColor: '#fff', color: rankVal > 0 ? '#2563eb' : '#94a3b8' }}>
                              <option value="0">Off</option>
                              {Array.from({ length: 10 }).map((_, rankIdx) => (
                                <option key={`cell-opt-${rankIdx+1}`} value={rankIdx+1}>R{rankIdx+1}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {skippedBacklogItems.length > 0 && (
            <div style={{ backgroundColor: '#fff7ed', border: '1px dashed #ffedd5', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', textTransform: 'uppercase', color: '#c2410c', fontWeight: 'bold' }}>⚠️ AUTOMATED PREVENTATIVE DEFERRALS (Workload Rolled Forward)</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#7c2d12' }}>These low-priority tasks exceed the strict limit for today. The engine automatically deferred them to prevent overwork.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {skippedBacklogItems.map((item, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ffedd5', fontSize: '12px', color: '#9a3412', fontWeight: '500' }}>
                    ⏭️ <strong>[Rank {item.computedActiveWeight}]</strong> {item.displayLabel} ({item.duration} mins)
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
