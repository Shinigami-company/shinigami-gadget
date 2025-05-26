import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraItemGift" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "h5yqaGyCRxSC",
  fields: {
    appleAmount: { type: "number", storageKey: "wvcd1qQV6a_M" },
    itemPtr: {
      type: "belongsTo",
      parent: { model: "KiraItems" },
      storageKey: "KsoAklMa4OcB",
    },
    userIdOwner: { type: "string", storageKey: "PRdjvPWkE4C_" },
    userIdRecipient: { type: "string", storageKey: "AxskXklKY2gi" },
    usernameOwner: { type: "string", storageKey: "8gWLZ3DUS041" },
  },
};
