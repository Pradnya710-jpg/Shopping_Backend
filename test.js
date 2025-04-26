const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bodyParser = require("body-parser");
const cors = require("cors");

const Item = require("./Models/schema");
const Cart = require("./Models/cart");

const app = express();
app.use(cors());
app.use(bodyParser.json());
jest.setTimeout(20000);

app.get("/products", async (req, res) => {
  const products = await Item.find();
  res.json(products);
});

app.post("/cart", async (req, res) => {
  const { productId } = req.body;
  const product = await Item.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const newCart = new Cart({
    products: {
      productId: product._id,
      title: product.title,
      variantPrice: product.variantPrice,
      quantity: 1,
      imageSrc: product.imageSrc,
    },
  });
  await newCart.save();
  res.status(200).json(newCart);
});

describe("API Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 2000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Item.deleteMany();
    await Cart.deleteMany();
  });

  it("GET /products should return all products", async () => {
    const product = new Item({
      title: "Test Product",
      variantSKU: "TEST123",
      variantPrice: 100,
      imageSrc: "test.jpg",
    });
    await product.save();

    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Test Product");
  });

  it("POST /cart should add a product to cart", async () => {
    const product = new Item({
      title: "Test Cart Item",
      variantSKU: "SKU123",
      variantPrice: 199,
      imageSrc: "image.jpg",
    });
    await product.save();

    const res = await request(app)
      .post("/cart")
      .send({ productId: product._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.products.title).toBe("Test Cart Item");
  });

  it("POST /cart with invalid productId should return 404", async () => {
    const res = await request(app)
      .post("/cart")
      .send({ productId: new mongoose.Types.ObjectId() });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });
});
