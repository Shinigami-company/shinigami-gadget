import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraLetters" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "HYloQWZ1dEH6",
  fields: {
    color: { type: "string", storageKey: "0IYePyRjtDYx" },
    content: { type: "richText", storageKey: "t7Z5-sGlyIrR" },
    recipientPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "m7ICBPEjVYd3",
    },
  },
};
