import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraGameCoin" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "0wnqpB1G0MbT",
  fields: {
    bet: { type: "number", storageKey: "IcADpVvuTlgL" },
    step: { type: "number", storageKey: "tRbZ7CGtprN5" },
    user1DataId: { type: "string", storageKey: "VA7ts639il7H" },
    user1Id: { type: "string", storageKey: "Y-d5xW9xvC3y" },
    user1Side: { type: "number", storageKey: "HsK0WG2IaBOM" },
    user2DataId: { type: "string", storageKey: "acwfUyOdUYXG" },
    user2Id: { type: "string", storageKey: "bN2G40eV_KYN" },
    user2Side: { type: "number", storageKey: "5QP_VZwrC1gX" },
  },
};
