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
          'Foods': { relation: existingFoods }
        }
      });
    } else {
      // Create new entry
      const availableWeeks = await getAllWeeks();
      const weekRange = getWeekRangeForDate(today, availableWeeks);
      
      const weekProperty = weekRange ? {
        'Week': { multi_select: [{ name: weekRange }] }
      } : { 'Week': { multi_select: [] } };
      
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Day': {
            title: [{ text: { content: todayFormatted } }]
          },
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
    }
    
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
      }
    });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
