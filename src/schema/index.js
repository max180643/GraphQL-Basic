import { gql } from "apollo-server-express";

// Mockup database
const users = [
  {
    id: "1",
    name: "A",
  },
  {
    id: "2",
    name: "B",
  },
  {
    id: "3",
    name: "C",
  },
];

const me = users[0];

const resolvers = {
  Query: {
    me: (parent, args, context, info) => {
      return me;
    },
    user: (parent, args, context, info) => {
      const id = args.id;
      const user = users.find((u) => {
        return u.id === id;
      });
      return user;
    },
    users: (parent, args, context, info) => {
      return users;
    },
  },
};

const typeDefs = gql`
  type Query {
    me: User!
    user(id: ID!): User
    users: [User]!
  }
  type User {
    id: ID!
    name: String!
  }
`;

export { typeDefs, resolvers };
