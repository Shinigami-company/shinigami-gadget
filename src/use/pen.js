import { api } from "gadget-server";
import { kira_item_create, kira_item_get } from "./item";
import { sett_emoji_pens } from "../sett";

export const pen_atr = {
  pen_black: {
    emoji: sett_emoji_pens.black,
    max_durability: 10,
    filters: [],
  },
  pen_blue: {
      emoji: sett_emoji_pens.blue,
      max_durability: 5,
      filters: ["blue"],
  },
  pen_green: {
      emoji: sett_emoji_pens.green,
      max_durability: 5,
      filters: ["green"],
  },
  pen_red: {
      emoji: sett_emoji_pens.red,
      max_durability: 5,
      filters: ["red"],
  },
  pen_purple: {
      emoji: sett_emoji_pens.purple,
      max_durability: 5,
      filters: ["purple"],
  },
  feather_white: {
      emoji: sett_emoji_pens.feather,
      max_durability: 3,
      filters: [],
      silent: true,
  }
}

export const pen_filters = {
  red: (text) => `[2;31m${text}[0m`,
  blue: (text) => `[2;34m${text}[0m`,
  green: (text) => `[2;32m${text}[0m`,
  purple: (text) => `[2;35m${text}[0m`,
}

export async function pen_create(userdataId, lang, penItemId)
{
  if (!pen_atr[penItemId]) throw Error(`the pen [${penItemId}] does not exist.`)
  return await kira_item_create(userdataId, lang, penItemId, {}, {durability: pen_atr[penItemId].max_durability}, false);
}

export async function pen_equip(userdataId, penItemId)
{
  await api.KiraUsers.update(userdataId,{equipedPen: {_link: penItemId}});
  //await api.KiraItems.update(penItemId, {ownerPtr: {_link: userdataId}});
}

export async function pen_get(userdataId, penItemId)
{
  let pen=await kira_item_get(userdataId, penItemId);
  if (!pen) return undefined;
  pen.atr=pen_atr[pen.itemId];
  return pen;
}

export async function pen_use(penItem)
{
  penItem.meta.durability-=1;
  if (penItem.meta.durability<=0)
  {
    await api.KiraItems.delete(penItem.id);
    return false;
  } else {
    await api.KiraItems.update(penItem.id, {meta: penItem.meta});
    return true;
  }
}

export function pen_apply_filters(text, penType)
{
  for (let filterKey of pen_atr[penType].filters)
  {
    text=pen_filters[filterKey](text);
  }
  return text;
}