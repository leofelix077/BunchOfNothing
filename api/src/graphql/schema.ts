import { gql, makeExecutableSchema } from "apollo-server-express";
import merge from "lodash/merge";

const BaseTypes = gql`
  type Subscription {
    _empty: String
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const resolvers = {};

export default makeExecutableSchema({
  typeDefs: [BaseTypes],
  resolvers: merge(resolvers),
});
