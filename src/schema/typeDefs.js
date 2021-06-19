// ทำได้ 2 แบบ 1.typeDefs.js 2.schema.graphql ต่างที่การ import ใน server.js

import { gql } from "apollo-server-express";

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

export default typeDefs;
