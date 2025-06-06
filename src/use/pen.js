import { api } from "gadget-server";
import { Item } from "./item";

export const pen_atr = {
  pen_black: {
    filters: [],
    broken_item: "broken_pen",
    broken_chance: .1,
    empty_item: "empty_pen",
    empty_durability: 10,
  },
  pen_blue: {
    filters: ["blue"],
    broken_item: "broken_pen",
    broken_chance: .1,
    empty_item: "empty_pen",
    empty_durability: 5,
  },
  pen_green: {
    filters: ["green"],
    broken_item: "broken_pen",
    broken_chance: .1,
    empty_item: "empty_pen",
    empty_durability: 5,
  },
  pen_red: {
    filters: ["red"],
    broken_item: "broken_pen",
    broken_chance: .1,
    empty_item: "empty_pen",
    empty_durability: 5,
  },
  pen_purple: {
    filters: ["purple"],
    broken_item: "broken_pen",
    broken_chance: .1,
    empty_item: "empty_pen",
    empty_durability: 5,
  },
  feather_white: {
    filters: [],
    silent: true,
    broken_chance: 0,//no item : will delete
    empty_durability: 3,//no item : will delete
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
  return await Item.create(userdataId, lang, penName, {}, {use: 0});
}

export async function pen_equip(userdataId, penName)
{
  await api.KiraUsers.update(userdataId, {equipedPen: {_link: penName}});
  //await api.KiraItems.update(penName, {ownerPtr: {_link: userdataId}});
}

export async function pen_get(userdataId, penId)
{
  let pen = await Item.get(userdataId, penId);
  if (!pen) return undefined;
  pen.atr=pen_atr[pen.itemName];
  return pen;
}

export async function pen_use(userdata, penItem)
{
  penItem.meta.use+=1;
  //penItem.meta.dura = pen_atr[penItem.itemName].empty_durability - penItem.meta.use;//no more needed
  const empty_durability = pen_atr[penItem.itemName].empty_durability;
  const broken_chance = pen_atr[penItem.itemName].broken_chance;
  if (empty_durability && penItem.meta.use >= empty_durability)
  {//empty
    const newItemName=pen_atr[penItem.itemName].empty_item;
    if (newItemName)
    {
      penItem.meta.oldName = penItem.itemName;
      await penItem.unequip(userdata);
      await api.KiraItems.update(penItem.id, {meta: penItem.meta, itemName: newItemName});
    } else {
      await api.KiraItems.delete(penItem.id);
    }
    return -1;
  }
  else if (broken_chance && Math.random()<broken_chance)
  {//break
    const newItemName=pen_atr[penItem.itemName].broken_item;
    if (newItemName)
    {
      penItem.meta.oldName = penItem.itemName;
      await penItem.unequip(userdata);
      await penItem.change(newItemName, penItem.meta);
    } else {
      await penItem.delete();
      penItem = null;
    }
    return -2;
  } else {//good
    await api.KiraItems.update(penItem.id, {meta: penItem.meta});
    return 1;
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



export function flow_pen(deep) {
  let key = "items.pens.flow";
  let penItem = deep.item;
  let use = (penItem.meta?.use) ? penItem.meta.use : 0;
  let dura = pen_atr[penItem.itemName].empty_durability - use;
  let dolar = { dura };
  return { key, dolar };
}