import { api } from "gadget-server";
import { items_info } from "../item";
import { penState } from "../../enum";

export const pen_filters = {//ANSI color code block
  red: (text) => `[2;31m${text}[0m`,
  blue: (text) => `[2;34m${text}[0m`,
  green: (text) => `[2;32m${text}[0m`,
  purple: (text) => `[2;35m${text}[0m`,
  high_white: (text) => `[30;47m${text}[0m`,
}


export async function pen_use(userdata, penItem)
{
  const firstUse = (!penItem.meta.use);
  if (firstUse) penItem.meta.use=0;
  penItem.meta.use += 1;
  //penItem.meta.dura = items_info[penItem.itemName].atr.empty_durability - penItem.meta.use;//no more needed
  const empty_durability = items_info[penItem.itemName].atr.empty_durability;
  const broken_chance = items_info[penItem.itemName].atr.broken_chance;
  if (empty_durability && penItem.meta.use >= empty_durability)
  {//empty
    const newItemName=items_info[penItem.itemName].atr.empty_item;
    if (newItemName)
    {
      penItem.meta.oldName = penItem.itemName;
      await penItem.unequip(userdata);
      await penItem.change(newItemName, penItem.meta);
    } else {
      await penItem.delete(userdata);
    }
    return penState.EMPTY;
  }
  else if (broken_chance && !firstUse && Math.random()<broken_chance)
  {//break
    const newItemName=items_info[penItem.itemName].atr.broken_item;
    if (newItemName)
    {
      penItem.meta.oldName = penItem.itemName;
      await penItem.unequip(userdata);
      await penItem.change(newItemName, penItem.meta);
    } else {
      await penItem.delete(userdata);
      penItem = null;
    }
    return penState.BROKEN;
  } else {//good
    await api.KiraItems.update(penItem.id, {meta: penItem.meta});
    return penState.FINE;
  }
}

export function pen_apply_filters(text, penType)
{
  for (let filterKey of items_info[penType].atr.filters)
  {
    text=pen_filters[filterKey](text);
  }
  return text;
}

