/**
 * MEAL PLANNER — Google Apps Script Web App
 *
 * Sheet structure (confirmed):
 *   3-Principal          → principal metadata: name, servings, PrepTime, CookTime, Subtype (complete|minuta)
 *   4-Principal_Ingredients → principal ingredients: MealName, Ingredient, Qty, Unit
 *   5-Side               → side metadata: Side_id, Side_Name, servings, PrepTime, CookTime
 *   6-Side_Ingredients   → side ingredients: SideName, Ingredient, Qty, Unit
 *   7-Ingredients        → master ingredient list: Ingredient_id, Ingredient_Name, unit, category
 *
 * ACTIONS:
 *   saveRecipe(recipe)       — saves to 4-Principal_Ingredients or 6-Side_Ingredients + metadata sheet
 *   saveIngredient(ingredient) — adds new row to 7-Ingredients with next available ID
 *
 * TO UPDATE:
 * 1. script.google.com → open project → paste this file → save
 * 2. Deploy → Manage Deployments → Edit → New Version → Deploy
 */

const SHEET_PRINCIPAL_META = '3-Principal'
const SHEET_PRINCIPAL_INGS = '4-Principal_Ingredients'
const SHEET_SIDE_META      = '5-Side'
const SHEET_SIDE_INGS      = '6-Side_Ingredients'
const SHEET_INGREDIENTS    = '7-Ingredients'

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'Meal Planner API running OK',
      sheets: [SHEET_PRINCIPAL_META, SHEET_PRINCIPAL_INGS, SHEET_SIDE_META, SHEET_SIDE_INGS, SHEET_INGREDIENTS]
    }))
    .setMimeType(ContentService.MimeType.JSON)
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    let result = { success: false, message: 'Unknown action: ' + data.action }
    if (data.action === 'saveRecipe')     result = saveRecipe(data.recipe)
    if (data.action === 'saveIngredient') result = saveIngredient(data.ingredient)
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// saveRecipe
// recipe = { name, type ('principal'|'side'), cookTime (min|null), ingredients: [{name, qty, unit}] }
// ─────────────────────────────────────────────────────────────────────────────
function saveRecipe(recipe) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const isPrincipal = recipe.type === 'principal'
  const metaSheetName = isPrincipal ? SHEET_PRINCIPAL_META : SHEET_SIDE_META
  const ingsSheetName = isPrincipal ? SHEET_PRINCIPAL_INGS : SHEET_SIDE_INGS

  const metaSheet = ss.getSheetByName(metaSheetName)
  const ingsSheet = ss.getSheetByName(ingsSheetName)
  const missing = [!metaSheet && metaSheetName, !ingsSheet && ingsSheetName].filter(Boolean)
  if (missing.length) {
    return { success: false, message: 'Sheet(s) not found: ' + missing.join(', ') + '. Available: ' + ss.getSheets().map(s => s.getName()).join(', ') }
  }

  // 1. Update metadata (cook time)
  if (recipe.cookTime !== null && recipe.cookTime !== undefined) {
    const metaData = metaSheet.getDataRange().getValues()
    const headers = metaData[0].map(h => String(h).toLowerCase().trim())
    const nameCol   = headers.findIndex(h => h.includes('name'))
    const nameIdx   = nameCol >= 0 ? nameCol : 1
    const prepIdx   = headers.findIndex(h => h.includes('prep'))
    const cookIdx   = headers.findIndex(h => h.includes('cook') && !h.includes('prep'))
    let found = false
    for (let i = 1; i < metaData.length; i++) {
      if (String(metaData[i][nameIdx]).trim() === recipe.name.trim()) {
        if (prepIdx >= 0 && cookIdx >= 0) {
          const prep = Math.round(recipe.cookTime * 0.4)
          metaSheet.getRange(i + 1, prepIdx + 1).setValue(prep)
          metaSheet.getRange(i + 1, cookIdx + 1).setValue(recipe.cookTime - prep)
        } else if (cookIdx >= 0) {
          metaSheet.getRange(i + 1, cookIdx + 1).setValue(recipe.cookTime)
        }
        // Also update subtype column if present
        const subtypeIdx = headers.findIndex(h => h.includes('subtype') || h.includes('tipo') || h.includes('minuta'))
        if (subtypeIdx >= 0 && recipe.subtype) metaSheet.getRange(i + 1, subtypeIdx + 1).setValue(recipe.subtype)
        found = true; break
      }
    }
    if (!found) {
      const newRow = new Array(metaData[0].length).fill('')
      newRow[nameIdx] = recipe.name
      if (cookIdx >= 0) newRow[cookIdx] = recipe.cookTime
      metaSheet.appendRow(newRow)
    }
  }

  // 2. Replace ingredients rows
  const allIngs = ingsSheet.getDataRange().getValues()
  for (let i = allIngs.length - 1; i >= 0; i--) {
    if (String(allIngs[i][0]).trim() === recipe.name.trim()) ingsSheet.deleteRow(i + 1)
  }
  const ings = (recipe.ingredients || []).filter(i => String(i.name).trim())
  if (ings.length > 0) {
    ingsSheet.getRange(ingsSheet.getLastRow() + 1, 1, ings.length, 4)
      .setValues(ings.map(i => [recipe.name, i.name, i.qty, i.unit]))
  } else {
    ingsSheet.appendRow([recipe.name, '', '', ''])
  }

  return { success: true, message: 'Saved "' + recipe.name + '" → ' + ingsSheetName + ' (' + ings.length + ' ingredients)' }
}

// ─────────────────────────────────────────────────────────────────────────────
// saveIngredient
// ingredient = { name, unit, category }
// Adds a new row to 7-Ingredients with the next available Ingredient_id.
// Does nothing if an ingredient with the same name already exists.
// ─────────────────────────────────────────────────────────────────────────────
function saveIngredient(ingredient) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(SHEET_INGREDIENTS)
  if (!sheet) return { success: false, message: 'Sheet "' + SHEET_INGREDIENTS + '" not found' }

  const data = sheet.getDataRange().getValues()
  // Check for duplicate (case-insensitive)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(ingredient.name).trim().toLowerCase()) {
      return { success: true, message: 'Ingredient "' + ingredient.name + '" already exists (id=' + data[i][0] + ')' }
    }
  }

  // Find next ID (max existing ID + 1)
  const ids = data.slice(1).map(r => Number(r[0])).filter(n => !isNaN(n) && n > 0)
  const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1

  sheet.appendRow([nextId, ingredient.name.trim(), ingredient.unit || 'g', ingredient.category || 'almacen'])

  return { success: true, message: 'New ingredient "' + ingredient.name + '" added as id=' + nextId }
}
