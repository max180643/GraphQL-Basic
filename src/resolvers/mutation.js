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
    // const userId = "60ce4c7b56048d50510b0ce9";
    const { userId } = context.userId;

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");

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
  updateProduct: async (parent, args, context, info) => {
    const { id, description, price, imageUrl } = args;
    const { userId } = context.userId;

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");

    // Find product in database
    const product = await Product.findById(id);

    if (userId !== product.user.toString()) {
      throw new Error("You are not authorized.");
    }

    // Form updated information
    const updateInfo = {
      description: !!description ? description : product.description,
      price: !!price ? price : product.price,
      imageUrl: !!imageUrl ? imageUrl : product.imageUrl,
    };

    // Update product in database
    await Product.findByIdAndUpdate(id, updateInfo);

    // Find the updated Product
    const updatedProduct = await Product.findById(id).populate({
      path: "user",
    });

    return updatedProduct;
  },
  addToCart: async (parent, args, context, info) => {
    // id -> productId
    const { id } = args;
    const { userId } = context.userId;

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");

    try {
      // Find user who perform add to cart -> from logged in
      // const userId = "60cefccedef4a75aa852dc29";

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
  deleteCart: async (parent, args, context, info) => {
    const { id } = args;
    const { userId } = context.userId;

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");

    // Find cart from given id
    const cart = await CartItem.findById(id);

    // TODO: user id from request -> Find user
    // const userId = "60cefccedef4a75aa852dc29";

    const user = await User.findById(userId);

    // Check ownership of the cart
    if (cart.user.toString() !== userId) {
      throw new Error("You are not authorized.");
    }

    // Delete cart
    const deletedCart = await CartItem.findByIdAndRemove(id);

    // Delete cartItem in user
    const updatedUserCarts = user.carts.filter(
      (cartId) => cartId.toString() !== deletedCart.id.toString()
    );

    await User.findByIdAndUpdate(userId, { carts: updatedUserCarts });

    return deletedCart;
  },
};

export default Mutation;
