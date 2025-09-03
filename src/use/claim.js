import { translate } from "../lang";
import { Item } from "./item";


export async function event_claim_item(userdata, user, itemName, lang) {
  if (await Item.inventory_find_one(userdata.id, itemName))
  {//already an egg
    return "";
  }

  const dolarValues = { userdata, user };

  return await Item.create(userdata.id, lang, itemName, dolarValues)?.itemClaimTxt;
}