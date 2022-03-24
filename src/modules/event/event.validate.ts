import { IsInt, IsNotEmpty, IsString, Length, Min } from "class-validator";
import { Field, InputType } from "type-graphql";
import { Event } from "../../entity/Event";

@InputType()
export class CreateEventInput implements Partial<Event> {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  name!: string;

  @Field()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  maxQuantity!: number;
}
