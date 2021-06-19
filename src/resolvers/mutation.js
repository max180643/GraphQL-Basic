import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/user";
import Product from "../models/product";

const Mutation = {
  signup: async (parent, args, context, info) => {
    // Trim and lower case email
    const email = args.email.trim().toLowerCase();

    // Check email is valid
    if (!validator.isEmail(email)) {
      throw new Error("Email not valid.");
    }

    // Check if email already exist in database
    const currentUsers = await User.find({}); // get all users in database

    const isEmailExist =
      currentUsers.findIndex((user) => user.email === email) > -1;

    if (isEmailExist) {
      throw new Error("Email already exist.");
    }

    // Trim password
    const password = args.password.trim();

    // Validate password
    if (!validator.isLength(password, { min: 6 })) {
      throw new Error("Password must be at least 6 characters.");
    }

    // Encrypt password
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...args,
      email,
      password: hashPassword,
    });

    return newUser;
  },
  createProduct: async (parent, args, context, info) => {
    const userId = "60ce4c7b56048d50510b0ce9";
    const { description, price, imageUrl } = args;

    if (!description || !price || !imageUrl) {
      throw new Error("Please provide all required fields.");
    }

    // Create product
    const product = await Product.create({ ...args, user: userId });

    // Update user product
    const user = await User.findById(userId);

    if (!user.products) {
      user.products = [product];
    } else {
      user.products.push(product);
    }

    await user.save();

    return Product.findById(product.id).populate({
      path: "user",
      populate: { path: "products" },
    });
  },
};

export default Mutation;
