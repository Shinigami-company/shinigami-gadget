import { Item } from './item.ts';
import { NoteBook } from './itemType/book.ts';
import { Achievement } from "../achiv";
import { kira_apple_send } from "./apple";
import { kira_user_set_life } from './kira.js';
import { api } from 'gadget-server';

export async function kira_user_update(user, userdata, lang)
{
  //update userName
  if (userdata && user.username != userdata.userName)
  {
    userdata.userName = user.username;
    await api.KiraUsers.update(userdata.id, {
      userName: userdata.userName
    });
  }

  //VERSION

  //give death note item
  if (userdata.version < 1001000)
  {
    let noteBooksId = await kira_user_get_owned_books_note(userdata.id);
    console.log(`update userdata [${userdata.id}/${userdata.userId}/${userdata.userName}] version ${userdata.version} to 1.001.000 : books id ${noteBooksId}`);
    if (noteBooksId.length > 0)
    {
      let bookItem = await Item.create(userdata.id, lang, 'book_black');//manually add meta
      let noteBook = await NoteBook.get_old(noteBooksId[0]);
      if (!noteBook) throw Error(`try to update, but cant find book.`);
      await noteBook.link_item(bookItem);
      await bookItem.equip(userdata);//then equip
    }

    userdata.version = 1001000;
    await api.KiraUsers.update(userdata.id, {
      version: userdata.version
    });
  }

  if (userdata.version < 1002000)
  {
    console.log(`update userdata [${userdata.id}/${userdata.userId}/${userdata.userName}] version ${userdata.version} to 1.001.002 : apple quest and lifesince`);
    if (userdata.is_alive) kira_user_set_life(userdata, true);
    
    let missedAmount = await Achievement.count_finised(userdata);
    await kira_apple_send(
      userdata.id, missedAmount, userdata.statPtr.id,
      'past.quest',
    );
    userdata.version = 1002000;
    await api.KiraUsers.update(userdata.id, {
      version: userdata.version
    });
  }
}