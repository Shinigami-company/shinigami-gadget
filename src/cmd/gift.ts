import { api } from 'gadget-server';
import { SETT_CMD_GIFT } from "../sett";
import { Item } from "../use/item";
import { stats_simple_add } from "../use/stats";
import { translate } from "../lang";
import { kira_apple_send } from "../use/apple";

export class Gift {  

  // BOTTOM
  static async #send(item : Item, isAnonymous = false, expireTimestamp : Date, userIdRecipient : string, userdataOwner : any) {
    if (!isAnonymous)
    {
      if (!item.if_own(userdataOwner.id)) return false;
      
      await item.unequip(userdataOwner);

      //await api.KiraUsers.update(itemId, {myItems: {_unlink:[{id: userdataIdOwner}]}});//not this way
      await api.KiraItems.update(item.id, {ownerPtr: {_link:null}});
      item.ownerPtrId = null;
    }
    
    return await api.KiraItemGift.create({itemPtr: {_link: item.id}, userIdOwner: userdataOwner?.userId, usernameOwner: userdataOwner?.username, userIdRecipient, expireDate: expireTimestamp, anon: isAnonymous});
  }

  static async #apples(appleAmount : number, isAnonymous = false, expireTimestamp : Date, userIdRecipient : string, userdataOwner : any) {
    //await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, 'gift.send.'+(userIdRecipient) ? 'one' : 'everyone', {gifted: });//got lazy
    if (!isAnonymous)
      await kira_apple_send(userdataOwner.id, appleAmount*-1, userdataOwner.statPtr.id, 'gift.send.everyone');
    return await api.KiraItemGift.create({appleAmount, userIdOwner: userdataOwner?.userId, usernameOwner: userdataOwner?.username, userIdRecipient, expireDate: expireTimestamp, anon: isAnonymous});
  }


  static async get(giftId : string) {
    return await api.KiraItemGift.maybeFindFirst({filter: {id: {equals: giftId}}});
  }

  static async pick(gift : any, userdata : any) {
    await api.KiraItemGift.delete(gift.id);
    if (gift.appleAmount)
    {
      return await kira_apple_send(userdata.id, gift.appleAmount, userdata.statPtr.id, `gift.recive.${(gift.anon) ? 'anon' : 'human'}`, {'gifter': gift.usernameOwner});
    } else {
      return await api.KiraItems.update(gift.itemPtrId, {ownerPtr: {_link: userdata.id}, ownedDate: new Date().toISOString()});
    }
  }

  // TOP
  static async top_send(lang : string, isAnonymous : boolean = false, recipientId : string, appleAmount : number, item : Item | undefined = undefined, userdataOwner : any)
  {
    // expire
    let expireSpan = SETT_CMD_GIFT.expireSpanSecond;
    let expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + (expireSpan));
  
    let gift : any;
    if (item)
    {
     gift = await Gift.#send(item, isAnonymous, expireDate, recipientId, userdataOwner);
    } else {
     gift = await Gift.#apples(appleAmount, isAnonymous, expireDate, recipientId, userdataOwner)
    }
    
    if (!gift) throw Error("the gift cannot be send");
  
    //+stats
    if (!isAnonymous)
    {
      await stats_simple_add(userdataOwner.statPtr.id, "do_gift");
    }
  
    let content = '';
    if (isAnonymous)
      content += translate(lang, "cmd.gift.post.content.anon");
    else 
      content += translate(lang, "cmd.gift.post.content."+ ((recipientId) ? "one" : "everyone"), {gifterId: userdataOwner?.userId, giftedId: recipientId});
    content += "\n" + translate(lang, "cmd.gift.post.expire", { "timestamp": (Math.ceil(expireDate.getTime() / 1000)).toString() });

    return { gift, content };
  }
}