require('dotenv').config();
const express = require('express');
const path = require('path');
const { Client } = require('@notionhq/client');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware for parsing URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Optional: Add CORS middleware if your frontend is on a different port/domain
const cors = require('cors');
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * Collect all unique "Week" multi_select options from the Notion database.
 */
async function getAllWeeks() {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100, // Adjust if you have more pages
  });

  const allWeeks = new Set();

  response.results.forEach((page) => {
    const weekProperty = page.properties['Week'];
    if (weekProperty && Array.isArray(weekProperty.multi_select)) {
      weekProperty.multi_select.forEach((option) => {
        allWeeks.add(option.name);
      });
    }
  });

  return Array.from(allWeeks);
}

/**
 * Calculate the daily deficit (matching today's date in "YYYY / MM / DD" format).
 */
function getDailyStats(data, typeString) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dayToMatch = `${year} / ${month} / ${day}`;

  let totalDeficit = 0;
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        if (titleObj.plain_text === dayToMatch) {
          const deficitProperty = page.properties[typeString];
          if (deficitProperty && typeof deficitProperty.number === 'number') {
            totalDeficit += deficitProperty.number;
          }
        }
      });
    }
  });
  return totalDeficit;
}

function getDailyStatsSelect(data, typeString) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dayToMatch = `${year} / ${month} / ${day}`;

  let totalDeficit = false;
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        if (titleObj.plain_text === dayToMatch) {
          const deficitProperty = page.properties[typeString];
          if (deficitProperty) {
            totalDeficit = deficitProperty.select;
          }
        }
      });
    }
  });
  return totalDeficit;
}


function getDailyStatsString(data, typeString) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dayToMatch = `${year} / ${month} / ${day}`;

  let totalDeficit = false;
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        if (titleObj.plain_text === dayToMatch) {
          const deficitProperty = page.properties[typeString];
          if (deficitProperty) {
            totalDeficit = deficitProperty.rich_text;
          }
        }
      });
    }
  });
  return totalDeficit;
}

function getDailyStatsBool(data, typeString) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dayToMatch = `${year} / ${month} / ${day}`;

  let totalDeficit = false;
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        if (titleObj.plain_text === dayToMatch) {
          const deficitProperty = page.properties[typeString];
          if (deficitProperty && typeof deficitProperty.checkbox === 'boolean') {
            totalDeficit = deficitProperty.checkbox;
          }
        }
      });
    }
  });
  return totalDeficit;
}

function getDayBeforeWeight(data, typeString) {
  // Get current date
  const today = new Date();
  
  // Calculate yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // Format the day we're looking for
  let dayToMatch;
  
  // Handle first day of month
  if (today.getDate() === 1) {
    // If it's the first day of the month, we need the last day of the previous month
    
    // Handle first month of year (January)
    if (today.getMonth() === 0) {
      // If it's January 1st, we need December 31st of the previous year
      const lastYear = today.getFullYear() - 1;
      dayToMatch = `December 31, ${lastYear}`;
    } else {
      // For other months, get the last day of the previous month
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const prevMonthName = monthNames[previousMonth.getMonth()];
      const prevMonthDay = previousMonth.getDate();
      const year = today.getFullYear();
      
      dayToMatch = `${prevMonthName} ${prevMonthDay}, ${year}`;
    }
  } else {
    // Regular case - just yesterday's date
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const yesterdayMonth = (yesterday.getMonth() + 1).toString().padStart(2, '0');
    const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
    const year = yesterday.getFullYear();
    
    dayToMatch = `${year} / ${yesterdayMonth} / ${yesterdayDay}`;
    console.log("dayToMatch", dayToMatch);
  }
  
  // Calculate total from matching records
  let totalDeficit = 0;
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        if (titleObj.plain_text === dayToMatch) {
          const deficitProperty = page.properties[typeString];
          if (deficitProperty && typeof deficitProperty.number === 'number') {
            totalDeficit += deficitProperty.number;
          }
        }
      });
    }
  });
  
  return totalDeficit;
}

/**
 * Calculate the weekly deficit for the given "weekName" (e.g. "[MARCH] 3-9").
 */
function getWeeklyStats(data, weekName) {
  let totalDeficit = 0;
  data.results.forEach((page) => {
    const weekProp = page.properties['Week'];
    if (weekProp && Array.isArray(weekProp.multi_select)) {
      weekProp.multi_select.forEach((option) => {
        if (option.name === weekName) {
          const deficitProperty = page.properties['Deficit'];
          if (deficitProperty && typeof deficitProperty.number === 'number') {
            totalDeficit += deficitProperty.number;
          }
        }
      });
    }
  });
  return totalDeficit;
}

/**
 * GET /api/weeks
 * Returns a list of all available week options from the database.
 */
app.get('/api/weeks', async (req, res) => {
  try {
    const weeks = await getAllWeeks();
    res.json({ weeks });
  } catch (err) {
    console.error('Error fetching weeks:', err);
    res.status(500).json({ error: 'Error fetching weeks' });
  }
});

/**
 * GET /api/deficits?week=...
 * Returns { dailyDeficit, weeklyDeficit } for the requested week.
 * If no "week" is provided, weeklyDeficit will be 0.
 */


app.get('/api/deficits', async (req, res) => {
  try {
    const selectedWeek = req.query.week || ''; // e.g. "[MARCH] 3-9"
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const dailyDeficit = getDailyStats(response, 'Deficit');
    let weeklyDeficit = 0;
    if (selectedWeek) {
      weeklyDeficit = getWeeklyStats(response, selectedWeek);
    }

    res.json({ dailyDeficit, weeklyDeficit });
  } catch (err) {
    console.error('Error fetching deficits:', err);
    res.status(500).json({ error: 'Error fetching deficits' });
  }
});

app.get('/api/calories', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const dailyCal= getDailyStats(response, 'Calories');

    res.json({ dailyCal });
  } catch (err) {
    console.error('Error fetching deficits:', err);
    res.status(500).json({ error: 'Error fetching deficits' });
  }
});

function getWeekRangeForDate(date, availableWeeks) {
  // Get day of month
  const day = date.getDate();
  const month = date.getMonth(); // 0-based: 0 = January, 1 = February, etc.
  
  const monthNames = ["JAN", "FEB", "MARCH", "APR", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
  const currentMonthName = monthNames[month];
  const nextMonthName = monthNames[(month + 1) % 12];
  
  // Define week ranges based on your dropdown options
  let selectedWeek = null;
  
  // Parse the week ranges from availableWeeks
  for (const weekOption of availableWeeks) {
    // First check if it contains the current month
    if (weekOption.includes(currentMonthName)) {
      // Extract the numeric range
      const rangeMatch = weekOption.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        const startDay = parseInt(rangeMatch[1]);
        const endDay = parseInt(rangeMatch[2]);
        
        // Check if today's date falls within this range
        if (day >= startDay && day <= endDay) {
          selectedWeek = weekOption;
          break;
        }
      } else if (weekOption.includes("&") && weekOption.includes(nextMonthName)) {
        // Handle month transition weeks like "[MARCH & APR] 31-6"
        const rangeMatch = weekOption.match(/(\d+)-(\d+)/);
        if (rangeMatch) {
          const startDay = parseInt(rangeMatch[1]);
          const endDay = parseInt(rangeMatch[2]);
          
          // If we're in the current month and >= startDay
          if (day >= startDay) {
            selectedWeek = weekOption;
            break;
          }
        }
      }
    } else if (weekOption.includes(nextMonthName) && weekOption.includes("&") && weekOption.includes(currentMonthName)) {
      // Handle month transition weeks from the next month perspective
      const rangeMatch = weekOption.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        const startDay = parseInt(rangeMatch[1]);
        const endDay = parseInt(rangeMatch[2]);
        
        // If we're in the current month and day <= endDay
        if (day <= endDay) {
          selectedWeek = weekOption;
          break;
        }
      }
    }
  }
  
  return selectedWeek;
}

app.post('/api/nutrition', async (req, res) => {
  try {
    const { protein, carbs, fats, calories } = req.body;
    
    // Validate input
    if (protein === undefined || carbs === undefined || fats === undefined || calories === undefined) {
      return res.status(400).json({ error: 'Missing required nutrition data. Please provide protein, carbs, fats, and calories.' });
    }

    const availableWeeks = await getAllWeeks();
    
    // Format today's date in "YYYY / MM / DD" format to match your database
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year} / ${month} / ${day}`;
    
    // First, query the database to find today's entry
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    let pageId;
    
    if (response.results.length > 0) {
      // Today's entry exists, get current values and update by adding new values
      pageId = response.results[0].id;
      const existingPage = response.results[0];
      
      // Get current values (defaulting to 0 if they don't exist)
      const currentProtein = (existingPage.properties['Protein'] && existingPage.properties['Protein'].number) || 0;
      const currentCarbs = (existingPage.properties['Carbs'] && existingPage.properties['Carbs'].number) || 0;
      const currentFats = (existingPage.properties['Fats'] && existingPage.properties['Fats'].number) || 0;
      const currentCalories = (existingPage.properties['Calories'] && existingPage.properties['Calories'].number) || 0;
      
      // Add new values to existing values
      const newProtein = currentProtein + Number(protein);
      const newCarbs = currentCarbs + Number(carbs);
      const newFats = currentFats + Number(fats);
      const newCalories = currentCalories + Number(calories);
      
      // Update with combined values
      await notion.pages.update({
        page_id: pageId,
        properties: {
          'Protein': { number: newProtein },
          'Carbs': { number: newCarbs },
          'Fats': { number: newFats },
          'Calories': { number: newCalories }
        }
      });
      
      res.json({ 
        success: true, 
        message: 'Nutrition data added to today\'s totals',
        date: todayFormatted,
        newTotals: {
          protein: newProtein,
          carbs: newCarbs,
          fats: newFats,
          calories: newCalories
        }
      });
    } else {
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      // Prepare week multi-select property
      const weekProperty = weekRange ? {
        'Week': {
          multi_select: [
            {
              name: weekRange
            }
          ]
        }
      } : { 'Week': { multi_select: [] } };
      // Today's entry doesn't exist, create it
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [
              {
                text: {
                  content: todayFormatted
                }
              }
            ]
          },
          'Deficit': { number: 1800 - calories},
          'Protein': { number: Number(protein) },
          'Carbs': { number: Number(carbs) },
          'Fats': { number: Number(fats) },
          'Calories': { number: Number(calories) },
          ...weekProperty
          // You may need to include other required properties for your database
          // For example, if 'Week' is a required property, you'd need to determine the current week
        }
      });
      
      res.json({ 
        success: true, 
        message: 'New nutrition entry created for today',
        date: todayFormatted,
        week: weekRange || 'No matching week found',
        newTotals: {
          protein: Number(protein),
          carbs: Number(carbs),
          fats: Number(fats),
          calories: Number(calories)
        }
      });
    }
  } catch (err) {
    console.error('Error adding nutrition data:', err);
    res.status(500).json({ error: 'Error adding nutrition data to Notion database' });
  }
});

async function ensureFoodDatabaseExists() {
  // Check if we have the food database ID in env
  if (!process.env.NOTION_FOOD_DATABASE_ID) {
    console.log("Creating food database as it doesn't exist...");
    
    try {
      // Create the food database directly in the workspace root
      const newDb = await notion.databases.create({
        parent: {
          type: "workspace",
          workspace: true
        },
        title: [
          {
            type: "text",
            text: {
              content: "Food Items"
            }
          }
        ],
        properties: {
          "Name": {
            title: {}
          },
          "Protein": {
            number: {}
          },
          "Carbs": {
            number: {}
          },
          "Fats": {
            number: {}
          },
          "Calories": {
            number: {}
          },
          "Serving Size": {
            rich_text: {}
          },
          "Serving Unit": {
            rich_text: {}
          },
          "Date Added": {
            date: {}
          }
        }
      });
      
      console.log("Food database created with ID:", newDb.id);
      
      // Store the ID (in memory for now)
      process.env.NOTION_FOOD_DATABASE_ID = newDb.id;
      
      return newDb.id;
    } catch (err) {
      console.error("Failed to create food database:", err);
      throw err;
    }
  }
  
  return process.env.NOTION_FOOD_DATABASE_ID;
}

// Main food tracking API

app.post('/api/foods', async (req, res) => {
  try {
    const { name, protein, carbs, fats, calories, servingSize, servingUnit } = req.body;
    
    // Validate input
    if (!name || protein === undefined || carbs === undefined || 
        fats === undefined || calories === undefined) {
      return res.status(400).json({ 
        error: 'Missing required food data. Please provide name, protein, carbs, fats, and calories.' 
      });
    }

    // Get food database ID from environment
    const foodDatabaseId = process.env.NOTION_FOOD_DATABASE_ID;
    
    if (!foodDatabaseId) {
      return res.status(500).json({ 
        error: 'Food database ID not configured. Please set NOTION_FOOD_DATABASE_ID in .env file.' 
      });
    }
    
    // Format today's date in YYYY / MM / DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year} / ${month} / ${day}`;
    
    // First create the food item
    const newFood = await notion.pages.create({
      parent: { database_id: foodDatabaseId },
      properties: {
        'Name': {
          title: [{ text: { content: name } }]
        },
        'Protein': { number: Number(protein) },
        'Carbs': { number: Number(carbs) },
        'Fats': { number: Number(fats) },
        'Calories': { number: Number(calories) },
        'Serving Size': { 
          rich_text: [{ text: { content: servingSize || 'standard' } }]
        },
        'Serving Unit': { 
          rich_text: [{ text: { content: servingUnit || 'serving' } }]
        },
        'Date Added': {
          rich_text: [{ text: { content: todayFormatted } }]
        }
      }
    });
    
    // Now get or create today's entry and add the relation
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: { equals: todayFormatted }
      }
    });
    
    if (response.results.length > 0) {
      // Update existing entry
      const pageId = response.results[0].id;
      const existingPage = response.results[0];
      
      // Get current values
      const currentProtein = (existingPage.properties['Protein'] && existingPage.properties['Protein'].number) || 0;
      const currentCarbs = (existingPage.properties['Carbs'] && existingPage.properties['Carbs'].number) || 0;
      const currentFats = (existingPage.properties['Fats'] && existingPage.properties['Fats'].number) || 0;
      const currentCalories = (existingPage.properties['Calories'] && existingPage.properties['Calories'].number) || 0;
      
      // Get current deficit value
      const currentDeficit = (existingPage.properties['Deficit'] && 
                             existingPage.properties['Deficit'].number !== null) ? 
                             existingPage.properties['Deficit'].number : 1800;
      
      // Calculate new deficit by subtracting food calories
      const newDeficit = currentDeficit - Number(calories);
      
      // Get existing food relations
      let existingFoods = [];
      if (existingPage.properties['Foods'] && existingPage.properties['Foods'].relation) {
        existingFoods = [...existingPage.properties['Foods'].relation];
      }
      
      // Add new food relation
      existingFoods.push({ id: newFood.id });
      
      await notion.pages.update({
        page_id: pageId,
        properties: {
          'Protein': { number: currentProtein + Number(protein) },
          'Carbs': { number: currentCarbs + Number(carbs) },
          'Fats': { number: currentFats + Number(fats) },
          'Calories': { number: currentCalories + Number(calories) },
          'Deficit': { number: newDeficit },
          'Foods': { relation: existingFoods }
        }
      });
      
      res.json({
        success: true,
        message: 'Food added successfully',
        food: {
          id: newFood.id,
          name,
          protein: Number(protein),
          carbs: Number(carbs),
          fats: Number(fats),
          calories: Number(calories),
          servingSize: servingSize || 'standard',
          servingUnit: servingUnit || 'serving',
          date: todayFormatted
        },
        nutritionTotals: {
          protein: currentProtein + Number(protein),
          carbs: currentCarbs + Number(carbs),
          fats: currentFats + Number(fats),
          calories: currentCalories + Number(calories)
        },
        deficit: {
          previous: currentDeficit,
          new: newDeficit,
          change: -Number(calories)
        }
      });
    } else {
      // Create new entry
      const availableWeeks = await getAllWeeks();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      const weekProperty = weekRange ? {
        'Week': { multi_select: [{ name: weekRange }] }
      } : { 'Week': { multi_select: [] } };
      
      // Start with default deficit (1800) and subtract food calories
      const initialDeficit = 1800;
      const newDeficit = initialDeficit - Number(calories);
      
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [{ text: { content: todayFormatted } }]
          },
          'Deficit': { number: newDeficit },
          'Protein': { number: Number(protein) },
          'Carbs': { number: Number(carbs) },
          'Fats': { number: Number(fats) },
          'Calories': { number: Number(calories) },
          'Foods': {
            relation: [{ id: newFood.id }]
          },
          ...weekProperty
        }
      });
      
      res.json({
        success: true,
        message: 'New entry created with food data for today',
        food: {
          id: newFood.id,
          name,
          protein: Number(protein),
          carbs: Number(carbs),
          fats: Number(fats),
          calories: Number(calories),
          servingSize: servingSize || 'standard',
          servingUnit: servingUnit || 'serving',
          date: todayFormatted
        },
        nutritionTotals: {
          protein: Number(protein),
          carbs: Number(carbs),
          fats: Number(fats),
          calories: Number(calories)
        },
        deficit: {
          previous: initialDeficit,
          new: newDeficit,
          change: -Number(calories)
        }
      });
    }
  } catch (err) {
    console.error('Error adding food:', err);
    res.status(500).json({ error: 'Error adding food to log: ' + err.message });
  }
});

/**
 * Get all foods logged today
 */
app.get('/api/foods', async (req, res) => {
  try {
    // Format today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year} / ${month} / ${day}`;
    
    // Query to find today's entry
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      const page = response.results[0];
      let foods = [];
      
      // Extract foods from the page if they exist
      if (page.properties['Foods'] && 
          page.properties['Foods'].rich_text && 
          page.properties['Foods'].rich_text.length > 0) {
        try {
          foods = JSON.parse(page.properties['Foods'].rich_text[0].plain_text);
        } catch (e) {
          console.error('Error parsing foods JSON:', e);
        }
      }
      
      res.json({ 
        success: true,
        date: todayFormatted,
        foods
      });
    } else {
      // No entry for today
      res.json({ 
        success: true,
        date: todayFormatted,
        foods: []
      });
    }
  } catch (err) {
    console.error('Error fetching foods:', err);
    res.status(500).json({ error: 'Error fetching food log' });
  }
});

/**
 * Delete a food item by ID
 */
app.delete('/api/foods/:foodId', async (req, res) => {
  try {
    const { foodId } = req.params;
    
    // Get the food data to subtract from totals
    const foodData = await notion.pages.retrieve({ page_id: foodId });
    
    // Extract nutritional values
    const protein = (foodData.properties['Protein'] && foodData.properties['Protein'].number) || 0;
    const carbs = (foodData.properties['Carbs'] && foodData.properties['Carbs'].number) || 0;
    const fats = (foodData.properties['Fats'] && foodData.properties['Fats'].number) || 0;
    const calories = (foodData.properties['Calories'] && foodData.properties['Calories'].number) || 0;
    
    // Find today's entry
    const todayFormatted = getTodayFormatted();
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: { equals: todayFormatted }
      }
    });
    
    if (response.results.length > 0) {
      const pageId = response.results[0].id;
      const existingPage = response.results[0];
      
      // Get current values
      const currentProtein = (existingPage.properties['Protein'] && existingPage.properties['Protein'].number) || 0;
      const currentCarbs = (existingPage.properties['Carbs'] && existingPage.properties['Carbs'].number) || 0;
      const currentFats = (existingPage.properties['Fats'] && existingPage.properties['Fats'].number) || 0;
      const currentCalories = (existingPage.properties['Calories'] && existingPage.properties['Calories'].number) || 0;
      
      // Get existing food relations and remove the one to delete
      let existingFoods = [];
      if (existingPage.properties['Foods'] && existingPage.properties['Foods'].relation) {
        existingFoods = existingPage.properties['Foods'].relation.filter(
          food => food.id !== foodId
        );
      }
      
      // Update with new values
      await notion.pages.update({
        page_id: pageId,
        properties: {
          'Protein': { number: Math.max(0, currentProtein - protein) },
          'Carbs': { number: Math.max(0, currentCarbs - carbs) },
          'Fats': { number: Math.max(0, currentFats - fats) },
          'Calories': { number: Math.max(0, currentCalories - calories) },
          'Foods': { relation: existingFoods }
        }
      });
      
      // Optionally delete the food item itself
      // await notion.pages.update({
      //   page_id: foodId,
      //   archived: true
      // });
      
      res.json({
        success: true,
        message: 'Food deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'No entry found for today' });
    }
  } catch (err) {
    console.error('Error deleting food:', err);
    res.status(500).json({ error: 'Error deleting food: ' + err.message });
  }
});

/**
 * Helper function to get today's date formatted for Notion
 */
function getTodayFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year} / ${month} / ${day}`;
}

/**
 * Get a summary of today's nutrition with food details
 */
app.get('/api/summary', async (req, res) => {
  try {
    const todayFormatted = getTodayFormatted();
    
    // Query to find today's entry
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      const page = response.results[0];
      let foods = [];
      
      // Extract nutrition totals
      const protein = (page.properties['Protein'] && page.properties['Protein'].number) || 0;
      const carbs = (page.properties['Carbs'] && page.properties['Carbs'].number) || 0;
      const fats = (page.properties['Fats'] && page.properties['Fats'].number) || 0;
      const calories = (page.properties['Calories'] && page.properties['Calories'].number) || 0;
      
      // Extract foods
      if (page.properties['Foods'] && 
          page.properties['Foods'].rich_text && 
          page.properties['Foods'].rich_text.length > 0) {
        try {
          foods = JSON.parse(page.properties['Foods'].rich_text[0].plain_text);
        } catch (e) {
          console.error('Error parsing foods JSON:', e);
        }
      }
      
      res.json({
        success: true,
        date: todayFormatted,
        totals: {
          protein,
          carbs,
          fats,
          calories
        },
        foods,
        foodCount: foods.length
      });
    } else {
      // No entry for today
      res.json({
        success: true,
        date: todayFormatted,
        totals: {
          protein: 0,
          carbs: 0,
          fats: 0,
          calories: 0
        },
        foods: [],
        foodCount: 0
      });
    }
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Error fetching nutrition summary' });
  }
});

/*[ Weigth ]*/

app.post('/api/weight', async (req, res) => {
  try {
    const { weight, bloated, poop, watery, isBadSleep } = req.body;
    
    // Validate input
    if (weight === undefined) {
      return res.status(400).json({ error: 'Missing required weight data. Please provide weight.' });
    }

    // Format today's date in "YYYY / MM / DD" format to match your database
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year} / ${month} / ${day}`;
    
    // Check if today's entry already exists
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    // Prepare the health condition properties
    const healthConditions = {
      'Weight': { number: Number(weight) }
    };
    
    // Add toggle properties if they exist in your database
    if (bloated !== undefined) {
      healthConditions['Bloated'] = { checkbox: bloated };
    }
    
    if (poop !== undefined) {
      healthConditions['Poop'] = { checkbox: poop };
    }
    
    if (watery !== undefined) {
      healthConditions['Watery'] = { checkbox: watery };
    }
    
    if (isBadSleep !== undefined) {
      healthConditions['Bad Sleep'] = { checkbox: isBadSleep };
    }
    
    if (response.results.length > 0) {
      // Today's entry exists, update the weight and health conditions
      const pageId = response.results[0].id;
      
      await notion.pages.update({
        page_id: pageId,
        properties: healthConditions
      });
      
      res.json({ 
        success: true, 
        message: 'Weight and health conditions updated for today',
        date: todayFormatted,
        weight: Number(weight),
        conditions: {
          bloated: bloated || false,
          poop: poop || false,
          watery: watery || false,
          isBadSleep: isBadSleep || false
        }
      });
    } else {
      // Today's entry doesn't exist, create it
      // Get available weeks for proper categorization
      const availableWeeks = await getAllWeeks();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      // Prepare week multi-select property
      const weekProperty = weekRange ? {
        'Week': {
          multi_select: [
            {
              name: weekRange
            }
          ]
        }
      } : { 'Week': { multi_select: [] } };
      
      // Create new entry with weight and health conditions
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [
              {
                text: {
                  content: todayFormatted
                }
              }
            ]
          },
          ...healthConditions,
          ...weekProperty,
          // Initialize other required fields with default values
          'Protein': { number: 0 },
          'Carbs': { number: 0 },
          'Fats': { number: 0 },
          'Calories': { number: 0 },
          'Deficit': { number: 1800},
        }
      });
      
      res.json({ 
        success: true, 
        message: 'New entry created with weight and health conditions for today',
        date: todayFormatted,
        week: weekRange || 'No matching week found',
        weight: Number(weight),
        conditions: {
          bloated: bloated || false,
          poop: poop || false,
          watery: watery || false,
          isBadSleep: isBadSleep || false
        }
      });
    }
  } catch (err) {
    console.error('Error adding weight data:', err);
    res.status(500).json({ error: 'Error adding weight data to Notion database: ' + err.message });
  }
});

/**
 * GET /api/weight
 * Gets today's weight if it exists
 */
app.get('/api/weight', async (req, res) => {
  try {
    // Format today's date in "YYYY / MM / DD" format
    const todayFormatted = getTodayFormatted();
    
    // Query to find today's entry
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      const page = response.results[0];
      const weight = (page.properties['Weight'] && page.properties['Weight'].number) || null;
      
      res.json({
        success: true,
        date: todayFormatted,
        weight: weight
      });
    } else {
      // No entry for today
      res.json({
        success: true,
        date: todayFormatted,
        weight: null,
        message: 'No weight logged for today'
      });
    }
  } catch (err) {
    console.error('Error fetching weight:', err);
    res.status(500).json({ error: 'Error fetching weight data' });
  }
});

/*[Movements]*/

app.post('/api/steps', async (req, res) => {
  try {
    const { steps, burn } = req.body;
    
    // Validate input
    if (steps === undefined) {
      return res.status(400).json({ error: 'Missing steps data. Please provide steps count.' });
    }

    // Burn is optional but if provided, should be a number
    const burnValue = burn !== undefined ? Number(burn) : 0;

    // Format today's date in "YYYY / MM / DD" format to match your database
    const todayFormatted = getTodayFormatted();
    
    // Check if today's entry already exists
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      // Today's entry exists, update the steps and Kcal From Movement
      const pageId = response.results[0].id;
      const existingPage = response.results[0];
      
      // Get current values (if they exist)
      const currentSteps = existingPage.properties['Steps'] && 
                           existingPage.properties['Steps'].number !== null ? 
                           existingPage.properties['Steps'].number : 0;
      
      const currentKcal = existingPage.properties['Kcal From Movement'] && 
                          existingPage.properties['Kcal From Movement'].number !== null ? 
                          existingPage.properties['Kcal From Movement'].number : 0;
      
      // Get current deficit value
      const currentDeficit = existingPage.properties['Deficit'] && 
                             existingPage.properties['Deficit'].number !== null ? 
                             existingPage.properties['Deficit'].number : 1800;
      
      // Add new values to existing values
      const updatedSteps = currentSteps + Number(steps);
      const updatedKcal = currentKcal + burnValue;
      const updatedDeficit = currentDeficit + burnValue;
      
      // Prepare properties to update
      const updatedProperties = {
        'Steps': { number: updatedSteps }
      };
      
      // Only include Kcal From Movement and Deficit if burn was provided
      if (burn !== undefined) {
        updatedProperties['Kcal From Movement'] = { number: updatedKcal };
        updatedProperties['Deficit'] = { number: updatedDeficit };
      }
      
      await notion.pages.update({
        page_id: pageId,
        properties: updatedProperties
      });
      
      res.json({ 
        success: true, 
        message: 'Steps updated for today',
        date: todayFormatted,
        previousValues: {
          steps: currentSteps,
          kcal: currentKcal,
          deficit: currentDeficit
        },
        addedValues: {
          steps: Number(steps),
          burn: burnValue
        },
        newTotals: {
          steps: updatedSteps,
          kcal: updatedKcal,
          deficit: updatedDeficit
        }
      });
    } else {
      // Today's entry doesn't exist, create it
      const availableWeeks = await getAllWeeks();
      const today = new Date();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      // Prepare week multi-select property
      const weekProperty = weekRange ? {
        'Week': {
          multi_select: [
            {
              name: weekRange
            }
          ]
        }
      } : { 'Week': { multi_select: [] } };
      
      // Calculate initial deficit including burn
      const initialDeficit = 1800;
      const deficitValue = burn !== undefined ? initialDeficit + burnValue : initialDeficit;
      
      // Prepare properties for new entry
      const newProperties = {
        'Day': {
          title: [
            {
              text: {
                content: todayFormatted
              }
            }
          ]
        },
        'Steps': { number: Number(steps) },
        'Deficit': { number: deficitValue },
        ...weekProperty,
        // Initialize other required fields with default values
        'Protein': { number: 0 },
        'Carbs': { number: 0 },
        'Fats': { number: 0 },
        'Calories': { number: 0 }
      };
      
      // Add Kcal From Movement if burn was provided
      if (burn !== undefined) {
        newProperties['Kcal From Movement'] = { number: burnValue };
      }
      
      // Create new entry
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: newProperties
      });
      
      res.json({ 
        success: true, 
        message: 'New entry created with steps for today',
        date: todayFormatted,
        week: weekRange || 'No matching week found',
        values: {
          steps: Number(steps),
          burn: burnValue,
          deficit: deficitValue
        }
      });
    }
  } catch (err) {
    console.error('Error logging steps:', err);
    res.status(500).json({ error: 'Error logging steps to Notion database: ' + err.message });
  }
});

/**
 * POST /api/exercise
 * Logs exercise data (Zone 2, VO2 Max or Gym workouts) to Notion database
 */
app.post('/api/exercise', async (req, res) => {
  try {
    const { 
      exerciseType, // 'zone2', 'vo2max', or 'gym'
      duration,     // minutes for all types
      distance,     // for zone2 (km)
      vo2max,       // for vo2max (ml/kg/min)
      workoutType,  // for gym ('pull', 'push', 'fullbody')
      burn          // calories burned (optional)
    } = req.body;
    
    // Validate input
    if (!exerciseType || duration === undefined) {
      return res.status(400).json({ 
        error: 'Missing required exercise data. Please provide exerciseType and duration.' 
      });
    }

    // Burn is optional but if provided, should be a number
    const burnValue = burn !== undefined ? Number(burn) : 0;

    // Format today's date in "YYYY / MM / DD" format
    const todayFormatted = getTodayFormatted();
    
    // Check if today's entry already exists
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      // Today's entry exists, update the exercise data
      const pageId = response.results[0].id;
      const existingPage = response.results[0];
      
      // Get current values (if they exist)
      let currentKcal = existingPage.properties['Kcal From Movement'] && 
                        existingPage.properties['Kcal From Movement'].number !== null ? 
                        existingPage.properties['Kcal From Movement'].number : 0;
      
      // Get current deficit value
      let currentDeficit = existingPage.properties['Deficit'] && 
                         existingPage.properties['Deficit'].number !== null ? 
                         existingPage.properties['Deficit'].number : 1800;
      
      // Prepare the exercise properties based on type
      const exerciseProperties = {};
      const previousValues = {};
      const updatedValues = {};
      
      if (exerciseType === 'zone2') {
        // Get current Zone2 values
        const currentDuration = existingPage.properties['Zone2 Duration'] && 
                                existingPage.properties['Zone2 Duration'].number !== null ? 
                                existingPage.properties['Zone2 Duration'].number : 0;
        
        let currentDistance = 0;
        if (distance !== undefined) {
          currentDistance = existingPage.properties['Zone2 Distance'] && 
                            existingPage.properties['Zone2 Distance'].number !== null ? 
                            existingPage.properties['Zone2 Distance'].number : 0;
        }
        
        // Add new values to existing values
        const updatedDuration = currentDuration + Number(duration);
        let updatedDistance = currentDistance;
        if (distance !== undefined) {
          updatedDistance = currentDistance + Number(distance);
        }
        
        // Set properties
        exerciseProperties['Zone2 Duration'] = { number: updatedDuration };
        if (distance !== undefined) {
          exerciseProperties['Zone2 Distance'] = { number: updatedDistance };
        }
        
        // Save values for response
        previousValues.duration = currentDuration;
        previousValues.distance = currentDistance;
        updatedValues.duration = updatedDuration;
        updatedValues.distance = updatedDistance;
      } 
      else if (exerciseType === 'vo2max') {
        // For VO2Max, we typically just use the latest value as it's a measurement, not an accumulation
        exerciseProperties['VO2Max'] = { number: Number(vo2max) };
        
        // Save values for response
        const currentVO2Max = existingPage.properties['VO2Max'] && 
                              existingPage.properties['VO2Max'].number !== null ? 
                              existingPage.properties['VO2Max'].number : 0;
        previousValues.vo2max = currentVO2Max;
        updatedValues.vo2max = Number(vo2max);
      }
      else if (exerciseType === 'gym') {
        // Get current Gym Duration
        const currentDuration = existingPage.properties['Gym Duration'] && 
                                existingPage.properties['Gym Duration'].number !== null ? 
                                existingPage.properties['Gym Duration'].number : 0;
        
        // Add new values to existing values
        const updatedDuration = currentDuration + Number(duration);
        
        // Set properties
        exerciseProperties['Gym Duration'] = { number: updatedDuration };
        if (workoutType) {
          exerciseProperties['Workout Type'] = { 
            select: { name: workoutType.charAt(0).toUpperCase() + workoutType.slice(1) } 
          };
        }
        
        // Save values for response
        previousValues.duration = currentDuration;
        previousValues.workoutType = workoutType;
        updatedValues.duration = updatedDuration;
        updatedValues.workoutType = workoutType;
      }
      
      // Add burn to Kcal From Movement if provided
      if (burn !== undefined) {
        const updatedKcal = currentKcal + burnValue;
        exerciseProperties['Kcal From Movement'] = { number: updatedKcal };
        
        // Update deficit by adding burn value
        const updatedDeficit = currentDeficit + burnValue;
        exerciseProperties['Deficit'] = { number: updatedDeficit };
        
        // Save values for response
        previousValues.kcal = currentKcal;
        previousValues.deficit = currentDeficit;
        updatedValues.kcal = updatedKcal;
        updatedValues.deficit = updatedDeficit;
      }
      
      // Update the database
      await notion.pages.update({
        page_id: pageId,
        properties: exerciseProperties
      });
      
      res.json({ 
        success: true, 
        message: `${exerciseType} exercise data updated for today`,
        date: todayFormatted,
        exerciseType: exerciseType,
        previousValues: previousValues,
        addedValues: {
          duration: Number(duration),
          distance: distance !== undefined ? Number(distance) : null,
          vo2max: vo2max !== undefined ? Number(vo2max) : null,
          workoutType: workoutType || null,
          burn: burnValue
        },
        updatedValues: updatedValues
      });
    } else {
      // Today's entry doesn't exist, create it
      const availableWeeks = await getAllWeeks();
      const today = new Date();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      // Prepare week multi-select property
      const weekProperty = weekRange ? {
        'Week': {
          multi_select: [
            {
              name: weekRange
            }
          ]
        }
      } : { 'Week': { multi_select: [] } };
      
      // Prepare the exercise properties based on type
      const exerciseProperties = {};
      const initialDeficit = 1800; // Default deficit value
      
      if (exerciseType === 'zone2') {
        exerciseProperties['Zone2 Duration'] = { number: Number(duration) };
        if (distance !== undefined) {
          exerciseProperties['Zone2 Distance'] = { number: Number(distance) };
        }
      } 
      else if (exerciseType === 'vo2max') {
        exerciseProperties['VO2Max'] = { number: Number(vo2max) };
      }
      else if (exerciseType === 'gym') {
        exerciseProperties['Gym Duration'] = { number: Number(duration) };
        if (workoutType) {
          exerciseProperties['Workout Type'] = { 
            select: { name: workoutType.charAt(0).toUpperCase() + workoutType.slice(1) } 
          };
        }
      }
      
      // Calculate deficit including burn
      let deficitValue = initialDeficit;
      if (burn !== undefined) {
        deficitValue = initialDeficit + burnValue;
        exerciseProperties['Kcal From Movement'] = { number: burnValue };
      }
      
      // Create new entry with exercise data
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [
              {
                text: {
                  content: todayFormatted
                }
              }
            ]
          },
          ...exerciseProperties,
          ...weekProperty,
          // Initialize other required fields with default values
          'Protein': { number: 0 },
          'Carbs': { number: 0 },
          'Fats': { number: 0 },
          'Calories': { number: 0 },
          'Deficit': { number: deficitValue } // Including burn in initial deficit
        }
      });
      
      res.json({ 
        success: true, 
        message: `New entry created with ${exerciseType} exercise data for today`,
        date: todayFormatted,
        week: weekRange || 'No matching week found',
        exerciseType: exerciseType,
        values: {
          duration: Number(duration),
          distance: distance !== undefined ? Number(distance) : null,
          vo2max: vo2max !== undefined ? Number(vo2max) : null,
          workoutType: workoutType || null,
          burn: burnValue,
          deficit: deficitValue
        }
      });
    }
  } catch (err) {
    console.error('Error logging exercise data:', err);
    res.status(500).json({ error: 'Error logging exercise data to Notion database: ' + err.message });
  }
});

/**
 * POST /api/bike
 * Logs cycling data to Notion database
 */
app.post('/api/bike', async (req, res) => {
  try {
    const { duration, distance, burn } = req.body;
    
    // Validate input
    if (duration === undefined || distance === undefined || burn === undefined) {
      return res.status(400).json({ 
        error: 'Missing required cycling data. Please provide duration, distance, and burn.' 
      });
    }

    // Format today's date in "YYYY / MM / DD" format
    const todayFormatted = getTodayFormatted();
    
    // Check if today's entry already exists
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      // Today's entry exists, update the cycling data
      const pageId = response.results[0].id;
      const existingPage = response.results[0];
      
      // Get current values (if they exist)
      const currentKcal = existingPage.properties['Kcal From Movement'] && 
                          existingPage.properties['Kcal From Movement'].number !== null ? 
                          existingPage.properties['Kcal From Movement'].number : 0;
      
      const currentDuration = existingPage.properties['Cycling Duration'] && 
                              existingPage.properties['Cycling Duration'].number !== null ? 
                              existingPage.properties['Cycling Duration'].number : 0;
      
      const currentDistance = existingPage.properties['Cycling Distance'] && 
                              existingPage.properties['Cycling Distance'].number !== null ? 
                              existingPage.properties['Cycling Distance'].number : 0;
                              
      // Get current deficit value
      const currentDeficit = existingPage.properties['Deficit'] && 
                             existingPage.properties['Deficit'].number !== null ? 
                             existingPage.properties['Deficit'].number : 1800;
      
      // Add new values to existing values
      const updatedKcal = currentKcal + Number(burn);
      const updatedDuration = currentDuration + Number(duration);
      const updatedDistance = currentDistance + Number(distance);
      const updatedDeficit = currentDeficit + Number(burn);
      
      // Prepare the cycling properties with accumulated values
      const cyclingProperties = {
        'Cycling Duration': { number: updatedDuration },
        'Cycling Distance': { number: updatedDistance },
        'Kcal From Movement': { number: updatedKcal },
        'Deficit': { number: updatedDeficit }
      };
      
      await notion.pages.update({
        page_id: pageId,
        properties: cyclingProperties
      });
      
      res.json({ 
        success: true, 
        message: 'Cycling data updated for today',
        date: todayFormatted,
        previousValues: {
          duration: currentDuration,
          distance: currentDistance,
          kcal: currentKcal,
          deficit: currentDeficit
        },
        addedValues: {
          duration: Number(duration),
          distance: Number(distance),
          burn: Number(burn)
        },
        newTotals: {
          duration: updatedDuration,
          distance: updatedDistance,
          kcal: updatedKcal,
          deficit: updatedDeficit
        }
      });
    } else {
      // Today's entry doesn't exist, create it
      const availableWeeks = await getAllWeeks();
      const today = new Date();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      // Prepare week multi-select property
      const weekProperty = weekRange ? {
        'Week': {
          multi_select: [
            {
              name: weekRange
            }
          ]
        }
      } : { 'Week': { multi_select: [] } };
      
      // Calculate initial deficit including burn
      const initialDeficit = 1800;
      const deficitValue = initialDeficit + Number(burn);
      
      // Prepare the cycling properties (for new entry, just use the provided values directly)
      const cyclingProperties = {
        'Cycling Duration': { number: Number(duration) },
        'Cycling Distance': { number: Number(distance) },
        'Kcal From Movement': { number: Number(burn) }
      };
      
      // Create new entry with cycling data
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [
              {
                text: {
                  content: todayFormatted
                }
              }
            ]
          },
          ...cyclingProperties,
          ...weekProperty,
          // Initialize other required fields with default values
          'Protein': { number: 0 },
          'Carbs': { number: 0 },
          'Fats': { number: 0 },
          'Calories': { number: 0 },
          'Deficit': { number: deficitValue }
        }
      });
      
      res.json({ 
        success: true, 
        message: 'New entry created with cycling data for today',
        date: todayFormatted,
        week: weekRange || 'No matching week found',
        values: {
          duration: Number(duration),
          distance: Number(distance),
          kcal: Number(burn),
          deficit: deficitValue
        }
      });
    }
  } catch (err) {
    console.error('Error logging cycling data:', err);
    res.status(500).json({ error: 'Error logging cycling data to Notion database: ' + err.message });
  }
});

/* [SLEEP] */

app.post('/api/sleep', async (req, res) => {
  try {
    const { 
      sleepType,        // 'duration' or 'timing'
      sleepQuality,     // for duration (poor, fair, good, excellent)
      bedTime,          // for timing (HH:MM)
      wakeTime,         // for timing (HH:MM)
      sleepWindow       // for timing (calculated, e.g. "8h 30m")
    } = req.body;
    
    // Validate input
    if (!sleepType) {
      return res.status(400).json({ error: 'Missing required sleep type.' });
    }
    
    if (sleepType === 'duration' && !sleepQuality) {
      return res.status(400).json({ error: 'For duration tracking, please provide sleepQuality.' });
    }
    
    if (sleepType === 'timing' && (!bedTime || !wakeTime)) {
      return res.status(400).json({ error: 'For timing tracking, please provide both bedTime and wakeTime.' });
    }

    // Format today's date in "YYYY / MM / DD" format
    const todayFormatted = getTodayFormatted();
    
    // Check if today's entry already exists
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    // Prepare the sleep properties based on type
    const sleepProperties = {};
    
    if (sleepType === 'duration') {
      sleepProperties['Sleep Quality'] = { 
        select: { 
          name: sleepQuality.charAt(0).toUpperCase() + sleepQuality.slice(1) // Capitalize first letter
        } 
      };
    } 
    else if (sleepType === 'timing') {
      sleepProperties['Bed Time'] = { rich_text: [{ text: { content: bedTime } }] };
      sleepProperties['Wake Time'] = { rich_text: [{ text: { content: wakeTime } }] };
      if (sleepWindow) {
        sleepProperties['Sleep Window'] = { rich_text: [{ text: { content: sleepWindow } }] };
      }
    }
    
    if (response.results.length > 0) {
      // Today's entry exists, update the sleep data
      const pageId = response.results[0].id;
      
      await notion.pages.update({
        page_id: pageId,
        properties: sleepProperties
      });
      
      res.json({ 
        success: true, 
        message: `Sleep ${sleepType} data updated for today`,
        date: todayFormatted,
        sleepData: req.body
      });
    } else {
      // Today's entry doesn't exist, create it
      const availableWeeks = await getAllWeeks();
      const today = new Date();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      // Prepare week multi-select property
      const weekProperty = weekRange ? {
        'Week': {
          multi_select: [
            {
              name: weekRange
            }
          ]
        }
      } : { 'Week': { multi_select: [] } };
      
      // Create new entry with sleep data
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [
              {
                text: {
                  content: todayFormatted
                }
              }
            ]
          },
          ...sleepProperties,
          ...weekProperty,
          // Initialize other required fields with default values
          'Protein': { number: 0 },
          'Carbs': { number: 0 },
          'Fats': { number: 0 },
          'Calories': { number: 0 },
          'Deficit': { number: 1800},
        }
      });
      
      res.json({ 
        success: true, 
        message: `New entry created with sleep ${sleepType} data for today`,
        date: todayFormatted,
        week: weekRange || 'No matching week found',
        sleepData: req.body
      });
    }
  } catch (err) {
    console.error('Error logging sleep data:', err);
    res.status(500).json({ error: 'Error logging sleep data to Notion database: ' + err.message });
  }
});

/**
 * GET /api/sleep
 * Gets today's sleep data if it exists
 */
app.get('/api/sleep', async (req, res) => {
  try {
    // Format today's date in "YYYY / MM / DD" format
    const todayFormatted = getTodayFormatted();
    
    // Query to find today's entry
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Day',
        title: {
          equals: todayFormatted
        }
      }
    });
    
    if (response.results.length > 0) {
      const page = response.results[0];
      
      // Extract sleep data
      const sleepHours = (page.properties['Sleep Hours'] && page.properties['Sleep Hours'].number) || null;
      
      let sleepQuality = null;
      if (page.properties['Sleep Quality'] && 
          page.properties['Sleep Quality'].select && 
          page.properties['Sleep Quality'].select.name) {
        sleepQuality = page.properties['Sleep Quality'].select.name.toLowerCase();
      }
      
      let bedTime = null;
      if (page.properties['Bed Time'] && 
          page.properties['Bed Time'].rich_text && 
          page.properties['Bed Time'].rich_text.length > 0) {
        bedTime = page.properties['Bed Time'].rich_text[0].plain_text;
      }
      
      let wakeTime = null;
      if (page.properties['Wake Time'] && 
          page.properties['Wake Time'].rich_text && 
          page.properties['Wake Time'].rich_text.length > 0) {
        wakeTime = page.properties['Wake Time'].rich_text[0].plain_text;
      }
      
      res.json({
        success: true,
        date: todayFormatted,
        sleepData: {
          sleepHours,
          sleepQuality,
          bedTime,
          wakeTime
        }
      });
    } else {
      // No entry for today
      res.json({
        success: true,
        date: todayFormatted,
        sleepData: null,
        message: 'No sleep data logged for today'
      });
    }
  } catch (err) {
    console.error('Error fetching sleep data:', err);
    res.status(500).json({ error: 'Error fetching sleep data' });
  }
});


app.get('/api/tracker', async(req,res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const dailyCal= await getDailyStats(response, 'Calories');
    const dailyDef= await getDailyStats(response, 'Deficit');
    const dailyProt= await getDailyStats(response, 'Protein');
    const dailyCarb= await getDailyStats(response, 'Carbs');
    const dailyFat= await getDailyStats(response, 'Fats');

    const dailyStep= await getDailyStats(response, 'Steps');
    const dailyKcalFromMov= await getDailyStats(response, 'Kcal From Movement');
  
    const dailyZone2Dur= await getDailyStats(response, 'Zone2 Duration');
    const dailyZone2Dist= await getDailyStats(response, 'Zone2 Distance');
    const dailyCycleDist= await getDailyStats(response, 'Cycling Distance');
    const dailyCycleDur= await getDailyStats(response, 'Cycling Duration');
    const dailyWType= await getDailyStats(response, 'Workout Type');
    const dailyWDur= await getDailyStats(response, 'Gym Duration');

    const dailyWeight= await getDailyStats(response, 'Weight');
    const weightDayBefore = await getDayBeforeWeight(response, 'Weight');

    const dailyIsPoop = await getDailyStatsBool(response, 'Poop');
    const dailyIsBloated = await getDailyStatsBool(response, 'Bloated');
    const dailyIsWatery = await getDailyStatsBool(response, 'Watery');
    const dailyIsBadSleep = await getDailyStatsBool(response, 'Bad Sleep');

    const dailyBedTime = await getDailyStatsString(response, 'Bed Time');
    const dailyWakeTime = await getDailyStatsString(response, 'Wake Time');
    const dailySleepQuality = await getDailyStatsSelect(response, 'Sleep Quality');
    const dailySleepHours = await getDailyStatsString(response, 'Sleep Window');
    

    console.log(dailySleepQuality)
    const result = {
      protein: Math.round(dailyProt),
      fat: Math.round(dailyFat),
      carbs: Math.round(dailyCarb),
      calories: Math.round(dailyCal),
      deficit: Math.round(dailyDef),
      steps: Math.round(dailyStep),
      kcalFromMovement: Math.round(dailyKcalFromMov),
      zone2Dur:dailyZone2Dur,
      zone2Distance: dailyZone2Dist,
      cycleDist:dailyCycleDist,
      cycleDur:dailyCycleDur,
      workType:dailyWType,
      workDur:dailyWDur,
      weight: dailyWeight,
      weightDayBefore: weightDayBefore,
      isPoop: dailyIsPoop,
      isBloated: dailyIsBloated,
      isWatery: dailyIsWatery,
      isBadSleep: dailyIsBadSleep,
      bedTime: dailyBedTime[0].text.content,
      wakeTime: dailyWakeTime[0].text.content,
      sleepQuality: dailySleepQuality.name,
      sleepHours: dailySleepHours[0].text.content,

    }
    console.log(result)
    res.json({result});
  } catch (err) {
    console.error('Error fetching deficits:', err);
    res.status(500).json({ error: 'Error fetching deficits' });
  }
})


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
