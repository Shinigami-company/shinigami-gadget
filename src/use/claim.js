import { translate } from "../lang";
import { kira_item_create, kira_item_find, items_info } from "./item";


export async function kira_item_event_claim(userdata, user, itemId, lang) {
  if (await kira_item_find(userdata.id, itemId))
  {//already an egg
    return "";
  }

  const dolarValues={ userdata, user };

  let loreTxt = undefined;
  let loreArray = [];
  if (items_info[itemId].message_lore)
  {
    for (let fullKey of items_info[itemId].dolarsPath)
    {
      const path = fullKey.split(".");
      let getting = dolarValues;

      for (let p of path) {
        getting = getting?.[p];
      }
      loreArray.push(getting);
    }
    loreTxt = translate(lang, "item."+itemId+".lore", dolarValues);
  }

  await kira_item_create(userdata.id, itemId, loreTxt, loreArray);
  return (items_info[itemId].message_claim) 
  ? translate(lang, "item."+itemId+".claim", dolarValues)+"\n"
  : "";
}