const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Item = require("./Models/schema");
const Cart = require("./Models/cart");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ordering";

console.log("MONGODB_URI", MONGODB_URI);
const serverless = require("serverless-http");

app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://website-shopping-seven.vercel.app", // ✅ Correct Frontend URL
  })
);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Fetch all products
app.get("/products", async (req, res) => {
  try {
    const allItems = await Item.find();
    res.json(allItems);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/products", async (req, res) => {
  try {
    console.log("req", req.body);

    let productDetails = {
      title: req.body.title,
      variantPrice: req.body.variantPrice,
      quantity: 1,
      imageSrc: req.body.imageSrc,
    };

    let newProduct = new Item(productDetails);
    console.log("newProduct", newProduct);

    await newProduct.save();
    // res.json(newProduct);
    res.status(200).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all cart items
app.get("/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items" });
  }
});

// Add product to cart
app.post("/cart", async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Item.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newCartItem = new Cart({
      products: {
        productId: product._id,
        title: product.title,
        variantPrice: product.variantPrice,
        quantity: 1,
        imageSrc: product.imageSrc,
      },
    });

    await newCartItem.save();
    res.status(200).json(newCartItem);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

// Remove item from cart
app.delete("/cart/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    const deleted = await Cart.findByIdAndDelete(cartId);

    if (!deleted) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart", product: deleted });
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Item.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Search products
app.get("/search", async (req, res) => {
  try {
    const { title, sku } = req.query;
    let query = {};

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (sku) {
      query.variantSKU = { $regex: sku, $options: "i" };
    }

    const results = await Item.find(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error during search" });
  }
});

// Delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Item.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});

module.exports = serverless(app);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally at http://localhost:${PORT}`);
  });
}
