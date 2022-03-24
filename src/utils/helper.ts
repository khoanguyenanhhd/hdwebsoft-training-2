import * as Bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { Job } from "bull";
import nodemailer from "nodemailer";
import config from "../config";

export const hashPassword = async (password: string) => {
  const salt = await Bcrypt.genSalt(10);
  const passwordHash = await Bcrypt.hash(password, salt);
  return passwordHash;
};

export const validatePassword = async (
  requestPassword: string,
  password: string
) => {
  const isValid = await Bcrypt.compare(requestPassword, password);
  return isValid;
};

export const uniqueId = (): string => {
  return nanoid();
};

export const shouldRetryTransaction = (err: unknown) => {
  const code = typeof err === "object" ? String((err as any).code) : null;
  return code === "40001" || code === "40P01";
};

export const emailProcess = async (job: Job) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.MAIL_HOST,
      port: Number(config.MAIL_PORT),
      secure: false,
      auth: {
        user: config.MAIL_USERNAME,
        pass: config.MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: config.MAIL_USERNAME,
      to: config.MAIL_USERNAME,
      subject: "Created data",
      text: JSON.stringify(job.data),
      html: `<h1>${JSON.stringify(job.data)}</h1>`,
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
  }
};
