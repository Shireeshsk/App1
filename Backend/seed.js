require('dotenv').config();
const mongoose = require('mongoose');
const faker = require('faker');
const Product = require('./model.js');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function seedProducts() {
  await Product.deleteMany({});
  const products = [];
  for (let i = 0; i < 100; i++) {
    products.push({
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      inStock: faker.datatype.boolean()
    });
  }
  await Product.insertMany(products);
  console.log('Database seeded!');
  mongoose.disconnect();
}

seedProducts();
