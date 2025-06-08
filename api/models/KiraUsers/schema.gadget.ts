import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUsers" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "oi3a16gtOqDz",
  fields: {
    achivPtr: {
      type: "hasOne",
      child: { model: "KiraUserAchiv", belongsToField: "userPtr" },
      storageKey: "RR3W8scCkFes",
    },
    apples: {
      type: "number",
      default: 0,
      storageKey: "cRSWRWfoSnT4::Serk2cVDT56V",
    },
    apples_claim: {
      type: "json",
      default: [],
      storageKey: "-49EQE-If398::bR8rmUya8U7E",
    },
    apples_daily: {
      type: "dateTime",
      includeTime: true,
      default: "1999-01-01T00:00:00.000Z",
      storageKey: "IaxgtPrWKgRh::XwmWJz71-4cN",
    },
    backDate: {
      type: "dateTime",
      includeTime: true,
      storageKey: "SVqHycqERVsV::rt4ai8i955t_",
    },
    banTime: {
      type: "dateTime",
      includeTime: true,
      storageKey: "mEHu8wCFxIeg",
    },
    banValue: { type: "number", storageKey: "olZPOzgP4MKN" },
    deathDate: {
      type: "dateTime",
      includeTime: true,
      storageKey: "bRmM-ugIUS1a::_hVDoSZAH3eF",
    },
    dmDate: {
      type: "dateTime",
      includeTime: true,
      storageKey: "XBySdkFWJxOn",
    },
    dmId: { type: "string", storageKey: "IaMZi7dVthSt" },
    equipedBag: {
      type: "belongsTo",
      parent: { model: "KiraItems" },
      storageKey: "bG5FE6CIlvsS",
    },
    equipedBook: {
      type: "belongsTo",
      parent: { model: "KiraItems" },
      storageKey: "5QEZtdKyrjy7",
    },
    equipedPen: {
      type: "belongsTo",
      parent: { model: "KiraItems" },
      storageKey: "9s6W1pikaoS_",
    },
    feedbackCooldown: {
      type: "dateTime",
      includeTime: true,
      storageKey: "hXop9CipHCSE",
    },
    feedbackState: { type: "number", storageKey: "-_20nZrG8UzT" },
    giveUp: {
      type: "dateTime",
      includeTime: true,
      storageKey: "LPUuSjFVw9Qh",
    },
    is_alive: {
      type: "boolean",
      default: true,
      storageKey: "ezZ-TPn6Cv7v::-sBGQyASAlZe",
    },
    is_god: {
      type: "boolean",
      default: false,
      storageKey: "lx7fjOHlG4_e::7QkcSAaYuiF8",
    },
    lang: {
      type: "string",
      storageKey: "7EStxtlMHvj5::U-rrIFAWCanl",
    },
    mailboxLettersPtr: {
      type: "hasMany",
      children: {
        model: "KiraLetters",
        belongsToField: "recipientPtr",
      },
      storageKey: "7Pdoi1AWdxD7",
    },
    myItems: {
      type: "hasMany",
      children: { model: "KiraItems", belongsToField: "ownerPtr" },
      storageKey: "vi7llGudt-WW",
    },
    nameLast: {
      type: "string",
      storageKey: "CL9fpep-2-Wu::GAflb5wTYZID",
    },
    nameNick: {
      type: "string",
      storageKey: "Q4WdeabGduWM::eQBV4LuIRPFu",
    },
    nameReal: {
      type: "string",
      storageKey: "talKrltdWT_C::DmyRhXFBFJYQ",
    },
    noteBook: {
      type: "belongsTo",
      parent: { model: "KiraBooks" },
      storageKey: "-HzuHqzEaIWT",
    },
    ownedBooksPtr: {
      type: "hasMany",
      children: { model: "KiraBooks", belongsToField: "owner" },
      storageKey: "EArr0Ke5jyl_",
    },
    pairsPtr: {
      type: "hasMany",
      children: {
        model: "KiraUserPair",
        belongsToField: "userPtr_two",
      },
      storageKey: "Kj8rEbQNOmvL",
    },
    shopAlready: {
      type: "json",
      default: [],
      storageKey: "FiIz_833esLK",
    },
    statPtr: {
      type: "hasOne",
      child: { model: "KiraUserStats", belongsToField: "userPtr" },
      storageKey: "vver91mvgQ50",
    },
    userId: {
      type: "string",
      storageKey: "04zNJTwrlf0Z::koCfbDR4Qxvo",
    },
    userName: { type: "string", storageKey: "86u085r2lfQA" },
  },
};
