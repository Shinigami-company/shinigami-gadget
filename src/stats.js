import { api } from "gadget-server";
import { time_format_string_from_int } from "./tools.js";

//--- SIMPLE ---

//type :
//1 = int counter
//2 = list counter
//3 = dict counter [you can use the DictKey parameter]
//4 = time (int in s) [you can use the lang parameter]

const stats_simple_all = {
do_kill: {type: 1},
do_hit: {type: 1},
do_try: {type: 1},
do_counter: {type: 1},
do_outerTime: {type: 4},

is_killed: {type: 1},
is_hited: {type: 1},
is_tried: {type: 1},
is_countered: {type: 1},
is_outedTime: {type: 4},

ever_apple: {type: 1},
ever_book: {type: 1},
ever_test: {type: 1},

misc_match: {type: 1},

streak_appleDay: {type: 1},
streak_killDay: {type: 1},
streak_pageFilled: {type: 1},
};

//used in #stats command
export const stats_order_broad = [
  "do_kill",
  "do_hit",
  "do_try",
  "do_counter",
  "do_outerTime",
  "is_hited",
  "is_outedTime",
  "ever_book",
  "ever_apple",
  "streak_appleDay",
];

export const stats_order_ratio = {
  "hit":["do_hit","is_hited"],
  "kill":["do_kill","is_killed"],
  "counter":["do_counter","is_countered"],
  "time":["do_outerTime","is_outedTime"],
};

//GET

//simply get the value at a key from stats model
export async function stats_simple_get(f_modelStatsId, f_statKey) {
  //getting the value
  return await api.KiraUserStats.findOne(f_modelStatsId, {
    [f_statKey]: true,
  }).then((obj) => obj[f_statKey])
  .then(elem => (elem===null) ? 0 : elem);
}

export function stats_simple_is_default(f_statKey, f_value) {
  //getting the value
  return (
    f_value === 0 || f_value === null
    //f_value === (stats_simple_all[f_statKey]?.begin ? stats_simple_all[f_statKey].begin : 0)
  );
}

export function stats_parse(f_statKey, f_value, f_lang = undefined) {
  switch (stats_simple_all[f_statKey].type) {
    case 4:
      return time_format_string_from_int(f_value, f_lang);
    default:
      return f_value;
  }
}

//SET

//simply set the value at a key to an stats model
export async function stats_simple_set(f_modelStatsId, f_statKey, f_statValue) {
  //getting the value
  await api.KiraUserStats.update(f_modelStatsId, {
    [f_statKey]: f_statValue,
  });
}

//simply add to the value at a key to an stats model
export async function stats_simple_add(
  f_modelStatsId,
  f_statKey,
  f_statValueAdd = 1
) {
  //getting the value
  const h_value =
    (await stats_simple_get(f_modelStatsId, f_statKey)) + f_statValueAdd;
  await api.KiraUserStats.update(f_modelStatsId, {
    [f_statKey]: h_value,
  });
  return h_value;
}

export async function stats_simple_bulkadd(f_modelStatsId, f_dictionnary) {
  for (let k in f_dictionnary) {
    f_dictionnary[k] += await stats_simple_get(f_modelStatsId, k);
  }
  //getting the value
  await api.KiraUserStats.update(f_modelStatsId, f_dictionnary);
	return f_dictionnary;
}

//--- PAIR ---

const stats_pair_place = ["_one", "_two"];
const stats_pair_place_reverse = ["_two", "_one"];
const stats_pair_all = {
  by_hit: {
    type: 1
  },
  by_counter: {
    type: 1
  },
};

//CREATE
async function stats_pair_create(
  f_user1_dataId,
  f_user1_userId,
  f_user2_dataId,
  f_user2_userId
) {
  const h_places =
    f_user1_userId > f_user2_userId
      ? stats_pair_place_reverse
      : stats_pair_place;

  return await api.KiraUserPair.create({
    [`userPtr${h_places[0]}`]: { _link: f_user1_dataId },
    [`userPtr${h_places[1]}`]: { _link: f_user2_dataId },
    [`userId${h_places[0]}`]: f_user1_userId,
    [`userId${h_places[1]}`]: f_user2_userId,
  });
}

//GET
export async function stats_pair_get_id(
  f_user1_dataId,
  f_user1_userId,
  f_user2_dataId,
  f_user2_userId,
  f_creatingIfNot = true
) {
  const h_places =
    f_user1_userId > f_user2_userId
      ? stats_pair_place_reverse
      : stats_pair_place;

  let h_found = await api.KiraUserPair.maybeFindFirst({
    filter: {
      [`userId${h_places[0]}`]: { equals: f_user1_userId },
      [`userId${h_places[1]}`]: { equals: f_user2_userId },
    },
    select: {
      id: true,
    },
  });

  if (!h_found)
    if (f_creatingIfNot)
      h_found = await stats_pair_create(
        f_user1_dataId,
        f_user1_userId,
        f_user2_dataId,
        f_user2_userId
      );
    else return undefined;

  return [h_found.id, f_user1_userId > f_user2_userId];
}

async function stats_pair_get_bykey(f_pairModelId, f_fullKey) {
  return await api.KiraUserPair.findOne(f_pairModelId, {
    select: { [f_fullKey]: true },
  }).then((obj) => obj[f_fullKey]);
}

//f_pair : [<pairId>, ifFromIsTwo]
export async function stats_pair_get_value(f_pair, f_key) {
  const h_places = f_pair[1] ? stats_pair_place_reverse : stats_pair_place;

  return await stats_pair_get_bykey(f_pair[0], f_key + h_places[0]);
}

//f_pair : [<pairId>, ifFromIsTwo]
//f_keysDict : {<key> : <wanted>...}
//wanted : 0=no, 1=from, 2=to, 3=both
export async function stats_pair_get_multiples(f_pair, f_keysDict) {
  const h_places = f_pair[1] ? stats_pair_place_reverse : stats_pair_place;

  let keys_returnAs = {};
  let keys_select = {};
  for (const k in f_keysDict) {
		if (f_keysDict[k]==1 || f_keysDict[k]==3)
    {
      keys_returnAs[k + h_places[0]] = [0,k];
			keys_select[k + h_places[0]] = true;
    }
		if (f_keysDict[k]==2 || f_keysDict[k]==3)
    {
      keys_returnAs[k + h_places[1]] = [1,k];
			keys_select[k + h_places[1]] = true;
    }
  }

  const h_data = await api.KiraUserPair.findOne(f_pair[0], {
    select: keys_select,
  });

  let r = [{}, {}];
  for (let k in keys_returnAs) {
    r[keys_returnAs[k][0]][keys_returnAs[k][1]] = h_data[k];
  }
  return r;
}
//return [{<keyFrom>: <value>},{<keyTo>: <value>}]

//f_keysDict : {<key> : <wanted>...}
//wanted : 0=no, 1=from, 2=to, 3=both
export async function stats_pairs_get_all(f_userId) {
	
	let r=[]
	for (const place of stats_pair_place)
	{
	  const h_pairs = await api.KiraUserPair.findMany({
	    filter: {
	      [`userId${place}`]: { equals: f_userId },
	    },
			select: {
				id: true
			}
	  });
		for (let i=0;i<h_pairs.length;i++)
			r.push([h_pairs[i].id, place==stats_pair_place[1]]);
	}
  return r;
}


//SET

//f_pair : [<pairId>, ifFromIsTwo]
export async function stats_pair_set(f_pair, f_key, f_value) {
  const h_places = f_pair[1] ? stats_pair_place_reverse : stats_pair_place;

  f_key = f_key + h_places[0];

  await api.KiraUserPair.update(f_pair[0], { [f_key]: f_value });
}

//f_pair : [<pairId>, ifFromIsTwo]
export async function stats_pair_add(f_pair, f_key, f_addValue) {
  const h_places = f_pair[1] ? stats_pair_place_reverse : stats_pair_place;

  f_key = f_key + h_places[0];
  const h_value = (await stats_pair_get_bykey(f_pair[0], f_key)) + f_addValue;

  await api.KiraUserPair.update(f_pair[0], { [f_key]: h_value });
  return h_value;
}

//--- CHECKUP ---

export async function stats_checkup(f_userdata) {

	let patch = {
		"do_kill":0,
		"do_counter":0,
		"is_killed":0,
		"is_countered":0,
	};

	for (const places of [stats_pair_place, stats_pair_place_reverse])
	{
	  const h_founds = await api.KiraUserPair.findMany({
	    filter: {
	      [`userId${places[0]}`]: { equals: f_userdata.userId },
	    },
	  });
  	
		for (let i = 0; i < h_founds.length; i++) 
		{
			if (h_founds[i][`by_hit${places[0]}`]>1)
				patch["do_kill"]+=1;
			if (h_founds[i][`by_hit${places[1]}`]>1)
				patch["is_killed"]+=1;
			if (h_founds[i][`by_counter${places[0]}`])
				patch["do_counter"]+=h_founds[i][`by_counter${places[0]}`];
			if (h_founds[i][`by_counter${places[1]}`])
				patch["is_countered"]+=h_founds[i][`by_counter${places[1]}`];
			if (h_founds[i][`by_avenge${places[0]}`])
				patch["do_avenger"]+=h_founds[i][`by_avenge${places[0]}`];
			if (h_founds[i][`by_avenge${places[1]}`])
				patch["is_avenged"]+=h_founds[i][`by_avenge${places[1]}`];

		}
	}
  await api.KiraUserStats.update(f_userdata.statPtr.id,patch);
}

//--- RANKING ---

export async function stats_simple_rank(f_onKey) {
  return await api.KiraUserStats.findMany({
    sort: {
      [f_onKey]: "Descending",
    },
    select: {
      userId: true,
      [f_onKey]: true,
    },

    first: 3,
  });
} //return 3 best userdata on [f_onKey]
