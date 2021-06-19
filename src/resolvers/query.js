import User from "../models/user";
import Product from "../models/product";

// args มาจาก argument ใน schema.graphql

const Query = {
  user: (parent, args, context, info) => {
    return User.findById(args.id).populate({
      path: "products",
      populate: { path: "user" },
    });
  },
  users: (parent, args, context, info) => {
    return User.find({});
  },
  product: (parent, args, context, info) => {
    return Product.findById(args.id).populate({
      path: "user",
      populate: { path: "products" },
    });
  },
  products: (parent, args, context, info) => {
    return Product.find({}).populate({
      path: "user",
      populate: { path: "products" },
    });
  },
};

export default Query;
