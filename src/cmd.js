console.log("LOG : cmd : refresh");
//--- sett ---

const enum_know_for = {
  NONE: 0,
  VICTIM: 1,
  ATTACKER: 2
};

const sett_know = {
  //lang :
  //"cmd.kira.start.mp.<for>.pay.<index>"
  //"cmd.know.get.<index>"
  who: {
    price: 1,
    for: enum_know_for.VICTIM
  },
  where: {
    price: 3,
    for: enum_know_for.VICTIM
  },
  fullwho: {//old victim
    price: 100,
    for: enum_know_for.NONE
  },
  fullwhere: {//old victim
    price: 50,
    for: enum_know_for.NONE
  },
  delmsg: {
    price: 2,
    for: enum_know_for.ATTACKER
  },
}

const sett_emoji_apple_eat =
{
  name: 'apple_croc',
  id: '1266010583623532574',
  animated: true
}
const sett_emoji_burn_confirm = {
  "id": null,
  "name": "🔥"
};
const sett_daily_amount = 1;

function sett_apples_byVictimKills(f_kills) {
  return parseInt((f_kills) ** 0.5);
}
const sett_counter_combo_max = 13;

//--- imports ---

//dependancies
import { RouteContext } from "../gadget-server";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { DiscordRequest } from '../utils.js';
import { DiscordUserById } from '../utils.js';

//own
//import { sleep } from './tools.js';

import { translate, lang_choice, lang_lore, lang_get, lang_set } from './lang.js';

import { kira_user_get, kira_user_set_life, kira_user_get_daily, kira_user_set_daily, kira_user_add_apple } from './kira.js';//kira user
import { kira_users_rank_apple, kira_users_rank_kill, kira_users_rank_hit } from './kira.js';//kira user
import { kira_book_create, kira_book_delete, kira_book_get, kira_book_color_choice, book_colors } from './kira.js';//kira book
import { kira_run_create, kira_run_delete, kira_run_get, kira_run_of, kira_run_pack, kira_run_unpack_execute, kira_run_unpack_know, kira_runs_by } from './kira.js';//kira run
import { kira_line_append, kira_line_get_page, kira_line_get_last_indexPage, kira_line_if_pageGood, kira_line_taste } from './kira.js';//kira line
import { kira_apple_claims_set, kira_apple_claims_add, kira_apple_claims_get, kira_format_applemoji } from './apple.js';//kira apples

import { stats_simple_get, stats_simple_is_default, stats_simple_set, stats_simple_add, stats_simple_bulkadd, stats_parse, stats_order_misc } from './stats.js';
import { stats_pair_get_id, stats_pair_get_value, stats_pair_get_multiples, stats_pair_add } from './stats.js';

import { random_rule, format_time_string_from_int } from './tools.js';

import { linkme } from './remember.js';
linkme("linked from cmd");//need to use a function from there




//the structure to describe the command
const commands_structure =
{

  //OP
  "god": {
    functions:
    {
      exe: cmd_god,
      checks: [[check_is_god, false]]
    },
    register:
    {
      name: 'god',
      contexts: [0],
      description: 'An admin-only command',

      options: [
        {
          type: 3,
          name: 'action',
          description: 'the action to do',
          required: true,
          choices: [
            { name: "test", value: "test", description: 'execute the test script' },
            { name: "revive", value: "revive", description: 'revive someone' },
            { name: "kill", value: "kill", description: 'kill someone' },
            { name: "mercy", value: "mercy", description: 'cancel someone\'s death' },
            { name: "give apple", value: "apple_give", description: 'give apple' },
            { name: "gift apple", value: "apple_fake", description: 'fake giving apple' },
          ]
        },
        {
          type: 6,
          name: 'user',
          description: 'the potential user to do things on',
          required: false
        },
        {
          type: 4,
          name: 'amount',
          description: 'the potential amount',
          required: false
        },
      ],
      /*
      options: [
        {
          name: 'test',
          description: 'execute the test script',
          type: 1
        },
        {
          name: 'revive',
          description: 'revive someone',
          options: [
            {
              type: 6,
              name: 'user',
              description: 'the person to revive',
              required: true
            },
          ],
          type: 1
        },
        {
          name: 'kill',
          description: 'kill someone',
          options: [
            {
              type: 6,
              name: 'user',
              description: 'the person to kill',
              required: true
            },
          ],
          type: 1
        },
      ],
      */
      type: 1
    }
  },

  //SET
  "claim": {
    functions:
    {
      exe: cmd_claim,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'claim',
      description: 'Claim your death note',
      contexts: [0],
      options: [
        {
          type: 4,
          name: 'color',
          description: 'choose black please',
          choices: kira_book_color_choice()
        }
      ],
      type: 1
    }
  },

  "burn": {
    functions:
    {
      exe: cmd_burn,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'burn',
      description: 'Burn your death note. Why would you do that?',
      contexts: [0],
      type: 1
    }
  },

  //GET
  "stats": {
    functions:
    {
      exe: cmd_stats,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'stats',
      description: 'Getting your stats',
      contexts: [0],
      type: 1,
      options: [
        {
          type: 3,
          name: 'categorie',
          description: 'stats about...',
          required: true,
          choices: [{ name: "General", value: "misc" }, { name: "People", value: "relation" }]
        }
      ]
    }
  },

  "lang": {
    functions:
    {
      exe: cmd_lang,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'lang',
      description: 'Set/Get the human language I speak',
      contexts: [0],
      options: [
        {
          type: 3,
          name: 'language',
          description: 'set the language',
          required: false,
          choices: lang_choice([{ name: "<Default>", value: "mine" }])
        },
      ],
      type: 1
    }
  },

  //GET
  "apple": {
    functions:
    {
      exe: cmd_apple,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'apple',
      description: 'Claim your daily apple, claim obtained apples, and get your number of apples',
      contexts: [0],
      type: 1
    }
  },

  "top": {
    functions:
    {
      exe: cmd_top,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'top',
      description: 'The top 3 players on multiples things',
      contexts: [0],
      options: [
        {
          type: 3,
          name: 'on',
          description: 'have the most...',
          required: true,
          choices: [{ name: "Apples", value: "apple" }, { name: "Kills", value: "kill" }, { name: "Murders", value: "murder" }]
        }
      ],
      type: 1
    }
  },


  "rules": {
    functions:
    {
      exe: cmd_rules,
      checks: [[check_can_alive, false], [check_has_book, false]]
    },
    register:
    {
      name: 'rules',
      description: 'Get a random rules of the death note',
      contexts: [0],
      type: 1
    }
  },

  "see": {
    functions:
    {
      exe: cmd_see,
      checks: [[check_can_alive, false], [check_has_book, false]]
    },
    register:
    {
      name: 'see',
      description: 'Read what you wrote in your death note',
      contexts: [0],
      options: [
        {
          type: 4,
          name: 'page',
          description: 'the page to look',
          required: false,
          min_value: 1
        },
      ],
      type: 1
    }
  },

  "running": {
    functions:
    {
      exe: cmd_running,
      checks: [[check_can_alive, false]]
    },
    register:
    {
      name: 'running',
      description: 'See who will be killed',
      contexts: [0],
      type: 1
    }
  },

  //SET
  "kira": {
    functions:
    {
      exe: cmd_kira,
      checks: [[check_can_alive, false], [check_has_book, false]]
    },
    register:
    {
      name: 'kira',
      description: 'Kill someone after 40 seconds',
      contexts: [0],
      options: [
        {
          type: 6,
          name: 'victim',
          description: 'the person to kill',
          required: true
        },
        {
          type: 3,
          name: 'reason',
          description: 'is "heart attack" by default',
          required: false,
        },
        {
          type: 4,
          name: 'span',
          description: 'is 40 seconds by default',
          required: false,
          min_value: 40,
          max_value: 1987200,
        }
      ],
      type: 1
    }
  },


  "know": {
    functions:
    {
      exe: cmd_know,
      checks: [[check_can_alive, true], [check_has_book, true]]
    },
    systemOnly: true
    /*
    register:
    {
      name: 'know',
      description: 'INDEV',
      contexts: [0],
      options: [
        {
          type: 3,
          name: 'wh',
          description: 'what to know',
          required: true,
          choices: [{ name: "who?", value: "who" }, { name: "where?", value: "where"}]
        },
        {
          type: 4,
          name: 'id',
          description: 'kira_run\'s id',
          required: true
        },
      ],
      type: 1
    }
     */
  },
};

//--- technical ---
//dont have to be edited
export async function kira_cmd(f_deep, f_cmd) {
  /**f_deep :
   * - (api)
   * - (reply)
   * - user
   * - |lang|
   * body
   * - ~~type~~
   * - (id)
   * - data
   * - member
   * - ([token])
   * - (message)
   * datamodels
   * - |userdata|
   * - |userbook|
   */
  // usable ~~unusable~~ (unused) [used here] |created here|


  //new datas

  //get the user data element.
  //if dont exist, it's automaticly created.
  f_deep.userdata = await kira_user_get(f_deep.user.id, true);
  //get the user's book
  //if dont exist, is undefined
  f_deep.userbook = await kira_book_get(f_deep.userdata.id);
  //get user lang
  //lang selected, else discord lang
  f_deep.lang = lang_get(f_deep);

  //errors
  if (!commands_structure[f_cmd]) {//error 404
    return {
      method: 'PATCH',
      body: {
        content: kira_error_msg("error.point.404",{message: `unknow command [${f_cmd}]`}, f_deep.lang),
      }
    };
  }

  let replyed = false;// used only if catch
  try {
    
    //checks
    for (let v of commands_structure[f_cmd].functions.checks) {
      const r_check = await v[0](f_deep);
      if (r_check) {//if the check is not validated
        await DiscordRequest(`interactions/${f_deep.id}/${f_deep.token}/callback`, {method:'POST', body: { type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data: { flags: (v[1]) ? (InteractionResponseFlags.EPHEMERAL) : (undefined) } }});
        return r_check;
      }
    }

    await DiscordRequest(`interactions/${f_deep.id}/${f_deep.token}/callback`, {method:'POST', body: { type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE }});
    replyed = true;

    return await commands_structure[f_cmd].functions.exe(f_deep);
  }
    
  catch (e) {
    if (!replyed)
      await DiscordRequest(`interactions/${f_deep.id}/${f_deep.token}/callback`, {method:'POST', body: { type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE }});
    console.log("ERROR : cmd wrong js : ", e);
    kira_error_throw("error.system.wrongjs", e, f_deep.lang, f_deep.token, true);
    return;// will not bcs throw before
  }
};

export function kira_error_msg(f_errorKey, f_errorObject, f_lang)
{
  return translate(f_lang, f_errorKey, { name: f_errorObject.name, message: f_errorObject.message })  
}

export async function kira_error_throw(f_errorKey, f_errorObject, f_lang, f_token, f_ifThrow=true) {
  await DiscordRequest(`webhooks/${process.env.APP_ID}/${f_token}/messages/@original`,
    {
      method: 'PATCH',
      body: {
        content: kira_error_msg(f_errorKey, f_errorObject, f_lang)
      }
    }
  );
  if (f_ifThrow)
    throw f_errorObject;
};

export function cmd_register() {
  let r_commandsRegisterAll = [];
  for (let i in commands_structure) {
    if (commands_structure[i].register) {
      r_commandsRegisterAll.push(commands_structure[i].register);
    } else if (!commands_structure[i].systemOnly) {
      r_commandsRegisterAll.push({
        name: i,
        description: '<no register field>',
        type: 1
      });
    }
  }
  return r_commandsRegisterAll;
}


//--- the checks ---
//

//"god" check
function check_is_god(dig) {
  if (!dig.userdata.is_god) {
    return {
      method: 'PATCH',
      body: {
        content: translate(dig.lang, "check.god.not")
      }
    };
  }
  return undefined;
};

//"alive" check
function check_is_alive(dig) {
  if (!dig.userdata.is_alive) {
    return {
      method: 'PATCH',
      body: {
        content: translate(dig.lang, "check.alive.not")
      }
    };
  }
  return undefined;
};

async function check_can_alive(dig) {
  if (!dig.userdata.is_alive) {//is not alive
    const h_ping = parseInt((new Date(dig.userdata.backDate).getTime() - new Date().getTime()) / 1000);
    if (h_ping > 0) {//can not be bring back
      return {
        method: 'PATCH',
        body: {
          content: translate(dig.lang, "check.alive.not", { "time": format_time_string_from_int(h_ping, dig.lang) }),
        }
      };
    }
    //bring back
    await kira_user_set_life(dig.userdata.id, true);
    //continue
  }
  //gud
  return undefined;
};

//"book" check
function check_has_book(dig) {
  if (!dig.userbook) {
    return {
      method: 'PATCH',
      body: {
        content: translate(dig.lang, "check.hasbook.not")
      },
    };
  }
  return undefined;
}


//--- the commands ---



//#god command
async function cmd_god({ userdata, data, lang }) {
  
  const arg_sub=data.options.find(opt => opt.name === "action")?.value;// also data.options[0].value
  const arg_user=data.options.find(opt => opt.name === "user")?.value;
  const arg_amount=data.options.find(opt => opt.name === "amount")?.value;
 
  switch (arg_sub)
  {
    //#life subcommand (#revive & #kill)
    case ("revive"): {};
    case ("kill"):
    {
      if (!arg_user) {
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, "cmd.god.life.fail.missing.user")
          }
        };
      }
  
      const h_targetId = arg_user;
      const targetdata = await kira_user_get(h_targetId, false);
  
      if (!targetdata) {
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, "cmd.god.life.fail.notplayer")
          }
        };
      }
  
      const h_life = (arg_sub === "revive");
  
      if (targetdata.is_alive === h_life) {
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, `cmd.god.life.fail.already.${h_life ? "alive" : "dead"}`, { "targetId": h_targetId })
          }
        };
      }
  
      await kira_user_set_life(targetdata.id, h_life, 120);
  
      return {
        method: 'PATCH',
        body: {
          content: translate(lang, `cmd.god.life.done.${h_life ? "revive" : "kill"}`, { "targetId": h_targetId })
        },
      };
    } break;

    //#apple subcommand (#apple_fake & #apple_give)
    case ("apple_fake"): {};
    case ("apple_give"): {
	  
      if (!arg_user) {
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, "cmd.god.apple.fail.missing.user")
          }
        };
      }

	  const h_fake = !(arg_sub === "apple_give");

      if (!arg_amount) {
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, "cmd.god.apple.fail.missing.amount")
          }
        };
      }
	  
      const h_targetId = arg_user;
      const targetdata = await kira_user_get(h_targetId, false);
	  
      if (!targetdata) {
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, "cmd.god.apple.fail.notplayer")
          }
        };
      }

	  const h_given = (h_fake) ? 0 : arg_amount;
	  const h_identity = `${(h_fake) ? "fake" : "real"}.${(h_given<0) ? "remove" : "add"}`;
      
      kira_apple_claims_add(targetdata.id, { "added": h_given, "displayed": Math.abs(arg_amount), "type": "admin."+h_identity  });
	  
      return {
        method: 'PATCH',
        body: {
          content: translate(lang, "cmd.god.apple.done."+h_identity, { "targetId": h_targetId, "displayed": Math.abs(arg_amount), "word": translate(lang, `word.apple${(Math.abs(arg_amount) > 1) ? "s" : ""}`) })
        }
      };

	} break;
  
  
    //#test subcommand
    case ("test"): {
		let r;
		
		//if (false)
		{
  			const arg_user_data = await kira_user_get(arg_user, false);
			const h_pair = await stats_pair_get_id(userdata.id, userdata.userId, arg_user_data.id, arg_user);

			console.time("test:cost");
			const repeat=(arg_amount) ? arg_amount : (11);
			let r_som=0;
			let r_all=[];
			for (let i=0;i<repeat;i++)
			{
				const start = Date.now();
				//console.log("test:cost:operation:",);
				//the operation to test
				
    			const h_value = await stats_pair_add(h_pair, "test", 1);//return the value
				//await stats_pair_get_id(userdata.id, userdata.userId, arg_user_data.id, arg_user);
				//await stats_simple_bulkadd(userdata.statPtr.id, {"ever_test":1,"ever_test2":1});
				//await stats_simple_add(userdata.statPtr.id, "ever_test");
				//await stats_simple_add(userdata.statPtr.id, "ever_test2");
				//await stats_simple_get(userdata.statPtr.id, "ever_test")
				const end = Date.now();
				const gap_ms = (end-start);
				console.log("test:cost:time:",gap_ms);
				r_som+=gap_ms;
				r_all.push(gap_ms);
			}
			r_all.sort((a,b)=> a - b);
			console.log(r_all);
			r= `operation repeated ${repeat} times.\ntotal=${Math.round(r_som)}ms  average=${Math.round(r_som/repeat)}ms  median=${Math.round(r_all[Math.floor(repeat/2)])}ms  min=${Math.round(r_all[0])}ms  max=${Math.round(r_all[repeat-1])}ms`;
			console.log(r);
			console.timeEnd("test:cost");
		}

		if (false)
		{
			console.time("test:things");
  			const arg_user_data = await kira_user_get(arg_user, false);
			const h_pair = await stats_pair_get_id(userdata.id, userdata.userId, arg_user_data.id, arg_user);
    		const h_value = await stats_pair_add(h_pair, "test", 1);//return the value
			console.log(`details:`,[userdata.id, userdata.userId, arg_user_data.id, arg_user]);
			r=`added to pair. value=${h_value}.`;
			console.timeEnd("test:things");
		}

		/*
		console.time("test");
		console.log("time('test') started");
		let v;
		console.timeEnd("test");
		
		console.time("test");
		v= await stats_simple_get(userdata.statPtr.id, "ever_book");
		console.log("get stat:",v);
		console.timeEnd("test");
		
		console.time("test");
		v=await stats_add(userdata.id, "ever_book");
		console.log("add stats:",v);
		console.timeEnd("test");
		
		console.time("test");
		v=await stats_add(userdata.id, "ever_book");
		console.log("add stats:",v);
		console.timeEnd("test");
		
		console.time("test");
		v= await kira_user_set_daily(userdata.id);
		console.log("set daily:",v);
		console.timeEnd("test");
		
		console.time("test");
		v= await kira_user_get_daily(userdata.id);
		console.log("get daily:",v);
		console.timeEnd("test");
		*/
  
      return {
        method: 'PATCH',
        body: {
          content: translate(lang, "cmd.god.test.done")+ ((r) ? (" `"+r+"`") : ""),
        },
      };
    } break;
  
  
    default: {
      return {
        method: 'PATCH',
        body: {
          content: kira_error_msg("error.point.404",{message: `unknow god action [${data.options[0].value}]`}, lang),
        },
      };
    } break;


  }
}



//#claim command
async function cmd_claim({ userdata, data, userbook, lang }) {
  if (userbook) {
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, "cmd.claim.fail.already")
      },
    };
  }

  else {
    let h_color = 0;
    let h_price = 0;

    if (data.options) {
      h_color = data.options[0].value;
      h_price = book_colors[h_color].price;

      //
      if (h_price > 0) {
        let h_book_amount = await stats_simple_get(userdata.statPtr.id, "ever_book");
        if (!h_book_amount > 0) {//cant pay your first death note
          return {
            method: 'PATCH',
            body: {
              content: translate(lang, "cmd.claim.fail.color.young")
            }
          };
        }

        if (data.options[1])
        {//has clicked on the button
          if (userdata.apples < h_price) {
            //fail because too poor
            return {
              method: 'PATCH',
              body: {
                content: translate(lang, "cmd.claim.fail.color.poor")
              }
            };
          } else {
            //do it
            kira_user_add_apple(userdata, h_price * -1);
          }
        }
        else
        {//send the button
          return {
            method: 'PATCH',
            body: {
              content: translate(lang, `cmd.claim.confirm.color.${book_colors[h_color].color}`),
              components: [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `makecmd claim ${h_color}+true`,
                      label: translate(lang, `cmd.claim.confirm.button`, { "price": h_price }),
                      emoji: sett_emoji_apple_eat,
                      style: (userdata.apples < h_price) ? ButtonStyleTypes.SECONDARY : ButtonStyleTypes.SUCCESS,
                      disabled: false
                    },
                  ]
                }
              ]
            }
          };
        }
      }
    }

    await kira_book_create(userdata, h_color);
    await stats_simple_add(userdata.statPtr.id, "ever_book");
    
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.claim.done.${(h_price === 0) ? "free" : "paid"}`, { emoji: book_colors[h_color].emoji })
      }
    };
  }
}


//#burn command
async function cmd_burn({ request, data, userbook, lang }) {

  if (!userbook) {
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, "cmd.burn.already")
      }
    };
  }

  if (!data.options)
  {
    
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.burn.confirm`),
        components: [
          {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `makecmd burn true`,
                label: translate(lang, `cmd.burn.confirm.button.ok`),
                emoji: sett_emoji_burn_confirm,
                style: ButtonStyleTypes.DANGER,
                disabled: false
              },
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `makecmd burn false`,
                label: translate(lang, `cmd.burn.confirm.button.no`),
                style: ButtonStyleTypes.SECONDARY,
                disabled: false
              },
            ]
          }
        ]
      }
    };
  }

  if (!data.options[0] || !data.options[0].value)
  {
    //remove components from the message
    //this does not works if know is used as a command
    await DiscordRequest(
      `channels/${request.body.channel_id}/messages/${request.body.message.id}`,
      {
        method: 'PATCH',
        body: {
          components: []
        },
      });
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.burn.cancel`),
      }
    }
  }
  
  
  console.log("DBUG : cmd : burn userbook=",userbook);
  // throw new Error("you would have burned it with sucress.");
  await kira_book_delete(userbook);

  return {
    method: 'PATCH',
    body: {
      content: translate(lang, "cmd.burn.done")
    },
  };
}


//#apples command
async function cmd_apple({ userdata, lang }) {

  let h_apples_claimed = 0;
  let h_txt_claims = "";

  let date_day = await kira_user_get_daily(userdata.id);
  let date_now = new Date();
  const date_diff_seconds = (date_now.getTime() - date_day.getTime()) / 1000;


  //claims

  //60 * 60 = 3600
  //60 * 60 * 12 = 43200
  //60 * 60 * 24 = 86400
  if (date_diff_seconds > 43200) {//claim you daily
    await kira_user_set_daily(userdata.id);
    h_apples_claimed += sett_daily_amount;
    h_txt_claims += translate(lang, `cmd.apples.claim.daily`, { "added": 1 }) + "\n";
  }

  const h_claims = await kira_apple_claims_get(userdata.id);
  await kira_apple_claims_set(userdata.id, []);

  if (h_claims.length > 0) {
    for (let i = 0; i < h_claims.length; i++) {
      h_txt_claims += translate(lang, `cmd.apples.claim.${h_claims[i].type}`, h_claims[i]) + "\n";
      h_apples_claimed += h_claims[i].added;
    }
  }

  await kira_user_add_apple(userdata, h_apples_claimed);
  await stats_add(userdata.statPtr.id, "ever_apple", h_apples_claimed);//stats


  return {
    method: 'PATCH',
    body: {
      content: h_txt_claims + translate(lang, `cmd.apples.get.${(h_apples_claimed > 0) ? "changed" : "same"}`, { "added": 1, "amount": userdata.apples + h_apples_claimed, "word": translate(lang, `word.apple${(userdata.apples + h_apples_claimed > 1) ? "s" : ""}`), "emoji": kira_format_applemoji(userdata.apples + h_apples_claimed) })
    }
  };
}



//#top command
async function cmd_top({ data, lang }) {


  const h_on = data.options[0].value;
  //get
  let h_ranks;
  let h_amountK;
  switch (h_on)
  {
    case ("apple"): {
      h_ranks = await kira_users_rank_apple();
      h_amountK = "apples";
    } break;
    case ("kill"): {
      h_ranks = await kira_users_rank_kill();
      h_amountK = "kills";
    } break;
    case ("murder"): {
      h_ranks = await kira_users_rank_hit();
      h_amountK = "murders";
    } break;
  }

  //formating
  {
    let h_txt = ""

    let h_nl = "";
    for (let i = 0; i < 3; i++) {
      h_txt += h_nl + translate(lang, `cmd.best.get.${h_on}.place`, { "rank": i + 1, "playerId": h_ranks[i].userId, "amount": h_ranks[i][h_amountK] });
      h_nl = "\n";
    }

    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.best.get.${h_on}.title`),
        embeds: [{
          description: h_txt
        }]
      }
    };
  }
}


//#rules command
async function cmd_rules({ lang }) {

  return {
    method: 'PATCH',
    body: {
      content: translate(lang, "cmd.rules.english")+"\n"+translate(lang, "cmd.rules.preamble"),
      embeds:
        [
          {
            description: random_rule(),
            //footer: {text: `how to use it I`}
          }
        ]
    }
  }
}



//#stats command
async function cmd_stats({ data, userdata, lang }) {
  let h_match = data.options[0].value

  let r_text;
  let r_lore = "";

  switch (h_match) {

    case "misc": {
        for (let k of stats_order_misc) {
        	const value = await stats_simple_get(userdata.statPtr.id, k);
			//if (!stats_simple_is_default(k, value))
			if (value)
			{
				console.log("YEEEEEE ",k);
            	r_lore = `${r_lore}\n${translate(lang, `stats.misc.show.${k}`, { "value": stats_parse(k, value, lang) })}`;
			}
		};
      if (r_lore==="") {
        r_text = translate(lang, `stats.misc.fail.nothing`);
      } else {
        r_text = translate(lang, `stats.misc.show`);
      }
    } break;

    case "relation": {
	  throw Error("todo");

      if (h_stats.book_kill) {
        r_text = translate(lang, `stats.relation.show`);
        for (let k in h_stats.book_kill) {
          r_lore = `${r_lore}\n${translate(lang, `stats.relation.person`, { "whoId":k, "value": h_stats.book_kill[k], "unit": translate(lang, `word.time${(h_stats.book_kill[k] > 1) ? "s" : ""}`) })}`;
        }
      } else {
        r_text = translate(lang, `stats.relation.fail.nothing`);
      }
    } break;
  }

  return {
    method: 'PATCH',
    body: {
      content: r_text,
      embeds: (r_lore === "") ?
        undefined
        : [{
          description: r_lore
        }]
    }
  };
}



//#running
async function cmd_running({ data, userbook, user, lang }) {
  let h_runs_attacker = await kira_runs_by(undefined, user.id);

  let r_text;
  let r_lore = "";

  if (h_runs_attacker.length > 0) {
    r_text = translate(lang, `stats.running.show`);
    for (let v of h_runs_attacker) {
        let h_ping = parseInt((new Date(v.finalDate).getTime() - new Date().getTime()) / 1000);
        r_lore += `\n${translate(lang, `stats.running.attacker`, { "victimId": v.victimId,  "span": format_time_string_from_int(h_ping, lang) })}`;
    }
  } else {
    r_text = translate(lang, `stats.running.fail.nothing`);
  }

  return {
    method: 'PATCH',
    body: {
      content: r_text,
      embeds: (r_lore === "") ?
        undefined
        : [{
          description: r_lore
        }]
    }
  };
}



//#lang command
async function cmd_lang({ data, userdata, request, lang }) {

  let r_txt;
  if (data.options) {
    let h_lang = data.options[0].value;
    if (h_lang === "mine") {
      let lore = lang_lore(request.body.locale);
      await lang_set(userdata.id, null);
      r_txt = translate(request.body.locale, "cmd.lang.your.set") + lore;
    } else {
      let lore = lang_lore(h_lang);
      await lang_set(userdata.id, h_lang);
      r_txt = translate(h_lang, "cmd.lang.define.set") + lore;
    }
  }
  else {
    let lore = lang_lore(lang);
    if (userdata.lang)
      r_txt = translate(lang, "cmd.lang.define.get") + lore;
    else
      r_txt = translate(lang, "cmd.lang.your.get") + lore;
  }

  return {
    method: 'PATCH',
    body: {
      content: r_txt
    }
  };
}


//#see command
async function cmd_see({ data, userbook, lang }) {

  //arg/page

  const h_lastPage = await kira_line_get_last_indexPage(userbook);
  let h_page = h_lastPage;
  if (data.options) h_page = data.options[0].value;

  if (!await kira_line_if_pageGood(userbook, h_page - 1)) {
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, "cmd.page.fail.none", { "number": h_page })
      }
    };
  }

  //page/make
  const h_lines = await kira_line_get_page(userbook, h_page - 1);
  let h_content = "";
  let t_delim = "";
  for (let i = 0; i < h_lines.length; i++) {
    if (h_lines[i])
      h_content += t_delim + (h_lines[i].line.markdown);
    else
      h_content += t_delim + "———————————————————";
    t_delim = "\n";
  }

  return {
    method: 'PATCH',
    body: {
      content: translate(lang, "cmd.page.get.up", { "number": h_page }),
      embeds: [{
        color: book_colors[userbook.color].int,
        description: `${h_content}`,
        footer: {
          text: `${h_page} / ${h_lastPage}`
        }
      }],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd see`,
              style: ButtonStyleTypes.SECONDARY,
              emoji: book_colors[userbook.color].emojiObj,
              disabled: false
            },
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd see ${h_page - 1}`,
              label: translate(lang, "cmd.page.get.left", { page: h_page - 1 }),
              style: ButtonStyleTypes.SECONDARY,
              disabled: !await kira_line_if_pageGood(userbook, h_page - 2)
            },
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd see ${h_page + 1}`,
              label: translate(lang, "cmd.page.get.right", { page: h_page + 1 }),
              style: ButtonStyleTypes.SECONDARY,
              disabled: !await kira_line_if_pageGood(userbook, h_page)
            },
          ],
        }
      ]
    }
  };
}

//#kira command
async function cmd_kira({ request, user, userdata, data, userbook, channel, lang, token }) {

  //arg/victim
  const h_victim_id = data.options[0].value;
  let h_victim = await DiscordUserById(h_victim_id);
  //if (h_victim.global_name)
  let h_victim_name = h_victim.username;

  //arg/reason
  let h_txt_reason = data.options.find(opt => opt.name === "reason");
  if (h_txt_reason) h_txt_reason = h_txt_reason.value;
  if (!h_txt_reason) h_txt_reason = translate(lang, `format.default.death`);

  //arg/span
  let h_span = data.options.find(opt => opt.name === "span");
  if (h_span) h_span = h_span.value;
  if (!h_span) h_span = 40;

  
  //checks/first
  let h_will_ping_attacker = true;
  let h_will_ping_victim = true;
  let h_will_fail = false;

  if (h_victim.id === process.env.APP_ID) {//fail because god of death
    h_will_ping_victim = false;
    h_will_fail = true;
  }

  if (h_victim.id === user.id) {//fail because urself
    h_will_ping_attacker = false;
  }

  if (!request.body.guild) {//instant fail because victim not here
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, "cmd.kira.fail.channel")
      },
    };
  }

  try {
    let user = await DiscordRequest(
      `/guilds/${request.body.guild.id}/members/${h_victim_id}`,
      //`/users/${h_victim_id}`,
      {
        method: 'GET'
      }).then(res => res.json());
  }
  catch (error) {
    console.log("DBUG : kira : catch cant acess to user : ", error);
    if (JSON.parse(error.message)?.code === 10007)
    {//instant fail because victim not here
      return {
        method: 'PATCH',
        body: {
          content: translate(lang, "cmd.kira.fail.blind", { "victimId": h_victim_id })
        },
      };
      throw error;
    }
  }

  let h_victim_data = await kira_user_get(h_victim_id, h_will_fail);//needed to know if alive

  //check/others runs
  let run_combo = 1;
  {
    //if attacker is not already killing victim
    let h_run_same = await kira_run_of(h_victim_id, user.id);
    if (h_run_same) {
      console.log("LOG : kira : A already killing V : ", h_run_same);
      //if (new Date(h_run_same.finalDate) < new Date(h_now.getTime() + 610000))//!if sentance late of 10 second
      return {
        method: 'PATCH',
        body: {
          content: translate(lang, "cmd.kira.fail.edit")
        }
      };
    }
  }

  {
    //if victim is not already killing attacker
    let h_run_reverse = await kira_run_of(user.id, h_victim_id);
    if (h_run_reverse) {
      console.log("LOG : kira : V already killing A : ", h_run_reverse);
      run_combo = h_run_reverse.counterCombo + 1;

      if (run_combo>sett_counter_combo_max)
      {// too much combo
        console.log("LOG : kira : counter is max comobo=",run_combo);
        return {
          method: 'PATCH',
          body: {
            content: translate(lang, "cmd.kira.fail.maxcombo", {"max": sett_counter_combo_max})
          },
        }
      }
      
      //cancel death if itself
      console.log("LOG : kira : countering... comobo=",run_combo);
      await cmd_kira_cancel({ more: { runId: h_run_reverse.id } });
      console.log("LOG : kira : countered");
      //and continue
    }
  }

    if (!h_will_fail && // if will fail = possibily no victim_data
        !h_victim_data.is_alive) 
    {//instant fail because is dead
      return {
        method: 'PATCH',
        body: {
          content: translate(lang, "cmd.kira.fail.isdead")
        },
      };
    }

  
  //line
  let h_txt_span = format_time_string_from_int(h_span, lang);
  const h_line = translate(lang, "format.line", { "victim": h_victim_name, "reason": h_txt_reason, "time": h_txt_span });

  if (h_line.length > 256 && !userdata.is_god)
  //54*3 : 3 less than lines
  {//fail bcs too long
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, "cmd.kira.fail.text.max")
      },
    };
  }

  //checked !

  //validate writting
  const h_note = await kira_line_append(userdata, userbook, h_line);

  //stat
  await stats_simple_add(userdata.id, "note_try");

  //creat kira run
  const h_run = await kira_run_create(h_span, user.id, h_victim_id, h_victim_data?.id, run_combo);

  var h_all_msg = translate(lang, "cmd.kira.start.guild", { "attackerId": user.id, "line": h_line });


  //message/victim
  if (h_will_ping_victim) {
    //open DM
    var h_victim_dm = await DiscordRequest(
      `users/@me/channels`,
      {
        method: 'POST',
        body:
        {
          recipient_id: h_victim_id
        }
      }).then(res => res.json());
    //send message
    try {
      var h_victim_message = await DiscordRequest(
        `channels/${h_victim_dm.id}/messages`,
        {
          method: 'POST',
          body: {
            content: translate(lang, "cmd.kira.start.mp.victim", { "time": h_txt_span }),
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: (() => {
                  let buttons = [];
                  for (let i in sett_know) {
                    if (sett_know[i].for === enum_know_for.VICTIM)
                      buttons.push(
                        {
                          type: MessageComponentTypes.BUTTON,
                          custom_id: `makecmd know ${i}+${h_run.id}`,
                          label: translate(lang, `cmd.kira.start.mp.victim.pay.${i}`, { "price": sett_know[i].price }),
                          emoji: sett_emoji_apple_eat,
                          style: (userdata.apples < sett_know[i].price) ? ButtonStyleTypes.SECONDARY : ButtonStyleTypes.SUCCESS,
                          disabled: false
                        }
                      )
                  }
                  return buttons;
                })()
              }
            ]
          }
        }).then(res => res.json());
    }
    catch (e) {
      let errorMsg = JSON.parse(e.message);
      if (errorMsg?.code === 50007) {
        h_all_msg += "\n" + translate(lang, "cmd.kira.warn.nomp", { "userId": h_victim_id });
        h_will_ping_victim = false;
      }
      else
        throw e;
    }
  }


  //message/attacker
  if (h_will_ping_attacker) {
    //open DM
    var h_attacker_dm = await DiscordRequest(
      `users/@me/channels`,
      {
        method: 'POST',
        body:
        {
          recipient_id: user.id
        }
      }).then(res => res.json());
    //send message
    try {
      var h_attacker_message = await DiscordRequest(
        `channels/${h_attacker_dm.id}/messages`,
        {
          method: 'POST',
          body: {
            content: translate(lang, "cmd.kira.start.mp.attacker", { "victimId": h_victim.id, "time": h_txt_span }),
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: (() => {
                  let buttons = [];
                  for (let i in sett_know) {
                    if (sett_know[i].for === enum_know_for.ATTACKER)
                      buttons.push(
                        {
                          type: MessageComponentTypes.BUTTON,
                          custom_id: `makecmd know ${i}+${h_run.id}`,
                          label: translate(lang, `cmd.kira.start.mp.attacker.pay.${i}`, { "price": sett_know[i].price }),
                          emoji: sett_emoji_apple_eat,
                          style: (userdata.apples < sett_know[i].price) ? ButtonStyleTypes.SECONDARY : ButtonStyleTypes.SUCCESS,
                          disabled: false
                        }
                      )
                  }
                  return buttons;
                })()
              }
            ]
          },
        }).then(res => res.json());
    }
    catch (e) {
      let errorMsg = JSON.parse(e.message);
      if (errorMsg?.code === 50007) {
        h_all_msg += "\n" + translate(lang, "cmd.kira.warn.nomp", { "userId": user.id });
        h_will_ping_attacker = false;
      }
      else
        throw e;
    }
  }

  //packing before wait
  await kira_run_pack(h_run.id,
    {//used to execute
      txt_reason: h_txt_reason,
      span: h_span,
      note_id: h_note.id,

      lang: lang,

      will_ping_victim: h_will_ping_victim,
      will_ping_attacker: h_will_ping_attacker,
      will_fail: h_will_fail,

      victim_id: h_victim.id,
      victim_data_id: h_victim_data?.id,// is possibly undefined (when [will_fail])
      victim_username: h_victim_name,
      victim_dm_id: h_victim_dm?.id,//can be undefined
      victim_message_id: h_victim_message?.id,//can be undefined
      attacker_id: user.id,
      // attacker_data_id: ?,
      attacker_dm_id: h_attacker_dm?.id,//can be undefined
      attacker_message_id: h_attacker_message?.id,//can be undefined
      attacker_book_id: userbook.id,
    },
    {//used to know
      attacker_id: user.id,
      attacker_name: user.username,
      guild_id: channel.guild_id,
      channel_id: channel.id,
      channel_name: channel.name,
      message_id: channel.id,
      the_token: token,
    }
  );

  //message/all
  return {
    method: 'PATCH',
    body: {
      content: h_all_msg
    }
  };
  
  //pretty old method
  //setTimeout(() => { cmd_kira_execute({ more, user, lang }); }, h_span * 1000);
}




//is executed by [./remember.js]
export async function cmd_kira_execute({ more }) {
  //if (!more.run)
  console.log(`LOG : kira : EXECUTE. runId=${more.runId}`);

  //run reading
  if (!more.runId) {
    console.log(`ERROR : kira : runId not defined. more=`, more);
    return;
  }
  const pack = await kira_run_unpack_execute(more.runId);
  if (!pack) {
    console.log(`ERROR : kira : run deleted. more=`, more);
    await kira_run_delete(more.runId);
    return;
  }

  //datas reading again
  const user = await DiscordUserById(pack.attacker_id);//!
  const lang = pack.lang;//!
  let h_victim_data = await kira_user_get(pack.victim_id, !pack.will_fail);//needed to know if alive
  let userdata = await kira_user_get(user.id, true);
  const h_attacker_book = await kira_book_get(userdata.id);
  //handle special case : burned book
  const h_will_book_victim = (!h_attacker_book || h_attacker_book.id != pack.attacker_book_id);

  
  //run delete
  await kira_run_delete(more.runId, h_victim_data?.id);
  console.log(`LOG : kira : deleted. (runId=${more.runId})`);

  try {
    //message/victim/first/edit
    if (pack.will_ping_victim) {
      await DiscordRequest(
        `channels/${pack.victim_dm_id}/messages/${pack.victim_message_id}`,
        {
          method: 'PATCH',
          body: {
            components: []
          },
        });
    }

    //message/attacker/first/edit
    if (pack.will_ping_attacker) {
      await DiscordRequest(
        `channels/${pack.attacker_dm_id}/messages/${pack.attacker_message_id}`,
        {
          method: 'PATCH',
          body: {
            components: []
          },
        });
    }
  }
  catch (e) {
    let errorMsg = JSON.parse(e.message);
    if (!(errorMsg?.code === 50007))
      throw e;
  }


  //check/second
  let h_return_msg_attacker = {
    message_reference:
    {
      message_id: pack.attacker_message_id
    }
  };
  let h_return_msg_victim = {
    message_reference:
    {
      message_id: pack.victim_message_id
    }
  };

  if (pack.victim_id === process.env.APP_ID) {
    //fail/god
    h_return_msg_attacker.content = translate(lang, "cmd.kira.fail.shini");
  }
  else if (!h_victim_data) {
    //will never happend
    h_return_msg_attacker.content = translate(lang, "cmd.kira.fail.notplayer");
  }
  else if (!h_victim_data.is_alive) {
    h_return_msg_attacker.content = translate(lang, "cmd.kira.fail.victim.dead.attacker");
    h_return_msg_victim.content = translate(lang, "cmd.kira.fail.victim.dead.victim");
  }
  //else if (!userdata.is_alive) {
  //  h_return_msg_attacker.content = translate(lang, "cmd.kira.fail.attacker.dead.attacker");
  //  h_return_msg_victim.content = translate(lang, "cmd.kira.fail.attacker.dead.victim");
  //}

  //kill
  else {
    //sucess
    h_return_msg_attacker.content = translate(lang, "cmd.kira.finish.attacker", { "victimId": pack.victim_id, "reason": pack.txt_reason });
    h_return_msg_victim.content = translate(lang, "cmd.kira.finish.victim", { "reason": pack.txt_reason });

    //kill
    await kira_user_set_life(h_victim_data.id, false, pack.span);
    if (h_will_book_victim) await kira_line_taste(pack.note_id, 1);//note need to exist

    //stats
    await stats_simple_add(userdata.statPtr.id, "note_hit");
    await stats_simple_add(h_victim_data.statPtr.id, "ever_death");
    await stats_simple_add(h_victim_data.statPtr.id, "ever_deathTime", pack.span);
    
	const h_pair=await stats_pair_get_id(userdata.id, user.id, h_victim_data.id, pack.victim_id);
    const h_repetition=await stats_pair_add(h_pair, "note_kill", 1);//return the value

    if (h_repetition === 1) {//first time attacker kill victim
      await stats_simple_add( userdata.statPtr.id, "all_kill", 1);//!
      
	  //monetize kill
	  let h_victim_kills = await stats_simple_get(h_victim_data.statPtr.id, "all_kill");
      console.log("DBUG : kira : kills by victim for apples : ", h_victim_kills);
      let h_apples = 0;//default
      if (h_victim_kills) {
        h_apples = sett_apples_byVictimKills(h_victim_kills);
        kira_apple_claims_add(userdata.id, { "added": h_apples, "type": "murderer", "victim": pack.victim_username, "attacker": user.username, "kill": h_victim_kills });
      } else {
        kira_apple_claims_add(userdata.id, { "added": h_apples, "type": "harmless", "victim": pack.victim_username, "attacker": user.username });
      }
      h_return_msg_attacker.content += "\n" + translate(lang, "cmd.kira.finish.attacker.first", { "number": h_apples, "unit": translate(lang, `word.apple${(h_apples > 1) ? "s" : ""}`) });
    } else {
      h_return_msg_attacker.content += "\n" + translate(lang, "cmd.kira.finish.attacker.count", { "number": h_repetition });
    }
  }


  //send messages in last

  try {
    //message/victim/second
    if (pack.will_ping_victim) {
      await DiscordRequest(
        `channels/${pack.victim_dm_id}/messages`,
        {
          method: 'POST',
          body: h_return_msg_victim
        });
    }

    //message/attacker/second
    if (pack.will_ping_attacker) {
      await DiscordRequest(
        `channels/${pack.attacker_dm_id}/messages`,
        {
          method: 'POST',
          body: h_return_msg_attacker
        });
    }
  }
  catch (e) {
    let errorMsg = JSON.parse(e.message);
    if (!(errorMsg?.code === 50007))
      throw e;
  }
}


//is not executed by [./remember.js]
export async function cmd_kira_cancel({ more }) {
  console.log(`kira : CANCEL. runId=${more.runId}`);

  //run reading
  if (!more.runId) {
    console.log(`ERROR : runId not defined. more=`, more);
    return;
  }
  const pack = await kira_run_unpack_execute(more.runId);
  if (!pack) {
    console.log(`ERROR : run deleted. more=`, more);
    await kira_run_delete(more.runId);
    return;
  }

  //datas reading again
  const user = DiscordUserById(pack.attacker_id);//!
  const lang = pack.lang;//!
  // let h_victim_data = await kira_user_get(pack.victim_id, !pack.will_fail);//needed to know if alive

  //run delete
  await kira_run_delete(more.runId, pack.victim_data_id);

  //message/victim/first/edit
  try {
    if (pack.will_ping_victim) {
      await DiscordRequest(
        `channels/${pack.victim_dm_id}/messages/${pack.victim_message_id}`,
        {
          method: 'PATCH',
          body: {
            components: []
          },
        });
    }

    //message/attacker/first/edit
    if (pack.will_ping_attacker) {
      await DiscordRequest(
        `channels/${pack.attacker_dm_id}/messages/${pack.attacker_message_id}`,
        {
          method: 'PATCH',
          body: {
            components: []
          },
        });
    }


    //message/victim/second
    if (pack.will_ping_victim) {
      await DiscordRequest(`channels/${pack.victim_dm_id}/messages`,
        {
          method: 'POST',
          body:
          {
            message_reference:
            {
              message_id: pack.victim_message_id
            },
            content: translate(lang, "cmd.kira.counter.victim", { "victimId": pack.victim_id, "attackerId": pack.attacker_id })
          }
        });
    }

    //message/attacker/second
    if (pack.will_ping_attacker) {
      await DiscordRequest(
        `channels/${pack.attacker_dm_id}/messages`,
        {
          method: 'POST',
          body: {
            message_reference:
            {
              message_id: pack.attacker_message_id
            },
            content: translate(lang, "cmd.kira.counter.attacker", { "victimId": pack.victim_id, "attackerId": pack.attacker_id })
          }
        });
    }
  }
  catch (e) {
    let errorMsg = JSON.parse(e.message);
    if (!(errorMsg?.code === 50007))
      throw e;
  }
}


//#know command

async function cmd_know({ data, request, userdata, lang }) {

  //args

  let h_wh = data.options[0].value;
  let h_id = data.options[1].value;

  const pack = await kira_run_unpack_know(h_id);

  //fail bcs too late
  if (!pack) {
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, "cmd.know.fail.expired"),
      },
    };
  }

  const h_price = sett_know[h_wh].price;

  //apples
  if (userdata.apples < h_price) {//if hasn't enougth
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.know.fail.poor`, { "price": h_price }),
      }
    };
  }
  kira_user_add_apple(userdata, -1 * h_price);

  //wich info/action
  let h_info;
  if (h_wh === "who") {
    h_info = `${pack.attacker_name.charAt(0).toUpperCase()}`;
  } else if (h_wh === "where") {
    h_info = `${pack.channel_name}`;

  } else if (h_wh === "fullwho") {
    h_info = `<@${pack.attacker_id}>`;
  } else if (h_wh === "fullwhere") {
    //h_info = `<#${pack.guild_id}>`;//didnt work
    h_info = `<#${pack.channel_id}>`;
  } else if (h_wh === "delmsg") {
    //delete the message
    await DiscordRequest(`webhooks/${process.env.APP_ID}/${pack.the_token}/messages/@original`,
      {
        method: 'DELETE'
      }
    );
  }

  //remove components from the message
  //this does not works if know is used as a command
  await DiscordRequest(
    `channels/${request.body.channel_id}/messages/${request.body.message.id}`,
    {
      method: 'PATCH',
      body: {
        components: []
      },
    });

  //respond with a message
  //get the info
  return {
    method: 'PATCH',
    body: {
      //content: `you are trying to know [${h_wh}] for id [${h_id}]`
      content: translate(lang, `cmd.know.get.${h_wh}`, { "wh": h_info, "price": h_price })
    }
  };
}