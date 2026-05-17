import fs from "fs";
const path = "./src/data/menu.ts";
let code = fs.readFileSync(path, 'utf8');

const updatedCode = code.replace(/"price": (\d+),/g, (match, priceStr) => {
    let price = parseInt(priceStr, 10);
    // Lower price by ~40%
    let newPrice = Math.max(4, Math.ceil(price * 0.6));
    return `"price": ${newPrice},`;
});

fs.writeFileSync(path, updatedCode);
console.log('Prices updated successfully!');
