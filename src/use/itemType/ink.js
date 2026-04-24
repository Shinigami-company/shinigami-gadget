import { api } from "gadget-server";
import { items_info } from "../item";
import { usedState } from "../../enum";


export async function ink_use(userdata, inkItem)
{
  const firstUse = (!inkItem.meta.use);
  if (firstUse) inkItem.meta.use=0;
  inkItem.meta.use += 1;
  //penItem.meta.dura = items_info[penItem.itemName].dura.empty_durability - penItem.meta.use;//no more needed
  const empty_durability = items_info[inkItem.itemName].dura.empty_durability;
  const broken_chance = items_info[inkItem.itemName].dura.broken_chance;
  if (empty_durability && inkItem.meta.use >= empty_durability)
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

