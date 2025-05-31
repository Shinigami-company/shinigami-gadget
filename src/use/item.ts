import { equal } from "assert";
import { api } from "gadget-server";
import { itemType } from "../enum";
import { translate } from "../lang";
import { sett_emoji_pens, sett_emoji_objects } from "../sett";
import { kira_apple_send } from "./apple";

export const items_info = {
  event_egg_2025: {
    type: itemType.COLLECTOR,
    emoji: sett_emoji_objects.event_egg_2025,
    message_claim: true,
    lore_static: true,
    dolarsPath: [
      "user.id",
      "user.username"
    ],
    shopData: {
      proba: 1,
      price: 1000,
    }
  },


  pen_black: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.black,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
    shopData: {
      proba: 10,
      price_min: 3,
      price_max: 5,
    }
  },
  
  pen_blue: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.blue,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
    shopData: {
      proba: 5,
      price_min: 3,
      price_max: 5,
    }
  },
  
  pen_green: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.green,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
    shopData: {
      proba: 2.5,
      price_min: 10,
      price_max: 15,
    }
  },

  pen_red: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.red,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
    shopData: {
      proba: 2.5,
      price_min: 10,
      price_max: 15,
    }
  },
  
  pen_purple: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.purple,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
    shopData: {
      proba: 2.5,
      price_min: 10,
      price_max: 15,
    }
  },
  
  feather_white: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.feather,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
  },
  
  broken_pen: {
    type: itemType.JUNK,
    emoji: sett_emoji_pens.broken,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
  },
  empty_pen: {
    type: itemType.JUNK,
    emoji: sett_emoji_pens.empty,
    message_claim: false,
    lore_static: true,
    lore_dynamic: true,
  },
}


function copyAttrs(source: any, target: Item) {
  const keys = Object.keys(target); // Get all property keys defined in the class
  keys.forEach(key => {
    if (key in source) {
      target[key] = source[key];
    }
  });
}

export class Item {
  
  // GET
  id : string;
  //updatedAt : string;
  //createdAt : string;
  itemName : string;

  ownerPtrId;

  itemLoreTxt;
  itemLoreDict;
  
  meta;

  itemClaimTxt;// special add
  info;// special add

  constructor(itemDbObj: any) {
    if (!itemDbObj) return;
    copyAttrs(itemDbObj, this);
    //console.log("CONSTRUCT ITEM:", itemDbObj, this)
    this.info = items_info[this.itemName];
  }

  async refresh() {
    let itemDbObj=api.KiraItems.findById(this.id);
    copyAttrs(itemDbObj, this);
    this.info = items_info[this.itemName];
  }

  static async create(userdataId, lang, itemName, dolarValues = {}, metaDataValues = {})
  {
    // create item lore
    let itemLoreTxt = undefined;
    let itemLoreDict = {};
    if (items_info[itemName].lore_static)
    {
      if (items_info[itemName].dolarsPath)
      {
        for (let fullKey of items_info[itemName].dolarsPath)
        {
          const path = fullKey.split(".");
          let getting = dolarValues;

          for (let p of path) {
            getting = getting?.[p];
          }
          itemLoreDict[fullKey]=getting;
        }
      }
      itemLoreTxt = translate(lang, "item."+itemName+".lore", dolarValues);
    }

    // create item obj
    const itemDbObj = await api.KiraItems.create({
      ownerPtr: {
        _link: userdataId,
      },
      itemName,
      itemLoreTxt: {markdown: itemLoreTxt},
      itemLoreDict,
      meta: metaDataValues
    });
    let item = new Item(itemDbObj);
    
    // claim message
    if (items_info[itemName].message_claim) 
    {
      item.itemClaimTxt = translate(lang, "item."+itemName+".claim", dolarValues);
    }
    return item;
  }
  
  static async inventory_ids(userdataId) {
    return await api.KiraItems.findMany({
      filter: {
        ownerPtr: {
          equals: userdataId,
        },
      },
      select: {
        id: true,
        itemName: true,
      }
    });
  }

  static async inventory_find_one(userdataId, itemName) {
    return new Item(await api.KiraItems.maybeFindFirst({
      filter: {
        ownerPtr: {
          equals: userdataId,
        },
        itemName: (itemName) ? {equals: itemName} : undefined
      }
    }));
  }

  static async get(userdataId, itemId) {
    return new Item(await api.KiraItems.maybeFindFirst({
      filter: {
        ownerPtr: {
          equals: userdataId,
        },
        id: {equals: itemId}
      }
    }));
  }

  // DELETE
  async delete(userdataId) {
    if (!await this.if_own(userdataId)) return false;
    await api.KiraItems.delete(this.id);
    //del this;
    return true;
  }

  async unequip(userdata)
  {
    // pen
    if ((userdata.equipedPen.id.toString())===(this.id.toString()))
    {
      await api.KiraUsers.update(userdata.id, {equipedPen: {_link: null}});
    }
    return true;
  }

  // SET
  async change(itemName: string, meta: {})
  {
    await api.KiraItems.update(this.id, {meta, itemName});
  }
  
  // IF
  async if_own(userdataId) {
    return ((this.ownerPtrId.toString()) == (userdataId.toString()));
  }

  // INFOS
  get_title(lang, withEmoji=true)
  {
    return Item.static_title(this.itemName, lang, withEmoji);
  };
  
  static static_title(itemName, lang, withEmoji)
  {
    return ((withEmoji)
      ? `<:${items_info[itemName].emoji.name}:${items_info[itemName].emoji.id}> `
      : '')
    + translate(lang, "item."+itemName+".title");
  }

  get_lore(lang) {
    return this.itemLoreTxt.markdown;
  }

  // GIFT
  async gift_send(userdataOwner, usernameOwner, userIdRecipient) {
    if (!await this.if_own(userdataOwner.id)) return false;
    
    await this.unequip(userdataOwner);
    //await api.KiraUsers.update(itemId, {myItems: {_unlink:[{id: userdataIdOwner}]}});//not this way
    await api.KiraItems.update(this.id, {ownerPtr: {_link:null}});
    this.ownerPtrId = null;
    
    return await api.KiraItemGift.create({itemPtr: {_link: this.id}, userIdOwner: userdataOwner.userId, usernameOwner, userIdRecipient});
  }

  static async gift_apples(appleAmount, userdataOwner, usernameOwner, userIdRecipient) {
    //await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, "gift.send."+(userIdRecipient) ? "one" : "everyone", {gifted: });//got lazy
    await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, "gift.send.everyone");
    return await api.KiraItemGift.create({appleAmount, userIdOwner: userdataOwner.userId, usernameOwner, userIdRecipient});
  }


  static async gift_get(giftId) {
    return await api.KiraItemGift.maybeFindFirst({filter: {id: {equals: giftId}}});
  }

  static async gift_pick(gift, userdata) {
    await api.KiraItemGift.delete(gift.id);
    if (gift.appleAmount)
    {
      return await kira_apple_send(userdata.id, gift.appleAmount, userdata.statPtr.id, "gift.recive", {"gifter": gift.usernameOwner});
    } else {
      return await api.KiraItems.update(gift.itemPtrId, {ownerPtr: {_link: userdata.id}});
    }
  }
}