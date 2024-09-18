import { applyParams, save, ActionOptions, CreateKiraUserAchivementsActionContext } from "gadget-server";

/**
 * @param { CreateKiraUserAchivementsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKiraUserAchivementsActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
