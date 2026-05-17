export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  options?: string[];
  dietary?: string[];
  calories?: number;
};

export const menuData: MenuItem[] = [
  {
    "id": "item_1",
    "name": "Fresh Pinot Noir",
    "description": "A elegant glass of curated pinot noir, with notes of cherry and earth.",
    "price": 14,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 120
  },
  {
    "id": "item_2",
    "name": "Signature Tiramisu",
    "description": "Layers of coffee-soaked ladyfingers and mascarpone cream, dusted with premium cocoa.",
    "price": 12,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 757
  },
  {
    "id": "item_3",
    "name": "Grilled Ribeye",
    "description": "A delightful serving of grilled ribeye, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 22,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Vegan"
    ],
    "calories": 254
  },
  {
    "id": "item_4",
    "name": "Truffle Panna Cotta",
    "description": "A delightful serving of truffle panna cotta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 583
  },
  {
    "id": "item_5",
    "name": "Crispy Mousse",
    "description": "A delightful serving of crispy mousse, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 614
  },
  {
    "id": "item_6",
    "name": "Truffle Tartare",
    "description": "A delightful serving of truffle tartare, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 787
  },
  {
    "id": "item_7",
    "name": "Roasted Gelato",
    "description": "A delightful serving of roasted gelato, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 7,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 290
  },
  {
    "id": "item_8",
    "name": "Velvet Kombucha",
    "description": "A delightful serving of velvet kombucha, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 172
  },
  {
    "id": "item_9",
    "name": "Fresh Calamari",
    "description": "A delightful serving of fresh calamari, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 712
  },
  {
    "id": "item_10",
    "name": "Artisan Iced Tea",
    "description": "A delightful serving of artisan iced tea, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 7,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 10
  },
  {
    "id": "item_11",
    "name": "Grilled Panna Cotta",
    "description": "A delightful serving of grilled panna cotta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 699
  },
  {
    "id": "item_12",
    "name": "Crispy Oysters",
    "description": "A delightful serving of crispy oysters, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 313
  },
  {
    "id": "item_13",
    "name": "Zesty Ravioli",
    "description": "A delightful serving of zesty ravioli, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 33,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegan"
    ],
    "calories": 351
  },
  {
    "id": "item_14",
    "name": "Classic Dumplings",
    "description": "A delightful serving of classic dumplings, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 15,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 549
  },
  {
    "id": "item_15",
    "name": "Truffle Iced Tea",
    "description": "A delightful serving of truffle iced tea, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 4,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 56
  },
  {
    "id": "item_16",
    "name": "Roasted Pinot Noir",
    "description": "A delightful serving of roasted pinot noir, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegan"
    ],
    "calories": 134
  },
  {
    "id": "item_17",
    "name": "Classic Asparagus",
    "description": "A delightful serving of classic asparagus, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 6,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1551228639-65b50033ad11?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 690
  },
  {
    "id": "item_18",
    "name": "Artisan Pasta",
    "description": "A delightful serving of artisan pasta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 17,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian"
    ],
    "calories": 254
  },
  {
    "id": "item_19",
    "name": "Crispy Iced Tea",
    "description": "A delightful serving of crispy iced tea, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 6,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian"
    ],
    "calories": 95
  },
  {
    "id": "item_20",
    "name": "Classic Iced Tea",
    "description": "A delightful serving of classic iced tea, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 115
  },
  {
    "id": "item_21",
    "name": "Spicy Lava Cake",
    "description": "A delightful serving of spicy lava cake, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 6,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1551024506-0bc4a2cb1cbf?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 323
  },
  {
    "id": "item_22",
    "name": "Crispy Cheesecake",
    "description": "A delightful serving of crispy cheesecake, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 543
  },
  {
    "id": "item_23",
    "name": "Signature Lemonade",
    "description": "A delightful serving of signature lemonade, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 4,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 143
  },
  {
    "id": "item_24",
    "name": "Classic Creme Brulee",
    "description": "A delightful serving of classic creme brulee, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 10,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Vegan"
    ],
    "calories": 703
  },
  {
    "id": "item_25",
    "name": "Pan-Seared Mashed Potatoes",
    "description": "A delightful serving of pan-seared mashed potatoes, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 550
  },
  {
    "id": "item_26",
    "name": "Grilled Caviar",
    "description": "A delightful serving of grilled caviar, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 8,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegan"
    ],
    "calories": 645
  },
  {
    "id": "item_27",
    "name": "Signature Gelato",
    "description": "A delightful serving of signature gelato, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 7,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 337
  },
  {
    "id": "item_28",
    "name": "Chilled Side Salad",
    "description": "A delightful serving of chilled side salad, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1551228639-65b50033ad11?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian"
    ],
    "calories": 613
  },
  {
    "id": "item_29",
    "name": "Signature Salmon",
    "description": "A delightful serving of signature salmon, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 20,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 433
  },
  {
    "id": "item_30",
    "name": "Roasted Ravioli",
    "description": "A delightful serving of roasted ravioli, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 18,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 548
  },
  {
    "id": "item_31",
    "name": "Signature Dumplings",
    "description": "A delightful serving of signature dumplings, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 371
  },
  {
    "id": "item_32",
    "name": "Roasted Tart",
    "description": "A delightful serving of roasted tart, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 502
  },
  {
    "id": "item_33",
    "name": "Classic Garlic Bread",
    "description": "A delightful serving of classic garlic bread, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 8,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 215
  },
  {
    "id": "item_34",
    "name": "Artisan Ribeye",
    "description": "A delightful serving of artisan ribeye, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 33,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 353
  },
  {
    "id": "item_35",
    "name": "Glazed Chardonnay",
    "description": "A delightful serving of glazed chardonnay, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 8,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 57
  },
  {
    "id": "item_36",
    "name": "Chilled Dumplings",
    "description": "A delightful serving of chilled dumplings, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 16,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1615486171448-4df27063bd56?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 593
  },
  {
    "id": "item_37",
    "name": "Classic Calamari",
    "description": "A delightful serving of classic calamari, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 8,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 283
  },
  {
    "id": "item_38",
    "name": "Signature Salmon",
    "description": "A delightful serving of signature salmon, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 20,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 459
  },
  {
    "id": "item_39",
    "name": "Rich Garlic Bread",
    "description": "A delightful serving of rich garlic bread, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 795
  },
  {
    "id": "item_40",
    "name": "Zesty Panna Cotta",
    "description": "A delightful serving of zesty panna cotta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "calories": 289
  },
  {
    "id": "item_41",
    "name": "Premium Mushroom Soup",
    "description": "A delightful serving of premium mushroom soup, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 14,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 583
  },
  {
    "id": "item_42",
    "name": "Roasted Calamari",
    "description": "A delightful serving of roasted calamari, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 780
  },
  {
    "id": "item_43",
    "name": "Premium Bruschetta",
    "description": "A delightful serving of premium bruschetta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 14,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1615486171448-4df27063bd56?auto=format&fit=crop&q=80&w=800",
    "calories": 278
  },
  {
    "id": "item_44",
    "name": "Truffle Ravioli",
    "description": "A delightful serving of truffle ravioli, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 19,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 354
  },
  {
    "id": "item_45",
    "name": "Chilled Chicken Supreme",
    "description": "A delightful serving of chilled chicken supreme, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 32,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    "calories": 657
  },
  {
    "id": "item_46",
    "name": "Pan-Seared Tartare",
    "description": "A delightful serving of pan-seared tartare, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 15,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "calories": 341
  },
  {
    "id": "item_47",
    "name": "Aged Mashed Potatoes",
    "description": "A delightful serving of aged mashed potatoes, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 6,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1625938146369-adc8336262b9?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 475
  },
  {
    "id": "item_48",
    "name": "Chilled Craft Beer",
    "description": "A delightful serving of chilled craft beer, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 7,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 43
  },
  {
    "id": "item_49",
    "name": "Pan-Seared Salmon",
    "description": "A delightful serving of pan-seared salmon, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 23,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 283
  },
  {
    "id": "item_50",
    "name": "Aged Scallops",
    "description": "A delightful serving of aged scallops, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 16,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "calories": 313
  },
  {
    "id": "item_51",
    "name": "Artisan Carpaccio",
    "description": "A delightful serving of artisan carpaccio, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 600
  },
  {
    "id": "item_52",
    "name": "Truffle Carpaccio",
    "description": "A delightful serving of truffle carpaccio, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 10,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 595
  },
  {
    "id": "item_53",
    "name": "Wild Mojito",
    "description": "A delightful serving of wild mojito, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 6,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "High Protein"
    ],
    "calories": 162
  },
  {
    "id": "item_54",
    "name": "Aged Mousse",
    "description": "A delightful serving of aged mousse, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 362
  },
  {
    "id": "item_55",
    "name": "Glazed Pasta",
    "description": "A delightful serving of glazed pasta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 15,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 702
  },
  {
    "id": "item_56",
    "name": "Classic Duck Breast",
    "description": "A delightful serving of classic duck breast, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 28,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "calories": 673
  },
  {
    "id": "item_57",
    "name": "Rich Side Salad",
    "description": "A delightful serving of rich side salad, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 6,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 569
  },
  {
    "id": "item_58",
    "name": "Creamy Tart",
    "description": "A delightful serving of creamy tart, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 7,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 697
  },
  {
    "id": "item_59",
    "name": "Creamy Espresso Martini",
    "description": "A delightful serving of creamy espresso martini, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "calories": 167
  },
  {
    "id": "item_60",
    "name": "Spicy Prawns",
    "description": "A delightful serving of spicy prawns, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 14,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegan"
    ],
    "calories": 481
  },
  {
    "id": "item_61",
    "name": "Fresh Tartare",
    "description": "A delightful serving of fresh tartare, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 11,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 509
  },
  {
    "id": "item_62",
    "name": "Premium Panna Cotta",
    "description": "A delightful serving of premium panna cotta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 466
  },
  {
    "id": "item_63",
    "name": "Pan-Seared Chardonnay",
    "description": "A delightful serving of pan-seared chardonnay, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 5,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegan"
    ],
    "calories": 190
  },
  {
    "id": "item_64",
    "name": "Spicy Cheesecake",
    "description": "A delightful serving of spicy cheesecake, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 8,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "calories": 422
  },
  {
    "id": "item_65",
    "name": "Premium Calamari",
    "description": "A delightful serving of premium calamari, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 343
  },
  {
    "id": "item_66",
    "name": "Spicy Calamari",
    "description": "A delightful serving of spicy calamari, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 14,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Add Bacon",
      "Extra Cheese",
      "No Onions"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 258
  },
  {
    "id": "item_67",
    "name": "Classic Matcha Spritz",
    "description": "A delightful serving of classic matcha spritz, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 94
  },
  {
    "id": "item_68",
    "name": "Pan-Seared Calamari",
    "description": "A delightful serving of pan-seared calamari, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-Free Option",
      "Extra Sauce"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 496
  },
  {
    "id": "item_69",
    "name": "Aged Tartare",
    "description": "A delightful serving of aged tartare, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 12,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 218
  },
  {
    "id": "item_70",
    "name": "Grilled Caesar Salad",
    "description": "A delightful serving of grilled caesar salad, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 8,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "calories": 502
  },
  {
    "id": "item_71",
    "name": "Grilled Pork Belly",
    "description": "A delightful serving of grilled pork belly, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 35,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Gluten-Free"
    ],
    "calories": 644
  },
  {
    "id": "item_72",
    "name": "Rich Panna Cotta",
    "description": "A delightful serving of rich panna cotta, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 10,
    "category": "Desserts",
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 528
  },
  {
    "id": "item_73",
    "name": "Signature Truffle Fries",
    "description": "A delightful serving of signature truffle fries, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Sides",
    "imageUrl": "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Served Chilled",
      "Room Temperature"
    ],
    "dietary": [
      "Vegan",
      "Gluten-Free"
    ],
    "calories": 204
  },
  {
    "id": "item_74",
    "name": "Chilled Pinot Noir",
    "description": "A delightful serving of chilled pinot noir, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 9,
    "category": "Drinks",
    "imageUrl": "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Dairy-Free"
    ],
    "calories": 185
  },
  {
    "id": "item_75",
    "name": "Artisan Pork Belly",
    "description": "A delightful serving of artisan pork belly, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 26,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan Cheese"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 358
  },
  {
    "id": "item_76",
    "name": "Wild Caesar Salad",
    "description": "A delightful serving of wild caesar salad, prepared with our chef's special recipe to bring out the finest flavors.",
    "price": 14,
    "category": "Starters",
    "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Extra Shot",
      "Almond Milk",
      "Oat Milk"
    ],
    "dietary": [
      "Vegetarian",
      "Gluten-Free"
    ],
    "calories": 543
  },
  {
    "id": "wagyu_burger",
    "name": "Truffle Wagyu Burger",
    "description": "Grade A5 Wagyu beef, black truffle aioli, aged gruyère, arugula, brioche bun.",
    "price": 20,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Gluten-free bun",
      "Extra truffle",
      "No arugula"
    ],
    "dietary": [
      "High Protein"
    ],
    "calories": 850
  },
  {
    "id": "wild_mushroom_risotto",
    "name": "Wild Mushroom Risotto",
    "description": "Arborio rice, seasonal foraged mushrooms, parmigiano-reggiano, white truffle oil.",
    "price": 17,
    "category": "Mains",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
    "options": [
      "Vegan cheese"
    ],
    "dietary": [
      "Vegetarian"
    ],
    "calories": 600
  }
];
