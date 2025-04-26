const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  products: {
    productId: mongoose.Schema.Types.ObjectId,
    title: String,
    variantPrice: Number,
    quantity: Number,
    imageSrc: String,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
