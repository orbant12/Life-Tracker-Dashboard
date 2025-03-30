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

app.post('/api/nutrition', async (req, res) => {
  try {
    const { protein, carbs, fats, calories } = req.body;
    
    // Validate input
    if (protein === undefined || carbs === undefined || fats === undefined || calories === undefined) {
      return res.status(400).json({ error: 'Missing required nutrition data. Please provide protein, carbs, fats, and calories.' });
    }
    
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
          // You may need to include other required properties for your database
          // For example, if 'Week' is a required property, you'd need to determine the current week
        }
      });
      
      res.json({ 
        success: true, 
        message: 'New nutrition entry created for today',
        date: todayFormatted,
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
