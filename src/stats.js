import { api } from "gadget-server";
import { translate } from "./lang.js";
import { format_time_string_from_int } from './tools.js';



//type :
//1 = int counter
//2 = list counter
//3 = dict counter [you can use the DictKey parameter]
//4 = time (in s) [you can use the lang parameter]

export const stats_all = {
  "book_kill":
  {
    begin:{},
    type:3,
    cousin: "kills",
    cousinRaw: false
  },
  "book_hit":
  {
    begin:0,
    type:1,
    cousin: "hits",
    cousinRaw: false
  },
  "book_try":
  {
    begin:0,
    type:1
  },

  "ever_death":
  {
    begin:0,
    type:1
  },
  "ever_deathTime":
  {
    begin:0,
    type:4
  },
  "ever_apple":
  {
    begin:0,
    type:1
  },
  "ever_book":
  {
    begin:0,
    type:1
  }
};

export const stats_order = [
  "book_kill",
  "book_hit",
  "book_try",
  "ever_death",
  "ever_deathTime",
  "ever_apple",
  "ever_book",
]


//type :
//1 = int counter
//2 = list counter
const all_achiv = {
};

export async function stats_get_data(f_userdataId)
{
  //getting
  return await api.KiraUsers.findOne(f_userdataId,{
    select: {
      stats: true
    }
  }).then(obj => obj.stats);

  if (Object.keys(h_stats).length>0)
  {
    let r_text = translate(f_lang,`stats.show`);
    for (let k of stats_order)
    {
      if (h_stats[k])
      r_text = `${r_text}\n${translate(f_lang, `stats.show.${k}`, { "value": stats_geter(h_stats[k], k, f_lang)})}`;
    }
    return r_text;
  } else {
    return translate(f_lang, `stats.fail.nothing`);
  }
};

export function stats_geter(f_stat, f_statKey, f_lang=undefined, f_dictKey=undefined)
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


export async function stats_get(f_userdataId, f_statKey, f_raw = false, f_dictKey = undefined)
{
  //getting
  let h_stats = await api.KiraUsers.findOne(f_userdataId,{
    select: {
      stats: true
    }
  }).then(obj => obj.stats);

  if (f_raw || !h_stats[f_statKey])
  {
    return h_stats[f_statKey]
  }

  return stats_geter(h_stats[f_statKey], f_statKey, undefined, f_dictKey);
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