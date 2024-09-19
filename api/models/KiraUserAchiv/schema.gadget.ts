import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserAchiv" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "LAh9i2LlL1o3",
  fields: {
    userId: { type: "string", storageKey: "zY03WKPyvCHu" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "goVP3wMA1Pv0",
    },
  },
};
