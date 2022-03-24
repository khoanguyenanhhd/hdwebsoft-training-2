import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../utils/BaseEntity";
import { EventTracking } from "./EventTracking";
import { Voucher } from "./Voucher";

@ObjectType()
@Entity()
export class Event extends BaseEntity {
  @Field()
  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
  })
  name!: string;

  @Field()
  @Column({
    type: "integer",
    nullable: false,
  })
  maxQuantity!: number;

  @Field(() => [Voucher])
  @OneToMany(() => Voucher, (voucher) => voucher.event)
  vouchers?: Voucher[];

  @Field(() => [EventTracking])
  @OneToMany(() => EventTracking, (eventTracking) => eventTracking.event)
  eventTrackings?: EventTracking[];
}
