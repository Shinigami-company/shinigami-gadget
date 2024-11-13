import { deleteRecord, ActionOptions, DeleteKiraRememberActionContext } from "gadget-server";

/**
 * @param { DeleteKiraRememberActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
