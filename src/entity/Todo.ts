import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/BaseEntity";
import { User } from "./User";

@ObjectType()
@Entity()
export class Todo extends BaseEntity {
  @Field()
  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
  })
  name!: string;

  @Field()
  @Column({
    type: "varchar",
    length: 255,
  })
  description!: string;

  @Field()
  @Column({
    type: "boolean",
    default: false,
  })
  isCompleted!: boolean;

  @ManyToOne(() => User, (user) => user.todos)
  user!: User;
}
