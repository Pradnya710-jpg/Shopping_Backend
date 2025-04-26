const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("./Models/schema");
mongoose
  .connect("mongodb://127.0.0.1:27017/ordering")
  .then(() => {
    console.log("MongoDB connected");
    importData();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

const normalizeKeys = (item) => ({
  handle: item["Handle"],
  title: item["Title"],
  body: item["Body"],
  vendor: item["Vendor"],
  type: item["Type"],
  tags: item["Tags"],
  option1Name: item["Option1 Name"],
  option1Value: item["Option1 Value"],
  option2Name: item["Option2 Name"],
  option2Value: item["Option2 Value"],
  option3Name: item["Option3 Name"],
  option3Value: item["Option3 Value"],
  variantSKU: item["Variant SKU"],
  variantGrams: item["Variant Grams"],
  variantInventoryTracker: item["Variant Inventory Tracker"],
  variantInventoryQty: item["Variant Inventory Qty"],
  variantInventoryPolicy: item["Variant Inventory Policy"],
  variantPrice: item["Variant Price"],
  variantCompareAtPrice: item["Variant Compare At Price"],
  imageSrc: item["Image Src"],
});

async function importData() {
  try {
    const rawData = fs.readFileSync("./data.json");
    const products = JSON.parse(rawData);

    const normalizedProducts = products.map(normalizeKeys);
    const validProducts = normalizedProducts.filter((p) => p.variantSKU);

    await Product.insertMany(validProducts);
    console.log("Data imported successfully!");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
}
