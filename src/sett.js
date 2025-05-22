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

export const sett_options_gift_apples = [
  (apple) => 1,
  (apple) => 2,
  (apple) => 5,
  (apple) => 10,
  (apple) => 20,
  (apple) => 100,
  (apple) => 200,
  (apple) => 500,
  (apple) => 1000,
  (apple) => Math.ceil(Math.log10(apple)),
  (apple) => Math.ceil(apple/4),
  (apple) => Math.ceil(apple/2),
  (apple) => apple,
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
export const sett_emoji_coin_throw = {
  id: null,
  name: "🪙", //coin
};

export const sett_emoji_pens = {
  black: {
    name: "pen_black",
    id: "1374354563032940627",
  },
  blue: {
    name: "pen_blue",
    id: "1374353917768503326",
  },
  red: {
    name: "pen_red",
    id: "1374353922298351738",
  },
  green: {
    name: "pen_green",
    id: "1374353919786094683",
  },
  purple: {
    name: "pen_purple",
    id: "1374590353109422141",
  },
  feather: {
    name: "feather_white",
    id: "1374353915675545770",
  }
};


export const sett_emoji_objects = {
  event_egg_2025: {
    name: "weirdegg",
    id: "1363686307955740864",
  },
}

//--commands--
const dailyAmount = 1;
const dailyStreakReward = [
  {day:3,apple:1},
  //{day:7,apple:2},
];

function avangerAppleReward(killsOfVictim) {
  return parseInt(killsOfVictim ** 0.5); //squareroot
}
const counterMax = 13;

const noSuscide = false;
const comebackBy = {
  time: {
    //comeback automaticly after the time
    other: { if: false, message: false },
    suicide: { if: true, message: true },
  },
  check: {
    //comeback when victim do something
    self: { if: true, message: false }, //just, dont disable that.
  },
};
const cancelWhenDeadAttacker = true;
const cancelWhenDeadVictim = true;

const maxLines = 10;
const maxPages = 70;

const couldown = 60 * 10; //10 minutes

export const SETT_CMD = {
  apple: {
    dailyAmount,
    avangerAppleReward,
    dailyStreakReward,
  },
  kira: {
    counterMax,
    noSuscide,
    comebackBy,
    cancelWhenDeadAttacker,
    cancelWhenDeadVictim,
  },
  see: {
    maxLines,
    maxPages,
  },
  feedback: {
    couldown,
  },
};
