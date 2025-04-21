import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraItems" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ajFsJt-RW_nN",
  fields: {
    itemId: { type: "string", storageKey: "J3mHD1CwWgaL" },
    itemLoreArray: {
      type: "json",
      default: [],
      storageKey: "oyuOM_XoAOry",
    },
    itemLoreTxt: { type: "richText", storageKey: "BR9ljaH87ShH" },
    ownerPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "FaNqfJXG3B4a",
    },
  },
};
