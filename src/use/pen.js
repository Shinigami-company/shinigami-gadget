import { api } from "gadget-server";
import { kira_item_create, kira_item_get, kira_item_unequip } from "./item";

export const pen_atr = {
  pen_black: {
    max_durability: 10,
    filters: [],
    broke_item: "broken_pen",
  },
  pen_blue: {
    max_durability: 5,
    filters: ["blue"],
    broke_item: "broken_pen",
  },
  pen_green: {
    max_durability: 5,
    filters: ["green"],
    broke_item: "broken_pen",
  },
  pen_red: {
    max_durability: 5,
    filters: ["red"],
    broke_item: "broken_pen",
  },
  pen_purple: {
    max_durability: 5,
    filters: ["purple"],
    broke_item: "broken_pen",
  },
  feather_white: {
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

export async function pen_create(userdataId, lang, penName)
{
  if (!pen_atr[penName]) throw Error(`the pen [${penName}] does not exist.`)
  return await kira_item_create(userdataId, lang, penName, {}, {durability: pen_atr[penName].max_durability}, false);
}

export async function pen_equip(userdataId, penName)
{
  await api.KiraUsers.update(userdataId, {equipedPen: {_link: penName}});
  //await api.KiraItems.update(penName, {ownerPtr: {_link: userdataId}});
}

export async function pen_get(userdataId, penName)
{
  let pen=await kira_item_get(userdataId, penName);
  if (!pen) return undefined;
  pen.atr=pen_atr[pen.itemName];
  return pen;
}

export async function pen_use(userdata, penItem)
{
  penItem.meta.durability-=1;
  if (penItem.meta.durability<=0)
  {
    const broke_item=pen_atr[penItem.itemName].broke_item;
    if (broke_item)
    {
      penItem.meta.oldName = penItem.itemName;
      await kira_item_unequip(userdata, penItem.id);
      await api.KiraItems.update(penItem.id, {meta: penItem.meta, itemName: broke_item});
    } else {
      await api.KiraItems.delete(penItem.id);
    }
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