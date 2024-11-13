import { applyParams, save, ActionOptions, UpdateKiraRememberActionContext } from "gadget-server";

/**
 * @param { UpdateKiraRememberActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
