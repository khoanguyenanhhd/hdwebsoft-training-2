import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Event } from "../../entity/Event";
import { CreateEventInput } from "./event.validate";

@Resolver()
export class EventResolver {
  private eventRepository = getRepository(Event);

  @Mutation(() => Event)
  async createEvent(@Arg("data") data: CreateEventInput): Promise<Event> {
    const event = this.eventRepository.create(data);

    await this.eventRepository.save(event);

    return event;
  }
}
