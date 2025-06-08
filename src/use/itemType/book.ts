import { api } from 'gadget-server';
import { items_info } from "../item";
import { time_day_gap } from '../../tools';
import { SETT_CMD } from '../../sett';


export class NoteBook {
  noteBook : any;
  itemName : string;
  id : string;
  color : { text: string, int: number, ord: number };
  emoji : { [key: string]: any };

  constructor(noteBookObject : any)
  {
    if (!noteBookObject) return;
    this.noteBook = noteBookObject;
    this.itemName = noteBookObject.itemName;
    this.id = noteBookObject.id;
    this.color = items_info[this.itemName].atr.color;
    this.emoji = items_info[this.itemName].emoji;
  };

  static async get(noteBookId : string, canNone : boolean = false) : Promise<NoteBook | undefined>
  {
    let userbook;
    if (canNone)
    {
      try {
        userbook = await api.KiraBooks.findOne(noteBookId);
      } catch (e)
      {
        return;
      }
    } else {
      userbook = await api.KiraBooks.findOne(noteBookId);
    }
    return new NoteBook(userbook);
  }

  static async create(userdata, itemName) : Promise<NoteBook> {
    return new NoteBook(await api.KiraBooks.create({
      index: 0,
      owner: {
        _link: userdata.id,
      },
      userId: userdata.userId,
      itemName: itemName
    }));
  } //return the created book


  // STATIC THINGS BUT COULD NOT BE
  static async link_owner(noteBookId : string, userdataId : string | undefined) {
    return await api.KiraBooks.update(noteBookId, {
      owner: {
        _link: userdataId,
      },
    });
  }

  static async link_writter(noteBookId : string, userdataId : string) {
    return await api.KiraUsers.update(userdataId, {
      noteBook: {
        _link: noteBookId,
      },
    });
  }
  
  static async unlink_writter(userdataId : string) {
    return await api.KiraUsers.update(userdataId, {
      noteBook: {
        _link: undefined,
      },
    });
  }

  static async delete(noteBookId : string) {
    const h_bookToNotes = await api.KiraBooks.findOne(noteBookId, {
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

    await api.KiraBooks.delete(noteBookId);
  };


  // LINE
  get_day_gap(locale)
  {
    const h_dayGap = time_day_gap(this.noteBook.updatedAt, locale, true, true);
  }
  
  async line_append(line : string, timeDayGapObject) {
    let h_indexLine = this.noteBook.index;
  
    //date
    if (
      this.noteBook.index === 0 ||
      timeDayGapObject.now.day != timeDayGapObject.last.day
    ) {
      await api.KiraNotes.create({
        indexLine: h_indexLine,
        line: {
          markdown: `*${timeDayGapObject.now.format}*`,
        },
        attackerBookPtr: {
          _link: this.noteBook.id,
        },
      });
      h_indexLine++;
    }
  
    //line
    let r_line = await api.KiraNotes.create({
      indexLine: h_indexLine,
      line: {
        markdown: line,
      },
      attackerBookPtr: {
        _link: this.noteBook.id,
      },
    });
  
    await api.KiraBooks.update(this.noteBook.id, {
      index: h_indexLine + 1,
      lastNoteId: r_line.id,
      //stats_kills: f_book.stats_kills+1,
    });
  
    //await api.KiraUsers.update(f_userdata.id, {stats_kills: f_userdata.stats_kills+1});
  
    return r_line;
  }
  
  //give a taste/style to a line.
  static async note_taste(noteId, code) {
    let r_line = await api.KiraNotes.findOne(noteId, {
      select: {
        line: { markdown: true },
      },
    }).then((obj) => obj.line.markdown);
  
    //-- codes --
  
    //sucessful kill
    if (code === 1) {
      r_line = `**${r_line}**`;
    }
  
    await api.KiraNotes.update(noteId, {
      line: { markdown: r_line },
    });
  }
  
  async line_get_last_indexPage() {
    if (!this.noteBook.lastNoteId) return 1;
    const h_data_gtr = await api.KiraNotes.findOne(this.noteBook.lastNoteId);
    return Math.ceil((h_data_gtr.indexLine + 1) / SETT_CMD.see.maxLines);
  }
  
  async line_if_pageGood(page : number) {
    return (
      page >= 0 &&
      (page < SETT_CMD.see.maxPages ||
        page < (await this.line_get_last_indexPage()))
    );
  }
  
  async get_page(page : number, ifBlank = true) {
    const h_data_lines_minimal = await api.KiraNotes.findMany({
      filter: [
        {
          attackerBookPtrId: { equals: this.noteBook.id },
        },
        {
          indexLine: {
            greaterThanOrEqual: SETT_CMD.see.maxLines * page,
            lessThan: SETT_CMD.see.maxLines * (page + 1),
          },
        },
      ],
    });
    if (!ifBlank) return h_data_lines_minimal;
  
    let h_data_lines_blanked = new Array(SETT_CMD.see.maxLines).fill(false);
    for (let i = 0; i < h_data_lines_minimal.length; i++) {
      h_data_lines_blanked[
        h_data_lines_minimal[i].indexLine - SETT_CMD.see.maxLines * page
      ] = h_data_lines_minimal[i];
    }
    return h_data_lines_blanked;
  }
}