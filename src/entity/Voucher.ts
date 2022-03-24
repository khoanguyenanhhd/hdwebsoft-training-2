import { Field, ObjectType } from "type-graphql";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../utils/BaseEntity";
import { Event } from "./Event";

@ObjectType()
@Entity()
export class Voucher extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  code!: string;

  @ManyToOne(() => Event, (event) => event.vouchers)
  event!: Event;
}
