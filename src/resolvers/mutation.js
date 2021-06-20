import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/user";
import Product from "../models/product";
import CartItem from "../models/cartItem";

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
    // Find user who perform create product -> from logged in
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
  addToCart: async (parent, args, context, info) => {
    // id -> productId
    const { id } = args;

    try {
      // Find user who perform add to cart -> from logged in
      const userId = "60cefccedef4a75aa852dc29";

      // Check if the new addToCart item is already in user.carts
      const user = await User.findById(userId).populate({
        path: "carts",
        populate: { path: "product" },
      });

      const findCartItemIndex = user.carts.findIndex(
        (cartItem) => cartItem.product.id === id
      );

      // Found item in cart
      if (findCartItemIndex > -1) {
        // Case A. The new addToCart item is already in cart

        // A.1 Find the cartItem and update in database
        user.carts[findCartItemIndex].quantity += 1;
        // user.carts[findCartItemIndex].id -> cartItemId
        await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
          quantity: user.carts[findCartItemIndex].quantity,
        });

        // A.2 Find updated cartItem
        const updatedCartItem = await CartItem.findById(
          user.carts[findCartItemIndex].id
        )
          .populate({ path: "product" })
          .populate({ path: "user" });

        return updatedCartItem;
      } else {
        // Case B. The new addToCart item is not in cart yet

        // B.1 Create new cartItem
        const cartItem = await CartItem.create({
          product: id,
          quantity: 1,
          user: userId,
        });

        // B.2 Find new cartItem
        const newCartItem = await CartItem.findById(cartItem.id)
          .populate({ path: "product" })
          .populate({ path: "user" });

        // B.3 Update user.carts
        await User.findByIdAndUpdate(userId, {
          carts: [...user.carts, newCartItem],
        });

        return newCartItem;
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export default Mutation;
