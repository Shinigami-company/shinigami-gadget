import { api } from "gadget-server";

import { FeedbackState, userBanType } from "../enum.ts";
import { DiscordUserOpenDm } from "../utils.js";

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
      userName: true,
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
      noteBookId: true,
      //noteBookPtr: { id: true },
      equipedPen: { id: true },
      equipedBook: { id: true },
      equipedBag: { id: true },
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

export async function kira_user_update(user, userdata)
{
  if (userdata && user.username != userdata.userName)
  {
    userdata.userName = user.username;
    await api.KiraUsers.update(userdata.id, {
      userName: user.username
    }); 
  }
}


//capsule
export async function kira_user_set_life(userdataId, f_bool, f_backDate = null) {
  if (f_backDate) f_backDate = f_backDate.toISOString();
  await api.KiraUsers.update(userdataId, {
    is_alive: f_bool,
    backDate: f_backDate,
  });
}

export async function kira_user_add_apple(userdataId, f_amount = 1) {
  console.debug(`kira : kira_user_add_apple : adding [${f_amount}] apples to [${userdataId}]...`);
  const f_apples = await api.KiraUsers.findOne(userdataId, {
    select: { apples: true },
  }).then((data) => data.apples);
  await api.KiraUsers.update(userdataId, {
    apples: f_apples + f_amount,
  });
  console.debug(`kira : kira_user_add_apple : added [${f_amount}] apples to [${userdataId}] now at (${f_apples+f_amount})`);
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
  if (userdata?.dmId)
    return userdata.dmId;
  let dmId = await DiscordUserOpenDm(userdata.userId);
  await api.KiraUsers.update(userdata.id, { dmId });
  return dmId;
}

export async function kira_user_set_daily(userdataId) {
  await api.KiraUsers.update(userdataId, {
    apples_daily: new Date().toISOString(),
  });
}

export async function kira_user_get_daily(userdataId) {
  return await api.KiraUsers.findOne(userdataId, {
    select: { apples_daily: true },
  })
    .then((data) => data.apples_daily)
    .then((iso) => new Date(iso));
}

export async function kira_user_get_shopAlready(userdataId)
{
  return await api.KiraUsers.findOne(userdataId, {
    select: { shopAlready: true },
  })
    .then((data) => data.shopAlready)
}

export async function kira_user_set_shopAlready(userdataId, shopAlready)
{
  return await api.KiraUsers.update(userdataId,
    { shopAlready },
  );
}

export async function kira_user_check_banTime(userdataId) {
  //get
  const banTime=await api.KiraUsers.findOne(userdataId, {
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
  await api.KiraUsers.update(userdataId, {banTime: null, banValue: userBanType.EXPIRE});//expire
  return 0;
}

export async function kira_user_set_ban(userdataId, f_span=0) {
  let banValue = userBanType.PERMA;
  let banTime = null;
  if (f_span)
  {
    banValue = userBanType.TEMP;
    banTime = new Date();
    banTime.setSeconds(banTime.getSeconds() + f_span);
    banTime=banTime.toISOString();
  }
  await api.KiraUsers.update(userdataId, {banTime, banValue});//ban
}

export async function kira_user_remove_ban(userdataId) {
  await api.KiraUsers.update(userdataId, {banTime: null, banValue: userBanType.PARDON});//unban
}



export async function kira_user_set_drop(userdataId, f_span) {
  let h_date = new Date();
  h_date.setSeconds(h_date.getSeconds() + f_span);
  await api.KiraUsers.update(userdataId, {
    giveUp: h_date.toISOString(),
  });
}

export async function kira_user_set_feedback(userdataId, f_state, f_span = 0) {
  let h_date = new Date();
  h_date.setSeconds(h_date.getSeconds() + f_span);
  await api.KiraUsers.update(userdataId, {
    feedbackState: f_state,
    feedbackCooldown: h_date.toISOString(),
  });
}

export async function kira_user_can_feedback(userdataId) {
  const iso = await api.KiraUsers.findOne(userdataId, {
    select: { feedbackCooldown: true },
  }).then((data) => data.feedbackCooldown);
  if (!iso) return 0;
  const span = Math.ceil(
    (new Date(iso).getTime() - new Date().getTime()) / 1000
  );
  return (span);
}

export async function kira_user_has_mail(userdataId, feedbackState=undefined) {
  const state = (feedbackState) 
    ? feedbackState 
    : await api.KiraUsers.findOne(userdataId, {
        select: { feedbackState: true },
      }).then((data) => data.feedbackState);
  
  //has a feedback response
  return (state===FeedbackState.MAILED);
}

export async function kira_user_pickup_mails(userdataId) {
  
  await kira_user_set_feedback(userdataId, FeedbackState.READED);

  //const h_data_messages = await api.KiraNotes.findMany({
  //  filter: [
  //    {
  //      recipientPtr: { equals: userdataId },
  //    }
  //  ],
  //});

  const h_user = await api.KiraUsers.findOne(userdataId, {
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



export async function kira_user_send_mail(userdataId, message)
{
  await kira_user_set_feedback(userdataId, FeedbackState.MAILED);

  await api.KiraLetters.create({
    content: {
      markdown: message,
    },
    recipientPtr: {
      _link: userdataId,
    },
  });
}



export async function kira_user_get_owned_booksItemId(userdataId) {

  const h_user = await api.KiraUsers.findOne(userdataId, {
    select: {
      ownedBooksPtr: {
        edges: {
          node: {
            id: true,
          },
        },
      },
    },
  });

  return h_user.ownedBooksPtr.edges.map((the) => the.node.id);
}


//uses

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
