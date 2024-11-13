import { applyParams, save, ActionOptions, CreateKiraRememberActionContext } from "gadget-server";

/**
 * @param { CreateKiraRememberActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
