import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// events eBRAiN did not take (down, a 4xx, no secret yet) go out again every hour
crons.interval("retry failed eBRAiN events", { hours: 1 }, internal.outbox.retryFailed, {});

export default crons;
