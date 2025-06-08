import { api } from 'gadget-server';
import { items_info } from "../item";

export const book_colors = [
  {
    //the first must be free
    color: "black",
    int: 0,
    emoji: "<:book_black:1281258833271849050>",
    emojiObj: { id: "1281258833271849050" },
    price: 0,
  },
  {
    color: "red",
    int: 16711680,
    emoji: "<:book_red:1281258840570204283>",
    emojiObj: { id: "1281258840570204283" },
    price: 42,
  },
  {
    color: "white",
    int: 16777215,
    emoji: "<:book_white:1281258835214073972>",
    emojiObj: { id: "1281258835214073972" },
    price: 333,
  },
  {
    color: "purple",
    int: 11665663,
    emoji: "<:book_purple:1281258837076082688>",
    emojiObj: { id: "1281258837076082688" },
    price: -1,
  },
];

//manage
/*old
export async function kira_book_get(userdataId) {
  const h_userToBook = await api.KiraUsers.findOne(userdataId, {
    select: {
      bookPtr: {
        id: true,
      },
    },
  });
  if (!h_userToBook.bookPtr) return undefined;
  return await api.KiraBooks.findOne(h_userToBook.bookPtr.id);
}
*/
export async function kira_book_get(bookId) {
  let userbook = await api.KiraBooks.findOne(bookId);
  userbook.int = items_info;
  return userbook;
}

export function kira_book_color_choice() {
  let r = [];

  for (let i = 0; i < book_colors.length; i++) {
    if (book_colors[i].price != -1)
      r.push({ value: i, name: book_colors[i].color });
  }

  return r;
}

export async function kira_book_create(userdata, itemName) {
  return await api.KiraBooks.create({
    index: 0,
    ownerPtr: {
      _link: userdata.id,
    },
    userId: userdata.userId,
    itemName: itemName
  });
} //return the created book


export async function kira_book_link(bookId, userdataId) {
  return await api.KiraBooks.update(bookId, {
    ownerPtr: {
      _link: userdataId,
    },
  });
} //return the created book

export async function kira_book_delete(f_book) {
  const h_bookToNotes = await api.KiraBooks.findOne(f_book.id, {
    select: {
      notesPtr: {
        edges: {
          node: {
            id: true,
          },
        },
      },
    },
  });
  await api.KiraNotes.bulkDelete(
    h_bookToNotes.notesPtr.edges.map((the) => the.node.id)
  );

  await api.KiraBooks.delete(f_book.id);
}