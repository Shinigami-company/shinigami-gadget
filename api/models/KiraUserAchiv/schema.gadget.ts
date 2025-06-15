import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUserAchiv" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "LAh9i2LlL1o3",
  fields: {
    done_booksDouble: { type: "number", storageKey: "scs3vJ72lMIO" },
    done_counterMax: { type: "number", storageKey: "KD5akNfwxXEy" },
    done_counterShort: { type: "number", storageKey: "ymPoh5WS76ci" },
    done_giftAway: { type: "number", storageKey: "8IIwE--QcbVc" },
    done_giftJunk: { type: "number", storageKey: "LvGsPbLNFT74" },
    done_giftSelf: { type: "number", storageKey: "zuzVk25eYZUM" },
    done_help: { type: "number", storageKey: "PHlIfyzqzVfW" },
    done_killDailyComeback: {
      type: "number",
      storageKey: "oCNto3mBnRsx",
    },
    done_killShini: { type: "number", storageKey: "SazWQFr9BA9J" },
    done_killU: { type: "number", storageKey: "zHzmUbljK8-Z" },
    done_murdersOn: { type: "number", storageKey: "NGUeqCB5WA9J" },
    done_onLeaderboard: {
      type: "number",
      storageKey: "8adKvUMuiExN",
    },
    done_outer23d: { type: "number", storageKey: "sFgvupAv1nja" },
    done_secretRule: { type: "number", storageKey: "DAyFzbNa3vNb" },
    done_shopEmpty: { type: "number", storageKey: "nX7e4MHreESb" },
    done_test1: {
      type: "number",
      default: 0,
      storageKey: "TMxqggYdUD2l",
    },
    level_avengeBest: { type: "number", storageKey: "V19WHtlTcAJl" },
    level_counter: { type: "number", storageKey: "1TygINI1K0Wx" },
    level_kill: { type: "number", storageKey: "C2LK2FkrNIfD" },
    level_killDailyStreak: {
      type: "number",
      storageKey: "kvrTXv7E0_8W",
    },
    level_outerTime: { type: "number", storageKey: "L0BCxHZN5Kqx" },
    level_penBreaker: { type: "number", storageKey: "XItCf_fG226g" },
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
