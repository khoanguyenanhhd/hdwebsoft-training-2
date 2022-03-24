import Bull, { JobOptions } from "bull";
import { emailProcess } from "../utils/helper";

const emailQueue = new Bull("emailQueue", "redis://127.0.0.1:6379");

// Remember to handle jobs when completed or failed
// A job still in queue when it finished
const emailJobOptions: JobOptions = {
  removeOnComplete: true,
  removeOnFail: true,
};

export const addEmailToQueue = async <T>(model: T) => {
  await emailQueue.add(model, emailJobOptions);
};

emailQueue.process(emailProcess);

emailQueue.on("global:completed", (jobId) => {
  console.log(`Job with id ${jobId} has been completed`);
});
