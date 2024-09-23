import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserStats" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "eImas_skswE4",
  fields: {
    all_kill: {
      type: "number",
      default: 0,
      storageKey: "zHeIEuJsJI3x",
    },
    ever_apple: {
      type: "number",
      default: 0,
      storageKey: "mueABtRLk2rY",
    },
    ever_book: {
      type: "number",
      default: 0,
      storageKey: "u0u9Zfy3zBZK",
    },
    ever_deadTime: {
      type: "number",
      default: 0,
      storageKey: "OcXB5H52KnEk",
    },
    ever_death: {
      type: "number",
      default: 0,
      storageKey: "r4FMf016tCAO",
    },
    ever_test: {
      type: "number",
      default: 0,
      storageKey: "B7kY1TDBcI2m",
    },
    ever_test2: {
      type: "number",
      default: 0,
      storageKey: "1qzux-ugEPd0",
    },
    note_counter: {
      type: "number",
      default: 0,
      storageKey: "NAMH8Sdd2MP-",
    },
    note_hit: {
      type: "number",
      default: 0,
      storageKey: "4Dm5OSvFPNSB",
    },
    note_try: {
      type: "number",
      default: 0,
      storageKey: "-IHJS3dZcG1h",
    },
    userId: { type: "string", storageKey: "LQwQf84POQ71" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "dKlK6D2quhzM",
    },
  },
};
