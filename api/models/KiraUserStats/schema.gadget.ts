import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserStats" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "eImas_skswE4",
  fields: {
    do_counter: {
      type: "number",
      default: 0,
      storageKey: "NAMH8Sdd2MP-",
    },
    do_hit: {
      type: "number",
      default: 0,
      storageKey: "4Dm5OSvFPNSB",
    },
    do_kill: {
      type: "number",
      default: 0,
      storageKey: "zHeIEuJsJI3x",
    },
    do_outerTime: {
      type: "number",
      default: 0,
      storageKey: "B7kY1TDBcI2m",
    },
    do_try: {
      type: "number",
      default: 0,
      storageKey: "-IHJS3dZcG1h",
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
    ever_test: {
      type: "number",
      default: 0,
      storageKey: "1qzux-ugEPd0",
    },
    is_countered: {
      type: "number",
      default: 0,
      storageKey: "UDrQ1whz-zen",
    },
    is_hited: {
      type: "number",
      default: 0,
      storageKey: "r4FMf016tCAO",
    },
    is_killed: {
      type: "number",
      default: 0,
      storageKey: "w4qjjsIgp6jN",
    },
    is_outedTime: {
      type: "number",
      default: 0,
      storageKey: "OcXB5H52KnEk",
    },
    is_tried: {
      type: "number",
      default: 0,
      storageKey: "AJjNLP5o-rcG",
    },
    misc_match: {
      type: "number",
      default: 0,
      storageKey: "xnOBXeUaGutL",
    },
    streak_appleDay: {
      type: "number",
      default: 0,
      storageKey: "EPnR1n-P3hCd",
    },
    streak_pageGreat: {
      type: "number",
      default: 0,
      storageKey: "1BOv7cNjsgwu",
    },
    userId: { type: "string", storageKey: "LQwQf84POQ71" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "dKlK6D2quhzM",
    },
  },
};
