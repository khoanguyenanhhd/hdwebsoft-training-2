import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { authChecker } from "../middlewares/auth/authChecker";
import { AuthResolver } from "../modules/auth/auth";
import { EventResolver } from "../modules/event/event";
import { EventTrackingResolver } from "../modules/eventTracking/eventTracking";
import { TestingResolver } from "../modules/testing/testing";
import { TodoResolver } from "../modules/todo/todo";
import { VoucherResolver } from "../modules/voucher/voucher";

export const createGraphqlSchema = async (): Promise<GraphQLSchema> => {
  return buildSchema({
    resolvers: [
      AuthResolver,
      TodoResolver,
      EventResolver,
      VoucherResolver,
      EventTrackingResolver,
      TestingResolver,
    ],
    authChecker: authChecker,
  });
};
