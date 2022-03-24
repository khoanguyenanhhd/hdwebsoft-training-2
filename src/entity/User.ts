import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../utils/BaseEntity";
import { Todo } from "./Todo";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @Column({
    type: "varchar",
    length: 50,
    unique: true,
  })
  email!: string;

  @Field()
  @Column({
    type: "varchar",
    length: 50,
  })
  firstName!: string;

  @Field()
  @Column({
    type: "varchar",
    length: 50,
  })
  lastName!: string;

  @Column({
    type: "varchar",
  })
  password!: string;

  @Field(() => [Todo])
  @OneToMany(() => Todo, (todo) => todo.user)
  todos?: Todo[];
}
