import fs from 'fs';

const categories = ["Starters", "Mains", "Sides", "Desserts", "Drinks"];
const dietOptions = [
  [],
  ["Vegetarian"],
  ["Vegan"],
  ["Gluten-Free"],
  ["High Protein"],
  ["Vegetarian", "Gluten-Free"],
  ["Dairy-Free"],
  ["Vegan", "Gluten-Free"],
];

const adjectives = ["Roasted", "Spicy", "Truffle", "Crispy", "Smoked", "Grilled", "Glazed", "Pan-Seared", "Wild", "Artisan", "Aged", "Rich", "Zesty", "Creamy", "Signature", "Classic", "Premium", "Chilled", "Fresh", "Velvet"];
const starersNouns = ["Calamari", "Bruschetta", "Oysters", "Tartare", "Carpaccio", "Dumplings", "Spring Rolls", "Caviar", "Mushroom Soup", "Caesar Salad", "Prawns", "Scallops"];
const mainsNouns = ["Salmon", "Ribeye", "Wagyu Burger", "Risotto", "Pasta", "Rack of Lamb", "Pork Belly", "Chicken Supreme", "Duck Breast", "Black Cod", "Halibut", "Filet Mignon", "Ravioli", "Gnocchi"];
const sidesNouns = ["Truffle Fries", "Asparagus", "Mashed Potatoes", "Roasted Vegetables", "Mac & Cheese", "Side Salad", "Garlic Bread", "Sweet Potato Fries", "Brussels Sprouts", "Polenta"];
const dessertsNouns = ["Cheesecake", "Lava Cake", "Tiramisu", "Panna Cotta", "Tart", "Gelato", "Creme Brulee", "Mousse", "Sorbet", "Profiteroles"];
const drinksNouns = ["Espresso Martini", "Matcha Spritz", "Sparkling Water", "Pinot Noir", "Chardonnay", "Craft Beer", "Mojito", "Lemonade", "Iced Tea", "Kombucha"];

const optionsArrays = [
  ["Add Bacon", "Extra Cheese", "No Onions"],
  ["Gluten-Free Option", "Extra Sauce"],
  ["Vegan Cheese"],
  ["Extra Shot", "Almond Milk", "Oat Milk"],
  ["Served Chilled", "Room Temperature"],
  [],
  [],
  []
];

const images = {
  "Mains": [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
  ],
  "Starters": [
    "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1615486171448-4df27063bd56?auto=format&fit=crop&q=80&w=800"
  ],
  "Sides": [
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551228639-65b50033ad11?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1625938146369-adc8336262b9?auto=format&fit=crop&q=80&w=800"
  ],
  "Desserts": [
    "https://images.unsplash.com/photo-1551024506-0bc4a2cb1cbf?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1658428453472-a42cc07548b2?auto=format&fit=crop&q=80&w=800"
  ],
  "Drinks": [
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&q=80&w=800"
  ]
};

const items = [];
let idCounter = 1;

for (let i = 0; i < 76; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  let nounList = mainsNouns;
  if (category === "Starters") nounList = starersNouns;
  if (category === "Sides") nounList = sidesNouns;
  if (category === "Desserts") nounList = dessertsNouns;
  if (category === "Drinks") nounList = drinksNouns;

  const noun = nounList[Math.floor(Math.random() * nounList.length)];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const name = `${adj} ${noun}`;
  
  const price = category === "Mains" ? Math.floor(Math.random() * 40) + 20 
              : category === "Starters" ? Math.floor(Math.random() * 15) + 12
              : category === "Desserts" ? Math.floor(Math.random() * 10) + 10
              : category === "Drinks" ? Math.floor(Math.random() * 15) + 5
              : Math.floor(Math.random() * 10) + 8;
              
  const dietary = dietOptions[Math.floor(Math.random() * dietOptions.length)];
  const options = optionsArrays[Math.floor(Math.random() * optionsArrays.length)];
  const calories = category === "Drinks" ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 600) + 200;
  
  const imgList = images[category];
  const imageUrl = imgList[Math.floor(Math.random() * imgList.length)];
  
  items.push({
    id: `item_${idCounter++}`,
    name,
    description: `A delightful serving of ${name.toLowerCase()}, prepared with our chef's special recipe to bring out the finest flavors.`,
    price,
    category,
    imageUrl,
    options: options.length > 0 ? options : undefined,
    dietary: dietary.length > 0 ? dietary : undefined,
    calories
  });
}

// Add specifically mentioned items from earlier to ensure featured works
items.push({
    id: "wagyu_burger", 
    name: "Truffle Wagyu Burger", 
    description: "Grade A5 Wagyu beef, black truffle aioli, aged gruyère, arugula, brioche bun.", 
    price: 32.00, 
    category: "Mains", 
    imageUrl: images["Mains"][1],
    options: ["Gluten-free bun", "Extra truffle", "No arugula"],
    dietary: ["High Protein"],
    calories: 850
});

items.push({
    id: "wild_mushroom_risotto", 
    name: "Wild Mushroom Risotto", 
    description: "Arborio rice, seasonal foraged mushrooms, parmigiano-reggiano, white truffle oil.", 
    price: 28.00, 
    category: "Mains", 
    imageUrl: images["Mains"][5],
    options: ["Vegan cheese"],
    dietary: ["Vegetarian"],
    calories: 600
});

const content = `export type MenuItem = {
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

export const menuData: MenuItem[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync('src/data/menu.ts', content);
