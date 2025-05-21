import { api } from "gadget-server";
import { kira_item_create, kira_item_get } from "./item";
import { sett_emoji_pens } from "../sett";

export const pen_atr = {
  pen_black: {
    emoji: sett_emoji_pens.black,
    max_durability: 10,
    filters: [],
  },
  pen_red: {
      emoji: sett_emoji_pens.red,
      max_durability: 5,
      filters: ["red"],
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
}

export async function pen_create(userdataId, lang, penItemId)
{
  return await kira_item_create(userdataId, lang, penItemId, {}, {durability: pen_atr[penItemId].max_durability}, false);
}

export async function pen_equip(userdataId, penItemId)
{
  console.log("bfr:",await kira_item_get(userdataId, penItemId), await api.KiraUsers.maybeFindFirst({filter:{id:{equals: userdataId}}}));
  console.log(userdataId,{equipedPen: {_relink: {id: penItemId}}});
  await api.KiraUsers.update(userdataId,{equipedPen: {_link: penItemId}});
  //await api.KiraItems.update(penItemId, {ownerPtr: {_link: userdataId}});
  console.log("afr:",await kira_item_get(userdataId, penItemId), await api.KiraUsers.maybeFindFirst({filter:{id:{equals: userdataId}}}));
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