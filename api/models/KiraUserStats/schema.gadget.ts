import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserStats" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "eImas_skswE4",
  fields: {
    count_dropTime: { type: "number", storageKey: "1BNnq5xMcbZd" },
    do_avenger: { type: "number", storageKey: "iHsR6rR52kGj" },
    do_counter: { type: "number", storageKey: "NAMH8Sdd2MP-" },
    do_gift: { type: "number", storageKey: "SJEfROvAayyW" },
    do_hit: { type: "number", storageKey: "4Dm5OSvFPNSB" },
    do_kill: { type: "number", storageKey: "zHeIEuJsJI3x" },
    do_outerTime: { type: "number", storageKey: "B7kY1TDBcI2m" },
    do_try: { type: "number", storageKey: "-IHJS3dZcG1h" },
    ever_apple: { type: "number", storageKey: "mueABtRLk2rY" },
    ever_bookBuy: { type: "number", storageKey: "IsTzH3mWM0Tp" },
    ever_bookFirst: { type: "number", storageKey: "u0u9Zfy3zBZK" },
    ever_itemBuy: { type: "number", storageKey: "ClLNszDKlSZ8" },
    ever_penBroken: { type: "number", storageKey: "J6vGq6M7qHth" },
    ever_penBuy: { type: "number", storageKey: "dfXHraC_-WoJ" },
    ever_penEmpty: { type: "number", storageKey: "phf6TvEdMRzm" },
    ever_test: { type: "number", storageKey: "1qzux-ugEPd0" },
    game_coinPlay: { type: "number", storageKey: "sVljNWfruivH" },
    game_coinWin: { type: "number", storageKey: "MnFcyFmgn6Q5" },
    help_state: { type: "number", storageKey: "7Kn0WmEF8f2-" },
    help_update: { type: "number", storageKey: "H3wDnsMCLjx5" },
    is_avenged: { type: "number", storageKey: "oeWqhkzbWJC_" },
    is_countered: { type: "number", storageKey: "UDrQ1whz-zen" },
    is_gift: { type: "number", storageKey: "G2f3Ch_fL28A" },
    is_hited: { type: "number", storageKey: "r4FMf016tCAO" },
    is_killed: { type: "number", storageKey: "w4qjjsIgp6jN" },
    is_outedTime: { type: "number", storageKey: "OcXB5H52KnEk" },
    is_tried: { type: "number", storageKey: "AJjNLP5o-rcG" },
    main_aliveSinceUnix: {
      type: "number",
      storageKey: "ur8HUrYd1Mic",
    },
    misc_know: { type: "number", storageKey: "0_xXqRPWDLjY" },
    misc_match: { type: "number", storageKey: "xnOBXeUaGutL" },
    misc_trickFake: { type: "number", storageKey: "AFRcvv-44MMR" },
    streak_appleDay: { type: "number", storageKey: "EPnR1n-P3hCd" },
    streak_killDay: { type: "number", storageKey: "I5tCeWryk-UW" },
    streak_pageFilled: { type: "number", storageKey: "1BOv7cNjsgwu" },
    userId: { type: "string", storageKey: "LQwQf84POQ71" },
    userPtr: {
      type: "belongsTo",
      parent: { model: "KiraUsers" },
      storageKey: "dKlK6D2quhzM",
    },
  },
};
