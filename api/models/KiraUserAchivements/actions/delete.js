import { deleteRecord, ActionOptions, DeleteKiraUserAchivementsActionContext } from "gadget-server";

/**
 * @param { DeleteKiraUserAchivementsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteKiraUserAchivementsActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
