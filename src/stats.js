import { api } from "gadget-server";
import { format_time_string_from_int } from './tools.js';



//type :
//1 = int counter
//2 = list counter
//3 = dict counter [you can use the DictKey parameter]
//4 = time (int in s) [you can use the lang parameter]

export const stats_old = {
  "book_kill":
  {
	new:"all_kill",
    begin:{},
    type:3,
    cousin: "kills",
    cousinRaw: false
  },
  "book_hit":
  {
	new:"note_hit",
    begin:0,
    type:1,
    cousin: "hits",
    cousinRaw: false
  },
  "book_try":
  {
	new:"note_try",
    begin:0,
    type:1
  },

  "ever_death":
  {
	new:"ever_death",
    begin:0,
    type:1
  },
  "ever_deathTime":
  {
	new:"ever_deadTime",
    begin:0,
    type:4
  },
  "ever_apple":
  {
	new:"ever_apple",
    begin:0,
    type:1
  },
  "ever_book":
  {
	new:"ever_book",
    begin:0,
    type:1
  }
};


//type :
//1 = int counter
//2 = list counter
const stats_all = {
  "all_kill":
  {
	type:1,
    begin:0
  },
  "note_hit":
  {
	type:1,
    begin:0
  },
  "note_try":
  {
	type:1,
    begin:0
  },
  "note_counter":
  {
	type:1,
    begin:0
  },

  "ever_death":
  {
	type:1,
    begin:0
  },
  "ever_deadTime":
  {
	type:3,
    begin:0
  },
  "ever_apple":
  {
	type:1,
    begin:0
  },
  "ever_book":
  {
	type:1,
    begin:0
  }
};

//used in #stats command
export const stats_order_misc = [
  "note_kill",
  "note_hit",
  "note_try",
  "note_counter",
  "ever_death",
  "ever_deadTime",
  "ever_apple",
  "ever_book",
]

const stats_pair_place = ["_one", "_two"];
const stats_pair_place_reverse = ["_two", "_one"];


//--- SIMPLE ---
//GET

//simply get the value at a key from stats model
export async function stats_simple_get(f_modelStatsId, f_statKey)
{
  //getting the value
  return await api.KiraUserStats.findOne(f_modelStatsId,{
    [f_statKey]:true
  }).then(obj => obj[f_statKey]);
  //.then(elem => (f_begin && elem===null) ? stats_all[f_statKey].begin : elem);
}

export function stats_simple_is_default(f_statKey, f_value)
{
  //getting the value
  return (f_value === ((stats_all[f_statKey]) ? stats_all[f_statKey].begin : 0));
}

export function stats_parse(f_statKey, f_value, f_lang=undefined)
{
  switch (stats_all[f_statKey].type)
  {
    case 3: return format_time_string_from_int(f_value, f_lang);
	default: return f_value;
  }
}




/*
export function stats_parse(f_stat, f_statKey, f_lang=undefined, f_dictKey=undefined)
{
  switch (stats_all[f_statKey].type)
  {
    case 1:
    {
      return f_stat;
    } break;

    case 2:
    {
      return f_stat?.length;
      } break;

    case 3:
      {
        if (f_dictKey)
          return f_stat[f_dictKey];
        else
          return Object.keys(f_stat)?.length;
      } break;

    case 4:
    {
      if (f_lang)
        return format_time_string_from_int(f_stat, f_lang);
      else
        return f_stat;
    } break;
  }
}

export async function stats_get(f_modelStatsId, f_statKey, f_raw = false, f_dictKey = undefined)
{
  //getting the value
  await api.KiraUserStats.findOne(f_modelStatsId,{
    [f_statKey]:true
  }).then(obj => obj[f_statKey]);

  if (f_raw || !h_stats[f_statKey])
  {
    return h_stats[f_statKey]
  }

  return stats_parse(h_stats[f_statKey], f_statKey, undefined, f_dictKey);
}

//when stats_all[f_statKey].type...
//= 1 -> f_add : int
//= 2 -> f_add : element
export async function stats_add(f_userdataId, f_statKey, f_add=1, f_dictKey=undefined)
{
  //getting
  let h_stats = await api.KiraUsers.findOne(f_userdataId,{
    select: {
      stats: true
    }
  }).then(obj => obj.stats);

  //initalize
  if (!h_stats[f_statKey])
  {
    h_stats[f_statKey] = stats_all[f_statKey].begin;
  }

  //edit
  switch (stats_all[f_statKey].type)
  {
    case 1:
    {
      h_stats[f_statKey] += f_add;
    } break;

    case 2:
    {
      if (h_stats[f_statKey].includes(f_add)) return false;
      h_stats[f_statKey].push(f_add);
      } break;
    
    case 3:
    {
      if (!f_dictKey)
      {
        f_dictKey = f_add;
        f_add = 1;
      }
      if (h_stats[f_statKey][f_dictKey])
        h_stats[f_statKey][f_dictKey]+=f_add;
      else
        h_stats[f_statKey][f_dictKey]=f_add;
    } break;

    case 4:
    {
      h_stats[f_statKey] += f_add;
    } break;
  }

  //set
  let h_property =
  {
    stats: h_stats
  }
  if (stats_all[f_statKey].cousin)
  {
    h_property[stats_all[f_statKey].cousin] = (stats_all[f_statKey].cousinRaw) ? h_stats[f_statKey] : stats_geter(h_stats[f_statKey], f_statKey)
  }
  await api.KiraUsers.update(
    f_userdataId, h_property
  );
  return true;
}
*/

//SET

//simply set the value at a key to an stats model
export async function stats_simple_set(f_modelStatsId, f_statKey, f_statValue)
{
  //getting the value
  await api.KiraUserStats.update(f_modelStatsId,{
    [f_statKey]: f_statValue
  });
}

//simply add to the value at a key to an stats model
export async function stats_simple_add(f_modelStatsId, f_statKey, f_statValueAdd=1)
{
  //getting the value
  const h_value=await stats_simple_get(f_modelStatsId, f_statKey) + f_statValueAdd;
  await api.KiraUserStats.update(f_modelStatsId,{
    [f_statKey]: h_value
  });
  return h_value;
}

export async function stats_simple_bulkadd(f_modelStatsId, f_dictionnary)
{
  for (let k in f_dictionnary)
  {
	f_dictionnary[k]+=await stats_simple_get(f_modelStatsId, k)
  }
  //getting the value
  await api.KiraUserStats.update(f_modelStatsId,f_dictionnary);
}


//--- PAIR ---

//CREATE
async function stats_pair_create(f_user1_dataId, f_user1_userId, f_user2_dataId, f_user2_userId)
{
  const h_places=(f_user1_userId > f_user2_userId) ? stats_pair_place_reverse : stats_pair_place;
  
  return await api.KiraUserPair.create(
	{
	  [`userPtr${h_places[0]}`]: { _link: f_user1_dataId},
	  [`userPtr${h_places[1]}`]: { _link: f_user2_dataId},
	  [`userId${h_places[0]}`]: f_user1_userId,
	  [`userId${h_places[1]}`]: f_user2_userId
	}
  );
}

//GET
export async function stats_pair_get_id(f_user1_dataId, f_user1_userId, f_user2_dataId, f_user2_userId, f_creatingIfNot=true)
{
  const h_places=(f_user1_userId > f_user2_userId) ? stats_pair_place_reverse : stats_pair_place;

  let h_found=await api.KiraUserPair.maybeFindFirst(
	{
	  filter: {
		  [`userId${h_places[0]}`]: {equals: f_user1_userId},
		  [`userId${h_places[1]}`]: {equals: f_user2_userId}
	  },
	  select: {
		id: true
	  }
	}
  );

  console.log("found=",h_found,
	  {
		  [`userId${h_places[0]}`]: {equals: f_user1_userId},
		  [`userId${h_places[1]}`]: {equals: f_user2_userId}
	  });

  if (!h_found)
    if (f_creatingIfNot)
	  h_found=await stats_pair_create(f_user1_dataId, f_user1_userId, f_user2_dataId, f_user2_userId);
	else
	  return undefined;
  
  return [h_found.id,(f_user1_userId > f_user2_userId)];
}

async function stats_pair_get_bykey(f_pairId, f_fullKey)
{
  return await api.KiraUserPair.findOne(f_pairId, {select: {[f_fullKey]: true}}).then(obj => obj[f_fullKey]);
}

//f_pair : [<pairId>, ifFromIsTwo]
export async function stats_pair_get_value(f_pair, f_key)
{
  const h_places=(f_pair[1]) ? stats_pair_place_reverse : stats_pair_place;
  
  return await stats_pair_get_bykey(f_pair[0],f_key+h_places[0]);
}


//f_pair : [<pairId>, ifFromIsTwo]
//f_keysDict : {<key> : <wanted>...}
//wanted : 0=no, 1=from, 2=to, 3=both
export async function stats_pair_get_multiples(f_pair, f_keysDict)
{
  const h_places=(f_pair[1]) ? stats_pair_place_reverse : stats_pair_place;

  keysToReturnAs={};
  for (let k of f_keysDict)
  {
	switch (f_keysDict[k])
	{
		case 3:
		case 1: {
			keysToReturnAs[k+h_places[0]]=1;
		} break;
		case 3:
		case 2: {
			keysToReturnAs[k+h_places[1]]=2;
		} break;
	}
  }

  const h_data = await api.KiraUserPair.findOne(f_pair[0], {select: keysToReturnAs});

  let r=[{},{}];
  for (let k of keysToReturnAs)
  {
	r[keysToReturnAs[k]-1]=h_data[k];
  }
  return r;
}
//return [{<keyFrom>: <value>},{<keyTo>: <value>}]


//SET

//f_pair : [<pairId>, ifFromIsTwo]
export async function stats_pair_set(f_pair, f_key, f_value)
{
  const h_places=(f_pair[1]) ? stats_pair_place_reverse : stats_pair_place;
  
  f_key=f_key+h_places[0];

  await api.KiraUserPair.update(f_pair[0], {[f_key]: f_value});
}


//f_pair : [<pairId>, ifFromIsTwo]
export async function stats_pair_add(f_pair, f_key, f_addValue)
{
  const h_places=(f_pair[1]) ? stats_pair_place_reverse : stats_pair_place;
  
  f_key=f_key+h_places[0];
  const h_value=await stats_pair_get_bykey(f_pair[0], f_key)+f_addValue;

  await api.KiraUserPair.update(f_pair[0], {[f_key]: h_value});
  return h_value;
}