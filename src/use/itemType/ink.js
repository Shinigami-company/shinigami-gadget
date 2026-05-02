import { api } from "gadget-server";
import { items_info } from "../item";
import { itemType, usedState } from "../../enum";


export async function ink_use(userdata, inkItem)
{
  const firstUse = (!inkItem.meta.use);
  if (firstUse) inkItem.meta.use=0;
  inkItem.meta.use += 1;
  //penItem.meta.dura = items_info[penItem.itemName].dura.empty_capacity - penItem.meta.use;//no more needed
  const empty_capacity = items_info[inkItem.itemName].dura.empty_capacity;
  const broken_chance = items_info[inkItem.itemName].dura.broken_chance;
  if (empty_capacity && inkItem.meta.use >= empty_capacity)
  {//empty
    const newItemName=items_info[inkItem.itemName].dura.empty_item;
    if (newItemName)
    {
      inkItem.meta.oldName = inkItem.itemName;
      //await inkItem.unequip(userdata);
      await inkItem.change(newItemName, inkItem.meta);
    } else {
      await inkItem.delete(userdata);
    }
    return usedState.EMPTY;
  }
  else if (broken_chance && !firstUse && Math.random()<broken_chance)
  {//break
    const newItemName=items_info[inkItem.itemName].dura.broken_item;
    if (newItemName)
    {
      inkItem.meta.oldName = inkItem.itemName;
      //await inkItem.unequip(userdata);
      await inkItem.change(newItemName, inkItem.meta);
    } else {
      await inkItem.delete(userdata);
      inkItem = null;
    }
    return usedState.BROKEN;
  } else {//good
    await api.KiraItems.update(inkItem.id, {meta: inkItem.meta});
    return usedState.FINE;
  }
}

export function ink_match(penItem, inkItem)
{
  // penItem can be minimal with atr
  let penName = penItem.itemName;
  let penMeta = penItem.meta;
  let penType = items_info[penName].type;
  let penPotentialName = penName;
  
  if (penType === itemType.JUNK)
  {
    if (penName != 'empty_pen') return false;
    penPotentialName = penMeta.oldName;// can be none and its normal
  } else if (penType === itemType.PEN)
  {
    if (!penMeta.use) return false;// never used
  } else return false;

  if (// true...
    penPotentialName === undefined ||// if broken_pen permissive
    items_info[penPotentialName].atr.ink_color === undefined ||// if has no ink color
    items_info[penPotentialName].atr.ink_color === items_info[inkItem.itemName].atr.ink_color// if good ink
    ) return true;
  return false;
}