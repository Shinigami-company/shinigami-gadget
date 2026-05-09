import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraCreditory" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "Hu3Zx938fiWn",
  fields: {
    hidden: {
      type: "boolean",
      default: false,
      storageKey: "2XHHNoy7SIS4",
    },
    importance: {
      type: "number",
      default: 0,
      storageKey: "SUKzWiyXQy_R",
    },
    incrusted: {
      type: "boolean",
      default: false,
      storageKey: "UznkxulqVJU8",
    },
    message: { type: "string", storageKey: "uF-66KCfs_Kc" },
    name: { type: "string", storageKey: "GGtxZB-hSlRj" },
    type: { type: "string", storageKey: "CX_KOjcFLZ2Q" },
  },
};
