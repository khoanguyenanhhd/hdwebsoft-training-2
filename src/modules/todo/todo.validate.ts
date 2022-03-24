import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  NotEquals,
  ValidateIf,
} from "class-validator";
import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import { Todo } from "../../entity/Todo";

@InputType()
export class CreateTodoInput implements Partial<Todo> {
  @Field()
  @IsNotEmpty()
  @Length(5, 50, {
    message: "Name length must be between 5 and 50 characters",
  })
  name!: string;

  @Field()
  @IsString()
  @IsOptional()
  @Length(0, 255, {
    message: "Description length must be between 0 and 255 characters",
  })
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

@ArgsType()
export class UpdateTodoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Field(() => CreateTodoInput)
  data!: CreateTodoInput;
}

@ObjectType()
export class PaginateTodoResponse {
  @Field(() => [Todo])
  todos!: Todo[];

  @Field()
  count!: number;

  @Field()
  limit!: number;

  @Field()
  currentPage!: number;

  @Field()
  totalPage!: number;
}
