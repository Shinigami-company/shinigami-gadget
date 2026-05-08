import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraCreditory" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "Hu3Zx938fiWn",
  fields: {
    importance: {
      type: "number",
      default: 0,
      storageKey: "SUKzWiyXQy_R",
    },
    message: { type: "string", storageKey: "uF-66KCfs_Kc" },
    name: { type: "string", storageKey: "GGtxZB-hSlRj" },
    type: { type: "string", storageKey: "CX_KOjcFLZ2Q" },
  },
};
