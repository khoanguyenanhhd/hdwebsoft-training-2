import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../utils/BaseEntity";
import { Event } from "./Event";

@ObjectType()
@Entity()
export class EventTracking extends BaseEntity {
  @Field()
  @Column({
    type: "timestamptz",
    nullable: false,
  })
  lockedAt!: Date;

  @Field()
  @Column({
    type: "timestamptz",
    nullable: false,
  })
  releaseAt!: Date;

  @Field()
  @Column("integer", { default: 0 })
  maintainTime!: Number;

  @Field()
  @Column({
    type: "varchar",
    nullable: false,
  })
  userId!: string;

  @ManyToOne(() => Event, (event) => event.eventTrackings)
  event!: Event;
}
