// resolvers เหมือนเป็น function ของ graphql ที่เราเรียกใช้
import Mutation from "./mutation";
import Query from "./query";

const resolvers = {
  Query,
  Mutation,
};

export default resolvers;
