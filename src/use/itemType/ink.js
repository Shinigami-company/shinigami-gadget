import { api } from "gadget-server";
import { items_info } from "../item";
import { itemType, usedState } from "../../enum";


export async function ink_use(userdata, inkItem)
{
  const firstUse = (!inkItem.meta.use);
  if (firstUse) inkItem.meta.use=0;
  inkItem.meta.use += 1;

  const empty_capacity = items_info[inkItem.itemName].dura.empty_capacity;
  if (empty_capacity && inkItem.meta.use >= empty_capacity)
  {//empty
    await inkItem.delete(userdata);
    return usedState.EMPTY;
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