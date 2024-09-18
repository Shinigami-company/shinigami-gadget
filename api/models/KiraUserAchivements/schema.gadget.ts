import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserAchivements" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "tKIDEM8p_yGM",
  fields: {
    userId: { type: "number", storageKey: "kCr7Ys0Ktoa1" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "sRANgYIsPY2-",
    },
  },
};
