import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraNotes" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "-gpGXQPQGDmz",
  fields: {
    attackerBookPtr: {
      type: "belongsTo",
      parent: { model: "KiraBooks" },
      storageKey: "yiqC93v_NmIy::addguMoxh3uS",
    },
    indexLine: {
      type: "number",
      storageKey: "SijJI2EAAuIx::bnq_dcnYnJS6",
    },
    line: {
      type: "richText",
      storageKey: "hSo1zStzupUN::55K_FZvXVCdh",
    },
  },
};
