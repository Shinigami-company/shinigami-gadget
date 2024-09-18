import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserStats" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "_rdspw2aR5t0",
  fields: {
    userId: { type: "number", storageKey: "hKdzz4ODw1MG" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "lovAxIj_GUAP",
    },
  },
};
