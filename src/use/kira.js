import { api } from 'gadget-server';

import { userBanType } from '../enum.ts';
import { CreateGlobalCommand, DeleteGlobalCommand, DiscordUserOpenDm, GetGlobalCommand, GetGlobalCommandsId, PutGlobalCommands, UpdateGlobalCommand } from '../utils.js';
import { cmd_register } from '../cmd.js';
import { stats_simple_set, stats_simple_get } from './stats.js';

export async function commands_put() {
  console.debug('kira : refreshcmd : registerCommands()...');
  await PutGlobalCommands(cmd_register());
  console.debug('kira : refreshcmd : registerCommands() done!');
}

export async function command_refresh_one(commandName) {
  console.debug(`kira : refreshcmd : refreshCommand(${commandName})...`);
  let commandsToId = await GetGlobalCommandsId();
  let commandId = commandsToId[commandName];
  let registerWanted = cmd_register(commandName);
  let registerActual = commandId ? await GetGlobalCommand(commandId) : undefined;
  console.debug(`registerWanted:`);
  console.debug(registerWanted);
  console.debug(`registerActual:`);
  console.debug(registerActual);
  if (registerWanted.length > 0)
  {
    registerWanted = registerWanted[0];
  } else {
    registerWanted = undefined;
  }

  // wich method
  if (!registerWanted && !registerActual)
  {
    return 404;//not found
  }
  else if (!registerWanted)
  {
    await DeleteGlobalCommand(commandId);
    return 204;//delete
  }
  
  else if (registerActual)
  {
    await UpdateGlobalCommand(commandId, registerWanted);
    return 200;//updated
  }
  else
  {
    await CreateGlobalCommand(registerWanted);
    return 201;//created
  }
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
      version: true,
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

//capsule
export async function kira_user_set_life(userdata, f_bool, f_backDate = null) {
  if (f_backDate) f_backDate = f_backDate.toISOString();
  await api.KiraUsers.update(userdata.id, {
    is_alive: f_bool,
    backDate: f_backDate,
    lifesteal: (f_bool || !userdata.lifesteal) ? undefined : 0
  });

  if (!f_bool)
  {
    // epoch is in ms, span in s
    let aliveSpan = Math.round((new Date().getTime() - await stats_simple_get(userdata.statPtr.id, "main_aliveSinceUnix")) / 1000);
    let lastBestAliveSpan = await stats_simple_get(userdata.statPtr.id, "ever_bestAliveSpan");
    if (!lastBestAliveSpan || lastBestAliveSpan < aliveSpan) await stats_simple_set(userdata.statPtr.id, "ever_bestAliveSpan", aliveSpan);
  }

  await stats_simple_set(userdata.statPtr.id, "main_aliveSinceUnix", (f_bool) ? new Date().getTime() : null);
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
      [f_onKey]: 'Descending',
    },
    select: {
      id: true,
      userName: true,
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
  let dmId;

  //open new DM
  dmId = await DiscordUserOpenDm(userdata.userId);
  //try {
  //} catch (e) {
  //  //let errorMsg = JSON.parse(e.message);
  //  //if (errorMsg?.code === 50007) {
  //  //  sucess=false;
  //  //} else throw e;
  //}
  if (!dmId) return;
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


export async function kira_user_get_owned_books_note(userdataId) {

  const h_user = await api.KiraUsers.findOne(userdataId, {
    select: {
      ownedNoteBooksPtr: {
        edges: {
          node: {
            id: true,
          },
        },
      },
    },
  });

  return h_user.ownedNoteBooksPtr.edges.map((the) => the.node.id);
}


export async function kira_user_get_owned_books_item(userdataId) {

  const h_user = await api.KiraUsers.findOne(userdataId, {
    select: {
      ownedNoteBooksPtr: {
        edges: {
          node: {
            itemId: true,
          },
        },
      },
    },
  });

  return h_user.ownedNoteBooksPtr.edges.map((the) => the.node.itemId);
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
        finalDate: 'Ascending'
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
