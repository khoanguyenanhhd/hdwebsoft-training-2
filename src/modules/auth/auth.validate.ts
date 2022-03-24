import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import { User } from "../../entity/User";
import { IsUserAlreadyExist } from "../../validation/customValidation";

@InputType()
export class RegisterInput implements Partial<User> {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Length(1, 50, {
    message: "Firstname length must be between 1 and 50 characters",
  })
  firstName!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @Length(1, 50, {
    message: "Lastname length must be between 1 and 50 characters",
  })
  lastName!: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  @IsUserAlreadyExist({
    message: "This email adress already exists, please try another email",
  })
  email!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password!: string;
}

@ArgsType()
export class LoginInput implements Partial<User> {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password!: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken!: string;
}
