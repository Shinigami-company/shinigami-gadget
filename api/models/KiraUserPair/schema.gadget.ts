import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserPair" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "UsXQqBlZgXkk",
  fields: {
    by_avenge_one: { type: "number", storageKey: "clY4LrKCRoGL" },
    by_avenge_two: { type: "number", storageKey: "OhvbvP_l1BVG" },
    by_counter_one: { type: "number", storageKey: "ohdChFo68FR5" },
    by_counter_two: { type: "number", storageKey: "TV9p_Gn7WZy7" },
    by_hit_one: { type: "number", storageKey: "AQzqD7EecIDW" },
    by_hit_two: { type: "number", storageKey: "vEptkN0gqhQZ" },
    userId_one: { type: "string", storageKey: "3cEW0E-Wcrge" },
    userId_two: { type: "string", storageKey: "8-m8xq1wwJT-" },
    userPtr_one: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "cOE6PJtTSm23",
    },
    userPtr_two: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "WMTNe22qHZzo",
    },
  },
};
