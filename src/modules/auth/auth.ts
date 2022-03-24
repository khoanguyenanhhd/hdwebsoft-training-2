import { Arg, Args, Mutation, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import { hashPassword, validatePassword } from "../../utils/helper";
import { LoginInput, LoginResponse, RegisterInput } from "./auth.validate";
import * as Jwt from "jsonwebtoken";
import config from "../../config";

@Resolver()
export class AuthResolver {
  private userRepository = getRepository(User);

  @Mutation(() => User)
  async register(
    @Arg("data") { email, firstName, lastName, password }: RegisterInput
  ): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user;
  }

  @Mutation(() => LoginResponse)
  async login(@Args() { email, password }: LoginInput): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error("Email does not exist");
    }

    const validPassword = await validatePassword(password, user.password);

    if (!validPassword) {
      throw new Error("Password is invalid");
    }

    const jwtSecretKey = config.JWT_SECRET;
    const jwtExpiration = config.JWT_LIFETIME;

    const payload = {
      userId: user.id,
      role: "USER",
    };

    const accessToken = Jwt.sign(payload, jwtSecretKey, {
      expiresIn: jwtExpiration,
    });

    return { accessToken };
  }
}
