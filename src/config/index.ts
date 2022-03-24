export default {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_LIFETIME: process.env.JWT_LIFETIME || "",
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_HOST: process.env.MAIL_HOST,
};
