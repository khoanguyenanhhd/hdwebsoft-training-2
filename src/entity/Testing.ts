import { Field, ObjectType } from "type-graphql";
import { Column, Entity, VersionColumn } from "typeorm";
import { BaseEntity } from "../utils/BaseEntity";

@ObjectType()
@Entity()
export class Testing extends BaseEntity {
  @Field()
  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
  })
  name!: string;

  @VersionColumn()
  version!: number;
}
