import "reflect-metadata";
import "dotenv/config";
import { App } from "./boostrap/app";

const main = async (): Promise<void> => {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    console.log("ERROR: ", error);
    throw error;
  }
};
main();
