import { api } from "gadget-server";

export const items_info = {
  event_egg_2025: {
    message_claim: true,
    message_lore: true,
    dolarsPath: [
      "user.id",
      "user.username"
    ]
  }
}

export async function kira_item_create(userdataId, itemId, itemLoreTxt, itemLoreArray) {
  return await api.KiraItems.create({
    ownerPtr: {
      _link: userdataId,
    },
    itemId,
    itemLoreTxt: {markdown: itemLoreTxt},
    itemLoreArray
  });
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

export async function kira_item_find(userdataId, itemId) {
  return await api.KiraItems.maybeFindFirst({
    filter: {
      ownerPtr: {
        equals: userdataId,
      },
      itemId: (itemId) ? {equals: itemId} : undefined
    }
  });
}