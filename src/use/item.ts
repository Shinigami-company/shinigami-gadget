import { equal } from "assert";
import { api } from "gadget-server";
import { itemType } from "../enum";
import { translate } from "../lang";
import { sett_emoji_pens, sett_emoji_objects } from "../sett";
import { kira_apple_send } from "./apple";
import { book_colors } from "./kira";
import { flow_pen } from "./pen";


//flow is like a dynamic lore.
export const items_info = {
  event_egg_2025: {
    type: itemType.COLLECTOR,
    emoji: sett_emoji_objects.event_egg_2025,
    fields: {
      claim: true,
      lore: true,
      //flow: {
      //  default: true,
      //  key: "items.pens.flow",
      //  function: (deep) => {
      //      let key = "items.pens.flow";
      //      let dolar = {};
      //      return { key, dolar };
      //    },
      //}
    },
  },


  pen_black: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.black,
    fields: {
      claim: false,
      lore: true,
      flow: {
        function: flow_pen
      }
    },
    shopData: {
      proba: 10,
      price_min: 2,
      price_max: 4,
    }
  },
  
  pen_blue: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.blue,
    fields: {
      claim: false,
      lore: true,
      flow: {
        function: flow_pen
      }
    },
    shopData: {
      proba: 5,
      price_min: 3,
      price_max: 5,
    }
  },
  
  pen_green: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.green,
    fields: {
      claim: false,
      lore: true,
      flow: {
        function: flow_pen
      }
    },
    shopData: {
      proba: 2.5,
      price_min: 5,
      price_max: 10,
    }
  },

  pen_red: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.red,
    fields: {
      claim: false,
      lore: true,
      flow: {
        function: flow_pen
      }
    },
    shopData: {
      proba: 2.5,
      price_min: 5,
      price_max: 10,
    }
  },
  
  pen_purple: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.purple,
    fields: {
      claim: false,
      lore: true,
      flow: {
        function: flow_pen
      }
    },
    shopData: {
      proba: 2.5,
      price_min: 10,
      price_max: 15,
    }
  },
  
  feather_white: {
    type: itemType.PEN,
    emoji: sett_emoji_pens.feather,
    fields: {
      claim: false,
      lore: true,
      flow: {
        function: flow_pen
      }
    },
    shopData: {
      proba: 2.5,
      price_min: 10,
      price_max: 15,
    }
  },


  broken_pen: {
    type: itemType.JUNK,
    emoji: sett_emoji_pens.broken,
    fields: {
      claim: false,
      lore: true,
      flow: false
    },
    shopData: {
      proba: 1,
      price_min: 0,
      price_max: 1,
    }
  },

  empty_pen: {
    type: itemType.JUNK,
    emoji: sett_emoji_pens.empty,
    fields: {
      claim: false,
      lore: true,
      flow: false
    },
    shopData: {
      proba: 1,
      price_min: 0,
      price_max: 1,
    }
  },
  

  book_black: {
    type: itemType.BOOK,
    emoji: book_colors[0].emojiObj,
    fields: {
      claim: false,
      lore: true,
      flow: false
    },
    shopData: {
      proba: 1,
      price_min: 0,
      price_max: 1,
    }
  },
}




export const items_types = {
  [itemType.PEN]: {
    str: 'pen',

    equipable: true,
    equip : async (userdata, item) => {
      await api.KiraUsers.update(userdata.id, {equipedPen: {_link: item.id}});
    },
    unequip: async (userdata, item) : Promise<boolean> => {
      if (items_types[itemType.PEN]?.if_equiped(userdata, item))
      {
        await api.KiraUsers.update(userdata.id, {equipedPen: {_link: null}});
        return true;
      }
      return false;
    },
    if_equiped: (userdata, item) : boolean => {
      return ((userdata.equipedPen.id.toString())===(item.id.toString()));
    },
    get_equiped: async (userdata) : Promise<Item | undefined> => {
      if (!userdata.equipedPen?.id)
        return;
      return await Item.get(userdata.id, userdata.equipedPen.id);
    }
  },

  [itemType.BOOK]: {
    str: 'book',
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

function field_translation(lang: string, itemName: string, fieldKey: string, deep: {}) : undefined | string
{
  let field_object = items_info[itemName].fields[fieldKey];

  if (!field_object)
  {
    return;
  }
  
  if (field_object.key)
  {//key
    return translate(lang, field_object.key, deep);
  }
  
  if (field_object.function)
  {//function
    let result = field_object.function(deep);
    return translate(lang, result.key, result?.dolar);
  }

  //default key
  return translate(lang, `item.${itemName}.${fieldKey}`, deep);
}

export class Item {
  
  // GET
  id : string;
  //updatedAt : string;
  //createdAt : string;
  itemName : string;

  ownerPtrId;

  itemLoreTxt;
  
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
    let itemLoreTxt : string | undefined = field_translation(lang, itemName, "lore", dolarValues);

    // create item obj
    const itemDbObj = await api.KiraItems.create({
      ownerPtr: {
        _link: userdataId,
      },
      itemName,
      itemLoreTxt: {markdown: itemLoreTxt},
      meta: metaDataValues
    });
    let item = new Item(itemDbObj);
    
    // claim message
    item.itemClaimTxt = field_translation(lang, itemName, "claim", dolarValues);
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

  static async inventory_find_one(userdataId, itemName) {// return an empty Item if dont find
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

  // TYPE
  async unequip(userdata)
  {
    if (!items_types[this.info.type]?.equipable) return false;
    return await items_types[this.info.type].unequip(userdata, this);
  }

  async equip(userdata)
  {
    if (!items_types[this.info.type]?.equipable) return false;
    return await items_types[this.info.type].equip(userdata, this);
  }
  
  if_equiped(userdata) : boolean
  {
    if (!items_types[this.info.type]?.equipable) return false;
    return items_types[this.info.type].if_equiped(userdata, this);
  }
  
  static async get_equiped(userdata, itemType) : Promise<Item | boolean | undefined>
  {
    if (!items_types[itemType]?.equipable) return false;
    return await items_types[itemType].get_equiped(userdata);
  }

  // SET
  async change(itemName: string, meta: {} | undefined)
  {
    let change : {} = { itemName };
    if (meta!=undefined)
      change =  { itemName, meta };
    await api.KiraItems.update(this.id, change);
  }
  
  // IF
  async if_own(userdataId) {
    return ((this.ownerPtrId.toString()) == (userdataId.toString()));
  }

  // INFOS
  get_title(lang: string, withEmoji=true)
  {
    return Item.static_title(this.itemName, lang, withEmoji);
  };
  
  static static_title(itemName: string, lang: string, withEmoji=true)
  {
    return ((withEmoji)
      ? `<:${items_info[itemName].emoji.name}:${items_info[itemName].emoji.id}> `
      : '')
    + translate(lang, "item."+itemName+".title");
  }

  get_lore(lang: string, dolarValues={}) {
    let lore = "";
    //if (items_info[this.itemName].fields.lore)
    if (this.itemLoreTxt)
    {
      lore += this.itemLoreTxt.markdown;
    }
    if (items_info[this.itemName].fields.flow)
    {
      if (lore != "")
        lore += "\n";
      lore += field_translation(lang, this.itemName, 'flow', { item: this, ...dolarValues });
    }
    if (lore === "")
      lore += " ";
    return lore;
  }

  // GIFT
  async gift_send(userdataOwner, usernameOwner, expireTimestamp, userIdRecipient) {
    if (!await this.if_own(userdataOwner.id)) return false;
    
    await this.unequip(userdataOwner);
    //await api.KiraUsers.update(itemId, {myItems: {_unlink:[{id: userdataIdOwner}]}});//not this way
    await api.KiraItems.update(this.id, {ownerPtr: {_link:null}});
    this.ownerPtrId = null;
    
    return await api.KiraItemGift.create({itemPtr: {_link: this.id}, userIdOwner: userdataOwner.userId, usernameOwner, userIdRecipient, expireDate: expireTimestamp});
  }

  static async gift_apples(appleAmount, userdataOwner, usernameOwner, expireTimestamp, userIdRecipient) {
    //await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, "gift.send."+(userIdRecipient) ? "one" : "everyone", {gifted: });//got lazy
    await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, "gift.send.everyone");
    return await api.KiraItemGift.create({appleAmount, userIdOwner: userdataOwner.userId, usernameOwner, userIdRecipient, expireDate: expireTimestamp});
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