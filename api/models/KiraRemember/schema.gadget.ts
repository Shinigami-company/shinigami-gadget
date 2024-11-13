import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraRemember" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "dG8OvMnw_ZIV",
  fields: {
    RememberingData: { type: "json", storageKey: "xO1NsT2CRtSL" },
    RememberingType: { type: "number", storageKey: "DrwCtyC1W5o5" },
    executeDate: {
      type: "dateTime",
      includeTime: true,
      storageKey: "T4krrGGFhsMP",
    },
  },
};
