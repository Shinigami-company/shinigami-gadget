import { applyParams, save, ActionOptions, CreateKiraUserStatsActionContext } from "gadget-server";

/**
 * @param { CreateKiraUserStatsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKiraUserStatsActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
