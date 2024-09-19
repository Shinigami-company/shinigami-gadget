import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserStats" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "eImas_skswE4",
  fields: {
    userId: { type: "string", storageKey: "LQwQf84POQ71" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "dKlK6D2quhzM",
    },
  },
};
