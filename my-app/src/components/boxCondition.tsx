export const getBox = (title) => {

    // [ MEATS]
    if (title == "🍳 Egg") {
        return {
            options: [{title: "2 Eggs", multiplier: 2}, {title: "3 Eggs", multiplier: 3}, {title: "4 Eggs", multiplier: 4}],
            isPiece: true
        }
    } else if (title == "🥩 Lean Steak") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🐠 Salmon") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🐔 Chicken Breast") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🐟 Tuna") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🥩 Fatty Steak") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }

    // [ FRUITS ]
    } else if (title == "🫐 Blueberries") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🍓 Rasberries") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🍓 Strawberries") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🍏 Apple") {
        return {
            options: [{title: "1 Apples", multiplier: 1}, {title: "2 Apples", multiplier: 2}, {title: "3 Apples", multiplier: 3}],
            isPiece: true
        }
    } else if (title == "🍌 Banana") {
        return {
            options: [{title: "1 Bananas", multiplier: 1}, {title: "2 Bananas", multiplier: 2}, {title: "3 Bananas", multiplier: 3}],
            isPiece: true
        }
    } else if (title == "🍐 Pear") {
        return {
            options: [{title: "1 Pear", multiplier: 1}, {title: "2 Pear", multiplier: 2}, {title: "3 Pear", multiplier: 1.3}],
            isPiece: true
        }
    } else if (title == "🥑 Avocado") {
        return {
            options: [{title: "1/4", multiplier: 0.25}, {title: "Half", multiplier: 0.5}, {title: "Full", multiplier: 1}],
            isPiece: true
        }
    // [ VEGGIES ]
    } else if (title == "🥦 Broccoli") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🥬 Green Leaf") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🥬 Spinach") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "❤️ Beetroot") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🍅 Cherry Tomatoes") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🍅 Tomatoes") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🥒 Cucumber") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🧅 Onions") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }
    } else if (title == "🥒 Pickle") {
        return {
            options: [{title: "Small", multiplier: 0.7}, {title: "Medium", multiplier: 1}, {title: "Large", multiplier: 1.3}],
            isPiece: false
        }

    // [ DAIRY ]    
    } else if (title == "🥛 Alpro - [No Sugar & High Protein]") {
        return {
            options: [{title: "1/5 Cup", multiplier: 1}, {title: "2/5 Cup", multiplier: 2}, {title: "5/5 Cup", multiplier: 5}],
            isPiece: false
        }
    } else if (title == "🥛 HiPRO Straccateilla - [High Protein]") {
        return {
            options: [{title: "1/5 Cup", multiplier: 1}, {title: "2/5 Cup", multiplier: 2}, {title: "5/5 Cup", multiplier: 5}],
            isPiece: false
        }

    // [TREAT]
    } else if (title == "🍫 Jumbo Dark - [92%]"){
        return {
            options: [{title: "1 Block", multiplier: 0.1}, {title: "2 Block", multiplier: 0.2}, {title: "Whole", multiplier: 1}],
            isPiece: false
        }
    
    // [ CARBS ]
    } else if (title == "🥫 Kidney Beans"){
        return {
            options: [{title: "1/3 Can", multiplier: 0.85}, {title: "Half Can", multiplier: 1.275}, {title: "Full Can", multiplier: 2.55}],
            isPiece: false
        }
    } else if (title == "🥔 Jumbo Fries"){

        return {
            options: [{title: "Small", multiplier: 2.5}, {title: "Half", multiplier: 5}, {title: "Full", multiplier: 10}],
            isPiece: false
        }
    } else if (title == "🍚 Black Rice [NOT COOKED]"){
        return {
            options: [{title: "One Portion", multiplier: 0.8}, {title: "Half", multiplier: 2}, {title: "Whole", multiplier: 4}],
            isPiece: false
        }
    } else if (title == "🍚 Black Rice [COOKED]"){
        return {
            options: [{title: "One Portion", multiplier: 2.4}, {title: "Half", multiplier: 6}, {title: "Whole", multiplier: 12}],
            isPiece: false
        }
    // [WORKFOOD]
    } else if (title == "🥟 [SPAR] - Hotdog Bakery" ){
        return {
            options: [{title: "Half", multiplier: 0.5}, {title: "1", multiplier: 1}, {title: "2", multiplier: 2}],
            isPiece: true
        }
    } else if (title == "🥪 [SPAR] - Egg,Ham & Cheese Sandwich"){
        return {
            options: [{title: "Half", multiplier: 1.3}, {title: "Full", multiplier: 2.3}],
            isPiece: false
        }
    } else if (title == "🥪 [SPAR] - Chicken & Fried Onnion Sandwich"){
        return {
            options: [{title: "Half", multiplier: 1.3}, {title: "Full", multiplier: 2.3}],
            isPiece: false
        }
    } else if (title == "🌯 [SPAR] - Chicken Wrap"){
        return {
            options: [{title: "Half", multiplier: 1.3}, {title: "Full", multiplier: 2.3}],
            isPiece: false
        }
    } else if (title == "🥟 [SPAR] - Cheese Roll") {
        return {
            options: [{title: "Half", multiplier: 0.5}, {title: "1", multiplier: 1}, {title: "2", multiplier: 2}],
            isPiece: true
        }
    }
}

export const getSaladBox = (title) => {

    const withoutDtressingData = {
        "Falafel":{
            calories: 370,
            protein: 14,
            fats: 15,
            carbs: 38,
        },
        "Cesar":{ 
            calories: 280,
            protein: 25,
            fats: 8,
            carbs: 12
        },
        "Tuna":{ 
            calories: 240,
            protein: 22,
            fats: 10,
            carbs: 8
        },
        "Salmon":{
            calories: 250,
            protein: 23,
            fats: 8,
            carbs: 12
        },
    }

    const littleDressingData = {
        "Falafel":{
            calories: 400,
            protein: 14,
            fats: 20,
            carbs: 40,
        },
        "Cesar":{ 
            calories: 300,
            protein: 25,
            fats: 15,
            carbs: 12
        },
        "Tuna":{ 
            calories: 270,
            protein: 22,
            fats: 15,
            carbs: 8
        },
        "Salmon":{
            calories: 290,
            protein: 23,
            fats: 15,
            carbs: 12
        },
    }

    const withDressingData = {
        "Falafel":{
            calories: 440,
            protein: 14,
            fats: 23,
            carbs: 43,
        },
        "Cesar":{ 
            calories: 350,
            protein: 25,
            fats: 20,
            carbs: 8
        },
        "Tuna":{ 
            calories: 340,
            protein: 22,
            fats: 18,
            carbs: 10
        },
        "Salmon":{
            calories: 340,
            protein: 23,
            fats: 20,
            carbs: 8
        },
    }

    if(title == "🥗 [SPAR] - Falafel Salad") {
        return {
            options: [{title: "No Dressing", multiplier: withoutDtressingData["Falafel"]}, {title: "Little Dressing", multiplier: littleDressingData["Falafel"]}, {title: "All Dressing", multiplier: withDressingData["Falafel"]}],
            isPiece: false
        }
    } else if(title == "🥗 [SPAR] - Cesar Salad") {
        return {
            options: [{title: "No Dressing", multiplier: withoutDtressingData["Cesar"]}, {title: "Little Dressing", multiplier: littleDressingData["Cesar"]}, {title: "All Dressing", multiplier: withDressingData["Cesar"]}],
            isPiece: false
        }
    } else if(title == "🥗 [SPAR] - Tuna Salad") {
        return {
            options: [{title: "No Dressing", multiplier: withoutDtressingData["Tuna"]}, {title: "Little Dressing", multiplier: littleDressingData["Tuna"]}, {title: "All Dressing", multiplier: withDressingData["Tuna"]}],
            isPiece: false
        }
    } else if(title == "🥗 [SPAR] - Salmon Salad") {
        return {
            options: [{title: "No Dressing", multiplier: withoutDtressingData["Salmon"]}, {title: "Little Dressing", multiplier: littleDressingData["Salmon"]}, {title: "All Dressing", multiplier: withDressingData["Salmon"]}],
            isPiece: false
        }
    } 
}

