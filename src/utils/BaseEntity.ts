import { Field, ObjectType } from "type-graphql";
import {
  BeforeInsert,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { uniqueId } from "./helper";

@Entity()
@ObjectType()
export class BaseEntity {
  @Field()
  @PrimaryColumn()
  id!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  private beforeInsert() {
    this.id = uniqueId();
  }
}
