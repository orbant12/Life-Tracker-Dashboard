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
            number: {}
          },
          "Serving Unit": {
            rich_text: {}
          },
          "Date Added": {
            date: {}
          }
        }
      });
      
      
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
    const { name, protein, carbs, fats, calories, servingSize, servingUnit, date } = req.body;
    
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Split the input by hyphen
    const [year, month, day] = date.split('-');
    
    // Return the formatted date
    
    const todayFormatted = `${year} / ${month} / ${day}`;

    const [year2, month2, day2] = date.split('-').map(Number);
    const today = new Date(year2, month2 - 1, day2);
    
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
        'Serving Size': { number: Number(servingSize)},
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
          servingSize: Number(servingSize),
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
          servingSize: Number(servingSize),
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
    const { weight, bloated, poop, watery, isBadSleep,date } = req.body;
    
    // Validate input
    if (weight === undefined) {
      return res.status(400).json({ error: 'Missing required weight data. Please provide weight.' });
    }

    // Format today's date in "YYYY / MM / DD" format to match your database
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Split the input by hyphen
    const [year, month, day] = date.split('-');
    
    // Return the formatted date
    
    const todayFormatted = `${year} / ${month} / ${day}`;

    const [year2, month2, day2] = date.split('-').map(Number);
    const today = new Date(year2, month2 - 1, day2);
    
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
    const { steps, burn, date } = req.body;
    
    // Validate input
    if (steps === undefined) {
      return res.status(400).json({ error: 'Missing steps data. Please provide steps count.' });
    }

    // Burn is optional but if provided, should be a number
    const burnValue = burn !== undefined ? Number(burn) : 0;

    // Format today's date in "YYYY / MM / DD" format to match your database
    // Format today's date in YYYY / MM / DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Split the input by hyphen
    const [year, month, day] = date.split('-');
    
    // Return the formatted date
    
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
      burn,         // calories burned (optional)
      workoutData,   // detailed workout data (optional)
      date
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Split the input by hyphen
    const [year, month, day] = date.split('-');
    
    // Return the formatted date
    
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
      
      // Add workout data as text if provided
      if (workoutData) {
        // Convert to string if it's an object
        const workoutDataStr = typeof workoutData === 'object' ? 
                               JSON.stringify(workoutData) : 
                               workoutData.toString();
        
        exerciseProperties['WorkoutData'] = {
          rich_text: [{
            text: {
              content: workoutDataStr
            }
          }]
        };
        
        // Save for response
        updatedValues.workoutData = workoutDataStr;
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
          burn: burnValue,
          workoutData: workoutData || null
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
      
      // Add workout data as text if provided
      if (workoutData) {
        // Convert to string if it's an object
        const workoutDataStr = typeof workoutData === 'object' ? 
                               JSON.stringify(workoutData) : 
                               workoutData.toString();
        
        exerciseProperties['WorkoutData'] = {
          rich_text: [{
            text: {
              content: workoutDataStr
            }
          }]
        };
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
          deficit: deficitValue,
          workoutData: workoutData || null
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
    const { duration, distance, burn, date } = req.body;
    
    // Validate input
    if (duration === undefined || distance === undefined || burn === undefined) {
      return res.status(400).json({ 
        error: 'Missing required cycling data. Please provide duration, distance, and burn.' 
      });
    }

    // Format today's date in "YYYY / MM / DD" format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Split the input by hyphen
    const [year, month, day] = date.split('-');
    
    // Return the formatted date
    
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
      sleepWindow,       // for timing (calculated, e.g. "8h 30m")
      date
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
     // Format today's date in "YYYY / MM / DD" format to match your database
     if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    // Split the input by hyphen
    const [year, month, day] = date.split('-');
    
    // Return the formatted date
    
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

const getDailyFoods = (data) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateToMatch = `${year} / ${month} / ${day}`;

  let todaysFoods = [];
  let totalCal = 0;
  
  data.results.forEach((page) => {
    const dateAddedProp = page.properties['Date Added'];
    
    // Check if the date matches today's date
    if ( dateAddedProp.rich_text[0].plain_text === dateToMatch) {
      
      // Extract food information
      const food = {
        name: page.properties['Name'].title[0]?.plain_text || '',
        protein: page.properties['Protein'].number || 0,
        carbs: page.properties['Carbs'].number || 0,
        fats: page.properties['Fats'].number || 0,
        calories: page.properties['Calories'].number || 0,
        servingSize: page.properties['Serving Size'].number || 0,
        servingUnit: page.properties['Serving Unit'].rich_text[0].plain_text || 'g'
      };
      
      totalCal += page.properties['Calories'].number || 0,
      todaysFoods.push(food);
    }
  });
  const cal = {
    name: "Total Calories",
    protein:null,
    carbs:null,
    fats:null,
    calories:totalCal,
    servingSize:null,
    servingUnit: null,
  }
  todaysFoods.push(cal)
  return todaysFoods;
};

const getDailyFoodsForWeek = (data, day) => {
  
  let todaysFoods = [];
  let totalCal = 0;
  
  data.results.forEach((page) => {
    const dateAddedProp = page.properties['Date Added'];
    
    // Check if the date matches today's date
    if ( dateAddedProp.rich_text[0].plain_text === day) {
      
      // Extract food information
      const food = {
        name: page.properties['Name'].title[0]?.plain_text || '',
        protein: page.properties['Protein'].number || 0,
        carbs: page.properties['Carbs'].number || 0,
        fats: page.properties['Fats'].number || 0,
        calories: page.properties['Calories'].number || 0,
        servingSize: page.properties['Serving Size'].number || 0,
        servingUnit: page.properties['Serving Unit'].rich_text[0].plain_text || 'g'
      };
      
      totalCal += page.properties['Calories'].number || 0,
      todaysFoods.push(food);
    }
  });
  const cal = {
    name: "Total Calories",
    protein:null,
    carbs:null,
    fats:null,
    calories:totalCal,
    servingSize:null,
    servingUnit: null,
  }
  todaysFoods.push(cal)
  return todaysFoods;
};

const foodDatabaseId = process.env.NOTION_FOOD_DATABASE_ID;

app.get('/api/tracker', async(req,res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const foodResponse = await notion.databases.query({
      database_id: foodDatabaseId, 
      page_size: 100,
    })

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
    const dailyGymData = await getDailyStatsString(response, 'WorkoutData');

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

    const dailyFoods = await getDailyFoods(foodResponse)
    
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
      // Add null checks for sleep-related data
      bedTime: dailyBedTime && dailyBedTime[0] && dailyBedTime[0].text ? dailyBedTime[0].text.content : null,
      wakeTime: dailyWakeTime && dailyWakeTime[0] && dailyWakeTime[0].text ? dailyWakeTime[0].text.content : null,
      sleepQuality: dailySleepQuality ? dailySleepQuality.name : null,
      sleepHours: dailySleepHours && dailySleepHours[0] && dailySleepHours[0].text ? dailySleepHours[0].text.content : null,
      foodList: dailyFoods,
      workoutData: dailyGymData && dailyGymData[0] && dailyGymData[0].text ? dailyGymData[0].text.content : null,
    }
    
    res.json({result});
  } catch (err) {
    console.error('Error fetching deficits:', err);
    res.status(500).json({ error: 'Error fetching deficits' });
  }
})

function getWeeklyStatsString(data, typeString) {
  // Get current date
  const today = new Date();
  
  // Find the Monday of the current week
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust for week starting on Monday
  
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - daysFromMonday);
  
  // Create an array of dates for the current week (Monday to Sunday)
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    weekDates.push(`${year} / ${month} / ${day}`);
  }
  
  // Initialize results array with one object per day of the week
  const weeklyResults = weekDates.map(dateString => {
    return {
      day: dateString,
      value: false // Default to false to match original function's behavior
    };
  });
  
  // Fill in values from the data
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        // Check if the date is in our week array
        const dayIndex = weekDates.indexOf(titleObj.plain_text);
        if (dayIndex !== -1) {
          const textProperty = page.properties[typeString];
          if (textProperty) {
            weeklyResults[dayIndex].value = textProperty.rich_text;
          }
        }
      });
    }
  });
  
  return weeklyResults;
}

function getWeeklyStats(data, typeString) {
  // Get current date
  const today = new Date();
  
  // Find the Monday of the current week
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust for week starting on Monday
  
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - daysFromMonday);
  
  // Create an array of dates for the current week (Monday to Sunday)
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    weekDates.push(`${year} / ${month} / ${day}`);
  }
  
  // Initialize results array with one object per day of the week
  const weeklyResults = weekDates.map(dateString => {
    return {
      day: dateString,
      value: 0
    };
  });
  
  

  // Fill in values from the data
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        // Check if the date is in our week array
        const dayIndex = weekDates.indexOf(titleObj.plain_text);
        if (dayIndex !== -1) {
          const valueProperty = page.properties[typeString];
          if (valueProperty && typeof valueProperty.number === 'number') {
            weeklyResults[dayIndex].value += valueProperty.number;
          }
        }
      });
    }
  });
  
  return weeklyResults;
}

// Example usage:
// const weeklyCalories = getWeeklyStats(data, 'Calories');
// const weeklyDeficit = getWeeklyStats(data, 'Deficit');

app.get('/api/tracker/weekly', async(req,res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const foodResponse = await notion.databases.query({
      database_id: foodDatabaseId, 
      page_size: 100,
    });

    // Get weekly stats for all metrics
    const weeklyCal = await getWeeklyStats(response, 'Calories');
    const weeklyDef = await getWeeklyStats(response, 'Deficit');
    const weeklyProt = await getWeeklyStats(response, 'Protein');
    const weeklyCarb = await getWeeklyStats(response, 'Carbs');
    const weeklyFat = await getWeeklyStats(response, 'Fats');

    const weeklyStep = await getWeeklyStats(response, 'Steps');
    const weeklyKcalFromMov = await getWeeklyStats(response, 'Kcal From Movement');
  
    const weeklyZone2Dur = await getWeeklyStats(response, 'Zone2 Duration');
    const weeklyZone2Dist = await getWeeklyStats(response, 'Zone2 Distance');
    const weeklyCycleDist = await getWeeklyStats(response, 'Cycling Distance');
    const weeklyCycleDur = await getWeeklyStats(response, 'Cycling Duration');
    const weeklyWType = await getWeeklyStatsString(response, 'Workout Type');
    const weeklyWDur = await getWeeklyStats(response, 'Gym Duration');

    const weeklyWeight = await getWeeklyStats(response, 'Weight');
    const weeklyIsPoop = await getWeeklyStatsString(response, 'Is Poop');
    const weeklyIsBloated = await getWeeklyStatsString(response, 'Is Bloated');
    const weeklyIsWatery = await getWeeklyStatsString(response, 'Is Watery');
    const weeklyIsBadSleep = await getWeeklyStatsString(response, 'Is Bad Sleep');
    
    const weeklyBedTime = await getWeeklyStatsString(response, 'Bed Time');
    const weeklyWakeTime = await getWeeklyStatsString(response, 'Wake Time');
    const weeklySleepQuality = await getWeeklyStatsString(response, 'Sleep Quality');
    const weeklySleepHours = await getWeeklyStatsString(response, 'Sleep Window');

    // Process food data weekly
    const weeklyFoods = [];
    
    // Get array of days for the week
    const days = weeklyCal.map(item => item.day);
    
    // Get food for each day
    for (const day of days) {
      const dayFoods = await getDailyFoodsForDate(foodResponse, day);
      weeklyFoods.push({
        day: day,
        foods: dayFoods
      });
    }
    
    // Format days with processed text values
    const formattedDays = days.map((day, index) => {
      return {
        date: day,
        nutrition: {
          protein: Math.round(weeklyProt[index].value),
          fat: Math.round(weeklyFat[index].value),
          carbs: Math.round(weeklyCarb[index].value),
          calories: Math.round(weeklyCal[index].value),
          deficit: Math.round(weeklyDef[index].value)
        },
        movement: {
          steps: Math.round(weeklyStep[index].value),
          kcalFromMovement: Math.round(weeklyKcalFromMov[index].value),
          zone2: {
            duration: weeklyZone2Dur[index].value,
            distance: weeklyZone2Dist[index].value
          },
          cycling: {
            distance: weeklyCycleDist[index].value,
            duration: weeklyCycleDur[index].value
          },
          workout: {
            type: weeklyWType[index].value && weeklyWType[index].value.length > 0 ? 
                 weeklyWType[index].value[0]?.text?.content || '' : '',
            duration: weeklyWDur[index].value
          }
        },
        biometrics: {
          weight: weeklyWeight[index].value,
          isPoop: weeklyIsPoop[index].value && weeklyIsPoop[index].value.length > 0 ? 
                  weeklyIsPoop[index].value[0]?.text?.content === 'true' : false,
          isBloated: weeklyIsBloated[index].value && weeklyIsBloated[index].value.length > 0 ? 
                    weeklyIsBloated[index].value[0]?.text?.content === 'true' : false,
          isWatery: weeklyIsWatery[index].value && weeklyIsWatery[index].value.length > 0 ? 
                   weeklyIsWatery[index].value[0]?.text?.content === 'true' : false
        },
        sleep: {
          isBadSleep: weeklyIsBadSleep[index].value && weeklyIsBadSleep[index].value.length > 0 ? 
                     weeklyIsBadSleep[index].value[0]?.text?.content === 'true' : false,
          bedTime: weeklyBedTime[index].value && weeklyBedTime[index].value.length > 0 ? 
                  weeklyBedTime[index].value[0]?.text?.content : '',
          wakeTime: weeklyWakeTime[index].value && weeklyWakeTime[index].value.length > 0 ? 
                   weeklyWakeTime[index].value[0]?.text?.content : '',
          quality: weeklySleepQuality[index].value && weeklySleepQuality[index].value.length > 0 ? 
                  weeklySleepQuality[index].value[0]?.text?.content : '',
          hours: weeklySleepHours[index].value && weeklySleepHours[index].value.length > 0 ? 
                weeklySleepHours[index].value[0]?.text?.content : ''
        },
        foods: weeklyFoods[index]?.foods || []
      };
    });
    
    // Calculate weekly averages and totals
    const weeklyAverages = {
      nutrition: {
        avgProtein: Math.round(weeklyProt.reduce((sum, day) => sum + day.value, 0) / 7),
        avgFat: Math.round(weeklyFat.reduce((sum, day) => sum + day.value, 0) / 7),
        avgCarbs: Math.round(weeklyCarb.reduce((sum, day) => sum + day.value, 0) / 7),
        avgCalories: Math.round(weeklyCal.reduce((sum, day) => sum + day.value, 0) / 7),
        totalDeficit: Math.round(weeklyDef.reduce((sum, day) => sum + day.value, 0))
      },
      movement: {
        avgSteps: Math.round(weeklyStep.reduce((sum, day) => sum + day.value, 0) / 7),
        totalKcalFromMovement: Math.round(weeklyKcalFromMov.reduce((sum, day) => sum + day.value, 0)),
        totalZone2Minutes: weeklyZone2Dur.reduce((sum, day) => sum + day.value, 0),
        totalZone2Distance: weeklyZone2Dist.reduce((sum, day) => sum + day.value, 0),
        totalCyclingDistance: weeklyCycleDist.reduce((sum, day) => sum + day.value, 0),
        totalCyclingMinutes: weeklyCycleDur.reduce((sum, day) => sum + day.value, 0),
        totalWorkoutMinutes: weeklyWDur.reduce((sum, day) => sum + day.value, 0)
      },
      biometrics: {
        avgWeight: weeklyWeight.filter(day => day.value > 0).length > 0 ?
                  weeklyWeight.filter(day => day.value > 0).reduce((sum, day) => sum + day.value, 0) / 
                  weeklyWeight.filter(day => day.value > 0).length : 0
      }
    };
    
    const result = {
      dailyData: formattedDays,
      weeklyAverages: weeklyAverages,
      weekStart: days[0],
      weekEnd: days[6]
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching weekly data:', err);
    res.status(500).json({ error: 'Error fetching weekly data' });
  }
});

app.get('/api/tracker/weekly/macro', async(req,res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const foodResponse = await notion.databases.query({
      database_id: foodDatabaseId, 
      page_size: 100,
    });

    // Get weekly stats for all metrics
    const weeklyCal = await getWeeklyStats(response, 'Calories');
    const weeklyDef = await getWeeklyStats(response, 'Deficit');
    const weeklyProt = await getWeeklyStats(response, 'Protein');
    const weeklyCarb = await getWeeklyStats(response, 'Carbs');
    const weeklyFat = await getWeeklyStats(response, 'Fats');

    const weeklyWeight = await getWeeklyStats(response, 'Weight');

    

    // Process food data weekly
    const weeklyFoods = [];
    
    // Get array of days for the week
    const days = weeklyCal.map(item => item.day);
    
    // Get food for each day
    for (const day of days) {
      const dayFoods = await getDailyFoodsForWeek(foodResponse, day);
      weeklyFoods.push({
        day: day,
        foods: dayFoods
      });
    }
    
    // Format days with processed text values
    const formattedDays = days.map((day, index) => {
      return {
        date: day,
        nutrition: {
          protein: Math.round(weeklyProt[index].value),
          fat: Math.round(weeklyFat[index].value),
          carbs: Math.round(weeklyCarb[index].value),
          calories: Math.round(weeklyCal[index].value),
          deficit: Math.round(weeklyDef[index].value),
          weight: Math.round(weeklyWeight[index].value)
        },
        
        foods: weeklyFoods[index]?.foods || []
      };
    });
    
    // Calculate weekly averages and totals
    const weeklyAverages = {
      nutrition: {
        avgProtein: Math.round(weeklyProt.reduce((sum, day) => sum + day.value, 0) / 7),
        avgFat: Math.round(weeklyFat.reduce((sum, day) => sum + day.value, 0) / 7),
        avgCarbs: Math.round(weeklyCarb.reduce((sum, day) => sum + day.value, 0) / 7),
        avgCalories: Math.round(weeklyCal.reduce((sum, day) => sum + day.value, 0) / 7),
        totalDeficit: Math.round(weeklyDef.reduce((sum, day) => sum + day.value, 0)),
        totalProtein:Math.round(weeklyProt.reduce((sum, day) => sum + day.value, 0)),
        totalFat: Math.round(weeklyFat.reduce((sum, day) => sum + day.value, 0)),
        totalCarbs: Math.round(weeklyCarb.reduce((sum, day) => sum + day.value, 0)),
        totalCalories: Math.round(weeklyCal.reduce((sum, day) => sum + day.value, 0)),
        avgWeight: Math.round(weeklyWeight.reduce((sum, day) => sum + day.value, 0) / 7),
      },
    };
    
    const result = {
      dailyData: formattedDays,
      weeklyAverages: weeklyAverages,
      weekStart: days[0],
      weekEnd: days[6]
    };
    
    res.json({result});
  } catch (err) {
    console.error('Error fetching weekly data:', err);
    res.status(500).json({ error: 'Error fetching weekly data' });
  }
});

app.get('/api/tracker/weekly/deficit', async(req,res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    const foodResponse = await notion.databases.query({
      database_id: foodDatabaseId, 
      page_size: 100,
    });

    // Get weekly stats for all metrics
    const weeklyCal = await getWeeklyStats(response, 'Calories');
    const weeklyDef = await getWeeklyStats(response, 'Deficit');
    
  

    // Process food data weekly
    const weeklyFoods = [];
    
    // Get array of days for the week
    const days = weeklyCal.map(item => item.day);
    
    // Get food for each day
    for (const day of days) {
      const dayFoods = await getDailyFoodsForWeek(foodResponse, day);
      weeklyFoods.push({
        day: day,
        foods: dayFoods
      });
    }
    
    // Format days with processed text values
    const formattedDays = days.map((day, index) => {
      return {
        date: day,
        nutrition: {
          calories: Math.round(weeklyCal[index].value),
          deficit: Math.round(weeklyDef[index].value)
        },
        
        foods: weeklyFoods[index]?.foods || []
      };
    });
    
    // Calculate weekly averages and totals
    const weeklyAverages = {
      nutrition: { 
        avgCalories: Math.round(weeklyCal.reduce((sum, day) => sum + day.value, 0) / 7),
        totalDeficit: Math.round(weeklyDef.reduce((sum, day) => sum + day.value, 0)),
        totalCalories: Math.round(weeklyCal.reduce((sum, day) => sum + day.value, 0))
      },
    };

    
    const result = {
      dailyData: formattedDays,
      weeklyAverages: weeklyAverages,
      weekStart: days[0],
      weekEnd: days[6]
    };
    
    res.json({result});
  } catch (err) {
    console.error('Error fetching weekly data:', err);
    res.status(500).json({ error: 'Error fetching weekly data' });
  }
});


// Helper function to get foods for a specific date
async function getDailyFoodsForDate(foodResponse, dateString) {
  const foods = [];
  
  foodResponse.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        if (titleObj.plain_text === dateString) {
          const foodName = page.properties['Food Name']?.rich_text?.[0]?.text?.content || '';
          const calories = page.properties['Calories']?.number || 0;
          const protein = page.properties['Protein']?.number || 0;
          const carbs = page.properties['Carbs']?.number || 0;
          const fat = page.properties['Fat']?.number || 0;
          
          foods.push({
            name: foodName,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat
          });
        }
      });
    }
  });
  
  return foods;
}

app.get('/api/weekly/exercise', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    // Get weekly stats for all exercise-related metrics
    const weeklySteps = await getWeeklyStats(response, 'Steps');
    const weeklyKcalFromMov = await getWeeklyStats(response, 'Kcal From Movement');
    
    // Cardio related metrics
    const weeklyZone2Dur = await getWeeklyStats(response, 'Zone2 Duration');
    const weeklyZone2Dist = await getWeeklyStats(response, 'Zone2 Distance');
    const weeklyCycleDur = await getWeeklyStats(response, 'Cycling Duration');
    const weeklyCycleDist = await getWeeklyStats(response, 'Cycling Distance');
    
    // Gym related metrics
    const weeklyGymDur = await getWeeklyStats(response, 'Gym Duration');
    const weeklyWorkoutType = await getWeeklyStatsString(response, 'Workout Type');
    const weeklyWorkoutData = await getWeeklyStatsString(response, 'WorkoutData');
    
    // VO2Max - this is typically a measurement rather than a cumulative value
    const weeklyVO2Max = await getWeeklyStats(response, 'VO2Max');
    
    // Get array of days for the week
    const days = weeklySteps.map(item => item.day);
    
    // Format days with processed exercise data
    const dailyExerciseData = days.map((day, index) => {
      // Get workout type from select field (if available)
      let workoutType = '';
      if (weeklyWorkoutType[index].value && 
          weeklyWorkoutType[index].value.select && 
          weeklyWorkoutType[index].value.select.name) {
        workoutType = weeklyWorkoutType[index].value.select.name;
      }
      
      // Get workout data (if available)
      let workoutData = null;
      if (weeklyWorkoutData[index].value && 
          weeklyWorkoutData[index].value.length > 0 && 
          weeklyWorkoutData[index].value[0].text) {
        workoutData = weeklyWorkoutData[index].value[0].text.content;
        
        // Try to parse JSON if it appears to be JSON
        if (workoutData && (workoutData.startsWith('{') || workoutData.startsWith('['))) {
          try {
            workoutData = JSON.parse(workoutData);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      }
      
      return {
        date: day,
        steps: Math.round(weeklySteps[index].value) || 0,
        kcalBurned: Math.round(weeklyKcalFromMov[index].value) || 0,
        cardio: {
          zone2: {
            minutes: weeklyZone2Dur[index].value || 0,
            distance: weeklyZone2Dist[index].value || 0,
            // Add pace calculation if both duration and distance exist
            pace: weeklyZone2Dist[index].value && weeklyZone2Dur[index].value ? 
                  (weeklyZone2Dur[index].value / weeklyZone2Dist[index].value).toFixed(2) : null
          },
          cycling: {
            minutes: weeklyCycleDur[index].value || 0,
            distance: weeklyCycleDist[index].value || 0,
            // Add speed calculation if both duration and distance exist
            speed: weeklyCycleDist[index].value && weeklyCycleDur[index].value ? 
                   ((weeklyCycleDist[index].value / (weeklyCycleDur[index].value / 60))).toFixed(2) : null
          },
          vo2max: weeklyVO2Max[index].value || null
        },
        strength: {
          minutes: weeklyGymDur[index].value || 0,
          workoutType: workoutType || null,
          workoutData: workoutData
        },
        // Flag to easily check if any exercise was done on this day
        hasExercise: weeklySteps[index].value > 0 || 
                     weeklyZone2Dur[index].value > 0 || 
                     weeklyCycleDur[index].value > 0 || 
                     weeklyGymDur[index].value > 0
      };
    });
    
    // Calculate weekly totals and averages
    const weeklyTotals = {
      totalSteps: weeklySteps.reduce((sum, day) => sum + day.value, 0),
      totalKcalBurned: Math.round(weeklyKcalFromMov.reduce((sum, day) => sum + day.value, 0)),
      cardio: {
        totalMinutes: (weeklyZone2Dur.reduce((sum, day) => sum + day.value, 0) || 0) + 
                      (weeklyCycleDur.reduce((sum, day) => sum + day.value, 0) || 0),
        zone2: {
          totalMinutes: weeklyZone2Dur.reduce((sum, day) => sum + day.value, 0) || 0,
          totalDistance: weeklyZone2Dist.reduce((sum, day) => sum + day.value, 0) || 0,
          sessionsCount: weeklyZone2Dur.filter(day => day.value > 0).length
        },
        cycling: {
          totalMinutes: weeklyCycleDur.reduce((sum, day) => sum + day.value, 0) || 0,
          totalDistance: weeklyCycleDist.reduce((sum, day) => sum + day.value, 0) || 0,
          sessionsCount: weeklyCycleDur.filter(day => day.value > 0).length
        },
        // For VO2Max, only report the latest value from the week (if any)
        latestVO2Max: (() => {
          const vo2maxEntries = weeklyVO2Max.filter(day => day.value > 0);
          return vo2maxEntries.length > 0 ? vo2maxEntries[vo2maxEntries.length - 1].value : null;
        })()
      },
      strength: {
        totalMinutes: weeklyGymDur.reduce((sum, day) => sum + day.value, 0) || 0,
        sessionsCount: weeklyGymDur.filter(day => day.value > 0).length,
        // Count workout types
        workoutTypes: (() => {
          const types = {};
          weeklyWorkoutType.forEach((day, index) => {
            if (day.value && day.value.select && day.value.select.name && weeklyGymDur[index].value > 0) {
              const type = day.value.select.name;
              types[type] = (types[type] || 0) + 1;
            }
          });
          return types;
        })()
      },
      // Calculate active days (days with any exercise)
      activeDays: dailyExerciseData.filter(day => day.hasExercise).length,
      // Calculate rest days (days with no exercise recorded)
      restDays: dailyExerciseData.filter(day => !day.hasExercise).length
    };
    
    // Calculate averages
    const weeklyAverages = {
      avgDailySteps: Math.round(weeklyTotals.totalSteps / 7),
      avgDailyKcalBurned: Math.round(weeklyTotals.totalKcalBurned / 7),
      // Average stats for active days only
      activeDay: {
        avgSteps: Math.round(weeklyTotals.totalSteps / (weeklyTotals.activeDays || 1)),
        avgKcalBurned: Math.round(weeklyTotals.totalKcalBurned / (weeklyTotals.activeDays || 1))
      }
    };
    
    // Prepare data for a week-at-a-glance visualization
    const weekAtGlance = dailyExerciseData.map(day => {
      return {
        date: day.date,
        steps: day.steps,
        hasCardio: day.cardio.zone2.minutes > 0 || day.cardio.cycling.minutes > 0,
        hasStrength: day.strength.minutes > 0,
        totalActiveMinutes: (day.cardio.zone2.minutes || 0) + 
                          (day.cardio.cycling.minutes || 0) + 
                          (day.strength.minutes || 0),
        kcalBurned: day.kcalBurned
      };
    });
    
    const result = {
      weekStart: days[0],
      weekEnd: days[days.length - 1],
      dailyData: dailyExerciseData,
      weekAtGlance,
      totals: weeklyTotals,
      averages: weeklyAverages
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching weekly exercise data:', err);
    res.status(500).json({ error: 'Error fetching weekly exercise data: ' + err.message });
  }
});

function getWeeklyStatsBool(data, typeString) {
  // Get current date
  const today = new Date();
  
  // Find the Monday of the current week
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust for week starting on Monday
  
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - daysFromMonday);
  
  // Create an array of dates for the current week (Monday to Sunday)
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    weekDates.push(`${year} / ${month} / ${day}`);
  }
  
  // Initialize results array with one object per day of the week
  const weeklyResults = weekDates.map(dateString => {
    return {
      day: dateString,
      value: false // Default to false
    };
  });
  
  // Fill in values from the data
  data.results.forEach((page) => {
    const dayProp = page.properties['Day'];
    if (dayProp && Array.isArray(dayProp.title)) {
      dayProp.title.forEach((titleObj) => {
        // Check if the date is in our week array
        const dayIndex = weekDates.indexOf(titleObj.plain_text);
        if (dayIndex !== -1) {
          const boolProperty = page.properties[typeString];
          if (boolProperty && typeof boolProperty.checkbox === 'boolean') {
            weeklyResults[dayIndex].value = boolProperty.checkbox;
          }
        }
      });
    }
  });
  
  return weeklyResults;
}

app.get('/api/weekly/sleep', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    // Get weekly stats for all sleep-related metrics
    const weeklyBedTime = await getWeeklyStatsString(response, 'Bed Time');
    const weeklyWakeTime = await getWeeklyStatsString(response, 'Wake Time');
    const weeklySleepWindow = await getWeeklyStatsString(response, 'Sleep Window');
    const weeklySleepQuality = await getWeeklyStatsString(response, 'Sleep Quality');
    const weeklyBadSleep = await getWeeklyStatsBool(response, 'Bad Sleep');
    
    // Get array of days for the week
    const days = weeklyBedTime.map(item => item.day);
    
    // Function to parse time string in "HH:MM" format and return minutes since midnight
    const parseTimeToMinutes = (timeString) => {
      if (!timeString) return null;
      
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // Function to format minutes since midnight back to "HH:MM" format
    const formatMinutesToTime = (minutes) => {
      if (minutes === null || minutes === undefined) return null;
      
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };
    
    // Function to calculate sleep duration in minutes from bed time and wake time
    const calculateSleepDuration = (bedTimeStr, wakeTimeStr) => {
      if (!bedTimeStr || !wakeTimeStr) return null;
      
      let bedTime = parseTimeToMinutes(bedTimeStr);
      let wakeTime = parseTimeToMinutes(wakeTimeStr);
      
      // Handle case where bedtime is later than wake time (sleeping past midnight)
      if (bedTime > wakeTime) {
        return (24 * 60 - bedTime) + wakeTime;
      } else {
        return wakeTime - bedTime;
      }
    };
    
    // Function to extract sleep window duration in minutes from a string like "8h 30m"
    const parseSleepWindowToMinutes = (sleepWindowStr) => {
      if (!sleepWindowStr) return null;
      
      let totalMinutes = 0;
      
      // Extract hours
      const hoursMatch = sleepWindowStr.match(/(\d+)h/);
      if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
      }
      
      // Extract minutes
      const minutesMatch = sleepWindowStr.match(/(\d+)m/);
      if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
      }
      
      return totalMinutes;
    };
    
    // Function to format minutes as hours and minutes
    const formatMinutes = (minutes) => {
      if (!minutes) return null;
      
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    };
    
    // Format days with processed sleep data
    const dailySleepData = days.map((day, index) => {
      // Extract bed time and wake time
      let bedTime = null;
      if (weeklyBedTime[index].value && 
          weeklyBedTime[index].value.length > 0 && 
          weeklyBedTime[index].value[0].text) {
        bedTime = weeklyBedTime[index].value[0].text.content;
      }
      
      let wakeTime = null;
      if (weeklyWakeTime[index].value && 
          weeklyWakeTime[index].value.length > 0 && 
          weeklyWakeTime[index].value[0].text) {
        wakeTime = weeklyWakeTime[index].value[0].text.content;
      }
      
      // Extract sleep window as recorded or calculate it from bed time and wake time
      let sleepWindow = null;
      if (weeklySleepWindow[index].value && 
          weeklySleepWindow[index].value.length > 0 && 
          weeklySleepWindow[index].value[0].text) {
        sleepWindow = weeklySleepWindow[index].value[0].text.content;
      } else if (bedTime && wakeTime) {
        const durationMinutes = calculateSleepDuration(bedTime, wakeTime);
        if (durationMinutes) {
          sleepWindow = formatMinutes(durationMinutes);
        }
      }
      
      // Extract sleep quality
      let sleepQuality = null;
      if (weeklySleepQuality[index].value && 
          weeklySleepQuality[index].value.select && 
          weeklySleepQuality[index].value.select.name) {
        sleepQuality = weeklySleepQuality[index].value.select.name;
      }
      
      // Get sleep duration in minutes (for calculations)
      let sleepDurationMinutes = null;
      if (sleepWindow) {
        sleepDurationMinutes = parseSleepWindowToMinutes(sleepWindow);
      } else if (bedTime && wakeTime) {
        sleepDurationMinutes = calculateSleepDuration(bedTime, wakeTime);
      }
      
      // Check if sleep was recorded for this day
      const hasSleepData = bedTime || wakeTime || sleepWindow || sleepQuality;
      
      return {
        date: day,
        bedTime,
        wakeTime,
        sleepWindow,
        durationMinutes: sleepDurationMinutes,
        quality: sleepQuality,
        isBadSleep: weeklyBadSleep[index].value || false,
        hasSleepData,
        // Calculate bedtime consistency (difference from average bedtime)
        // This will be calculated after getting average bedtime
        bedTimeDeviation: null,
        // Calculate sleep debt (difference from recommended 8 hours)
        sleepDebt: sleepDurationMinutes ? 480 - sleepDurationMinutes : null
      };
    });
    
    // Calculate average bedtime in minutes since midnight
    const validBedTimes = dailySleepData
      .filter(day => day.bedTime)
      .map(day => parseTimeToMinutes(day.bedTime));
    
    const avgBedTimeMinutes = validBedTimes.length > 0 
      ? validBedTimes.reduce((sum, time) => sum + time, 0) / validBedTimes.length 
      : null;
    
    // Calculate average wake time in minutes since midnight
    const validWakeTimes = dailySleepData
      .filter(day => day.wakeTime)
      .map(day => parseTimeToMinutes(day.wakeTime));
    
    const avgWakeTimeMinutes = validWakeTimes.length > 0 
      ? validWakeTimes.reduce((sum, time) => sum + time, 0) / validWakeTimes.length 
      : null;
    
    // Calculate bedtime consistency (deviation from average)
    if (avgBedTimeMinutes) {
      dailySleepData.forEach(day => {
        if (day.bedTime) {
          const bedTimeMinutes = parseTimeToMinutes(day.bedTime);
          // Calculate absolute difference in minutes
          day.bedTimeDeviation = Math.abs(bedTimeMinutes - avgBedTimeMinutes);
        }
      });
    }
    
    // Weekly sleep metrics
    const weeklySleepMetrics = {
      // Sleep duration metrics
      totalSleepMinutes: dailySleepData.reduce((sum, day) => sum + (day.durationMinutes || 0), 0),
      avgSleepDuration: dailySleepData.filter(day => day.durationMinutes).length > 0 
        ? dailySleepData.reduce((sum, day) => sum + (day.durationMinutes || 0), 0) / 
          dailySleepData.filter(day => day.durationMinutes).length 
        : null,
      shortestSleep: Math.min(...dailySleepData.filter(day => day.durationMinutes).map(day => day.durationMinutes) || [0]),
      longestSleep: Math.max(...dailySleepData.filter(day => day.durationMinutes).map(day => day.durationMinutes) || [0]),
      // Consistency metrics
      avgBedTime: avgBedTimeMinutes ? formatMinutesToTime(Math.round(avgBedTimeMinutes)) : null,
      avgWakeTime: avgWakeTimeMinutes ? formatMinutesToTime(Math.round(avgWakeTimeMinutes)) : null,
      avgBedTimeDeviation: dailySleepData.filter(day => day.bedTimeDeviation).length > 0
        ? dailySleepData.reduce((sum, day) => sum + (day.bedTimeDeviation || 0), 0) /
          dailySleepData.filter(day => day.bedTimeDeviation).length
        : null,
      // Quality metrics
      badSleepDays: dailySleepData.filter(day => day.isBadSleep).length,
      sleepQualityDistribution: (() => {
        const distribution = {};
        dailySleepData.forEach(day => {
          if (day.quality) {
            distribution[day.quality] = (distribution[day.quality] || 0) + 1;
          }
        });
        return distribution;
      })(),
      // Tracking completeness
      daysTracked: dailySleepData.filter(day => day.hasSleepData).length,
      daysWithCompleteTiming: dailySleepData.filter(day => day.bedTime && day.wakeTime).length,
      daysWithQualityRating: dailySleepData.filter(day => day.quality).length
    };
    
    // Format durations for better readability
    weeklySleepMetrics.avgSleepDurationFormatted = weeklySleepMetrics.avgSleepDuration 
      ? formatMinutes(Math.round(weeklySleepMetrics.avgSleepDuration)) 
      : null;
    weeklySleepMetrics.shortestSleepFormatted = weeklySleepMetrics.shortestSleep && weeklySleepMetrics.shortestSleep > 0
      ? formatMinutes(weeklySleepMetrics.shortestSleep)
      : null;
    weeklySleepMetrics.longestSleepFormatted = weeklySleepMetrics.longestSleep && weeklySleepMetrics.longestSleep > 0
      ? formatMinutes(weeklySleepMetrics.longestSleep)
      : null;
    weeklySleepMetrics.avgBedTimeDeviationFormatted = weeklySleepMetrics.avgBedTimeDeviation
      ? formatMinutes(Math.round(weeklySleepMetrics.avgBedTimeDeviation))
      : null;
    
    // Weekly sleep score calculation (custom metric from 0-100)
    const calculateSleepScore = () => {
      if (weeklySleepMetrics.daysTracked === 0) return null;
      
      let score = 0;
      const trackedDays = weeklySleepMetrics.daysTracked;
      
      // Component 1: Average sleep duration (40 points max)
      // Optimal sleep is 7-9 hours (420-540 minutes)
      if (weeklySleepMetrics.avgSleepDuration) {
        const avgDuration = weeklySleepMetrics.avgSleepDuration;
        if (avgDuration >= 420 && avgDuration <= 540) {
          score += 40; // Optimal range
        } else if (avgDuration >= 360 && avgDuration < 420) {
          score += 30; // Slightly low
        } else if (avgDuration > 540 && avgDuration <= 600) {
          score += 30; // Slightly high
        } else if (avgDuration >= 300 && avgDuration < 360) {
          score += 20; // Low
        } else if (avgDuration > 600) {
          score += 20; // High
        } else {
          score += 10; // Very low
        }
      }
      
      // Component 2: Sleep consistency (30 points max)
      // Lower deviation from average bedtime is better
      if (weeklySleepMetrics.avgBedTimeDeviation !== null) {
        const avgDeviation = weeklySleepMetrics.avgBedTimeDeviation;
        if (avgDeviation <= 15) {
          score += 30; // Very consistent (within 15 min)
        } else if (avgDeviation <= 30) {
          score += 25; // Consistent (within 30 min)
        } else if (avgDeviation <= 45) {
          score += 20; // Fairly consistent (within 45 min)
        } else if (avgDeviation <= 60) {
          score += 15; // Somewhat inconsistent (within 1 hour)
        } else if (avgDeviation <= 90) {
          score += 10; // Inconsistent (within 1.5 hours)
        } else {
          score += 5; // Very inconsistent (more than 1.5 hours)
        }
      }
      
      // Component 3: Sleep quality (30 points max)
      // Based on quality ratings and bad sleep days
      const qualityDistribution = weeklySleepMetrics.sleepQualityDistribution;
      let qualityScore = 0;
      
      // Check for quality ratings
      if (weeklySleepMetrics.daysWithQualityRating > 0) {
        const excellentDays = qualityDistribution['Excellent'] || 0;
        const goodDays = qualityDistribution['Good'] || 0;
        const fairDays = qualityDistribution['Fair'] || 0;
        const poorDays = qualityDistribution['Poor'] || 0;
        
        qualityScore = ((excellentDays * 30) + (goodDays * 22) + (fairDays * 15) + (poorDays * 7)) / 
                        weeklySleepMetrics.daysWithQualityRating;
      }
      
      // Penalize for bad sleep days
      const badSleepRatio = weeklySleepMetrics.badSleepDays / trackedDays;
      qualityScore = Math.max(0, qualityScore - (badSleepRatio * 10));
      
      score += qualityScore;
      
      // Adjust for tracking completeness
      const trackingCompleteness = (weeklySleepMetrics.daysWithCompleteTiming + weeklySleepMetrics.daysWithQualityRating) / (trackedDays * 2);
      score = score * Math.min(1, trackingCompleteness + 0.5);
      
      return Math.round(score);
    };
    
    weeklySleepMetrics.sleepScore = calculateSleepScore();
    
    // Weekly recommendations based on sleep metrics
    const generateRecommendations = () => {
      const recommendations = [];
      
      // Only generate recommendations if we have enough data
      if (weeklySleepMetrics.daysTracked < 3) {
        recommendations.push("Track your sleep more consistently to receive personalized recommendations.");
        return recommendations;
      }
      
      // Recommendation for sleep duration
      if (weeklySleepMetrics.avgSleepDuration) {
        if (weeklySleepMetrics.avgSleepDuration < 420) {
          recommendations.push("Consider increasing your sleep duration. Aim for at least 7 hours per night.");
        } else if (weeklySleepMetrics.avgSleepDuration > 540) {
          recommendations.push("Your average sleep duration is higher than recommended. Consider if you're spending too much time in bed.");
        }
      }
      
      // Recommendation for sleep consistency
      if (weeklySleepMetrics.avgBedTimeDeviation) {
        if (weeklySleepMetrics.avgBedTimeDeviation > 60) {
          recommendations.push("Your bedtime varies significantly. Try to establish a more consistent sleep schedule.");
        }
      }
      
      // Recommendation for sleep quality
      if (weeklySleepMetrics.badSleepDays > 2) {
        recommendations.push("You've reported multiple days of poor sleep quality. Consider reviewing your sleep environment or habits.");
      }
      
      // Add general recommendation if none were generated
      if (recommendations.length === 0) {
        recommendations.push("Your sleep patterns look good. Continue maintaining your healthy sleep habits.");
      }
      
      return recommendations;
    };
    
    weeklySleepMetrics.recommendations = generateRecommendations();
    
    // Prepare data for a week-at-a-glance visualization
    const sleepAtGlance = dailySleepData.map(day => {
      return {
        date: day.date,
        duration: day.durationMinutes ? day.durationMinutes / 60 : null, // Hours
        bedTime: day.bedTime,
        wakeTime: day.wakeTime,
        quality: day.quality,
        hasSleepData: day.hasSleepData,
        sleepDebt: day.sleepDebt ? day.sleepDebt / 60 : null // Hours
      };
    });
    
    const result = {
      weekStart: days[0],
      weekEnd: days[days.length - 1],
      dailyData: dailySleepData,
      weekAtGlance: sleepAtGlance,
      metrics: weeklySleepMetrics
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching weekly sleep data:', err);
    res.status(500).json({ error: 'Error fetching weekly sleep data: ' + err.message });
  }
});

app.get('/api/weekly/weight', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100, // adjust if needed
    });

    // Get weekly stats for weight and health conditions
    const weeklyWeight = await getWeeklyStats(response, 'Weight');
    const weeklyBloated = await getWeeklyStatsBool(response, 'Bloated');
    const weeklyPoop = await getWeeklyStatsBool(response, 'Poop');
    const weeklyWatery = await getWeeklyStatsBool(response, 'Watery');
    const weeklyBadSleep = await getWeeklyStatsBool(response, 'Bad Sleep');
    
    // Get array of days for the week
    const days = weeklyWeight.map(item => item.day);
    
    // Format days with processed weight data
    const dailyWeightData = days.map((day, index) => {
      return {
        date: day,
        weight: weeklyWeight[index].value || null,
        conditions: {
          bloated: weeklyBloated[index].value || false,
          poop: weeklyPoop[index].value || false,
          watery: weeklyWatery[index].value || false,
          badSleep: weeklyBadSleep[index].value || false
        },
        // Flag to easily check if weight was recorded on this day
        hasWeightData: weeklyWeight[index].value > 0
      };
    });
    
    // Calculate weight analytics and trends
    const weightAnalytics = {
      // Weight days recorded
      daysRecorded: dailyWeightData.filter(day => day.hasWeightData).length,
      
      // Calculate average weight for the week (only from days with data)
      averageWeight: (() => {
        const weightsRecorded = dailyWeightData.filter(day => day.hasWeightData);
        if (weightsRecorded.length === 0) return null;
        
        const sum = weightsRecorded.reduce((total, day) => total + day.weight, 0);
        return parseFloat((sum / weightsRecorded.length).toFixed(1));
      })(),
      
      // Calculate min and max weight for the week
      lowestWeight: (() => {
        const weights = dailyWeightData
          .filter(day => day.hasWeightData)
          .map(day => day.weight);
        return weights.length > 0 ? Math.min(...weights) : null;
      })(),
      
      highestWeight: (() => {
        const weights = dailyWeightData
          .filter(day => day.hasWeightData)
          .map(day => day.weight);
        return weights.length > 0 ? Math.max(...weights) : null;
      })(),
      
      // Calculate weight change over the week (first recorded to last recorded)
      weeklyChange: (() => {
        const weightsRecorded = dailyWeightData.filter(day => day.hasWeightData);
        if (weightsRecorded.length < 2) return null;
        
        const firstWeight = weightsRecorded[0].weight;
        const lastWeight = weightsRecorded[weightsRecorded.length - 1].weight;
        const change = parseFloat((lastWeight - firstWeight).toFixed(1));
        
        return {
          value: change,
          direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change',
          percentage: parseFloat(((change / firstWeight) * 100).toFixed(1))
        };
      })(),
      
      // Calculate day-to-day changes
      dailyChanges: (() => {
        const changes = [];
        const weightsRecorded = dailyWeightData.filter(day => day.hasWeightData);
        
        for (let i = 1; i < weightsRecorded.length; i++) {
          const prevWeight = weightsRecorded[i-1].weight;
          const currentWeight = weightsRecorded[i].weight;
          const change = parseFloat((currentWeight - prevWeight).toFixed(1));
          
          changes.push({
            fromDate: weightsRecorded[i-1].date,
            toDate: weightsRecorded[i].date,
            change: change,
            direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change'
          });
        }
        
        return changes;
      })(),
      
      // Calculate moving average (if enough data points)
      movingAverage: (() => {
        const weightsRecorded = dailyWeightData.filter(day => day.hasWeightData);
        if (weightsRecorded.length < 3) return null;
        
        const movingAverages = [];
        for (let i = 2; i < weightsRecorded.length; i++) {
          const threePointAvg = (
            weightsRecorded[i].weight + 
            weightsRecorded[i-1].weight + 
            weightsRecorded[i-2].weight
          ) / 3;
          
          movingAverages.push({
            date: weightsRecorded[i].date,
            value: parseFloat(threePointAvg.toFixed(1))
          });
        }
        
        return movingAverages;
      })(),
      
      // Calculate correlations with health conditions
      healthCorrelations: {
        bloatedDays: dailyWeightData.filter(day => day.conditions.bloated).length,
        poopDays: dailyWeightData.filter(day => day.conditions.poop).length,
        wateryDays: dailyWeightData.filter(day => day.conditions.watery).length,
        badSleepDays: dailyWeightData.filter(day => day.conditions.badSleep).length,
        
        // Average weight on days with each condition vs days without
        bloatedWeight: (() => {
          const bloatedDays = dailyWeightData.filter(day => day.hasWeightData && day.conditions.bloated);
          const nonBloatedDays = dailyWeightData.filter(day => day.hasWeightData && !day.conditions.bloated);
          
          if (bloatedDays.length === 0 || nonBloatedDays.length === 0) return null;
          
          const avgBloated = bloatedDays.reduce((sum, day) => sum + day.weight, 0) / bloatedDays.length;
          const avgNonBloated = nonBloatedDays.reduce((sum, day) => sum + day.weight, 0) / nonBloatedDays.length;
          
          return {
            withCondition: parseFloat(avgBloated.toFixed(1)),
            withoutCondition: parseFloat(avgNonBloated.toFixed(1)),
            difference: parseFloat((avgBloated - avgNonBloated).toFixed(1))
          };
        })(),
        
        poopWeight: (() => {
          const poopDays = dailyWeightData.filter(day => day.hasWeightData && day.conditions.poop);
          const nonPoopDays = dailyWeightData.filter(day => day.hasWeightData && !day.conditions.poop);
          
          if (poopDays.length === 0 || nonPoopDays.length === 0) return null;
          
          const avgPoop = poopDays.reduce((sum, day) => sum + day.weight, 0) / poopDays.length;
          const avgNonPoop = nonPoopDays.reduce((sum, day) => sum + day.weight, 0) / nonPoopDays.length;
          
          return {
            withCondition: parseFloat(avgPoop.toFixed(1)),
            withoutCondition: parseFloat(avgNonPoop.toFixed(1)),
            difference: parseFloat((avgPoop - avgNonPoop).toFixed(1))
          };
        })()
      }
    };
    
    // Generate insights based on the data
    const generateInsights = () => {
      const insights = [];
      
      // Only generate insights if we have enough data
      if (weightAnalytics.daysRecorded < 3) {
        insights.push("Track your weight more consistently to receive detailed insights.");
        return insights;
      }
      
      // Weight change insights
      if (weightAnalytics.weeklyChange) {
        const change = weightAnalytics.weeklyChange;
        if (Math.abs(change.percentage) > 2) {
          insights.push(`You had a significant ${change.direction} of ${Math.abs(change.value)} kg (${Math.abs(change.percentage)}%) this week.`);
        } else if (Math.abs(change.percentage) > 0.5) {
          insights.push(`You had a moderate ${change.direction} of ${Math.abs(change.value)} kg this week.`);
        } else {
          insights.push("Your weight remained relatively stable this week.");
        }
      }
      
      // Fluctuation insights
      if (weightAnalytics.highestWeight && weightAnalytics.lowestWeight) {
        const range = weightAnalytics.highestWeight - weightAnalytics.lowestWeight;
        if (range > 1.5) {
          insights.push(`You experienced significant fluctuations of ${range.toFixed(1)} kg between your highest and lowest weights.`);
        }
      }
      
      // Health condition correlations
      if (weightAnalytics.healthCorrelations.bloatedWeight && 
          Math.abs(weightAnalytics.healthCorrelations.bloatedWeight.difference) > 0.5) {
        insights.push(`On days you reported bloating, your weight was ${Math.abs(weightAnalytics.healthCorrelations.bloatedWeight.difference).toFixed(1)} kg ${weightAnalytics.healthCorrelations.bloatedWeight.difference > 0 ? 'higher' : 'lower'}.`);
      }
      
      if (weightAnalytics.healthCorrelations.poopWeight && 
          Math.abs(weightAnalytics.healthCorrelations.poopWeight.difference) > 0.5) {
        insights.push(`Weight tends to be ${Math.abs(weightAnalytics.healthCorrelations.poopWeight.difference).toFixed(1)} kg ${weightAnalytics.healthCorrelations.poopWeight.difference > 0 ? 'higher' : 'lower'} on days you reported a bowel movement.`);
      }
      
      // Add a general insight if none generated
      if (insights.length === 0) {
        insights.push("Continue tracking your weight consistently to reveal patterns and trends.");
      }
      
      return insights;
    };
    
    weightAnalytics.insights = generateInsights();
    
    // Prepare data for weight-at-a-glance visualization
    const weightAtGlance = dailyWeightData.map(day => {
      // Calculate day-to-day change if possible
      let dayChange = null;
      const prevDay = dailyWeightData[dailyWeightData.indexOf(day) - 1];
      if (prevDay && prevDay.hasWeightData && day.hasWeightData) {
        dayChange = parseFloat((day.weight - prevDay.weight).toFixed(1));
      }
      
      return {
        date: day.date,
        weight: day.weight,
        dayChange: dayChange,
        conditions: day.conditions,
        hasWeightData: day.hasWeightData
      };
    });
    
    const result = {
      weekStart: days[0],
      weekEnd: days[days.length - 1],
      dailyData: dailyWeightData,
      weightAtGlance,
      analytics: weightAnalytics
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching weekly weight data:', err);
    res.status(500).json({ error: 'Error fetching weekly weight data: ' + err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
