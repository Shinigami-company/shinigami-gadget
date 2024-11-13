import { applyParams, save, ActionOptions, CreateUserActionContext } from "gadget-server";

/**
 * @param { CreateUserActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
