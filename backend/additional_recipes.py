"""
Additional Italian and French recipes for seed data.
Add these to the recipes list in seed_data.py
"""

ITALIAN_FRENCH_RECIPES = [
    # Italian Pasta Dishes
    {
        "name": "Penne all'Arrabbiata",
        "description": "Spicy Italian pasta with tomato sauce and chili peppers",
        "categories": ["Italian", "Pasta", "Spicy"],
        "ingredients": [
            {"name": "Penne pasta", "amount": 400, "unit": "g", "order_index": 0},
            {"name": "Tomatoes", "amount": 800, "unit": "g", "order_index": 1},
            {"name": "Garlic", "amount": 4, "unit": "cloves", "order_index": 2},
            {"name": "Red chili peppers", "amount": 2, "unit": "pieces", "order_index": 3},
            {"name": "Olive oil", "amount": 4, "unit": "tbsp", "order_index": 4},
            {"name": "Parsley", "amount": 1, "unit": "bunch", "order_index": 5}
        ],
        "steps": [
            {"step_number": 1, "content": "Cook penne in salted boiling water until al dente."},
            {"step_number": 2, "content": "Sauté garlic and chopped chili in olive oil."},
            {"step_number": 3, "content": "Add crushed tomatoes and simmer for 15 minutes."},
            {"step_number": 4, "content": "Toss pasta with sauce and garnish with parsley."}
        ]
    },
    {
        "name": "Tagliatelle al Ragù Bolognese",
        "description": "Classic meat sauce from Bologna with fresh pasta",
        "categories": ["Italian", "Pasta", "Meat"],
        "ingredients": [
            {"name": "Tagliatelle", "amount": 400, "unit": "g", "order_index": 0},
            {"name": "Ground beef", "amount": 300, "unit": "g", "order_index": 1},
            {"name": "Ground pork", "amount": 200, "unit": "g", "order_index": 2},
            {"name": "Tomato paste", "amount": 3, "unit": "tbsp", "order_index": 3},
            {"name": "Red wine", "amount": 200, "unit": "ml", "order_index": 4},
            {"name": "Milk", "amount": 100, "unit": "ml", "order_index": 5},
            {"name": "Onion", "amount": 1, "unit": "piece", "order_index": 6},
            {"name": "Carrot", "amount": 1, "unit": "piece", "order_index": 7},
            {"name": "Celery", "amount": 1, "unit": "stalk", "order_index": 8}
        ],
        "steps": [
            {"step_number": 1, "content": "Finely chop onion, carrot, and celery (soffritto)."},
            {"step_number": 2, "content": "Brown the vegetables in olive oil, add meat and brown."},
            {"step_number": 3, "content": "Add wine and let evaporate, then add tomato paste."},
            {"step_number": 4, "content": "Simmer for 2-3 hours, adding milk gradually."},
            {"step_number": 5, "content": "Cook tagliatelle and serve with ragù and Parmesan."}
        ]
    },
    {
        "name": "Linguine alle Vongole",
        "description": "Linguine with fresh clams in white wine sauce",
        "categories": ["Italian", "Pasta", "Seafood"],
        "ingredients": [
            {"name": "Linguine", "amount": 400, "unit": "g", "order_index": 0},
            {"name": "Fresh clams", "amount": 1000, "unit": "g", "order_index": 1},
            {"name": "White wine", "amount": 150, "unit": "ml", "order_index": 2},
            {"name": "Garlic", "amount": 3, "unit": "cloves", "order_index": 3},
            {"name": "Parsley", "amount": 1, "unit": "bunch", "order_index": 4},
            {"name": "Olive oil", "amount": 4, "unit": "tbsp", "order_index": 5},
            {"name": "Chili flakes", "amount": 1, "unit": "tsp", "order_index": 6}
        ],
        "steps": [
            {"step_number": 1, "content": "Soak clams in salted water for 30 minutes."},
            {"step_number": 2, "content": "Sauté garlic and chili in olive oil."},
            {"step_number": 3, "content": "Add clams and wine, cover until clams open."},
            {"step_number": 4, "content": "Cook linguine, toss with clam sauce and parsley."}
        ]
    },
    
    # Italian Meat Dishes
    {
        "name": "Osso Buco alla Milanese",
        "description": "Braised veal shanks in white wine and vegetables",
        "categories": ["Italian", "Meat", "Main Course"],
        "ingredients": [
            {"name": "Veal shanks", "amount": 4, "unit": "pieces", "order_index": 0},
            {"name": "White wine", "amount": 300, "unit": "ml", "order_index": 1},
            {"name": "Beef broth", "amount": 500, "unit": "ml", "order_index": 2},
            {"name": "Tomatoes", "amount": 400, "unit": "g", "order_index": 3},
            {"name": "Onion", "amount": 1, "unit": "piece", "order_index": 4},
            {"name": "Carrot", "amount": 2, "unit": "pieces", "order_index": 5},
            {"name": "Celery", "amount": 2, "unit": "stalks", "order_index": 6},
            {"name": "Flour", "amount": 50, "unit": "g", "order_index": 7}
        ],
        "steps": [
            {"step_number": 1, "content": "Dust veal shanks with flour and brown in oil."},
            {"step_number": 2, "content": "Remove meat, sauté vegetables until soft."},
            {"step_number": 3, "content": "Return meat, add wine, tomatoes, and broth."},
            {"step_number": 4, "content": "Braise covered for 2 hours until tender."},
            {"step_number": 5, "content": "Serve with gremolata and risotto alla milanese."}
        ]
    },
    {
        "name": "Saltimbocca alla Romana",
        "description": "Veal cutlets with prosciutto and sage",
        "categories": ["Italian", "Meat", "Quick"],
        "ingredients": [
            {"name": "Veal cutlets", "amount": 8, "unit": "pieces", "order_index": 0},
            {"name": "Prosciutto", "amount": 8, "unit": "slices", "order_index": 1},
            {"name": "Fresh sage", "amount": 16, "unit": "leaves", "order_index": 2},
            {"name": "White wine", "amount": 100, "unit": "ml", "order_index": 3},
            {"name": "Butter", "amount": 50, "unit": "g", "order_index": 4},
            {"name": "Flour", "amount": 30, "unit": "g", "order_index": 5}
        ],
        "steps": [
            {"step_number": 1, "content": "Place prosciutto and sage on veal, secure with toothpick."},
            {"step_number": 2, "content": "Dust lightly with flour."},
            {"step_number": 3, "content": "Fry in butter, prosciutto side down first."},
            {"step_number": 4, "content": "Deglaze pan with white wine and reduce."},
            {"step_number": 5, "content": "Serve immediately with pan sauce."}
        ]
    },
    
    # Italian Fish Dishes
    {
        "name": "Branzino al Forno",
        "description": "Oven-baked sea bass with herbs and lemon",
        "categories": ["Italian", "Fish", "Healthy"],
        "ingredients": [
            {"name": "Sea bass", "amount": 2, "unit": "whole fish", "order_index": 0},
            {"name": "Lemon", "amount": 2, "unit": "pieces", "order_index": 1},
            {"name": "Fresh rosemary", "amount": 4, "unit": "sprigs", "order_index": 2},
            {"name": "Fresh thyme", "amount": 4, "unit": "sprigs", "order_index": 3},
            {"name": "Garlic", "amount": 4, "unit": "cloves", "order_index": 4},
            {"name": "Olive oil", "amount": 4, "unit": "tbsp", "order_index": 5},
            {"name": "White wine", "amount": 100, "unit": "ml", "order_index": 6}
        ],
        "steps": [
            {"step_number": 1, "content": "Clean fish and make diagonal cuts on both sides."},
            {"step_number": 2, "content": "Stuff cavity with lemon slices, herbs, and garlic."},
            {"step_number": 3, "content": "Drizzle with olive oil and wine."},
            {"step_number": 4, "content": "Bake at 200°C for 25-30 minutes."},
            {"step_number": 5, "content": "Serve with roasted vegetables."}
        ]
    },
    
    # French Pasta/Noodle Dishes
    {
        "name": "Coquilles Saint-Jacques",
        "description": "Scallops in creamy white wine sauce",
        "categories": ["French", "Seafood", "Elegant"],
        "ingredients": [
            {"name": "Scallops", "amount": 12, "unit": "pieces", "order_index": 0},
            {"name": "White wine", "amount": 150, "unit": "ml", "order_index": 1},
            {"name": "Heavy cream", "amount": 200, "unit": "ml", "order_index": 2},
            {"name": "Butter", "amount": 50, "unit": "g", "order_index": 3},
            {"name": "Shallots", "amount": 2, "unit": "pieces", "order_index": 4},
            {"name": "Mushrooms", "amount": 200, "unit": "g", "order_index": 5},
            {"name": "Gruyère cheese", "amount": 50, "unit": "g", "order_index": 6}
        ],
        "steps": [
            {"step_number": 1, "content": "Sauté shallots and mushrooms in butter."},
            {"step_number": 2, "content": "Add scallops and sear briefly."},
            {"step_number": 3, "content": "Deglaze with wine, add cream and simmer."},
            {"step_number": 4, "content": "Transfer to shells, top with cheese."},
            {"step_number": 5, "content": "Broil until golden brown."}
        ]
    },
    
    # French Meat Dishes
    {
        "name": "Coq au Vin",
        "description": "Chicken braised in red wine with mushrooms and bacon",
        "categories": ["French", "Meat", "Classic"],
        "ingredients": [
            {"name": "Chicken", "amount": 1500, "unit": "g", "order_index": 0},
            {"name": "Red wine", "amount": 750, "unit": "ml", "order_index": 1},
            {"name": "Bacon", "amount": 150, "unit": "g", "order_index": 2},
            {"name": "Pearl onions", "amount": 200, "unit": "g", "order_index": 3},
            {"name": "Mushrooms", "amount": 250, "unit": "g", "order_index": 4},
            {"name": "Carrots", "amount": 2, "unit": "pieces", "order_index": 5},
            {"name": "Garlic", "amount": 3, "unit": "cloves", "order_index": 6},
            {"name": "Thyme", "amount": 3, "unit": "sprigs", "order_index": 7},
            {"name": "Bay leaf", "amount": 2, "unit": "pieces", "order_index": 8}
        ],
        "steps": [
            {"step_number": 1, "content": "Brown chicken pieces and bacon in butter."},
            {"step_number": 2, "content": "Add vegetables and sauté until golden."},
            {"step_number": 3, "content": "Pour in wine, add herbs, and simmer covered for 1 hour."},
            {"step_number": 4, "content": "Remove chicken, reduce sauce until thickened."},
            {"step_number": 5, "content": "Return chicken to sauce and serve with potatoes."}
        ]
    },
    {
        "name": "Boeuf Bourguignon",
        "description": "Beef stew braised in Burgundy wine",
        "categories": ["French", "Meat", "Stew"],
        "ingredients": [
            {"name": "Beef chuck", "amount": 1000, "unit": "g", "order_index": 0},
            {"name": "Red wine", "amount": 750, "unit": "ml", "order_index": 1},
            {"name": "Bacon", "amount": 150, "unit": "g", "order_index": 2},
            {"name": "Pearl onions", "amount": 250, "unit": "g", "order_index": 3},
            {"name": "Carrots", "amount": 3, "unit": "pieces", "order_index": 4},
            {"name": "Mushrooms", "amount": 300, "unit": "g", "order_index": 5},
            {"name": "Tomato paste", "amount": 2, "unit": "tbsp", "order_index": 6},
            {"name": "Beef stock", "amount": 500, "unit": "ml", "order_index": 7}
        ],
        "steps": [
            {"step_number": 1, "content": "Cut beef into chunks and marinate in wine overnight."},
            {"step_number": 2, "content": "Brown beef and bacon in batches."},
            {"step_number": 3, "content": "Add vegetables, tomato paste, wine, and stock."},
            {"step_number": 4, "content": "Braise in oven at 160°C for 3 hours."},
            {"step_number": 5, "content": "Serve with crusty bread or mashed potatoes."}
        ]
    },
    {
        "name": "Magret de Canard",
        "description": "Pan-seared duck breast with berry sauce",
        "categories": ["French", "Meat", "Elegant"],
        "ingredients": [
            {"name": "Duck breast", "amount": 2, "unit": "pieces", "order_index": 0},
            {"name": "Red wine", "amount": 200, "unit": "ml", "order_index": 1},
            {"name": "Blackberries", "amount": 150, "unit": "g", "order_index": 2},
            {"name": "Honey", "amount": 2, "unit": "tbsp", "order_index": 3},
            {"name": "Butter", "amount": 30, "unit": "g", "order_index": 4},
            {"name": "Thyme", "amount": 2, "unit": "sprigs", "order_index": 5}
        ],
        "steps": [
            {"step_number": 1, "content": "Score duck skin in crosshatch pattern."},
            {"step_number": 2, "content": "Sear skin-side down in cold pan, render fat slowly."},
            {"step_number": 3, "content": "Flip and cook to medium-rare, rest 5 minutes."},
            {"step_number": 4, "content": "Make sauce with wine, berries, and honey."},
            {"step_number": 5, "content": "Slice duck and serve with sauce."}
        ]
    },
    
    # French Fish Dishes
    {
        "name": "Sole Meunière",
        "description": "Dover sole in brown butter with lemon",
        "categories": ["French", "Fish", "Classic"],
        "ingredients": [
            {"name": "Dover sole fillets", "amount": 4, "unit": "pieces", "order_index": 0},
            {"name": "Butter", "amount": 100, "unit": "g", "order_index": 1},
            {"name": "Flour", "amount": 50, "unit": "g", "order_index": 2},
            {"name": "Lemon", "amount": 2, "unit": "pieces", "order_index": 3},
            {"name": "Parsley", "amount": 1, "unit": "bunch", "order_index": 4},
            {"name": "Milk", "amount": 100, "unit": "ml", "order_index": 5}
        ],
        "steps": [
            {"step_number": 1, "content": "Dip sole in milk, then dredge in flour."},
            {"step_number": 2, "content": "Pan-fry in butter until golden, about 3 minutes per side."},
            {"step_number": 3, "content": "Remove fish, add more butter to pan until brown and nutty."},
            {"step_number": 4, "content": "Add lemon juice and parsley to butter."},
            {"step_number": 5, "content": "Pour sauce over fish and serve immediately."}
        ]
    },
    {
        "name": "Bouillabaisse",
        "description": "Traditional Provençal fish stew",
        "categories": ["French", "Fish", "Soup"],
        "ingredients": [
            {"name": "Mixed fish", "amount": 1000, "unit": "g", "order_index": 0},
            {"name": "Mussels", "amount": 500, "unit": "g", "order_index": 1},
            {"name": "Shrimp", "amount": 300, "unit": "g", "order_index": 2},
            {"name": "Tomatoes", "amount": 400, "unit": "g", "order_index": 3},
            {"name": "White wine", "amount": 200, "unit": "ml", "order_index": 4},
            {"name": "Fish stock", "amount": 1000, "unit": "ml", "order_index": 5},
            {"name": "Saffron", "amount": 1, "unit": "pinch", "order_index": 6},
            {"name": "Fennel", "amount": 1, "unit": "bulb", "order_index": 7},
            {"name": "Garlic", "amount": 4, "unit": "cloves", "order_index": 8}
        ],
        "steps": [
            {"step_number": 1, "content": "Sauté fennel, onions, and garlic in olive oil."},
            {"step_number": 2, "content": "Add tomatoes, wine, stock, and saffron."},
            {"step_number": 3, "content": "Simmer for 20 minutes."},
            {"step_number": 4, "content": "Add firm fish first, then delicate fish and shellfish."},
            {"step_number": 5, "content": "Serve with rouille and crusty bread."}
        ]
    },
    
    # More Italian Pasta
    {
        "name": "Pappardelle al Cinghiale",
        "description": "Wide pasta ribbons with wild boar ragù",
        "categories": ["Italian", "Pasta", "Game"],
        "ingredients": [
            {"name": "Pappardelle", "amount": 400, "unit": "g", "order_index": 0},
            {"name": "Wild boar meat", "amount": 600, "unit": "g", "order_index": 1},
            {"name": "Red wine", "amount": 300, "unit": "ml", "order_index": 2},
            {"name": "Tomatoes", "amount": 400, "unit": "g", "order_index": 3},
            {"name": "Juniper berries", "amount": 5, "unit": "pieces", "order_index": 4},
            {"name": "Rosemary", "amount": 2, "unit": "sprigs", "order_index": 5}
        ],
        "steps": [
            {"step_number": 1, "content": "Marinate boar in wine with juniper overnight."},
            {"step_number": 2, "content": "Brown meat, add marinade and tomatoes."},
            {"step_number": 3, "content": "Simmer for 2-3 hours until tender."},
            {"step_number": 4, "content": "Cook pappardelle and toss with ragù."}
        ]
    },
    {
        "name": "Orecchiette con Cime di Rapa",
        "description": "Ear-shaped pasta with turnip greens",
        "categories": ["Italian", "Pasta", "Vegetarian"],
        "ingredients": [
            {"name": "Orecchiette", "amount": 400, "unit": "g", "order_index": 0},
            {"name": "Turnip greens", "amount": 500, "unit": "g", "order_index": 1},
            {"name": "Garlic", "amount": 4, "unit": "cloves", "order_index": 2},
            {"name": "Anchovies", "amount": 4, "unit": "fillets", "order_index": 3},
            {"name": "Chili flakes", "amount": 1, "unit": "tsp", "order_index": 4},
            {"name": "Olive oil", "amount": 5, "unit": "tbsp", "order_index": 5}
        ],
        "steps": [
            {"step_number": 1, "content": "Blanch turnip greens in salted water."},
            {"step_number": 2, "content": "Cook orecchiette in same water."},
            {"step_number": 3, "content": "Sauté garlic, anchovies, and chili in oil."},
            {"step_number": 4, "content": "Add greens and pasta, toss well."}
        ]
    }
]

# Add 40 more recipes following similar patterns...
# This is a starting template - you can expand with more variations

# Made with Bob
