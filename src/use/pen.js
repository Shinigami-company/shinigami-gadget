import { api } from "gadget-server";
import { kira_item_create, kira_item_find } from "./item";
import { sett_emoji_pens } from "../sett";

export const pen_atr = {
  pen_black: {
    filters: [],
    emoji: sett_emoji_pens.black,
    max_durability: 10,
  },
  pen_red: {
      filters: ["red"],
      emoji: sett_emoji_pens.red,
      max_durability: 5,
  },
  feather_white: {
      filters: [],
      silent: true,
      emoji: sett_emoji_pens.white,
      max_durability: 3,
  }
}

export async function pen_create(userdataId, penItemId)
{
  await kira_item_create(userdataId, penItemId, {}, {durability: pen_atr[penItemId].max_durability});
}

export async function pen_equip(userdataId, penItemId)
{
  await api.KiraUsers.update(userdataId, {equipedPen: {link: penItemId}});
}

export async function pen_get(penItemId)
{
  let pen=await kira_item_find(penItemId);
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