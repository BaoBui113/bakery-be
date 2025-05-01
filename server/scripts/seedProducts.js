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
  "Bánh Kem Socola Hạnh Nhân",
  "Bánh Kem Dâu Tươi",
  "Bánh Kem Matcha Trà Xanh",
  "Bánh Kem Tiramisu Ý",
];

const seedProducts = async () => {
  try {
    const products = sampleNames.map((name, i) => ({
      name,
      category_id: "6811e00fd8cefba09d490e9f",
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
