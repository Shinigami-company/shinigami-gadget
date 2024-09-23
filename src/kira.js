import { api } from "gadget-server";

const settings_max_pages = 60;
const settings_max_lines=10;//38

const settings_date_zone = "es-ES";

const settings_date_options = {
  day: "numeric",
  month: "numeric",
  year: "2-digit",
};

//{
//  console.log(new Date().toLocaleDateString(settings_date_zone, settings_date_options));
//}

//---kira_user---
//DATA about the user

//manage
export async function kira_user_get(f_userId, f_createIfNot=false)
{
  const h_preData=await api.KiraUsers.maybeFindFirst(
    {
      filter:
      {
        userId: { equals: f_userId }
      },
      select: {
        id: true,
        statPtr: {id: true},
        achivPtr: {id: true}
      }
    }
  );
  if (!h_preData)
  {
	if (f_createIfNot)//create it
	    return await kira_user_create(f_userId);
	else//not created
		return undefined;
  } else {
	//get it
	//and create submodel
	if (!h_preData.statPtr)
	{
		await api.KiraUserStats.create({userPtr: { _link: h_preData.id }, userId: f_userId });
	}
		  
	if (!h_preData.achivPtr)
	{
		await api.KiraUserAchiv.create({userPtr: { _link: h_preData.id }, userId: f_userId });
	}
	
    return await api.KiraUsers.maybeFindFirst(
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
          statPtr: {id: true},
          achivPtr: {id: true}
        }
      }
    );

  }
  return r_data;

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
}//return the userdata from user



export async function kira_user_create(f_userId)
{
  return await api.KiraUsers.create({
    userId: f_userId,
	statPtr: [{
		create: {userId: f_userId }
		}],
	achivPtr: [{
		create: {userId: f_userId }
		}]
  });
}//return the created element

//capsule
export async function kira_user_set_life(f_dataId, f_bool, f_span=null)
{
  let h_finalDate = null;
  if (f_span)
  {
    h_finalDate = new Date();
    h_finalDate.setSeconds(h_finalDate.getSeconds() + f_span);
  }

  await api.KiraUsers.update(
    f_dataId,
    {
      is_alive: f_bool,
      backDate: h_finalDate,
    }
  );
}


export async function kira_user_add_apple(f_data, f_amount=1)
{
  await api.KiraUsers.update(
    f_data.id,
    {
      apples: f_data.apples + f_amount
    }
  );
}

export async function kira_users_rank(f_onKey)
{
  return await api.KiraUsers.findMany(
    {
      sort: {
        [f_onKey]: "Descending",
      },
      select: {
        id: true,
        userId: true,
        [f_onKey]: true,
        lang: true,
      },

      first: 3
    }
  );
}//return 3 best kills userdata


export async function kira_user_set_daily(f_dataId)
{
  await api.KiraUsers.update(
    f_dataId,
    {
      apples_daily:new Date().toISOString()
    }
  );
}

export async function kira_user_get_daily(f_dataId)
{
  return await api.KiraUsers.findOne(f_dataId, {select: {apples_daily:true}})
    .then(data => data.apples_daily)
    .then(iso => new Date(iso));
}

//---kira_book---
//DATA about the book

export const book_colors = 
[
    {//the first must be free
    color: "black",
    int:0,
    emoji:"<:book_black:1281258833271849050>",
    emojiObj: { id:'1281258833271849050' },
    price:0
  },
  {
    color: "red",
    int: 16711680,
    emoji: "<:book_red:1281258840570204283>",
    emojiObj: { id: '1281258840570204283' },
    price: 10
  },
  {
    color:"white", int:16777215, 
    emoji: "<:book_white:1281258835214073972>",
    emojiObj: { id: '1281258835214073972' },
    price: 100
  },
  {
    color: "purple",
    int: 11665663,
    emoji: "<:book_purple:1281258837076082688>",
    emojiObj: { id: '1281258837076082688' },
    price: -1
  },
]

//manage
export async function kira_book_get(f_userdataId)
{
  const h_userToBook = await api.KiraUsers.findOne(f_userdataId,{
    select: {
      bookPtr: {
        id: true
      }
    }
  });
  if (!h_userToBook.bookPtr) return undefined;
  return await api.KiraBooks.findOne(h_userToBook.bookPtr.id);
}


export function kira_book_color_choice()
{
  let r = [];

  for (let i = 0; i < book_colors.length;i++)
  {
    if (book_colors[i].price!=-1)
    r.push({value:i, name: book_colors[i].color});
  }
  
  return r;
}

export async function kira_book_create(f_userdata, f_color)
{
  return await api.KiraBooks.create({
      index: 0,
      ownerPtr: {
        _link: f_userdata.id,
      },
    userId: f_userdata.userId,
    color: f_color,
    }
  );
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
}//return the created book

export async function kira_book_delete(f_book)
{

  const h_bookToNotes = await api.KiraBooks.findOne(f_book.id,{
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
  await api.KiraNotes.bulkDelete(h_bookToNotes.notesPtr.edges.map((the) => the.node.id));

  await api.KiraBooks.delete(
    f_book.id,
  );
}

//uses
//kira_line : DATA


export async function kira_line_append(f_userdata, f_book, f_line)
{
  let h_indexLine = f_book.index;

  
  //date
  let h_date_book = new Date(f_book.updatedAt).toLocaleDateString(settings_date_zone, settings_date_options);
  let h_date_now = new Date().toLocaleDateString(settings_date_zone, settings_date_options);

  if (f_book.index === 0 || h_date_book != h_date_now)
  {
    await api.KiraNotes.create({
      indexLine: h_indexLine,
      line: {
        markdown: `*${h_date_now}*`,
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
    index: h_indexLine+1,
    lastNoteId: r_line.id,
    //stats_kills: f_book.stats_kills+1,
  });

  //await api.KiraUsers.update(f_userdata.id, {stats_kills: f_userdata.stats_kills+1});

  return r_line;
}

//give a taste/style to a line.
export async function kira_line_taste(f_noteId, f_code)
{
  let r_line = await api.KiraNotes.findOne(
    f_noteId,
    {
      select: {
        line: { markdown:true }
      }
    }
  ).then(obj => obj.line.markdown);

  //-- codes --

  //sucessful kill
  if (f_code === 1)
  {
    r_line = `**${r_line}**`
  }

  await api.KiraNotes.update(
    f_noteId,
    {
      line: { markdown:r_line }
    }
  );
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
  return Math.ceil((h_data_gtr.indexLine + 1) / settings_max_lines);
}

export async function kira_line_if_pageGood(f_book, f_page) {
  return (f_page >= 0 && (f_page < settings_max_pages || f_page < await kira_line_get_last_indexPage(f_book)));
}

export async function kira_line_get_page(f_book, f_page, f_ifBlank=true)
{
  const h_data_lines_minimal = await api.KiraNotes.findMany(
    {
      filter:
      [
        {
          attackerBookPtr: { equals: f_book.id }
        }, {
          indexLine: { greaterThanOrEqual: settings_max_lines * f_page, lessThan: settings_max_lines * (f_page + 1) }
        }
      ]
    });
  if (!f_ifBlank) return h_data_lines_minimal;

  let h_data_lines_blanked = new Array(settings_max_lines).fill(false);
  for (let i=0;i<h_data_lines_minimal.length;i++)
  {
    h_data_lines_blanked[h_data_lines_minimal[i].indexLine - settings_max_lines * f_page] = h_data_lines_minimal[i];
  }
  return h_data_lines_blanked;
}



export async function kira_run_create(f_span, f_attackerId, f_victimId, f_victimDataId, f_counterCombo)
{
  //console.log("create c & g :", f_channelId, f_guildId);
  let h_finalDate = new Date();
  h_finalDate.setSeconds(h_finalDate.getSeconds() + f_span);

  if (f_victimDataId)
  {
    await api.KiraUsers.update(f_victimDataId, {
      deathDate: h_finalDate,
    });
  }

  return await api.KiraRun.create({
    //used to find one
    victimId: f_victimId,
    attackerId: f_attackerId,
    //edit userdata
    victimDataId: f_victimDataId,
    //the date
    finalDate: h_finalDate,
    //data
    counterCombo: f_counterCombo
    }
  );
}//return the kirarun

export async function kira_run_pack(f_runId, f_executePack, f_knowPack)
{//add kira_execute informations
  await api.KiraRun.update(f_runId, {
    //used to kira_execute
    executePack: f_executePack,
    knowPack: f_knowPack
  });
}

export async function kira_run_unpack_execute(f_runId)
{//retrive kira_execute informations
  return await api.KiraRun.maybeFindFirst(
  {
    filter: { id: { equals: f_runId } },
    select: { executePack: true }
  }).then(obj => obj?.executePack);
}

export async function kira_run_unpack_know(f_runId)
{//retrive kira_know informations
  return await api.KiraRun.maybeFindFirst(
  {
    filter: { id: { equals: f_runId } },
    select: { knowPack: true }
  }).then(obj => obj?.knowPack);
}


export async function kira_run_get(f_runId)
{
  //return await api.KiraRun.findOne(f_runId);
  return await api.KiraRun.maybeFindFirst(
    {
      filter: { id: { equals: f_runId } },
      select: {
        attackerId: true,
        channelId: true,
      }
    }
  );
}


export async function kira_runs_after(f_date)
{
  return await api.KiraRun.findMany(
    {
      filter: {
        finalDate: { before: f_date.toISOString() }
      },
      //sort: { finalDate: "Ascending" },//!better for manual search, but unefficient here
      select: {//! acually need only that, but could change
        id: true
        //is unpacked after. unpack here?
      },
    }
  );
}

export async function kira_runs_by(f_victimId, f_attackerId)
{
  return await api.KiraRun.findMany(
    {
      filter: {
        victimId: (f_victimId) ? { equals: f_victimId } : undefined,
        attackerId: (f_attackerId) ? { equals: f_attackerId } : undefined
      },
      select: {
        id: true,
        finalDate: true,
        victimId: true,
        attackerId: true
      }
    }
  );
}


export async function kira_run_of(f_victimId, f_attackerId)
{
  return await api.KiraRun.maybeFindFirst(
    {
      filter: {
        victimId: { equals: f_victimId },
        attackerId: { equals: f_attackerId }
      }
    },
    {
      select: {
        id: true,
        finalDate: true,
        counterCombo: true
      }
    }
  );
}

export async function kira_run_delete(f_runId, f_victimDataId)
{
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

  if (f_victimDataId)
  {
    await api.KiraUsers.update(f_victimDataId, {
      deathDate: null,
    });
  }

  await api.KiraRun.delete(f_runId);
}