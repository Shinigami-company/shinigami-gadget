import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserAchiv" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "LAh9i2LlL1o3",
  fields: {
    done_counterMax: { type: "number", storageKey: "SazWQFr9BA9J" },
    done_murdersOn: { type: "number", storageKey: "sFgvupAv1nja" },
    done_outer23d: { type: "number", storageKey: "zHzmUbljK8-Z" },
    done_test1: {
      type: "number",
      default: 0,
      storageKey: "TMxqggYdUD2l",
    },
    level_appleStreak: { type: "number", storageKey: "kvrTXv7E0_8W" },
    level_counter: { type: "number", storageKey: "1TygINI1K0Wx" },
    level_kill: { type: "number", storageKey: "C2LK2FkrNIfD" },
    level_killKiller: { type: "number", storageKey: "V19WHtlTcAJl" },
    level_outerTime: { type: "number", storageKey: "L0BCxHZN5Kqx" },
    level_test2: {
      type: "number",
      default: 0,
      storageKey: "-KyrrpjDsO8V",
    },
    level_writtenPage: { type: "number", storageKey: "Xr65Saii09qs" },
    userId: { type: "string", storageKey: "zY03WKPyvCHu" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "goVP3wMA1Pv0",
    },
  },
};
