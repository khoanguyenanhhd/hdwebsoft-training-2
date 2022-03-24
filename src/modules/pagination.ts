import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class Pagination {
  @Field({ nullable: true })
  limit?: number;

  @Field({ nullable: true })
  page?: number;
}
