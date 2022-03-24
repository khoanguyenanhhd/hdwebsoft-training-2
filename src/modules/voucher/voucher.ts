import { Arg, Mutation, Resolver } from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Voucher } from "../../entity/Voucher";
import { Event } from "../../entity/Event";
import { addEmailToQueue } from "../../queues/bull";

@Resolver()
export class VoucherResolver {
  private connection = getConnection();
  private eventRepository = getRepository(Event);

  @Mutation(() => Voucher)
  async createVoucher(@Arg("eventId") id: string) {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let isVoucherAvailable = true;

    try {
      const eventManager = queryRunner.manager.getRepository("Event");
      const voucherManager = queryRunner.manager.getRepository("Voucher");

      const eventInTxcn: any = await eventManager.findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
      });

      // console.log("Read oke");

      if (eventInTxcn.maxQuantity > 0) {
        const voucher = voucherManager.create({
          event: eventInTxcn,
        });

        eventInTxcn.maxQuantity = eventInTxcn.maxQuantity - 1;

        await eventManager.save(eventInTxcn);
        await voucherManager.save(voucher);

        await queryRunner.commitTransaction();

        await addEmailToQueue(voucher);
        return voucher;
      }

      isVoucherAvailable = false;
      console.log("No more voucher");
    } catch (error) {
      console.log("Transaction error: ", error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (!isVoucherAvailable) {
      throw new Error("No more voucher");
    }
  }
}
