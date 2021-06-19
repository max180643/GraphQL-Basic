// resolvers เหมือนเป็น function ของ graphql ที่เราเรียกใช้
import User from "../models/user";
import Mutation from "./mutation";

// args มาจาก argument ใน schema.graphql

const Query = {
  user: (parent, args, context, info) => {
    return User.findById(args.id);
  },
  users: (parent, args, context, info) => {
    return User.find({});
  },
};

const resolvers = {
  Query,
  Mutation,
};

export default resolvers;
