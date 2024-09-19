import { applyParams, save, ActionOptions, UpdateKiraUserStatsActionContext } from "gadget-server";

/**
 * @param { UpdateKiraUserStatsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { UpdateKiraUserStatsActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
