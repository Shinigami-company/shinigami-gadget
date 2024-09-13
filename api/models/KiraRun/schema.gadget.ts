import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraRun" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "upJTyb4MNXrN",
  fields: {
    attackerId: {
      type: "string",
      validations: { required: true },
      storageKey: "hDx9NBX4GR97::X-9Jnn2thTEt",
    },
    counterCombo: {
      type: "number",
      default: -3,
      storageKey: "60N9OcWZRp4T",
    },
    executePack: {
      type: "json",
      storageKey: "yhftWCjhKxjK::UkXqCYwCyVbp",
    },
    finalDate: {
      type: "dateTime",
      includeTime: true,
      storageKey: "Nj4WFHVLaXhU::WM9On9480UaE",
    },
    knowPack: { type: "json", storageKey: "FwuBNudU9VuJ" },
    victimDataId: { type: "string", storageKey: "leEfx3QY9xMV" },
    victimId: {
      type: "string",
      validations: { required: true },
      storageKey: "uOn6aSRybmyU::IkrM8HzC9_zr",
    },
  },
};
