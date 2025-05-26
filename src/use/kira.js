import { api } from "gadget-server";

import { SETT_CMD } from "../sett.js";

import { FeedbackState, userBanType } from "../enum.ts";
import { DiscordUserOpenDm } from "./utils.js";
import { kira_user_dm_id } from "../use/kira.js";

export async function kira_do_refreshCommands() {
  if (false)
  {
    console.debug("kira : refreshcmd : removeCommands()...");
    await api.removeCommands();
    console.debug("kira : refreshcmd : removeCommands() done!");
  }
  console.debug("kira : refreshcmd : registerCommands()...");
  await api.registerCommands();
  console.debug("kira : refreshcmd : registerCommands() done!");
}

//---kira_user---
//DATA about the user

//manage
export async function kira_user_get(f_userId, f_createIfNot = false) {

  let userdata=await api.KiraUsers.maybeFindFirst({
    filter: {
      userId: { equals: f_userId },
    },
    select: {
      id: true,
      userId: true,
      is_alive: true,
      is_god: true,
      apples: true,
      apples_daily: true,
      lang: true,
      backDate: true,
      deathDate: true,
      giveUp: true,
      banValue: true,
      //banTime: true,
      dmId: true,
      feedbackState: true,
      statPtr: { id: true },
      achivPtr: { id: true },
      bookPtr: { id: true },
      equipedPen: { id: true },
    },
  });
  if (!userdata)
  {
    //not created
    if (!f_createIfNot)
      return undefined;
    //create it
    await kira_user_create(f_userId);
    //return it
    userdata=await kira_user_get(f_userId, false);
    userdata.justCreated=true;
  }
  return userdata;

  /*
  let r_data=await api.KiraUsers.maybeFindFirst(
    {
      filter:
      {
        userId: { equals: f_userId }
      },
      select: {
        id: true,
        userId: true,
        is_alive: true,
        is_god: true,
        apples: true,
        apples_daily: true,
        lang: true,
        backDate: true,
        deathDate: true,
        //stats: false,
        //achievemens: false
      }
    }
  );
  if (!r_data && f_createIfNot)
  {
    r_data = await kira_user_create(f_userId);
  }
  return r_data;
*/
} //return the userdata from user


export async function kira_user_create(f_userId) {

  return await api.KiraUsers.create({
    userId: f_userId,
    statPtr: {
      create: { userId: f_userId },
    },
    achivPtr: {
      create: { userId: f_userId },
    },
  });
  //await posting_newbi(f_userId, userdata);

} //return the created element

//capsule
export async function kira_user_set_life(f_dataId, f_bool, f_backDate = null) {
  if (f_backDate) f_backDate = f_backDate.toISOString();
  await api.KiraUsers.update(f_dataId, {
    is_alive: f_bool,
    backDate: f_backDate,
  });
}

export async function kira_user_add_apple(f_dataId, f_amount = 1) {
  console.debug(`kira : kira_user_add_apple : adding [${f_amount}] apples to [${f_dataId}]...`);
  const f_apples = await api.KiraUsers.findOne(f_dataId, {
    select: { apples: true },
  }).then((data) => data.apples);
  await api.KiraUsers.update(f_dataId, {
    apples: f_apples + f_amount,
  });
  console.debug(`kira : kira_user_add_apple : added [${f_amount}] apples to [${f_dataId}] now at (${f_apples+f_amount})`);
}

export async function kira_users_rank(f_onKey) {
  return await api.KiraUsers.findMany({
    sort: {
      [f_onKey]: "Descending",
    },
    select: {
      id: true,
      userId: true,
      [f_onKey]: true,
      lang: true,
    },

    first: 3,
  });
} //return 3 best kills userdata

export async function kira_user_dm_id(userdata)
{
  if (userdata.dmId)
    return userdata.dmId;
  let dmId = await DiscordUserOpenDm(userdata.userId);
  await api.KiraUsers.update(userdata.id, { dmId });
  return dmId;
}

export async function kira_user_set_daily(f_dataId) {
  await api.KiraUsers.update(f_dataId, {
    apples_daily: new Date().toISOString(),
  });
}

export async function kira_user_get_daily(f_dataId) {
  return await api.KiraUsers.findOne(f_dataId, {
    select: { apples_daily: true },
  })
    .then((data) => data.apples_daily)
    .then((iso) => new Date(iso));
}

export async function kira_user_check_banTime(f_dataId) {
  //get
  const banTime=await api.KiraUsers.findOne(f_dataId, {
    select: { banTime: true },
  })
    .then((data) => data.banTime)
    .then((iso) => new Date(iso));
    
  //check
  const h_gap = parseInt(
    (banTime.getTime() - new Date().getTime()) / 1000
  );
  if (h_gap > 0) {
    //remain time
    return h_gap;
  }

  //update
  await api.KiraUsers.update(f_dataId, {banTime: null, banValue: userBanType.EXPIRE});//expire
  return 0;
}

export async function kira_user_set_ban(f_dataId, f_span=0) {
  let banValue = userBanType.PERMA;
  let banTime = null;
  if (f_span)
  {
    banValue = userBanType.TEMP;
    banTime = new Date();
    banTime.setSeconds(banTime.getSeconds() + f_span);
    banTime=banTime.toISOString();
  }
  await api.KiraUsers.update(f_dataId, {banTime, banValue});//ban
}

export async function kira_user_remove_ban(f_dataId) {
  await api.KiraUsers.update(f_dataId, {banTime: null, banValue: userBanType.PARDON});//unban
}



export async function kira_user_set_drop(f_dataId, f_span) {
  let h_date = new Date();
  h_date.setSeconds(h_date.getSeconds() + f_span);
  await api.KiraUsers.update(f_dataId, {
    giveUp: h_date.toISOString(),
  });
}

export async function kira_user_set_feedback(f_dataId, f_state, f_span = 0) {
  let h_date = new Date();
  h_date.setSeconds(h_date.getSeconds() + f_span);
  await api.KiraUsers.update(f_dataId, {
    feedbackState: f_state,
    feedbackCooldown: h_date.toISOString(),
  });
}

export async function kira_user_can_feedback(f_dataId) {
  const iso = await api.KiraUsers.findOne(f_dataId, {
    select: { feedbackCooldown: true },
  }).then((data) => data.feedbackCooldown);
  if (!iso) return 0;
  const span = Math.ceil(
    (new Date(iso).getTime() - new Date().getTime()) / 1000
  );
  return (span);
}

export async function kira_user_has_mail(f_dataId, feedbackState=undefined) {
  const state = (feedbackState) 
    ? feedbackState 
    : await api.KiraUsers.findOne(f_dataId, {
        select: { feedbackState: true },
      }).then((data) => data.feedbackState);
  
  //has a feedback response
  return (state===FeedbackState.MAILED);
}

export async function kira_user_pickup_mails(f_dataId) {
  
  await kira_user_set_feedback(f_dataId, FeedbackState.READED);

  //const h_data_messages = await api.KiraNotes.findMany({
  //  filter: [
  //    {
  //      recipientPtr: { equals: f_dataId },
  //    }
  //  ],
  //});

  const h_user = await api.KiraUsers.findOne(f_dataId, {
    select: {
      mailboxLettersPtr: {
        edges: {
          node: {
            id: true,
          },
        },
      },
    },
  });

  const letter_ids_array=h_user.mailboxLettersPtr.edges.map((the) => the.node.id);
  var letter_objects_array=[];
  for (var letter_id of letter_ids_array)
  {
    letter_objects_array.push(await api.KiraLetters.findById(letter_id));
  }
  console.log("user : mailbox pickup :",letter_objects_array);
  
  //delete
  await api.KiraLetters.bulkDelete(
    letter_ids_array
  );

  return letter_objects_array;
}



export async function kira_user_send_mail(f_dataId, message)
{
  await kira_user_set_feedback(f_dataId, FeedbackState.MAILED);

  await api.KiraLetters.create({
    content: {
      markdown: message,
    },
    recipientPtr: {
      _link: f_dataId,
    },
  });
}


//---kira_book---
//DATA about the book

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
export async function kira_book_get(f_dataId) {
  const h_userToBook = await api.KiraUsers.findOne(f_dataId, {
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
  return await api.KiraBooks.findOne(bookId);
}

export function kira_book_color_choice() {
  let r = [];

  for (let i = 0; i < book_colors.length; i++) {
    if (book_colors[i].price != -1)
      r.push({ value: i, name: book_colors[i].color });
  }

  return r;
}

export async function kira_book_create(f_userdata, f_color) {
  return await api.KiraBooks.create({
    index: 0,
    ownerPtr: {
      _link: f_userdata.id,
    },
    userId: f_userdata.userId,
    color: f_color,
  });
  /* 
  return await api.KiraUsers.update( f_userdata.id,
    {
      bookPtr: [{
        create: {
          index: 0,
          userId: f_userdata.userId,
        },
      },],
    },
  );
   */
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

//uses
//kira_line : DATA

export async function kira_line_append(f_book, f_line, f_TimeDayGapObject) {
  let h_indexLine = f_book.index;

  //date
  if (
    f_book.index === 0 ||
    f_TimeDayGapObject.now.day != f_TimeDayGapObject.last.day
  ) {
    await api.KiraNotes.create({
      indexLine: h_indexLine,
      line: {
        markdown: `*${f_TimeDayGapObject.now.format}*`,
      },
      attackerBookPtr: {
        _link: f_book.id,
      },
    });
    h_indexLine++;
  }

  //line
  let r_line = await api.KiraNotes.create({
    indexLine: h_indexLine,
    line: {
      markdown: f_line,
    },
    attackerBookPtr: {
      _link: f_book.id,
    },
  });

  //stats
  await api.KiraBooks.update(f_book.id, {
    index: h_indexLine + 1,
    lastNoteId: r_line.id,
    //stats_kills: f_book.stats_kills+1,
  });

  //await api.KiraUsers.update(f_userdata.id, {stats_kills: f_userdata.stats_kills+1});

  return r_line;
}

//give a taste/style to a line.
export async function kira_line_taste(f_noteId, f_code) {
  let r_line = await api.KiraNotes.findOne(f_noteId, {
    select: {
      line: { markdown: true },
    },
  }).then((obj) => obj.line.markdown);

  //-- codes --

  //sucessful kill
  if (f_code === 1) {
    r_line = `**${r_line}**`;
  }

  await api.KiraNotes.update(f_noteId, {
    line: { markdown: r_line },
  });
}

export async function kira_line_get_last_indexPage(f_book) {
  //const h_data_gtr = await api.KiraNotes.maybeFindFirst(
  // {
  //  filter:
  //  {
  //    attackerBookPtr: { equals: f_book.id }
  //  },
  //  sort:
  //  {
  //    indexLine: "Descending",
  //  }
  //});
  //if (!h_data_gtr) return 1;
  if (!f_book.lastNoteId) return 1;
  const h_data_gtr = await api.KiraNotes.findOne(f_book.lastNoteId);
  return Math.ceil((h_data_gtr.indexLine + 1) / SETT_CMD.see.maxLines);
}

export async function kira_line_if_pageGood(f_book, f_page) {
  return (
    f_page >= 0 &&
    (f_page < SETT_CMD.see.maxPages ||
      f_page < (await kira_line_get_last_indexPage(f_book)))
  );
}

export async function kira_line_get_page(f_book, f_page, f_ifBlank = true) {
  const h_data_lines_minimal = await api.KiraNotes.findMany({
    filter: [
      {
        attackerBookPtrId: { equals: f_book.id },
      },
      {
        indexLine: {
          greaterThanOrEqual: SETT_CMD.see.maxLines * f_page,
          lessThan: SETT_CMD.see.maxLines * (f_page + 1),
        },
      },
    ],
  });
  if (!f_ifBlank) return h_data_lines_minimal;

  let h_data_lines_blanked = new Array(SETT_CMD.see.maxLines).fill(false);
  for (let i = 0; i < h_data_lines_minimal.length; i++) {
    h_data_lines_blanked[
      h_data_lines_minimal[i].indexLine - SETT_CMD.see.maxLines * f_page
    ] = h_data_lines_minimal[i];
  }
  return h_data_lines_blanked;
}

export async function kira_run_create(
  f_finalDate,
  f_attackerId,
  f_victimId,
  f_victimDataId,
  f_counterCombo
) {
  return await api.KiraRun.create({
    //used to find one
    victimId: f_victimId,
    attackerId: f_attackerId,
    //edit userdata
    victimDataId: f_victimDataId,
    //the date
    finalDate: f_finalDate,
    //data
    counterCombo: f_counterCombo,
  });
} //return the kirarun

export async function kira_run_pack(f_runId, f_executePack, f_knowPack) {
  //add kira_execute informations
  await api.KiraRun.update(f_runId, {
    //used to kira_execute
    executePack: f_executePack,
    knowPack: f_knowPack,
  });
}

export async function kira_run_unpack_execute(f_runId) {
  //retrive kira_execute informations
  return await api.KiraRun.maybeFindFirst({
    filter: { id: { equals: f_runId } },
    select: { executePack: true },
  }).then((obj) => obj?.executePack);
}

export async function kira_run_unpack_know(f_runId) {
  //retrive kira_know informations
  return await api.KiraRun.maybeFindFirst({
    filter: { id: { equals: f_runId } },
    select: { knowPack: true },
  }).then((obj) => obj?.knowPack);
}

export async function kira_run_get(f_runId) {
  //return await api.KiraRun.findOne(f_runId);
  return await api.KiraRun.maybeFindFirst({
    filter: { id: { equals: f_runId } },
    select: {
      attackerId: true,
      channelId: true,
    },
  });
}

export async function kira_runs_by(f_victimId, f_attackerId) {
  return await api.KiraRun.findMany({
    filter: {
      victimId: f_victimId ? { equals: f_victimId } : undefined,
      attackerId: f_attackerId ? { equals: f_attackerId } : undefined,
    },
    select: {
      id: true,
      finalDate: true,
      victimId: true,
      attackerId: true,
    },
  });
}

export async function kira_run_of(f_victimId, f_attackerId) {
  return await api.KiraRun.maybeFindFirst(
    {
      filter: {
        victimId: { equals: f_victimId },
        attackerId: { equals: f_attackerId },
      },
    },
    {
      select: {
        id: true,
        finalDate: true,
        counterCombo: true,
      },
    }
  );
}

export async function kira_run_mercy(f_victimId) {
  const runFull=await api.KiraRun.maybeFindFirst(
    {
      filter: {
        victimId: { equals: f_victimId },
        //attackerId: { equals: f_attackerId },
      },
      sort: {
        finalDate: "Ascending"
      }
    },
    {
      select: {
        id: true
      },
    }
  );
  if (!runFull) return 0;
  await api.KiraRun.delete(runFull.id);
  return 1;
}

export async function kira_run_delete(f_runId, f_victimDataId) {
  /* get the victim data.
  //but victim data is not given when he does not exist.
  if (!f_victimDataId)
  {
    f_victimDataId=await api.KiraRun.findById(f_runId,
      {
        select: {
          victimDataId: true
        }
      }
    ).then(run => run.victimData);
  }
  */

  if (f_victimDataId) {
    await api.KiraUsers.update(f_victimDataId, {
      deathDate: null,
    });
  }

  await api.KiraRun.delete(f_runId);
}
