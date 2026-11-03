/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessRequests from "../accessRequests.js";
import type * as admin from "../admin.js";
import type * as crons from "../crons.js";
import type * as demos from "../demos.js";
import type * as feedback from "../feedback.js";
import type * as forms from "../forms.js";
import type * as launch from "../launch.js";
import type * as launchData from "../launchData.js";
import type * as notify from "../notify.js";
import type * as notifyData from "../notifyData.js";
import type * as outbox from "../outbox.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessRequests: typeof accessRequests;
  admin: typeof admin;
  crons: typeof crons;
  demos: typeof demos;
  feedback: typeof feedback;
  forms: typeof forms;
  launch: typeof launch;
  launchData: typeof launchData;
  notify: typeof notify;
  notifyData: typeof notifyData;
  outbox: typeof outbox;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
