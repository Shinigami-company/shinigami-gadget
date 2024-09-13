import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "KiraUsers" model, go to https://shinigami.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "oi3a16gtOqDz",
  fields: {
    achievements: {
      type: "json",
      storageKey: "xwo1onpC7DuG::iar1JPeY3FTM",
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
    bookPtr: {
      type: "hasOne",
      child: { model: "KiraBooks", belongsToField: "ownerPtr" },
      storageKey: "EArr0Ke5jyl_::6O8gs-HKWqKg",
    },
    deathDate: {
      type: "dateTime",
      includeTime: true,
      storageKey: "bRmM-ugIUS1a::_hVDoSZAH3eF",
    },
    heads: {
      type: "number",
      default: 0,
      storageKey: "G6pQJoy1QYhM::VwDUNOV78ccf",
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
    kills: { type: "number", storageKey: "iWLmQPtoMtqH" },
    lang: {
      type: "string",
      storageKey: "7EStxtlMHvj5::U-rrIFAWCanl",
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
    stats: {
      type: "json",
      default: {},
      storageKey: "Z_qznoOqayeX::jqMjB6Km3Hj8",
    },
    userId: {
      type: "string",
      storageKey: "04zNJTwrlf0Z::koCfbDR4Qxvo",
    },
  },
};
