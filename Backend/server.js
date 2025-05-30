require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const Product = require('./model.js');
const verifyToken =require('./auth.js');
const User = require('./User.js')
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/products',verifyToken, async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

app.put('/products/:id',verifyToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id',verifyToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.post('/register',async (req,res)=>{
  try{
        const {username,password} = req.body;
        const hashedPassword = await bcrypt.hash(password,parseInt(process.env.SALT,10));
        const newUser = new User({username,password: hashedPassword})
        await newUser.save();
        return res.status(201).json({message:`Registration successful. You can now login`})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:"something went wrong"})
    }
})

// app.post('/login',async (req,res)=>{
//   try{
//         const {username,password} = req.body;
//         const user = await User.findOne({username});
//         if(!user){
//             return res.send(404).json({message:"user with username not found"})
//         }
//         const match = await bcrypt.compare(password,user.password)
//         if(!match){
//             return res.status(400).json({message:"invalid credentials"})
//         }
//         const token = jwt.sign({id:user.id,name:user.username},process.env.JWT_SECRET,{expiresIn : "1h"});
//         return res.status(200).json({token})
//     }
//     catch(err){
//         console.log(err);
//         res.status(500).json({message:"something went wrong"})
//     }
// })

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      // Return proper 404 and clear message
      return res.status(404).json({ message: "User not found. Please register." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Return 401 for invalid credentials
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, name: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));