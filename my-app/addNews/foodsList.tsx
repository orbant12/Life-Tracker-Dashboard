export const getFoodData = (data) => {

    const meetsData = [
        {
        amount: '1',
        food: '🍳 Egg',
        calories: 70,
        protein: 6,
        fats: 5,
        carbs: 1
        },
        {
        amount: '100g',
        food: '🥩 Lean Steak',
        calories: 210,
        protein: 30,
        fats: 9,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🐠 Salmon',
        calories: 206,
        protein: 22,
        fats: 12,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🐔 Chicken Breast',
        calories: 165,
        protein: 31,
        fats: 4,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🐟 Tuna',
        calories: 130,
        protein: 29,
        fats: 1,
        carbs: 0
        },
        {
        amount: '100g',
        food: '🥩 Fatty Steak',
        calories: 165,
        protein: 23,
        fats: 8,
        carbs: 0
        }
    ];

    const veggiesData = [
        {
        amount: '100g ',
        food: '🥦 Broccoli',
        calories: 35,
        carbs: 7,
        protein: 2,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥬 Green Leaf',
        calories: 15,
        carbs: 3,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥬 Spinach',
        calories: 23,
        carbs: 4,
        protein: 3,
        fats: 0
        },
        {
        amount: '100g',
        food: '❤️ Beetroot',
        calories: 43,
        carbs: 10,
        protein: 2,
        fats: 0
        },
        {
        amount: '100g',
        food: '🍅 Cherry Tomatoes',
        calories: 18,
        carbs: 4,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🍅 Tomatoes',
        calories: 18,
        carbs: 4,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥒 Cucumber',
        calories: 15,
        carbs: 4,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🧅 Onions',
        calories: 40,
        carbs: 9,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🥒 Pickle',
        calories: 46,
        carbs: 10,
        protein: 0,
        fats: 0
        }
    ];
    
    const fruitsData = [
        {
        amount: '100g',
        food: '🫐 Blueberries',
        calories: 57,
        carbs: 14,
        protein: 1,
        fats: 0
        },
        {
        amount: '100g',
        food: '🍓 Rasberries',
        calories: 52,
        carbs: 12,
        protein: 1,
        fats: 1
        },
        {
        amount: '100g',
        food: '🍓 Strawberries',
        calories: 32,
        carbs: 8,
        protein: 1,
        fats: 0
        },
        {
        amount: '1',
        food: '🍏 Apple',
        calories: 100,
        carbs: 25,
        protein: 1,
        fats: 0
        },
        {
        amount: '1',
        food: '🍌 Banana',
        calories: 100,
        carbs: 27,
        protein: 1,
        fats: 0
        },
        {
        amount: '1',
        food: '🍐 Pear',
        calories: 101,
        carbs: 27,
        protein: 1,
        fats: 0
        },
        {
            amount: '1',
            food: '🥑 Avocado',
            calories: 240,
            carbs: 13,
            protein: 3,
            fats: 22
        }
    ];

    const dairyData = [
        {
            amount: '100g',
            food: '🥛 Alpro - [No Sugar & High Protein]',
            calories: 61,
            carbs: 0,
            protein: 6,
            fats: 3.3
        },
        {
            amount: '100g',
            food: '🥛 HiPRO Straccateilla - [High Protein]',
            calories: 56,
            carbs: 3.6,
            protein: 9.4,
            fats: 0.5
        },
    ]

    const snacksData = [
        {
            amount: '100g',
            food: '🍫 Jumbo Dark - [92%]',
            calories: 635,
            carbs: 13.8,
            protein: 9,
            fats: 57.2
        },
    ]

    const carbsData = [
        {
            amount: '100g',
            food: '🥫 Kidney Beans',
            calories: 106,
            carbs: 15,
            protein: 8,
            fats: 0.5
        },
        {
            amount: '100g',
            food: '🥔 Jumbo Fries',
            calories: 132,
            carbs: 19.4,
            protein: 2.8,
            fats: 4.2
        },
        {
            amount: '100g',
            food: '🍚 Black Rice [NOT COOKED]',
            calories: 305,
            carbs: 62,
            protein: 9,
            fats: 2
        },
        {
            amount: '100g',
            food: '🍚 Black Rice [COOKED]',
            calories: 102,
            carbs: 21,
            protein: 3,
            fats: 0.7
        }
    ]

    const workFood = [
        {// 370, 14, 15, 40
            amount: '1',
            food: '🥗 [SPAR] - Falafel Salad',
            calories: 440,
            protein: 14,
            fats: 23,
            carbs: 43,
        },
        {//280, 25, 8, 12
            amount: '1',
            food: '🥗 [SPAR] - Cesar Salad',
            calories: 350,
            protein: 25,
            fats: 20,
            carbs: 8
        },
        { // 240, 22, 10, 8
            amount: '1',
            food: '🥗 [SPAR] - Tuna Salad',
            calories: 340,
            protein: 22,
            fats: 18,
            carbs: 10
        },
        {// 250, 23, 8, 12
            amount: '1',
            food: '🥗 [SPAR] - Salmon Salad',
            calories: 340,
            protein: 23,
            fats: 20,
            carbs: 8
        },
        {
            amount: '1',
            food: '🥟 [SPAR] - Hotdog Bakery',
            calories: 300,
            protein: 22,
            fats: 20,
            carbs: 8,
        },
        {
            amount: '100g',
            food: '🥪 [SPAR] - Egg,Ham & Cheese Sandwich',
            calories: 250,
            protein: 13,
            fats: 11,
            carbs: 30
        },
        { 
            amount: '100g',
            food: '🥪 [SPAR] - Chicken & Fried Onnion Sandwich',
            calories: 250,
            protein: 15,
            fats: 10,
            carbs: 30
        },
        {
            amount: '100g',
            food: '🌯 [SPAR] - Chicken Wrap',
            calories: 230,
            protein: 14,
            fats: 8,
            carbs: 24
        },
        {
            amount: '1',
            food: '🥟 [SPAR] - Cheese Roll',
            calories: 350,
            protein: 10,
            fats: 13,
            carbs: 44
        }
    ]
            

    if(data == "meetsData"){
        return meetsData;
    } else if(data == "veggiesData"){
        return veggiesData;
    } else if(data == "fruitsData"){
        return fruitsData;
    }
    else if(data == "dairyData"){
        return dairyData;
    }
    else if(data == "snacksData"){
        return snacksData;
    } else if (data == "carbsData"){
        return carbsData;
    } else if (data == "workFood"){
        return workFood;
    }else{
        return [];
    }
}



