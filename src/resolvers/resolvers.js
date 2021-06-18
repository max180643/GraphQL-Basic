import User from "../models/user";

// Mockup database
// const users = [
//   {
//     id: "1",
//     name: "A",
//   },
//   {
//     id: "2",
//     name: "B",
//   },
//   {
//     id: "3",
//     name: "C",
//   },
// ];

// const me = users[0];

// args มาจาก argument ใน schema.graphql

const Query = {
  // me: (parent, args, context, info) => {
  //   return me;
  // },
  user: (parent, args, context, info) => {
    return User.findById(args.id);
  },
  users: (parent, args, context, info) => {
    return User.find({});
  },
};

const Mutation = {
  signup: async (parent, args, context, info) => {
    const newUser = await User.create(args);
    return newUser;
  },
};

const resolvers = {
  Query,
  Mutation,
};

export default resolvers;
