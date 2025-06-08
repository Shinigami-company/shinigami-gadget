import { api } from 'gadget-server';
import { itemType } from '../enum';
import { translate } from '../lang';
import { sett_emoji_items, godNamesProba } from '../sett';
import { kira_apple_send } from './apple';
import { NoteBook } from './itemType/book';
import { copyAttrs } from './tools';


//flow is like a dynamic lore.
export const items_info = {
  event_egg_2025: {
    type: itemType.COLLECTOR,
    emoji: sett_emoji_items.event_egg_2025,
    fields: {
      claim: true,
      lore: true,
      //flow: {
      //  default: true,
      //  key: 'items.pens.flow',
      //  function: (deep) => {
      //      let key = 'items.pens.flow';
      //      let dolar = {};
      //      return { key, dolar };
      //    },
      //}
    },
  },


  pen_black: {
    type: itemType.PEN,
    emoji: sett_emoji_items.pen_black,
    atr: {
      filters: [],
      broken_item: 'broken_pen',
      broken_chance: .1,
      empty_item: 'empty_pen',
      empty_durability: 10,
    },
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
    emoji: sett_emoji_items.pen_blue,
    atr: {
      filters: ['blue'],
      broken_item: 'broken_pen',
      broken_chance: .1,
      empty_item: 'empty_pen',
      empty_durability: 5,
    },
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
    emoji: sett_emoji_items.pen_green,
    atr: {
      filters: ['green'],
      broken_item: 'broken_pen',
      broken_chance: .1,
      empty_item: 'empty_pen',
      empty_durability: 5,
    },
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
    emoji: sett_emoji_items.pen_red,
    atr: {
      filters: ['red'],
      broken_item: 'broken_pen',
      broken_chance: .1,
      empty_item: 'empty_pen',
      empty_durability: 5,
    },
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
    emoji: sett_emoji_items.pen_purple,
    atr: {
      filters: ['purple'],
      broken_item: 'broken_pen',
      broken_chance: .1,
      empty_item: 'empty_pen',
      empty_durability: 5,
    },
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
    emoji: sett_emoji_items.feather_white,
    atr: {
      filters: [],
      silent: true,
      broken_chance: 0,//no item : will delete
      empty_durability: 3,//no item : will delete
    },
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
    emoji: sett_emoji_items.broken_pen,
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
    emoji: sett_emoji_items.empty_pen,
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
    emoji: sett_emoji_items.book_black,
    atr: {
      color: {
        ord: 0,
        int: 0,
        text: 'black',
      }
    },
    fields: {
      claim: false,
      lore: { function: lore_book },
      flow: { function: flow_book }
    },
    shopData: {
      proba: 100,
      price_min: 0,
      price_max: 1,
    }
  },
}




export const items_types = {
  [itemType.PEN]: {
    str: 'pen',

    equipable: true,
    equip : async (userdata, item: Item) => {
      await api.KiraUsers.update(userdata.id, {equipedPen: {_link: item.id}});
    },
    unequip: async (userdata, item: Item) : Promise<boolean> => {
      if (items_types[itemType.PEN]?.if_equiped(userdata, item))
      {
        await api.KiraUsers.update(userdata.id, {equipedPen: {_link: null}});
        return true;
      }
      return false;
    },
    if_equiped: (userdata, item) : boolean => {
      return ((userdata.equipedPen?.id.toString())===(item.id.toString()));
    },
    get_equiped: async (userdata) : Promise<Item | undefined> => {
      if (!userdata.equipedPen?.id)
        return;
      return await Item.get(userdata.id, userdata.equipedPen.id);
    }
  },

  [itemType.BOOK]: {
    str: 'book',

    equipable: true,
    equip : async (userdata, item: Item) => {
      if (!item.meta.bookId)
      {
        item.meta.bookId = await NoteBook.create(userdata, item.itemName).then((obj) => obj.noteBook.id);
      }
      await NoteBook.link_writter(item.meta.bookId, userdata.id);

      item.meta.ownerId = userdata.userId;
      item.meta.ownerName = userdata.userName;
      await item.change(undefined, item.meta)
      
      await api.KiraUsers.update(userdata.id, {equipedBook: {_link: item.id}});
    },
    unequip: async (userdata, item: Item) : Promise<boolean> => {
      if (items_types[itemType.BOOK]?.if_equiped(userdata, item))
      {
        await NoteBook.unlink_writter(userdata.id);
        await api.KiraUsers.update(userdata.id, {equipedBook: {_link: null}});
        return true;
      }
      return false;
    },
    if_equiped: (userdata, item) : boolean => {
      return ((userdata.equipedBook?.id.toString())===(item.id.toString()));
    },
    get_equiped: async (userdata) : Promise<Item | undefined> => {
      if (!userdata.equipedBook?.id)
        return;
      return await Item.get(userdata.id, userdata.equipedBook.id);
    },

    delete: async (userdata, item) => {
      if (item.meta.bookId)
        await NoteBook.delete(item.meta.bookId);
    }
  },
}




export function flow_pen(deep) {
  let key = 'items.pens.flow';
  let penItem = deep.item;
  let use = (penItem.meta?.use) ? penItem.meta.use : 0;
  let dura = items_info[penItem.itemName].atr.empty_durability - use;
  let dolar = { dura };
  return { key, dolar };
}


export function lore_book(deep) {  
  let godOwner : string = '';
  for (let nameType in godNamesProba)
  {
    const nameProba = godNamesProba[nameType];
    if (nameProba.chance >= 1 || Math.random() < nameProba.chance)
    {
      if (godOwner !== '')
        godOwner += ' ';
      godOwner += translate(deep.lang, `items.books.god.${nameType}.${Math.ceil(Math.random()*nameProba.amount)}`)
    }
  }

  let dolar = { godOwner };
  return { dolar };
}


export function flow_book(deep) {
  let key = 'items.books.flow.';
  let dolar = {};
  if (deep.item.meta.ownerId)
  {
    key += 'owned';
    dolar = { ownerName: deep.item.meta.ownerName, ownerId: deep.item.meta.ownerId };
  } else {
    key += 'never';
  }
  return { key, dolar };
}



function field_translation(lang: string, itemName: string, fieldKey: string, deep: {}) : undefined | string
{
  let field_object = items_info[itemName].fields[fieldKey];

  if (!field_object)
  {
    return;
  }
  
  let key = `item.${itemName}.${fieldKey}`;
  let dolar = deep;

  if (field_object.key)
  {//key
    key = field_object.key;
  }
  
  if (field_object.function)
  {//function
    let deeper = { ...deep, itemName, fieldKey, lang };// usefull deep propeties
    let result = field_object.function(deeper);
    if (result.key) key = result.key;
    if (result.dolar) dolar = result.dolar;
  }

  //default key
  return translate(lang, key, dolar);
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
  atr;// special add

  constructor(itemDbObj: any) {
    if (!itemDbObj) return;
    copyAttrs(itemDbObj, this);
    this.info = items_info[this.itemName];
    this.atr = items_info[this.itemName].atr;
  }

  async refresh() {
    let itemDbObj=api.KiraItems.findById(this.id);
    copyAttrs(itemDbObj, this);
    this.info = items_info[this.itemName];
  }

  static async create(userdataId, lang, itemName, dolarValues = {}, metaDataValues = {})
  {
    // create item lore
    let itemLoreTxt : string | undefined = field_translation(lang, itemName, 'lore', dolarValues);

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
    item.itemClaimTxt = field_translation(lang, itemName, 'claim', dolarValues);
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
  async delete(userdata) {
    if (!await this.if_own(userdata.id)) return false;
    if (items_types[this.info.type]?.delete)
    {
      await items_types[this.info.type].delete(userdata, this);
    }
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
  async change(itemName: string | undefined, meta: {} | undefined)
  {
    let change: any = {};
    if (meta!=undefined)
      change.meta = meta;
    if (itemName!=undefined)
      change.itemName = itemName;
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
    + translate(lang, 'item.'+itemName+'.title');
  }

  get_lore(lang: string, dolarValues={}) {
    let lore = '';
    //if (items_info[this.itemName].fields.lore)
    if (this.itemLoreTxt)
    {
      lore += this.itemLoreTxt.markdown;
    }
    if (items_info[this.itemName].fields.flow)
    {
      if (lore != '')
        lore += '\n';
      lore += field_translation(lang, this.itemName, 'flow', { item: this, ...dolarValues });
    }
    if (lore === '')
      lore += ' ';
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
    //await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, 'gift.send.'+(userIdRecipient) ? 'one' : 'everyone', {gifted: });//got lazy
    await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, 'gift.send.everyone');
    return await api.KiraItemGift.create({appleAmount, userIdOwner: userdataOwner.userId, usernameOwner, userIdRecipient, expireDate: expireTimestamp});
  }


  static async gift_get(giftId) {
    return await api.KiraItemGift.maybeFindFirst({filter: {id: {equals: giftId}}});
  }

  static async gift_pick(gift, userdata) {
    await api.KiraItemGift.delete(gift.id);
    if (gift.appleAmount)
    {
      return await kira_apple_send(userdata.id, gift.appleAmount, userdata.statPtr.id, 'gift.recive', {'gifter': gift.usernameOwner});
    } else {
      return await api.KiraItems.update(gift.itemPtrId, {ownerPtr: {_link: userdata.id}});
    }
  }
}