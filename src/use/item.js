import { equal } from "assert";
import { api } from "gadget-server";
import { itemType } from "../enum";
import { translate } from "../lang";

export const items_info = {
  event_egg_2025: {
    type: itemType.COLLECTOR,
    message_claim: true,
    message_lore: true,
    dolarsPath: [
      "user.id",
      "user.username"
    ],
  },


  pen_black: {
    type: itemType.PEN,
    message_claim: false,
    message_lore: true,
  },

  pen_red: {
    type: itemType.PEN,
    message_claim: false,
    message_lore: true,
  },
  
  feather_white: {
    type: itemType.PEN,
    message_claim: false,
    message_lore: true,
  },
}

export async function kira_item_create(userdataId, lang, itemId, dolarValues = {}, metaDataValues = {}, returnClaimMsg=false) {

  let itemLoreTxt = undefined;
  let itemLoreDict = {};
  if (items_info[itemId].message_lore)
  {
    if (items_info[itemId].dolarsPath)
    {
      for (let fullKey of items_info[itemId].dolarsPath)
      {
        const path = fullKey.split(".");
        let getting = dolarValues;

        for (let p of path) {
          getting = getting?.[p];
        }
        itemLoreDict[fullKey]=getting;
      }
    }
    itemLoreTxt = translate(lang, "item."+itemId+".lore", dolarValues);
  }

  const pen=await api.KiraItems.create({
    ownerPtr: {
      _link: userdataId,
    },
    itemId,
    itemLoreTxt: {markdown: itemLoreTxt},
    itemLoreDict,
    meta: metaDataValues
  });
  
  return (returnClaimMsg) 
  ? (items_info[itemId].message_claim) 
    ? translate(lang, "item."+itemId+".claim", dolarValues)+"\n"
    : ""
  : pen;
}

export async function kira_items_find(userdataId, itemId) {
  return await api.KiraItems.findMany({
    filter: {
      ownerPtr: {
        equals: userdataId,
      },
      itemId: (itemId) ? {equals: itemId} : undefined
    }
  });
}

export async function kira_item_page(userdataId, page) {
  //! not woking
  return await api.KiraItems.findMany({
    filter: [{
      ownerPtr: {
        equals: userdataId,
      },
    },
    {
      indexLine: {
        equal: page,
      },
    }]
  });
}

// get by string id
export async function kira_item_find(userdataId, itemNameId) {
  return await api.KiraItems.maybeFindFirst({
    filter: {
      ownerPtr: {
        equals: userdataId,
      },
      itemId: (itemNameId) ? {equals: itemNameId} : undefined
    }
  });
}

// get by numeric id
export async function kira_item_get(userdataId, itemId) {
  return await api.KiraItems.maybeFindFirst({
    filter: {
      ownerPtr: {
        equals: userdataId,
      },
      id: {equals: itemId}
    }
  });
}