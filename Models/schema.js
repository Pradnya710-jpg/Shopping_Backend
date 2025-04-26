const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  handle: String,
  title: String,
  body: String,
  vendor: String,
  type: String,
  tags: String,
  option1Name: String,
  option1Value: String,
  option2Name: String,
  option2Value: String,
  option3Name: String,
  option3Value: String,
  variantSKU: String,
  variantGrams: Number,
  variantInventoryTracker: String,
  variantInventoryQty: Number,
  variantInventoryPolicy: String,
  variantFulfillmentService: String,
  variantPrice: Number,
  variantCompareAtPrice: String,
  imageSrc: String,
});

module.exports = mongoose.model("Product", productSchema);
