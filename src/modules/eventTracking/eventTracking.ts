import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { EventTracking } from "../../entity/EventTracking";
import { Event } from "../../entity/Event";
import { AuthContext } from "../../middlewares/auth/context";
import { shouldRetryTransaction } from "../../utils/helper";

@Resolver()
export class EventTrackingResolver {
  private connection = getConnection();
  private eventRepository = getRepository(Event);
  private eventTrackingRepository = getRepository(EventTracking);

  @Authorized()
  @Mutation(() => String)
  async editable(@Arg("eventId") id: string, @Ctx() { req }: AuthContext) {
    const userId = req.auth!.userId;
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    let done = false;
    let retryCount = 0;
    let unhandle = false;

    let isLockedByAnotherUser = false;
    let isLockedByCurrentUser = false;
    let isUserEditAnotherEvent = false;
    while (!done && retryCount < 5) {
      retryCount++;

      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction("SERIALIZABLE");

      try {
        const eventTrackingManager =
          queryRunner.manager.getRepository("EventTracking");

        const eventTracking = (await eventTrackingManager.findOne({
          where: { event: { id: event.id } },
          order: { createdAt: "DESC" },
        })) as EventTracking;

        const isUserEditing = (await eventTrackingManager.findOne({
          where: { userId },
          order: { createdAt: "DESC" },
        })) as EventTracking;

        // console.log("Read oke");
        // console.log(eventTracking);

        if (
          isUserEditing &&
          isUserEditing.releaseAt > new Date() &&
          eventTracking.id !== isUserEditing.id
        ) {
          isUserEditAnotherEvent = true;
          done = true;
        } else if (
          eventTracking &&
          eventTracking.userId !== userId &&
          eventTracking.releaseAt > new Date()
        ) {
          isLockedByAnotherUser = true;
          done = true;
        } else if (
          eventTracking &&
          eventTracking.userId === userId &&
          eventTracking.releaseAt > new Date()
        ) {
          isLockedByCurrentUser = true;
          done = true;
        } else {
          const lockedAt = new Date();
          const releaseAt = new Date(lockedAt);
          releaseAt.setMinutes(releaseAt.getMinutes() + 5);

          const newEventTracking = eventTrackingManager.create({
            lockedAt,
            releaseAt,
            userId,
            event: event,
          }) as EventTracking;

          await eventTrackingManager.save(newEventTracking);
          await queryRunner.commitTransaction();

          done = true;

          return "Access successfully";
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();

        if (!shouldRetryTransaction(error)) {
          done = true;
          unhandle = true;
        }
      } finally {
        await queryRunner.release();
      }
    }

    if (retryCount === 5 || unhandle)
      return "Something went wrong, please try again";

    if (isUserEditAnotherEvent) return "One user can edit one event";

    if (isLockedByAnotherUser) return "Another user is editing this event";

    if (isLockedByCurrentUser) return "You are currently editing this event";
  }

  @Authorized()
  @Mutation(() => String)
  async release(@Arg("eventId") id: string, @Ctx() { req }: AuthContext) {
    const userId = req.auth!.userId;
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    let done = false;
    let retryCount = 0;
    let unhandle = false;

    let isLockedByAnotherUserAndOverTime = false;
    let isLockedByAnotherUserAndInTime = false;
    let isLockedByCurrentUserAndOverTime = false;

    while (!done && retryCount < 5) {
      retryCount++;
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction("SERIALIZABLE");

      try {
        const eventTrackingManager =
          queryRunner.manager.getRepository("EventTracking");

        const eventTracking = (await eventTrackingManager.findOne({
          where: { event: { id: event.id } },
          order: { createdAt: "DESC" },
        })) as EventTracking;

        if (
          (eventTracking &&
            eventTracking.userId !== userId &&
            eventTracking.releaseAt < new Date()) ||
          !eventTracking
        ) {
          isLockedByAnotherUserAndOverTime = true;
          done = true;
        } else if (
          eventTracking &&
          eventTracking.userId !== userId &&
          eventTracking.releaseAt > new Date()
        ) {
          isLockedByAnotherUserAndInTime = true;
          done = true;
        } else if (
          eventTracking &&
          eventTracking.userId === userId &&
          eventTracking.releaseAt < new Date()
        ) {
          isLockedByCurrentUserAndOverTime = true;
          done = true;
        } else {
          const releaseAt = new Date();

          eventTracking.releaseAt = releaseAt;

          await eventTrackingManager.save(eventTracking);
          await queryRunner.commitTransaction();

          done = true;

          return "Release successfully";
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();

        if (!shouldRetryTransaction(error)) {
          done = true;
          unhandle = true;
        }
      } finally {
        await queryRunner.release();
      }
    }

    if (retryCount === 5 || unhandle)
      return "Something went wrong, please try again";

    if (isLockedByAnotherUserAndOverTime)
      return "Need to access before releasing";

    if (isLockedByAnotherUserAndInTime)
      return "Can not release because the access belong to another user";

    if (isLockedByCurrentUserAndOverTime)
      return "Can not release because your access is over time";
  }

  @Authorized()
  @Mutation(() => String)
  async maintain(@Arg("eventId") id: string, @Ctx() { req }: AuthContext) {
    const userId = req.auth!.userId;
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    let done = false;
    let retryCount = 0;
    let unhandle = false;

    let isLockedByAnotherUserAndOverTime = false;
    let isLockedByAnotherUserAndInTime = false;
    let isLockedByCurrentUserAndOverTime = false;

    while (!done && retryCount < 5) {
      retryCount++;

      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction("SERIALIZABLE");

      try {
        const eventTrackingManager =
          queryRunner.manager.getRepository("EventTracking");

        const eventTracking = (await eventTrackingManager.findOne({
          where: { event: { id: event.id } },
          order: { createdAt: "DESC" },
        })) as EventTracking;

        if (
          (eventTracking &&
            eventTracking.userId !== userId &&
            eventTracking.releaseAt < new Date()) ||
          !eventTracking
        ) {
          isLockedByAnotherUserAndOverTime = true;
          done = true;
        } else if (
          eventTracking &&
          eventTracking.userId !== userId &&
          eventTracking.releaseAt > new Date()
        ) {
          isLockedByAnotherUserAndInTime = true;
          done = true;
        } else if (
          eventTracking &&
          eventTracking.userId === userId &&
          eventTracking.releaseAt < new Date()
        ) {
          isLockedByCurrentUserAndOverTime = true;
          done = true;
        } else {
          const releaseAt = new Date();
          releaseAt.setMinutes(releaseAt.getMinutes() + 5);

          eventTracking.releaseAt = releaseAt;
          eventTracking.maintainTime = Number(eventTracking.maintainTime) + 1;

          await eventTrackingManager.save(eventTracking);
          await queryRunner.commitTransaction();

          done = true;

          return "Maintain successfully";
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();

        if (!shouldRetryTransaction(error)) {
          done = true;
          unhandle = true;
        }
      } finally {
        await queryRunner.release();
      }
    }

    if (retryCount === 5 || unhandle)
      return "Something went wrong, please try again";

    if (isLockedByAnotherUserAndOverTime)
      return "Need to access before maintain";

    if (isLockedByAnotherUserAndInTime)
      return "Can not maintain because the access belong to another user";

    if (isLockedByCurrentUserAndOverTime)
      return "Can not maintain because your access is over time";
  }
}
