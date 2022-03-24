import { Arg, Args, ArgsType, Field, Mutation, Resolver } from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Testing } from "../../entity/Testing";

@ArgsType()
class TestingInput {
  @Field()
  id!: string;

  @Field()
  name!: string;
}

@Resolver()
export class TestingResolver {
  private connection = getConnection();
  private testingRepository = getRepository(Testing);

  @Mutation(() => Testing)
  async createTesting(@Arg("name") name: string) {
    const testing = this.testingRepository.create({
      name,
    });

    await this.testingRepository.save(testing);

    return testing;
  }

  @Mutation(() => Testing)
  async updateTesting(@Args() { id, name }: TestingInput) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const testingManager = queryRunner.manager.getRepository("Testing");

      const getVersion = (await testingManager.findOne({
        where: { id },
      })) as Testing;

      console.log("getVersion: ", getVersion.version);

      const testing = (await testingManager.findOne({
        where: { id },
        lock: { mode: "optimistic", version: getVersion.version },
      })) as Testing;

      testing.name = name;

      await testingManager.save(testing);

      await queryRunner.commitTransaction();

      console.log("version updated: ", testing.version);

      return testing;
    } catch (error) {
      console.log("Transaction error: ", error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
