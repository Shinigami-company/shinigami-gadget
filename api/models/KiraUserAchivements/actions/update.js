import { applyParams, save, ActionOptions, UpdateKiraUserAchivementsActionContext } from "gadget-server";

/**
 * @param { UpdateKiraUserAchivementsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { UpdateKiraUserAchivementsActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
