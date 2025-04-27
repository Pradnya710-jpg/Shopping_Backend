// Cart Model (cart.model.js)
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  products: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      title: String,
      variantPrice: Number,
      quantity: Number,
      imageSrc: String,
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
