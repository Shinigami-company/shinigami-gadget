import { translate } from "../lang";
import { kira_item_create, kira_item_find, items_info } from "./item";


export async function kira_item_event_claim(userdata, user, itemId, lang) {
  if (await kira_item_find(userdata.id, itemId))
  {//already an egg
    return "";
  }

  const dolarValues = { userdata, user };

  return await kira_item_create(userdata.id, itemId, dolarValues);
}