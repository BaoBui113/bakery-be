// scripts/seedProducts.js
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const dotenv = require("dotenv");
dotenv.config();
const db = process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleNames = [
  "Bánh Mì Pháp Bơ Tỏi",
  "Bánh Mì Sừng Bò Thịt Nguội",
  "Bánh Mì Pate Xúc Xích",
  "Bánh Mì Thịt Heo Quay",
  "Bánh Mì Chả Cá Nướng",
];

const seedProducts = async () => {
  try {
    const products = sampleNames.map((name, i) => ({
      name,
      category_id: "681439e6c64935e8d107e1e5",
      description: "Sản phẩm độc quyền nhà bakery shop",
      price: 300000 + i * 10000,
      stock: 50 + i * 5,
    }));

    await Product.insertMany(products);
    console.log("Seed thành công!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedProducts();
