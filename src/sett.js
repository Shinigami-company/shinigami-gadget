//--- enums ---

import { KnowUsableBy } from "./enum.ts";

//--catalog--
export const sett_catalog_knows = {
  //lang :
  //"cmd.kira.start.mp.<for>.pay.<index>"
  //"cmd.know.get.<index>"
  who: {
    price: 1,
    for: KnowUsableBy.VICTIM,
  },
  where: {
    price: 3,
    for: KnowUsableBy.VICTIM,
  },
  fullwho: {
    //old victim
    price: 100,
    for: KnowUsableBy.NONE,
  },
  fullwhere: {
    //old victim
    price: 50,
    for: KnowUsableBy.NONE,
  },
  delmsg: {
    price: 2,
    for: KnowUsableBy.ATTACKER,
  },
};

export const sett_catalog_drops = [
  {
    price: 1,
    span: 600,
  },
  {
    price: 1,
    span: 3600,
  },
  {
    price: 2,
    span: 86400,
  },
  {
    price: 5,
    span: 86400 * 3,
  },
];

//--emoji--
export const sett_emoji_apple_croc = {
  name: "apple_croc",
  id: "1266010583623532574",
  animated: true,
};
export const sett_emoji_apple_none = {
  //from apples_emoji
  name: "apple_zero",
  id: "1255900070117773313",
  animated: true,
};
export const sett_emoji_burn_confirm = {
  id: null,
  name: "🔥",
};
export const sett_emoji_feedback_confirm = {
  id: null,
  name: "📨",
};

//--commands--
const dailyAmount = 1;

function avangerAppleReward(killsOfVictim) {
  return parseInt(killsOfVictim ** 0.5); //squareroot
}
const counterMax = 13;

const noSuscide = false;
const comebackBy = {
  time: {
    //comeback automaticly after the time
    other: { if: true, message: true },
    suicide: { if: true, message: true },
  },
  check: {
    //comeback when victim do something
    all: { if: true, message: true }, //just, dont disable that.
  },
};
const cancelWhenDeadAttacker = true;
const cancelWhenDeadVictim = true;

const maxLines = 10;
const maxPages = 70;

const mailboxWebhook = process.env.POSTHOOK;

export const SETT_CMD = {
  apple: {
    dailyAmount,
    avangerAppleReward
  },
  kira: {
    counterMax,
    noSuscide,
    comebackBy,
    cancelWhenDeadAttacker,
    cancelWhenDeadVictim
  },
  see: {
    maxLines,
    maxPages
  },
  feedback: {
    mailboxWebhook,
  }
}