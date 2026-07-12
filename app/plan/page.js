'use client'

import { useEffect, useState } from 'react'

const principalsData = [
  { id: '1', name: 'Milanesa de calabacin a la napolitana', kcal: 450, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '2', name: 'Calabacin en rodaja a la napolitana', kcal: 450, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '3', name: 'Tarta masa de avena de jamon y queso', kcal: 600, group: 'protein', tags: ['warm', 'dairy'] },
  { id: '4', name: 'Tarta masa de avena de panceta y maiz', kcal: 610, group: 'grain', tags: ['warm', 'pork'] },
  { id: '5', name: 'Tarta masa de polenta de pollo y acelga', kcal: 600, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '6', name: 'Cubos pollo salteado con chauchas', kcal: 560, group: 'protein', tags: ['warm', 'poultry', 'greenbeans', 'low-cholesterol'] },
  { id: '7', name: 'Curry de pollo y garbanzos', kcal: 880, group: 'protein', tags: ['warm', 'poultry', 'grains'] },
  { id: '8', name: 'Curry de pollo y remolacha', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '9', name: 'Pollo al pimenton Mima', kcal: 560, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '10', name: 'Berengenas al horno a la napolitana', kcal: 460, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '11', name: 'Pastel de carne y zapallitos', kcal: 910, group: 'protein', tags: ['warm', 'beef'] },
  { id: '12', name: 'Zapallitos rellenos de carne de res', kcal: 570, group: 'protein', tags: ['warm', 'beef'] },
  { id: '13', name: 'Carne de cerdo a la olla con verduras', kcal: 600, group: 'protein', tags: ['warm', 'pork'] },
  { id: '14', name: 'Pollo a la olla del horno con verduras', kcal: 540, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '15', name: 'Carne de res a la olla con verduras', kcal: 580, group: 'protein', tags: ['warm', 'beef'] },
  { id: '16', name: 'Carne de res a presion con verduras', kcal: 575, group: 'protein', tags: ['warm', 'beef'] },
  { id: '17', name: 'Pollo a presion con chauchas', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'greenbeans', 'low-cholesterol'] },
  { id: '18', name: 'Pollo spicy salteado con cebolla', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '19', name: 'Soufle de zapallitos', kcal: 435, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '20', name: 'Carne de cerdo al horno limon', kcal: 575, group: 'protein', tags: ['warm', 'pork'] },
  { id: '21', name: 'Pastel de papas de carne de res', kcal: 880, group: 'protein', tags: ['warm', 'beef'] },
  { id: '22', name: 'Caponatta de berenjenas', kcal: 450, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '23', name: 'Lasagna tradicional con salsa bolognesa', kcal: 910, group: 'grain', tags: ['warm', 'beef', 'pasta'] },
  { id: '24', name: 'Lasagna de zuchinins salsa pollo', kcal: 890, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '25', name: 'Canelones de carne con salsa filetto', kcal: 880, group: 'grain', tags: ['warm', 'beef', 'pasta'] },
  { id: '26', name: 'Canelones de pollo con salsa filetto', kcal: 880, group: 'grain', tags: ['warm', 'poultry', 'pasta', 'low-cholesterol'] },
  { id: '27', name: 'Canelones de pollo y choclo', kcal: 890, group: 'grain', tags: ['warm', 'poultry', 'pasta'] },
  { id: '28', name: 'Chow fan de camarones', kcal: 885, group: 'grain', tags: ['warm', 'seafood', 'rice'] },
  { id: '29', name: 'Bao de cerdo', kcal: 575, group: 'grain', tags: ['warm', 'pork'] },
  { id: '30', name: 'Ramen de pollo', kcal: 880, group: 'grain', tags: ['warm', 'poultry', 'noodles'] },
  { id: '31', name: 'Lomitos', kcal: 560, group: 'protein', tags: ['warm', 'beef'] },
  { id: '32', name: 'Omelette de jamon y queso', kcal: 540, group: 'protein', tags: ['warm', 'dairy'] },
  { id: '33', name: 'Bifes de pollo a la plancha', kcal: 545, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '34', name: 'Salchichas y huevos duros', kcal: 550, group: 'protein', tags: ['warm', 'egg'] },
  { id: '35', name: 'Hamburguesa de res', kcal: 550, group: 'protein', tags: ['warm', 'beef'] },
  { id: '36', name: 'Carbonada de cerdo', kcal: 570, group: 'protein', tags: ['warm', 'pork'] },
  { id: '37', name: 'Bifes de cerdo salteados con cebolla', kcal: 560, group: 'protein', tags: ['warm', 'pork'] },
  { id: '38', name: 'Milanesas de soja a la napolitana', kcal: 430, group: 'protein', tags: ['warm', 'vegetarian', 'soy', 'low-cholesterol'] },
  { id: '39', name: 'Bifes de cerdo a la plancha', kcal: 550, group: 'protein', tags: ['warm', 'pork'] },
  { id: '40', name: 'Pescado y verduras al horno', kcal: 540, group: 'protein', tags: ['warm', 'fish', 'low-cholesterol'] },
  { id: '41', name: 'Costeletas de cerdo a la plancha', kcal: 570, group: 'protein', tags: ['warm', 'pork'] },
  { id: '42', name: 'Chorizos al horno', kcal: 580, group: 'protein', tags: ['warm', 'pork'] },
  { id: '43', name: 'Polenta con salsa bolognesa de res', kcal: 870, group: 'grain', tags: ['warm', 'beef'] },
  { id: '44', name: 'Polenta gratin', kcal: 880, group: 'grain', tags: ['warm', 'dairy'] },
  { id: '45', name: 'Salteado chino de pollo', kcal: 540, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '46', name: 'Milanesas de berenjena', kcal: 430, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '47', name: 'Chow mien', kcal: 895, group: 'grain', tags: ['warm', 'noodles'] },
  { id: '48', name: 'Fideos con salsa bolognesa de pollo', kcal: 890, group: 'grain', tags: ['warm', 'poultry', 'pasta'] },
  { id: '49', name: 'Pechugas a la olla con hierbas', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '50', name: 'Tortilla de papas', kcal: 600, group: 'vegetable', tags: ['warm', 'vegetarian'] },
  { id: '51', name: 'Empanadas de pollo', kcal: 530, group: 'grain', tags: ['warm', 'poultry'] },
  { id: '52', name: 'Empanadas de cerdo', kcal: 541, group: 'grain', tags: ['warm', 'pork'] },
  { id: '53', name: 'Empanadas de pescado', kcal: 540, group: 'grain', tags: ['warm', 'fish'] },
  { id: '54', name: 'Fajitas de res', kcal: 540, group: 'protein', tags: ['warm', 'beef'] },
  { id: '55', name: 'Pescado gratin con verduras', kcal: 550, group: 'protein', tags: ['warm', 'fish'] },
  { id: '56', name: 'Filet de pescado a la plancha', kcal: 530, group: 'protein', tags: ['warm', 'fish', 'low-cholesterol'] },
  { id: '57', name: 'Casuela de pollo', kcal: 880, group: 'protein', tags: ['warm', 'poultry'] },
  { id: '58', name: 'Pizza jamon y huevo', kcal: 550, group: 'grain', tags: ['warm'] },
  { id: '59', name: 'Pizza de pollo spicy', kcal: 540, group: 'grain', tags: ['warm', 'poultry'] },
  { id: '60', name: 'Pollo a la holla con papas', kcal: 890, group: 'protein', tags: ['warm', 'poultry'] },
  { id: '61', name: 'Cerdo a la holla con verduras', kcal: 550, group: 'protein', tags: ['warm', 'pork'] },
  { id: '62', name: 'Pollo y cebollas a la leche', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'dairy'] },
  { id: '63', name: 'Carbonada de res', kcal: 890, group: 'protein', tags: ['warm', 'beef'] },
  { id: '64', name: 'Carbonada de pollo', kcal: 890, group: 'protein', tags: ['warm', 'poultry'] },
  { id: '65', name: 'Lasagna de zuchinins', kcal: 540, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '66', name: 'Osobuco al limon', kcal: 570, group: 'protein', tags: ['warm', 'beef'] },
  { id: '67', name: 'Albondigas de cerdo', kcal: 560, group: 'protein', tags: ['warm', 'pork'] },
  { id: '68', name: 'Albondigas de pollo', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '70', name: 'Albondigas de res', kcal: 560, group: 'protein', tags: ['warm', 'beef'] },
  { id: '71', name: 'Pastel de Pollo', kcal: 890, group: 'protein', tags: ['warm', 'poultry'] },
  { id: '72', name: 'Soufle de calabaza', kcal: 460, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '73', name: 'Pastel de papas de pollo', kcal: 910, group: 'protein', tags: ['warm', 'poultry'] },
  { id: '74', name: 'Milanesas de zucchini', kcal: 440, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '75', name: 'Pollo a la crema de verdeo', kcal: 550, group: 'protein', tags: ['warm', 'poultry', 'dairy'] },
  { id: '76', name: 'Pollo tandoori marinado con yogur', kcal: 560, group: 'protein', tags: ['warm', 'poultry', 'dairy', 'low-cholesterol'] },
  { id: '77', name: 'Niños envueltos con salsa filetto', kcal: 545, group: 'protein', tags: ['warm', 'beef'] },
  { id: '78', name: 'Carne de cerdo mostaza y miel', kcal: 560, group: 'protein', tags: ['warm', 'pork'] },
  { id: '79', name: 'Bifes de Cerdo salteado con jengibre', kcal: 550, group: 'protein', tags: ['warm', 'pork'] },
  { id: '80', name: 'Ravioles con salsa scarparo', kcal: 890, group: 'grain', tags: ['warm', 'pasta'] },
  { id: '81', name: 'Empanadas de capresse', kcal: 540, group: 'grain', tags: ['warm', 'dairy', 'vegetarian'] },
  { id: '82', name: 'Bao de cerdo camaron repollo', kcal: 910, group: 'grain', tags: ['warm', 'pork', 'seafood'] },
  { id: '83', name: 'Tortillas de lentejas', kcal: 530, group: 'protein', tags: ['warm', 'lentils', 'vegetarian', 'low-cholesterol'] },
  { id: '84', name: 'Soufflé de queso', kcal: 435, group: 'vegetable', tags: ['warm', 'dairy', 'vegetarian'] },
  { id: '85', name: 'Soufflé de brócoli con bechamel', kcal: 430, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '86', name: 'Locro', kcal: 950, group: 'protein', tags: ['warm', 'pork', 'beef'] },
  { id: '87', name: 'Humita en olla', kcal: 890, group: 'vegetable', tags: ['warm', 'vegetarian'] },
  { id: '88', name: 'Guiso de mondongo con garbanzos', kcal: 920, group: 'protein', tags: ['warm', 'beef'] },
  { id: '89', name: 'Guiso de porotos alubias', kcal: 930, group: 'protein', tags: ['warm', 'beans', 'pork'] },
  { id: '90', name: 'Bifes de cerdo', kcal: 560, group: 'protein', tags: ['warm', 'pork'] },
  { id: '91', name: 'Hamburguesas de pollo', kcal: 540, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '92', name: 'Hamburguesas de cerdo', kcal: 550, group: 'protein', tags: ['warm', 'pork'] },
  { id: '93', name: 'Curry de lentejas rojas y vegetales', kcal: 530, group: 'protein', tags: ['warm', 'lentils', 'vegetarian', 'low-cholesterol'] },
  { id: '94', name: 'Sushi', kcal: 910, group: 'grain', tags: ['cold', 'fish', 'rice'] },
  { id: '95', name: 'Brochettes de carne', kcal: 540, group: 'protein', tags: ['warm', 'beef'] },
  { id: '96', name: 'Pastel de papas con base de lenteja', kcal: 890, group: 'protein', tags: ['warm', 'lentils', 'vegetarian', 'low-cholesterol'] },
  { id: '97', name: 'Hamburguesa de garbanzos remolacha', kcal: 520, group: 'protein', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '98', name: 'Hamburguesa de hongos portobello', kcal: 530, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '100', name: 'Tortilla de acelga queso gratin', kcal: 540, group: 'vegetable', tags: ['warm', 'vegetarian'] },
  { id: '101', name: 'Soufle de zapallitos panceta', kcal: 460, group: 'vegetable', tags: ['warm', 'pork'] },
  { id: '102', name: 'Lasagna de masa salsa carne', kcal: 910, group: 'grain', tags: ['warm', 'beef', 'pasta'] },
  { id: '103', name: 'Tarta de pescado', kcal: 540, group: 'grain', tags: ['warm', 'fish'] },
  { id: '104', name: 'Tarta de verduras', kcal: 540, group: 'grain', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '105', name: 'Canelones de carne y acelga', kcal: 890, group: 'grain', tags: ['warm', 'beef', 'pasta'] },
  { id: '106', name: 'Canelones de pollo y zanahoria', kcal: 885, group: 'grain', tags: ['warm', 'poultry', 'pasta', 'low-cholesterol'] },
  { id: '107', name: 'Canelones de choclo y pollo', kcal: 895, group: 'grain', tags: ['warm', 'poultry', 'pasta'] },
  { id: '108', name: 'Albondigas con Pure de papa', kcal: 890, group: 'protein', tags: ['warm', 'beef'] },
  { id: '109', name: 'Fajitas de pollo', kcal: 540, group: 'protein', tags: ['warm', 'poultry', 'low-cholesterol'] },
  { id: '110', name: 'Arroz chino salteado', kcal: 880, group: 'grain', tags: ['warm', 'rice'] },
  { id: '111', name: 'Risotto', kcal: 890, group: 'grain', tags: ['warm', 'rice', 'dairy'] },
  { id: '112', name: 'Sorrentinos con salsa rosa', kcal: 900, group: 'grain', tags: ['warm', 'pasta', 'dairy'] },
  { id: '113', name: 'Gnocchis con salsa estofado', kcal: 920, group: 'grain', tags: ['warm', 'beef', 'pasta'] },
  { id: '114', name: 'Tortilla de zucchini provoleta', kcal: 540, group: 'vegetable', tags: ['warm', 'dairy', 'vegetarian'] },
  { id: '115', name: 'Hamburguesas de lentejas avena', kcal: 520, group: 'protein', tags: ['warm', 'vegetarian', 'low-cholesterol'] },
  { id: '116', name: 'Pastel de choclo dulce tradicional', kcal: 900, group: 'grain', tags: ['warm', 'beef'] },
  { id: '117', name: 'Omelette de espinacas', kcal: 520, group: 'vegetable', tags: ['warm', 'vegetarian', 'low-cholesterol'] }
]

const sidesData = [
  { id: '1', name: 'Tortillas de lentejas', kcal: 350, group: 'protein', tags: ['warm', 'lentils'] },
  { id: '2', name: 'Ensalada de tomate y hojas verdes', kcal: 300, group: 'vegetable', tags: ['cold', 'salad', 'low-cholesterol'] },
  { id: '3', name: 'Ensalada de zanahoria y lechuga', kcal: 300, group: 'vegetable', tags: ['cold', 'salad', 'low-cholesterol'] },
  { id: '4', name: 'Pure de papa, batata', kcal: 350, group: 'vegetable', tags: ['warm', 'low-cholesterol'] },
  { id: '5', name: 'Arroz amarillo', kcal: 350, group: 'grain', tags: ['warm', 'rice', 'low-cholesterol'] },
  { id: '6', name: 'Puré de papas clásico con manteca', kcal: 350, group: 'vegetable', tags: ['warm', 'dairy'] },
  { id: '7', name: 'Papas asadas al ajo y oliva', kcal: 350, group: 'vegetable', tags: ['warm', 'low-cholesterol'] },
  { id: '8', name: 'Pure de papa', kcal: 350, group: 'vegetable', tags: ['warm', 'low-cholesterol'] },
  { id: '9', name: 'Puré de batatas rústico con canela', kcal: 350, group: 'vegetable', tags: ['warm', 'low-cholesterol'] },
  { id: '10', name: 'Papas en cubos al horno', kcal: 350, group: 'vegetable', tags: ['warm', 'low-cholesterol'] },
  { id: '11', name: 'Arroz Blanco', kcal: 350, group: 'grain', tags: ['warm', 'rice', 'low-cholesterol'] },
  { id: '12', name: 'Arroz en salsa de mariscos', kcal: 350, group: 'grain', tags: ['warm', 'seafood'] },
  { id: '13', name: 'Papas Fritas', kcal: 350, group: 'vegetable', tags: ['warm'] },
  { id: '14', name: 'Papas y calabazas al horno', kcal: 350, group: 'vegetable', tags: ['warm', 'low-cholesterol'] },
  { id: '15', name: 'Ensalada rusa', kcal: 350, group: 'vegetable', tags: ['cold', 'salad'] }
]

const availableTagsPool = ['fish', 'greenbeans', 'cold', 'low-cholesterol', 'dairy', 'pork', 'beef', 'poultry', 'pasta', 'vegetarian']

export default function AdvancedMonthlyPlanner() {
  const [monthlyPlan, setMonthlyPlan] = useState({})
  const [macroMetrics, setMacroMetrics] = useState({ protein: 0, grain: 0, vegetable: 0 })
  const [actionMessage, setActionMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [minKcal, setMinKcal] = useState(1750)
  const [maxKcal, setMaxKcal] = useState(1850)
  const [excludedTags, setExcludedTags] = useState([])
  const [requiredTags, setRequiredTags] = useState([])
  const [customPresetName, setCustomPresetName] = useState('')
  const [savedPresets, setSavedPresets] = useState({})
  const [planMonth, setPlanMonth] = useState(new Date().getMonth())
  const [planYear, setPlanYear] = useState(new Date().getFullYear())
  const [activeProfileName, setActiveProfileName] = useState('')
  const [profileFields, setProfileFields] = useState({ age: '', goal: '', notes: '', activityLevel: '' })
  const [preferredTags, setPreferredTags] = useState([])
  const [likedMeals, setLikedMeals] = useState([])
  const [newRuleText, setNewRuleText] = useState('')
  const [newRuleType, setNewRuleType] = useState('balance')
  const [editingRuleId, setEditingRuleId] = useState(null)
  const [mealSearchQuery, setMealSearchQuery] = useState('')

  const DEFAULT_RULES = [
    { id: 'r1', type: 'balance', active: true, label: 'Sin repetición de principal en el mismo día — almuerzo ≠ cena (id diferente)' },
    { id: 'r2', type: 'balance', active: true, label: 'Almuerzo y cena no pueden ser del mismo grupo nutricional (primeras 800 iteraciones)' },
    { id: 'r3', type: 'kcal', active: true, label: 'Total diario debe estar dentro del rango [Min Kcal, Max Kcal] configurado' },
    { id: 'r4', type: 'kcal', active: true, label: 'Las guarniciones suman al total calórico del día' },
    { id: 'r5', type: 'balance', active: true, label: 'Distribución equitativa: usa los menos usados primero (sort por uso acumulado)' },
    { id: 'r6', type: 'kcal', active: true, label: 'Platos con kcal ≥ 880 no llevan guarnición (comida completa)' },
    { id: 'r7', type: 'kcal', active: true, label: 'Platos con kcal ≤ 600 siempre llevan guarnición' },
    { id: 'r8', type: 'filter', active: true, label: 'Tags excluidos eliminan platos del pool de generación completamente' },
    { id: 'r9', type: 'filter', active: true, label: 'Tags requeridos filtran solo platos que cumplan TODOS los requisitos' },
  ]
  const [allRules, setAllRules] = useState(DEFAULT_RULES)

  const saveAllRules = (updated) => { setAllRules(updated); localStorage.setItem('robomidas_generation_rules_v2', JSON.stringify(updated)) }

  const RULE_TYPE_COLORS = { balance: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: '⚖️ Balance' }, kcal: { bg: '#fef9c3', color: '#854d0e', border: '#fde047', label: '🔥 Kcal' }, filter: { bg: '#dcfce7', color: '#166534', border: '#86efac', label: '🔍 Filtro' }, limit: { bg: '#faf5ff', color: '#7e22ce', border: '#ddd6fe', label: '🔒 Límite' }, custom: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', label: '✏️ Custom' } }

  const dateForDay = (dayNum) => {
    const d = new Date(planYear, planMonth, dayNum)
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  useEffect(() => {
    const savedPlan = localStorage.getItem('robomidas_custom_monthly_plan')
    const savedPresetsList = localStorage.getItem('robomidas_saved_presets')
    const savedRulesV2 = localStorage.getItem('robomidas_generation_rules_v2')
    const savedActiveProfile = localStorage.getItem('robomidas_active_profile_name')
    if (savedPresetsList) { try { const presets = JSON.parse(savedPresetsList); setSavedPresets(presets); if (savedActiveProfile && presets[savedActiveProfile]) { const p = presets[savedActiveProfile]; setMinKcal(p.minKcal || 1750); setMaxKcal(p.maxKcal || 1850); setExcludedTags(p.excludedTags || []); setRequiredTags(p.requiredTags || []); setPreferredTags(p.preferredTags || []); setLikedMeals(p.likedMeals || []); if (p.profileFields) setProfileFields(p.profileFields); if (p.allRules) setAllRules(p.allRules); setActiveProfileName(savedActiveProfile) } } catch(e) {} }
    if (savedPlan) { try { const parsed = JSON.parse(savedPlan); setMonthlyPlan(parsed); calculateMetrics(parsed) } catch (e) { console.error(e) } }
    if (savedRulesV2) { try { setAllRules(JSON.parse(savedRulesV2)) } catch (e) {} }
  }, [])

  function calculateMetrics(plan) {
    let counts = { protein: 0, grain: 0, vegetable: 0 }
    Object.values(plan).forEach(day => {
      const pLunch = principalsData.find(p => p.id === day.lunch_principal_id)
      const pDinner = principalsData.find(p => p.id === day.dinner_principal_id)
      if (pLunch) counts[pLunch.group]++
      if (pDinner) counts[pDinner.group]++
    })
    setMacroMetrics(counts)
  }

  function handleDropdownSelect(dayIndex, slotKey, value) {
    const updatedPlan = { ...monthlyPlan, [dayIndex]: { ...(monthlyPlan[dayIndex] || { lunch_principal_id: null, lunch_side_id: null, dinner_principal_id: null, dinner_side_id: null }), [slotKey]: value === '' ? null : value } }
    setMonthlyPlan(updatedPlan)
    localStorage.setItem('robomidas_custom_monthly_plan', JSON.stringify(updatedPlan))
    window.dispatchEvent(new Event('storage'))
    calculateMetrics(updatedPlan)
  }

  function toggleTagFilter(tag, filterType) {
    if (filterType === 'exclude') { setExcludedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]) }
    else { setRequiredTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]) }
  }

  function saveCurrentConfigurationAsPreset(nameOverride) {
    const finalName = (nameOverride || activeProfileName || '').trim()
    if (!finalName) return
    const presetPayload = { minKcal, maxKcal, excludedTags, requiredTags, preferredTags, likedMeals, profileFields, allRules }
    const nextPresets = { ...savedPresets, [finalName]: presetPayload }
    setSavedPresets(nextPresets)
    localStorage.setItem('robomidas_saved_presets', JSON.stringify(nextPresets))
    setActiveProfileName(finalName)
    localStorage.setItem('robomidas_active_profile_name', finalName)
    setActionMessage(`✅ Perfil "${finalName}" guardado!`)
    setTimeout(() => setActionMessage(''), 3000)
  }

  function loadSavedPreset(name) {
    const target = savedPresets[name]
    if (!target) return
    setMinKcal(target.minKcal || 1750); setMaxKcal(target.maxKcal || 1850)
    setExcludedTags(target.excludedTags || []); setRequiredTags(target.requiredTags || [])
    setPreferredTags(target.preferredTags || []); setLikedMeals(target.likedMeals || [])
    if (target.profileFields) setProfileFields(target.profileFields)
    if (target.allRules) setAllRules(target.allRules)
    setActiveProfileName(name)
    localStorage.setItem('robomidas_active_profile_name', name)
    setActionMessage(`🎯 Perfil cargado: "${name}"`); setTimeout(() => setActionMessage(''), 3000)
  }

  function toggleLikedMeal(id) { setLikedMeals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) }
  function togglePreferredTag(tag) { setPreferredTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]) }

  function handleAddRule(e) {
    e.preventDefault()
    if (!newRuleText.trim()) return
    const rule = { id: `custom-${Date.now()}`, type: newRuleType, active: true, label: newRuleText.trim(), isCustom: true }
    saveAllRules([...allRules, rule])
    setNewRuleText('')
  }

  function handleDeleteRule(id) { saveAllRules(allRules.filter(r => r.id !== id)) }
  function handleToggleRule(id) { saveAllRules(allRules.map(r => r.id === id ? { ...r, active: !r.active } : r)) }
  function handleEditRuleLabel(id, newLabel) { saveAllRules(allRules.map(r => r.id === id ? { ...r, label: newLabel } : r)) }
  function handleEditRuleType(id, newType) { saveAllRules(allRules.map(r => r.id === id ? { ...r, type: newType } : r)) }

  function generateOptimizedMonth() {
    setLoading(true)
    setActionMessage('🚀 Filtering ingredients, processing exclusions, and adjusting target windows...')
    const filteredPrincipals = principalsData.filter(dish => {
      if (dish.tags.some(t => excludedTags.includes(t))) return false
      if (requiredTags.length > 0 && !requiredTags.every(t => dish.tags.includes(t))) return false
      return true
    }).map(dish => {
      // boost liked meals and preferred-tag meals by reducing their usage count start
      const boost = likedMeals.includes(dish.id) ? -4 : (dish.tags.some(t => preferredTags.includes(t)) ? -2 : 0)
      return { ...dish, _boost: boost }
    })
    const filteredSides = sidesData.filter(side => !side.tags.some(t => excludedTags.includes(t)))
    if (filteredPrincipals.length === 0 || filteredSides.length === 0) { setActionMessage('⚠️ Filters too narrow! No recipes match.'); setLoading(false); return }
    const newPlan = {}
    const principalUsageMap = {}; const sideUsageMap = {}
    filteredPrincipals.forEach(p => principalUsageMap[p.id] = 0)
    filteredSides.forEach(s => sideUsageMap[s.id] = 0)
    for (let day = 1; day <= 30; day++) {
      let lunchP = null, lunchS = null, dinnerP = null, dinnerS = null, matched = false, runs = 0
      while (!matched && runs < 1500) {
        runs++
        const sortedP = [...filteredPrincipals].sort((a, b) => (principalUsageMap[a.id] + (a._boost || 0)) - (principalUsageMap[b.id] + (b._boost || 0)))
        const sortedS = [...filteredSides].sort((a, b) => sideUsageMap[a.id] - sideUsageMap[b.id])
        const sliceSizeP = Math.min(12, sortedP.length); const sliceSizeS = Math.min(5, sortedS.length)
        const candidateLP = sortedP[Math.floor(Math.random() * sliceSizeP)]
        const candidateDP = sortedP[Math.floor(Math.random() * sliceSizeP)]
        if (candidateLP.id === candidateDP.id) continue
        if (candidateLP.group === candidateDP.group && runs < 800) continue
        const noSideThreshold = 880
        const requiresSideThreshold = 600
        const pickSide = (principal) => {
          if (principal.kcal >= noSideThreshold) return null
          if (principal.kcal <= requiresSideThreshold) return sortedS[Math.floor(Math.random() * sliceSizeS)]
          return Math.random() > 0.15 ? sortedS[Math.floor(Math.random() * sliceSizeS)] : null
        }
        const candidateLS = pickSide(candidateLP)
        const candidateDS = pickSide(candidateDP)
        const daySumKcal = Number(candidateLP.kcal || 0) + Number(candidateLS ? candidateLS.kcal : 0) + Number(candidateDP.kcal || 0) + Number(candidateDS ? candidateDS.kcal : 0)
        if (daySumKcal >= minKcal && daySumKcal <= maxKcal) { lunchP = candidateLP; dinnerP = candidateDP; lunchS = candidateLS; dinnerS = candidateDS; matched = true }
      }
      if (!matched) { lunchP = filteredPrincipals[day % filteredPrincipals.length]; dinnerP = filteredPrincipals[(day + 2) % filteredPrincipals.length]; lunchS = filteredSides[day % filteredSides.length] }
      principalUsageMap[lunchP.id]++; principalUsageMap[dinnerP.id]++
      if (lunchS) sideUsageMap[lunchS.id]++; if (dinnerS) sideUsageMap[dinnerS.id]++
      newPlan[day] = { lunch_principal_id: lunchP.id, lunch_side_id: lunchS ? lunchS.id : null, dinner_principal_id: dinnerP.id, dinner_side_id: dinnerS ? dinnerS.id : null }
    }
    setMonthlyPlan(newPlan)
    localStorage.setItem('robomidas_custom_monthly_plan', JSON.stringify(newPlan))
    window.dispatchEvent(new Event('storage'))
    calculateMetrics(newPlan)
    setLoading(false)
    setActionMessage('🎯 30-Day Calendar generated!')
    setTimeout(() => setActionMessage(''), 4000)
  }

  const getKcal = (id, list) => { if (!id) return 0; const found = list.find(item => item.id === String(id)); return found ? Number(found.kcal || 0) : 0 }

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', maxWidth: '1850px', margin: '0 auto', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: activeProfileName ? '10px' : '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>⚙️ Open Ruleset Profile Configurator</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>Input targets, apply filters, and build optimized plans for any demographic criteria dynamically.</p>
        </div>
        <button onClick={generateOptimizedMonth} disabled={loading} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 6px rgba(37,99,235,0.1)' }}>
          {loading ? '🔄 Adjusting Matrix...' : '🎲 Generate Custom Plan'}
        </button>
      </div>
      {activeProfileName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 18px', marginBottom: '20px' }}>
          <span style={{ fontSize: '18px' }}>👤</span>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PERFIL ACTIVO</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af', marginLeft: '10px' }}>{activeProfileName}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {profileFields.goal && <span style={{ fontSize: '11px', color: '#3b82f6', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '99px' }}>🎯 {profileFields.goal}</span>}
            {profileFields.activityLevel && <span style={{ fontSize: '11px', color: '#3b82f6', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '99px' }}>⚡ {profileFields.activityLevel}</span>}
            {preferredTags.length > 0 && <span style={{ fontSize: '11px', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '99px' }}>❤️ {preferredTags.length} prefs</span>}
            {excludedTags.length > 0 && <span style={{ fontSize: '11px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '99px' }}>🚫 {excludedTags.length} excluidos</span>}
            {likedMeals.length > 0 && <span style={{ fontSize: '11px', color: '#7e22ce', backgroundColor: '#f3e8ff', padding: '2px 8px', borderRadius: '99px' }}>⭐ {likedMeals.length} favoritos</span>}
          </div>
          <button onClick={() => saveCurrentConfigurationAsPreset()} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>💾 Guardar cambios</button>
        </div>
      )}

      {actionMessage && <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '13px' }}>{actionMessage}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* LEFT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>

          {/* 1. PROFILE INFO — top */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.5px', fontWeight: 'bold' }}>👤 Perfil Activo{activeProfileName ? `: ${activeProfileName}` : ''}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[['Nombre del perfil', 'profileName', 'Ej: Mauro, Abuela, Niños...'],['Edad / Grupo etario', 'age', 'Ej: 35 años, adulto activo'],['Objetivo', 'goal', 'Ej: bajar peso, mantener masa'],['Nivel de actividad', 'activityLevel', 'Ej: sedentario, moderado, alto'],['Condiciones / Notas', 'notes', 'Ej: hipertenso, diabético, sin gluten']].map(([label, fieldKey, placeholder]) => (
                <div key={fieldKey}>
                  <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>{label.toUpperCase()}</label>
                  <input type="text" placeholder={placeholder} value={fieldKey === 'profileName' ? activeProfileName : (profileFields[fieldKey] || '')} onChange={e => { if (fieldKey === 'profileName') setActiveProfileName(e.target.value); else setProfileFields(prev => ({ ...prev, [fieldKey]: e.target.value })) }} style={{ width: '100%', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            {/* Save / Load buttons */}
            <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#94a3b8' }}>Guarda toda la configuración (kcal, filtros, perfil) bajo este nombre para reutilizarla.</p>
              <button onClick={() => saveCurrentConfigurationAsPreset(activeProfileName || 'Sin nombre')} disabled={!activeProfileName.trim()} style={{ width: '100%', padding: '8px', backgroundColor: activeProfileName.trim() ? '#2563eb' : '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: activeProfileName.trim() ? 'pointer' : 'default', marginBottom: '8px' }}>💾 Guardar perfil{activeProfileName ? ` "${activeProfileName}"` : ' (escribe un nombre)'}</button>
              {Object.keys(savedPresets).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>PERFILES GUARDADOS:</span>
                  {Object.keys(savedPresets).map(name => (
                    <button key={`preset-${name}`} onClick={() => loadSavedPreset(name)} style={{ padding: '7px 10px', borderRadius: '6px', border: `1px solid ${activeProfileName === name ? '#bfdbfe' : '#e2e8f0'}`, backgroundColor: activeProfileName === name ? '#eff6ff' : '#f8fafc', color: activeProfileName === name ? '#1d4ed8' : '#334155', fontSize: '12px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>
                      {activeProfileName === name ? '✓ ' : ''}👤 {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. TARGET CALORIE LIMITS */}
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>⚡ Target Calorie Limits</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Min Kcal/Day</label><input type="number" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} value={minKcal} onChange={e => setMinKcal(Number(e.target.value))} /></div>
              <div style={{ flex: 1 }}><label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Max Kcal/Day</label><input type="number" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} value={maxKcal} onChange={e => setMaxKcal(Number(e.target.value))} /></div>
            </div>
          </div>

          {/* 3. EXCLUDE */}
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>🚫 Exclude Components / Ingredients</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94a3b8' }}>Elimina completamente estas categorías del pool de generación.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {availableTagsPool.map(tag => { const isActive = excludedTags.includes(tag); return (<button key={`ex-${tag}`} onClick={() => toggleTagFilter(tag, 'exclude')} style={{ padding: '5px 9px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '500', border: '1px solid', backgroundColor: isActive ? '#fee2e2' : '#f8fafc', color: isActive ? '#ef4444' : '#64748b', borderColor: isActive ? '#fca5a5' : '#e2e8f0' }}>{isActive ? `✕ ${tag}` : `Hide ${tag}`}</button>) })}
            </div>
          </div>

          {/* 4. ENFORCE */}
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>🎯 Enforce Must-Have Tags</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94a3b8' }}>Todos los platos deben cumplir estos requisitos.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {availableTagsPool.map(tag => { const isActive = requiredTags.includes(tag); return (<button key={`req-${tag}`} onClick={() => toggleTagFilter(tag, 'require')} style={{ padding: '5px 9px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '500', border: '1px solid', backgroundColor: isActive ? '#dcfce7' : '#f8fafc', color: isActive ? '#15803d' : '#64748b', borderColor: isActive ? '#86efac' : '#e2e8f0' }}>{isActive ? `✓ ${tag}` : `Require ${tag}`}</button>) })}
            </div>
          </div>

          {/* 5. PREFERENCES / LIKES */}
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>❤️ Preferencias — Priorizar estos tags</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94a3b8' }}>Los platos con estos tags tendrán más probabilidad de aparecer en el plan generado.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {availableTagsPool.map(tag => { const isActive = preferredTags.includes(tag); return (<button key={`pref-${tag}`} onClick={() => togglePreferredTag(tag)} style={{ padding: '5px 9px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '500', border: '1px solid', backgroundColor: isActive ? '#fef9c3' : '#f8fafc', color: isActive ? '#854d0e' : '#64748b', borderColor: isActive ? '#fde047' : '#e2e8f0' }}>{isActive ? `⭐ ${tag}` : tag}</button>) })}
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>⭐ Platos favoritos</h3>
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#94a3b8' }}>Marcados como favoritos — el generador los priorizará.</p>
            <input type="text" value={mealSearchQuery} onChange={e => setMealSearchQuery(e.target.value)} placeholder="Buscar plato..." style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '12px', marginBottom: '6px', boxSizing: 'border-box' }} />
            {likedMeals.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px' }}>
                {likedMeals.map(id => { const m = principalsData.find(p => p.id === id); return m ? (<div key={`liked-${id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderRadius: '5px', backgroundColor: '#fef9c3', border: '1px solid #fde047' }}><span style={{ fontSize: '11px', color: '#854d0e', fontWeight: '500' }}>⭐ {m.name}</span><button onClick={() => toggleLikedMeal(id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: '0' }}>✕</button></div>) : null })}
              </div>
            )}
            {mealSearchQuery.trim().length >= 2 && (
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '5px', backgroundColor: '#fff' }}>
                {principalsData.filter(p => p.name.toLowerCase().includes(mealSearchQuery.toLowerCase()) && !likedMeals.includes(p.id)).slice(0, 10).map(p => (
                  <button key={`search-meal-${p.id}`} onClick={() => { toggleLikedMeal(p.id); setMealSearchQuery('') }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', border: 'none', borderBottom: '1px solid #f1f5f9', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '11px', color: '#334155' }}>
                    + {p.name} <span style={{ color: '#94a3b8' }}>({p.kcal} kcal)</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. MACRO DISTRIBUTION */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
            <div style={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', padding: '18px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '8px', color: '#f8fafc' }}>📊 Macro Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[['🍗 Protein Matches', 'protein', '#38bdf8', 30], ['🌾 Grain / Carbs', 'grain', '#fbbf24', 20], ['🥦 Vegetables', 'vegetable', '#4ade80', 20]].map(([label, key, color, max]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}><span style={{ color: '#94a3b8' }}>{label}</span><span style={{ fontWeight: 'bold', color }}>{macroMetrics[key]}</span></div>
                    <div style={{ height: '5px', backgroundColor: '#334155', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${Math.min((macroMetrics[key] / max) * 100, 100)}%`, height: '100%', backgroundColor: color }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. GENERATION RULES */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>📋 Reglas de Generación</h3>
              <button onClick={() => { if (window.confirm('¿Restaurar reglas por defecto?')) { saveAllRules(DEFAULT_RULES); setEditingRuleId(null) } }} style={{ fontSize: '9px', padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '3px', backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'pointer' }}>↺ Restaurar</button>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#94a3b8' }}>Todas las reglas son editables. Desactivá las que no aplican a este perfil.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
              {allRules.map(rule => {
                const c = RULE_TYPE_COLORS[rule.type] || RULE_TYPE_COLORS.custom
                const isEditing = editingRuleId === rule.id
                return (
                  <div key={rule.id} style={{ border: `1px solid ${rule.active ? c.border : '#e2e8f0'}`, borderRadius: '5px', backgroundColor: rule.active ? c.bg : '#f8fafc', opacity: rule.active ? 1 : 0.55 }}>
                    {isEditing ? (
                      <div style={{ padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <select value={rule.type} onChange={e => handleEditRuleType(rule.id, e.target.value)} style={{ padding: '3px 5px', border: '1px solid #e2e8f0', borderRadius: '3px', fontSize: '10px', backgroundColor: '#fff' }}>
                            <option value="balance">⚖️ Balance</option><option value="kcal">🔥 Kcal</option><option value="filter">🔍 Filtro</option><option value="limit">🔒 Límite</option>
                          </select>
                          <button onClick={() => setEditingRuleId(null)} style={{ padding: '2px 8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>✓ Ok</button>
                        </div>
                        <textarea value={rule.label} onChange={e => handleEditRuleLabel(rule.id, e.target.value)} rows={2} style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '3px', fontSize: '11px', resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', padding: '5px 7px' }}>
                        <button onClick={() => handleToggleRule(rule.id)} title={rule.active ? 'Desactivar' : 'Activar'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', padding: '0', flexShrink: 0, marginTop: '1px' }}>{rule.active ? '✅' : '⬜'}</button>
                        <span style={{ fontSize: '8px', fontWeight: 'bold', color: c.color, whiteSpace: 'nowrap', marginTop: '2px', backgroundColor: '#fff', padding: '1px 4px', borderRadius: '3px', border: `1px solid ${c.border}`, flexShrink: 0 }}>{c.label}</span>
                        <span style={{ fontSize: '10px', color: '#374151', lineHeight: 1.4, flex: 1 }}>{rule.label}</span>
                        <button onClick={() => setEditingRuleId(rule.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '10px', padding: '0', flexShrink: 0 }}>✏️</button>
                        <button onClick={() => handleDeleteRule(rule.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '0', flexShrink: 0 }}>✕</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <select value={newRuleType} onChange={e => setNewRuleType(e.target.value)} style={{ padding: '4px 7px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' }}>
                <option value="balance">⚖️ Balance</option><option value="kcal">🔥 Kcal</option><option value="filter">🔍 Filtro</option><option value="limit">🔒 Límite</option>
              </select>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" value={newRuleText} onChange={e => setNewRuleText(e.target.value)} placeholder="Agregar nueva regla..." style={{ flex: 1, padding: '5px 7px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px' }} />
                <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
              </div>
            </form>
          </div>

        </div>

        {/* CENTER PANEL: 30-Day Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Month selector */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>📅 Mes del plan:</span>
            <select value={planMonth} onChange={e => setPlanMonth(Number(e.target.value))} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' }}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <input type="number" value={planYear} onChange={e => setPlanYear(Number(e.target.value))} style={{ width: '80px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>{MONTH_NAMES[planMonth]} {planYear} — 30 días</span>
          </div>

          {[0, 1, 2, 3].map(weekIdx => {
            const firstDayOfWeek = weekIdx * 7 + 1
            return (
              <div key={`weekCard-${weekIdx}`} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>🗓️ Semana {weekIdx + 1}</h4>
                {weekIdx === 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 90px', gap: '10px', padding: '4px 8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>FECHA</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center' }}>☀️ ALMUERZO — Principal</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#0891b2', textAlign: 'center' }}>☀️ ALMUERZO — Guarnición</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce', textAlign: 'center' }}>🌙 CENA — Principal</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9333ea', textAlign: 'center' }}>🌙 CENA — Guarnición</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>KCAL</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Array.from({ length: 7 }).map((_, offset) => {
                    const dayNum = firstDayOfWeek + offset
                    if (dayNum > 30) return null
                    const currentDayConfig = monthlyPlan[dayNum] || {}
                    const lp = getKcal(currentDayConfig.lunch_principal_id, principalsData)
                    const ls = getKcal(currentDayConfig.lunch_side_id, sidesData)
                    const dp = getKcal(currentDayConfig.dinner_principal_id, principalsData)
                    const ds = getKcal(currentDayConfig.dinner_side_id, sidesData)
                    const totalKcalSum = lp + ls + dp + ds
                    const balancedFlag = totalKcalSum >= minKcal && totalKcalSum <= maxKcal
                    return (
                      <div key={`rowDay-${dayNum}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 90px', gap: '10px', alignItems: 'center', padding: '6px 8px', borderRadius: '8px', backgroundColor: dayNum % 2 === 0 ? '#f8fafc' : '#ffffff', border: '1px solid #edf2f7' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', lineHeight: 1.3 }}>{dateForDay(dayNum)}</span>
                        <select style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', width: '100%' }} value={currentDayConfig.lunch_principal_id ?? ''} onChange={e => handleDropdownSelect(dayNum, 'lunch_principal_id', e.target.value)}>
                          <option value="">Select Lunch...</option>
                          {principalsData.map(p => <option key={`lp-${dayNum}-${p.id}`} value={p.id}>{p.name} ({p.kcal} kcal)</option>)}
                        </select>
                        <select style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', width: '100%' }} value={currentDayConfig.lunch_side_id ?? ''} onChange={e => handleDropdownSelect(dayNum, 'lunch_side_id', e.target.value)}>
                          <option value="">No Side</option>
                          {sidesData.map(s => <option key={`ls-${dayNum}-${s.id}`} value={s.id}>{s.name} (+{s.kcal})</option>)}
                        </select>
                        <select style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', width: '100%' }} value={currentDayConfig.dinner_principal_id ?? ''} onChange={e => handleDropdownSelect(dayNum, 'dinner_principal_id', e.target.value)}>
                          <option value="">Select Dinner...</option>
                          {principalsData.map(p => <option key={`dp-${dayNum}-${p.id}`} value={p.id}>{p.name} ({p.kcal} kcal)</option>)}
                        </select>
                        <select style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', width: '100%' }} value={currentDayConfig.dinner_side_id ?? ''} onChange={e => handleDropdownSelect(dayNum, 'dinner_side_id', e.target.value)}>
                          <option value="">No Side</option>
                          {sidesData.map(s => <option key={`ds-${dayNum}-${s.id}`} value={s.id}>{s.name} (+{s.kcal})</option>)}
                        </select>
                        <div style={{ backgroundColor: totalKcalSum > 0 ? (balancedFlag ? '#dcfce7' : '#fee2e2') : '#f1f5f9', color: totalKcalSum > 0 ? (balancedFlag ? '#166534' : '#991b1b') : '#475569', padding: '6px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                          {totalKcalSum > 0 ? `${totalKcalSum} kcal` : 'Empty'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>


      </div>
    </div>
  )
}
