import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  price: {
    type: Number,
    required: [true, "pleae enter the price"],
    min: [0, "price cannot be negative"]
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: ["Laptop", "Smartphone", "Accessories", "Tablet", "Gaming", "Others"],
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
  },
  stock: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: 0,
    default: 0,
  },
  image: [
    {
      type: String, // URL to images
      required: true,
    },
  ],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  ],
  discount: {
    type: Number, // Discount percentage
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
