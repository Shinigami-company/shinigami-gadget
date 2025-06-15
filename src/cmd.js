console.log(`cmd : refresh`);
//--- sett ---

import {
  deferedActionType,
  FeedbackState,
  itemType,
  KnowUsableBy,
  penState,
  rememberTasksType,
  userBanType,
} from "./enum.ts";

import { SETT_CMD_GIFT, sett_emoji_gift_claim, sett_emoji_items, sett_options_gift_apples, Settings } from "./sett";

//--- imports ---

//dependancies
import { RouteContext } from "../gadget-server";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
  ChannelTypes,
  TextStyleTypes,
} from "discord-interactions";
import { DiscordRequest } from "./utils.js";
import { DiscordUserById } from "./utils.js";

import {
  SETT_CMD,
  sett_catalog_drops,
  sett_catalog_knows,
  sett_emoji_apple_croc,
  sett_emoji_apple_none,
  sett_emoji_burn_confirm,
  sett_emoji_feedback_confirm,
} from "./sett";

//own
//import { sleep } from './tools.js';

import {
  translate,
  lang_choice,
  lang_lore,
  lang_get,
  lang_set,
} from "./lang"; //all user langugage things

import {
  commands_put,
  kira_run_mercy,
  kira_user_check_banTime,
  kira_user_remove_ban,
  kira_user_set_ban,
  kira_user_dm_id,
  kira_user_update,
  kira_user_get_owned_books_item,
  command_refresh_one,
} from "./use/kira.js"; // god register commands
import {
  kira_user_get,
  kira_user_set_life,
  kira_user_get_daily,
  kira_user_set_daily,
  kira_user_set_drop,
  kira_user_get_drop,
  kira_user_set_feedback,
  kira_user_can_feedback,
} from "./use/kira.js"; //kira user
import { kira_users_rank } from "./use/kira.js"; //kira user
import {
  NoteBook
} from "./use/itemType/book"; //kira book
import {
  kira_run_create,
  kira_run_delete,
  kira_run_get,
  kira_run_of,
  kira_run_pack,
  kira_run_unpack_execute,
  kira_run_unpack_know,
  kira_runs_by,
} from "./use/kira.js"; //kira run
import {
  kira_apple_claims_set,
  kira_apple_claims_get,
  kira_format_applemoji,
  kira_apple_send,
  kira_apple_pay,
} from "./use/apple.js"; //kira apples
import { pen_use, pen_apply_filters } from "./use/itemType/pen";//kira pen

import {
  stats_simple_get,
  stats_simple_is_default,
  stats_simple_set,
  stats_simple_add,
  stats_simple_bulkadd,
  stats_parse,
  stats_simple_rank,
  stats_order_broad,
  stats_order_ratio,
} from "./use/stats.js"; // simple user statistics
import {
  stats_pair_get_id,
  stats_pair_get_value,
  stats_pair_add,
  stats_pair_set,
  stats_pairs_get_all,
  stats_pair_get_multiples,
} from "./use/stats.js"; // pair user statstics
import { stats_checkup } from "./use/stats.js"; // update user statistics
import { Achievement, Schedule } from "./achiv"; // user achivements

import {
  time_format_string_from_int,
  times_precise_string_from_int,
  time_day_gap,
} from "./tools.js"; // tools

import { event_claim_item } from "./use/claim.js";
import { items_info, Item, items_types } from "./use/item";

import { kira_remember_task_add } from "./use/remember.js";
import { linkme } from "./use/remember.js";
linkme("linked from cmd"); //need to use a function from there

//commands components
import { tricks_all } from "./cmd/trick.js";
import { shop_buy_item, shop_byable_items, shop_get_time_next, shop_get_time_remain } from "./cmd/shop.js";
import { cmd_rules } from "./cmd/rules.js";
import { cmd_help } from "./cmd/help.js";
import { webhook_reporter } from "./use/post.js";
import { channel } from "diagnostics_channel";
import { error } from "console";
import { register } from "module";
import { randomInt } from "crypto";
import { act } from "react-dom/test-utils";
import { string_emoji } from "./use/tools.ts";
import { Gift } from "./cmd/gift";


//the structure to describe the command
const commands_structure = {
  //OP
  god: {
    functions: {
      exe: cmd_god,
      checks: [[check_in_guild, true], [check_is_god, false]],
    },
    register: {
      name: "god",
      //contexts: [0],//!disabled
      description: "An admin-only command",

      options: [
        {
          type: 3,
          name: "action",
          description: "the action to do",
          required: true,
          choices: [
            //dev
            {
              name: "test",
              value: "test",
              description: "execute the test script",
            },
            { name: "update", value: "update", description: "update an user" },
            
            //account
            { name: "revive", value: "revive", description: "revive someone" },
            { name: "kill", value: "kill", description: "kill someone" },
            {
              name: "force drop",
              value: "forcedrop",
              description: "drop someone's Death Note",
            },
            {
              name: "no feedback",
              value: "nofeedback",
              description: "remove someone's ability to feedback for a span",
            },
            {
              name: "ban",
              value: "ban",
              description: "confiscate someone's Death Note (for a span)",
            },
            {
              name: "pardon",
              value: "unban",
              description: "give back someone's Death Note",
            },
            {
              name: "mercy",
              value: "mercy",
              description: "cancel someone's death",
            },
            
            //apple
            {
              name: "give apple",
              value: "apple_give",
              description: "give apple",
            },
            {
              name: "gift apple",
              value: "apple_fake",
              description: "fake giving apple",
            },

            //message
            { name: "tell", value: "tell", description: "tell to someone" },
            { name: "info", value: "info", description: "get info about someone" },
            
            //item
            {
              name: "give pen",
              value: "pen",
              description: "give a pen and equip it",
            },
            {
              name: "give item",
              value: "item",
              description: "give a item",
            },
            {
              name: "gift item",
              value: "gift_mp",
              description: "gift an item",
            },
          ],
        },
        {
          type: 6,
          name: "user",
          description: "the potential user to do things on",
          required: false,
        },
        {
          type: 4,
          name: "amount",
          description: "the potential amount",
          required: false,
        },
        {
          type: 3,
          name: "text",
          description: "the potential text",
          required: false,
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
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },
  god_form: {
    functions: {
      exe: cmd_god_form,
      checks: [
        [check_react_is_self, true],
        [check_is_god, true]
      ],
    },
    atr: {
      defered: deferedActionType.NO,
      notDeferred: true,
      systemOnly: true,
    },
  },
  god_submit: {
    functions: {
      exe: cmd_god,
      checks: [
        [check_is_god, true]
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      systemOnly: true,
    },
  },

  ping: {
    functions: {
      exe: cmd_ping,
      checks: [],
    },
    register: {
      name: "ping",
      description: "How fast can I play ping pong?"
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      //ephemeral: true,
    },
  },

  invite: {
    functions: {
      exe: cmd_invite,
      checks: [],
    },
    register: {
      name: "invite",
      description: "Shinigami is aviable on guilds",
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      //ephemeral: true,
    },
  },
  
  help: {
    functions: {
      exe: cmd_help,
      checks: [],
    },
    register: {
      name: "help",
      description: "Get a little tutorial, and advance help on commands.",
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      //ephemeral: true,
    },
  },
  help_edit: {
    functions: {
      exe: cmd_help,
      checks: [
        [check_react_is_self, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_UPDATE,
      systemOnly: true,
    },
  },

  feedback: {
    functions: {
      exe: cmd_feedback,
      checks: [ 
        [check_react_is_self, true],
        [check_can_feedback, true],
      ],
    },
    register: {
      name: "feedback",
      description: "send a message to the realm of the dead",
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      ephemeral: true,
    },
  },
  feedback_form: {
    functions: {
      exe: cmd_feedback_form,
      checks: [
        [check_react_is_self, true],
        [check_can_feedback, true],
      ],
    },
    atr: {
      defered: deferedActionType.NO,
      notDeferred: true,
      systemOnly: true,
    },
  },
  feedback_submit: {
    functions: {
      exe: cmd_feedback,
      checks: [
        [check_react_is_self, true],
        [check_can_feedback, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      ephemeral: true,
      systemOnly: true,
    },
  },

  //SET
  claim: {
    functions: {
      exe: cmd_claim,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_react_is_self, true],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "claim",
      description: "Claim your Death Note",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  burn: {
    functions: {
      exe: cmd_burn,
      checks: [[check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_react_is_self, true],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "burn",
      description: "Burn your Death Note. Why would you do that?",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },
  burn_edit: {
    functions: {
      exe: cmd_burn,
      checks: [
        [check_react_is_self, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_UPDATE,
      systemOnly: true,
    },
  },

  //GET
  apple: {
    functions: {
      exe: cmd_apple,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
      ],
    },
    register: {
      name: "apple",
      description:
        "Claim your daily apple, claim obtained apples, and get your number of apples",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  lang: {
    functions: {
      exe: cmd_lang,
      checks: [ [check_in_guild, true], [check_can_alive, false]],
    },
    register: {
      name: "lang",
      description: "Set/Get the human language I speak",
      //contexts: [0],//!disabled
      options: [
        {
          type: 3,
          name: "language",
          description: "set the language",
          required: false,
          choices: lang_choice([{ name: "<Default>", value: "mine" }]),
        },
      ],
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  stats: {
    functions: {
      exe: cmd_stats,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "stats",
      description: "Getting your stats",
      //contexts: [0],//!disabled
      type: 1,
      options: [
        {
          type: 3,
          name: "categorie",
          description: "stats about...",
          required: true,
          choices: [
            { name: "General", value: "broad" },
            { name: "Performance", value: "ratio" },
            { name: "People", value: "relation" },
          ],
        },
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  running: {
    functions: {
      exe: cmd_running,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "running",
      description: "See who will be killed",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  quest: {
    functions: {
      exe: cmd_quest,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "quest",
      description: "Your achievements",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  top: {
    functions: {
      exe: cmd_top,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
      ],
    },
    register: {
      name: "top",
      description: "The top 3 players on multiples things",
      //contexts: [0],//!disabled
      options: [
        {
          type: 3,
          name: "on",
          description: "have the most...",
          required: true,
          choices: [
            { name: "Apples", value: "apple" },
            { name: "Kills", value: "kill" },
            { name: "Murders", value: "murder" },
            { name: "Time", value: "time" },
          ],
        },
      ],
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  rules: {
    functions: {
      exe: cmd_rules,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    register: {
      name: "rules",
      description: "How to use it",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  see: {
    functions: {
      exe: cmd_see,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    register: {
      name: "see",
      description: "Read what is written in a Death Note",
      //contexts: [0],//!disabled
      options: [
        {
          type: 4,
          name: "page",
          description: "the page to look",
          required: false,
          min_value: 1,
        },
      ],
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },
  see_edit: {
    functions: {
      exe: cmd_see,
      checks: [
        [check_react_is_self, true],
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_UPDATE,
      systemOnly: true,
    },
  },

  pocket: {
    functions: {
      exe: cmd_pocket,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "pocket",
      description: "What do you have in your pockets?",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },
  pocket_edit: {
    functions: {
      exe: cmd_pocket,
      checks: [
        [check_react_is_self, true],
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_UPDATE,
      systemOnly: true,
    },
  },

  gift: {
    register: {
      name: "gift",
      description: "Gift one of your item or some apples.",
      //contexts: [0],//!disabled
      type: 1,
    },
    functions: {
      exe: cmd_gift,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      ephemeral: true,
    }
  },
  giftsend: {
    functions: {
      exe: cmd_gift,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      systemOnly: true
    }
  },
  giftclaim: {
    functions: {
      exe: cmd_gift_claim,
      checks: [
        //[check_in_guild, true],//must be off
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    atr: {
      defered: deferedActionType.NO,
      systemOnly: true
    }
  },

  shop: {
    functions: {
      exe: cmd_shop,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    register: {
      name: "shop",
      description: "You can buy cool things here",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },
  shop_edit: {
    functions: {
      exe: cmd_shop,
      checks: [
        [check_react_is_self, true],
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_UPDATE,
      systemOnly: true,
    },
  },


  //SET
  drop: {
    functions: {
      exe: cmd_drop,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_react_is_self, true],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    register: {
      name: "drop",
      description: "Give up your Death Note to protect yourself",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  trick: {
    functions: {
      exe: cmd_trick,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    register: {
      name: "trick",
      description: "Buy funny stuff with apples",
      //contexts: [0],//!disabled
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      ephemeral: true,
    },
  },
  trick_resp: {
    functions: {
      exe: cmd_trick_resp,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      ephemeral: false,
      systemOnly: true,
    },
  },
  trick_resp_eph: {
    functions: {
      exe: cmd_trick_resp,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      ephemeral: true,
      systemOnly: true,
    },
  },
  trick_resp_edit: {
    functions: {
      exe: cmd_trick_resp,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    atr: {
      defered: deferedActionType.NO,
      //defered: deferedActionType.DUMMY,
      notDeferred: true,
      systemOnly: true,
    },
  },

  kira: {
    functions: {
      exe: cmd_kira,
      checks: [
        [check_in_guild, true],
        [check_is_clean, true],
        [check_can_alive, false],
        [check_has_noDrop, true],
        [check_has_book, false],
      ],
    },
    register: {
      name: "kira",
      description: "Kill someone after 40 seconds",
      //contexts: [0],//!disabled
      options: [
        {
          type: 6,
          name: "victim",
          description: "the person to kill",
          required: true,
        },
        {
          type: 3,
          name: "reason",
          description: 'is "heart attack" by default',
          required: false,
        },
        {
          type: 4,
          name: "span",
          description: "is 40 seconds by default",
          required: false,
          min_value: 40,
          max_value: 1987200,
        },
      ],
      type: 1,
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
    },
  },

  know: {
    functions: {
      exe: cmd_know,
      checks: [
        [check_is_clean, true],
        [check_can_alive, true],
        [check_has_noDrop, true],
        [check_has_book, true],
        //[check_react_is_self, true]// JUST DONT DO IT NOOOOOOOOOO
      ],
    },
    atr: {
      defered: deferedActionType.WAIT_MESSAGE,
      systemOnly: true,
    },
    /*
    register:
    {
      name: 'know',
      description: 'INDEV',
      //contexts: [0],//!disabled
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
   * - ~~reply~~
   * - (source)
   * request
   *  - data
   *  - type
   *  - timespam
   *  - (id)
   *  - ([token])
   * context
   *  - locale
   *  - user
   *  - message
   *  - channel
   *  - guild
   * self
   * - |[cmd]|
   * - ([clock])
   * - |lang|
   * - ([|replyed|])
   * - |ecolor|
   * datamodels
   * - |userdata|
   * - |userbook|
   */
  // usable ~~unusable~~ (unused) [used here] |created here|

  //console.debug(`cmd : f_deep=`, f_deep);
  f_deep.clock.emit("cmd", true);

  //new datas
  f_deep.cmd=f_cmd;

  //get the user data element
  //if dont exist, it's automaticly created
  f_deep.userdata = await kira_user_get(f_deep.user.id, true);
  //get user lang
  //lang selected, else discord lang
  f_deep.lang = await lang_get(f_deep.userdata, f_deep.locale);
  //update user
  await kira_user_update(f_deep.user, f_deep.userdata, f_deep.lang);
  f_deep.clock.emit("got userdata");

  //get the user's book
  //if dont exist, is undefined
  f_deep.userbook = await NoteBook.get(f_deep.userdata.noteBookId, true);
  f_deep.ecolor = f_deep.userbook?.color.int;
  f_deep.clock.emit("got userbook");
  //if replyed by
  //will change a lot here, used by catch
  f_deep.replyed = false;
  
  f_deep.clock.emit("fetched", true);

  //errors
  if (!commands_structure[f_deep.cmd]) {
    //error 404

    //!no report

    return await DiscordRequest(
      // POST the error message
      `interactions/${f_deep.id}/${f_deep.token}/callback`,
      {
        method: "POST",
        body: {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: kira_error_msg(
              "error.message.define.404",
              { message: `unknow command [${f_deep.cmd}]` },
              f_deep.lang
            ),
          },
        },
      }
    );
  }

  let errorWhen = "CmdIdk"; // when is actually used as [errorKey] but define context. in the future :
  // - errorwhen has to be [errorContext] so different context debug message
  // - handle know issues giving each one a new [errorKey]

  /* Interaction Callback Type
~~PONG~~ : dirrectly at POST-interactions.js
(CHANNEL_MESSAGE_WITH_SOURCE) : never used
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE : at request 1
  DEFERRED_UPDATE_MESSAGE : at request 1 //!TODO
  UPDATE_MESSAGE : at cmd //!to move
(APPLICATION_COMMAND_AUTOCOMPLETE_RESULT) : never used
  MODAL : at cmd //!to move
~~PREMIUM_REQUIRED~~ : deprecated
~~LAUNCH_ACTIVIT~~ : not an activity
*/

  try {
    //-checks-
    errorWhen = "CmdCheck";

    for (let v of commands_structure[f_deep.cmd].functions.checks) {
      const r_check_message = await v[0](f_deep);
      if (r_check_message) {
        //if a message, then whe should stop there
        return await DiscordRequest(
          // POST the return message
          `interactions/${f_deep.id}/${f_deep.token}/callback`,
          {
            method: "POST",
            body: {
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: v[1] ? InteractionResponseFlags.EPHEMERAL : undefined,
                ...r_check_message,
              },
            },
          }
        );
      }
    }
    f_deep.clock.emit("checks done");

    //-defered-
    {
      errorWhen = "CmdPrepare1";
      const request_arg=kira_cmd_defered_get(f_deep);
      //send request
      if (request_arg)
      {
        errorWhen = "CmdRequest1";
        f_deep.clock.emit("sending defered", true);
        await DiscordRequest(
          // POST the deferred response
          ...request_arg
        );
        f_deep.clock.emit("sended defered", true);
      }
    }

    //-command-
    errorWhen = "CmdQueue";
    f_deep.clock.emit("queue", true);
    await kira_cmd_queue(f_deep);
  
  } catch (e) {

    await kira_cmd_error(f_deep, e, errorWhen);

  }
}



let commands_queue=[]

async function kira_cmd_queue(f_deep) {
  commands_queue.push(f_deep);
  if (commands_queue.length > 1) return;
  
  while (commands_queue.length > 0) {
    const current_deep = commands_queue[0];
    await kira_cmd_exe(current_deep);
    commands_queue.shift();
  }
}

async function kira_cmd_exe(f_deep)
{
  f_deep.clock.emit("exe", true);
  let errorWhen = "CmdIdk2";
  try {
    errorWhen = "CmdExecute";

    const return_request = await commands_structure[f_deep.cmd].functions.exe(
      f_deep
    );
    if (!return_request) return;

    //-doing-
    {
      errorWhen = "CmdPrepare2";
      const request_url=kira_cmd_respond_get(f_deep);

      errorWhen = "CmdRequest2";
      f_deep.clock.emit("sending respond");
      await DiscordRequest(
        // POST the answer response
        request_url, return_request
      );
      f_deep.clock.emit("sended respond");
      return;
    }
    
    errorWhen = "CmdEnd";
    throw Error("the end");
  
  } catch (e) {

    await kira_cmd_error(f_deep, e, errorWhen);

  }
}



function kira_cmd_defered_get(f_deep) {

  const defered_action = commands_structure[f_deep.cmd].atr.defered; //have to be set
  const defered_ephemeral = commands_structure[f_deep.cmd].atr?.ephemeral;

  if (!defered_action || (defered_action === deferedActionType.NO)) return;
  {
    //request fundation
    let response_request = {
      method: "POST",
      body: {
        type: 0, //will be edited as response type.
      },
    };

    //specific defered action
    switch (defered_action) {
      case deferedActionType.DUMMY:
        {
          response_request.body.type = InteractionResponseType.UPDATE_MESSAGE;
          response_request.method = "PATCH";
          //But only works when f_deep.type is componentsInteraction
        }
        break;

      case deferedActionType.WAIT_MESSAGE:
        {
          response_request.body.type =
            InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
          if (defered_ephemeral)
            response_request.body.data = {
              flags: InteractionResponseFlags.EPHEMERAL,
            };
        }
        break;

      case deferedActionType.WAIT_UPDATE:
        {
          response_request.body.type =
            InteractionResponseType.DEFERRED_UPDATE_MESSAGE;
        }
        break;

      case deferedActionType.EDIT_CLEAN_BUTTONS:
        {
          response_request.body.type = InteractionResponseType.UPDATE_MESSAGE;
          response_request.method = "PATCH";
          response_request.body.components = [];
        }
        break;
    }
    //request replyed
    f_deep.replyed = response_request.body.type;

    //test!!!!!!
    //response_request.body.data = {
    //  flags: 4096
    //  //flags: InteractionResponseFlags.EPHEMERAL
    //};

    return [
      `interactions/${f_deep.id}/${f_deep.token}/callback`,
      response_request
    ];
  }
}

function kira_cmd_respond_get(f_deep)
{
  let url = `nourl/atall`;
  //const return_method = return_request.method.toUpperCase(); //error if not method

  switch (f_deep.replyed) {
    case InteractionResponseType.DEFERRED_UPDATE_MESSAGE:
      {
        //PATCH last message
        //if (return_method==="PATCH") else ERROR
        url = `webhooks/${process.env.APP_ID}/${f_deep.token}/messages/${f_deep.message.id}`;
      }
      break;

    case InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE:
      {
        //PATCH sended message
        //if (return_method==="PATCH") else ERROR
        url = `webhooks/${process.env.APP_ID}/${f_deep.token}/messages/@original`;
      }
      break;

    case InteractionResponseType.UPDATE_MESSAGE: {
    }
    case false:
      {
        //POST by the returned request
        //if (return_method==="POST") else ERROR
        url = `interactions/${f_deep.id}/${f_deep.token}/callback`;
      }
      break;
  }

  //errorWhen = "CmdRequest2";
  return url;
}

async function kira_cmd_error(f_deep, e, errorWhen)
{

  if (!f_deep.replyed) {
    //-defered-
    //if has not been defered before

    try {
      await DiscordRequest(
        // POST the deferred response
        `interactions/${f_deep.id}/${f_deep.token}/callback`,
        {
          method: "POST",
          body: {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          },
        }
      );
    } catch (e2) {
      await kira_error_report(e2, "DiscordRequest", "error", {}, "en");
    }
  }

  console.error(`cmd : catch : found ERROR <${e.name}> [${e.code}] : `, e);
  console.error(`cmd : catch : temp : cause=`, e.cause);

  //-handle-
  //detect know issues

  //discord : Unknown interaction
  if (e.code===10062)
  {
    kira_error_throw(
      e,
      errorWhen,
      "command",
      "error.message.none",
      f_deep,
      false,
      true,
      false,
    );
    return;
  }

  if (
    e.code ===
    "GGT_INTERNAL_ERROR"
  ) {
    kira_error_throw(
      e,
      "GadgetInternal",
      "command",
      "error.message.level.critical", //this issue is critical
      f_deep,
      true,
      true,
      true,
    ); //throw
    return;
  }

  //-handle-
  //any other error

  console.error(
    `cmd : catch : throw ERROR : code=${e.code} name=${e.name} message=${e.message}`
  );
  kira_error_throw(
    e,
    errorWhen,
    "command",
    "error.message.any",
    f_deep,
    true,
    true,
    true,
  ); //throw

  return; // will not bcs throw before
}








export function kira_error_msg(f_errorKey, f_errorObject, f_lang) {
  console.error(`cmd : error msg code=${f_errorObject.code}`);
  return translate(f_lang, f_errorKey, {
    name: f_errorObject.name,
    message: f_errorObject.message,
  });
}

export async function kira_error_report(
  f_errorObject,
  f_errorKey,
  f_contextKey,
  f_contextValues,
  f_athorValues,
  f_lang
) {
  const context = translate(
    f_lang,
    `post.error.tree.context.${f_contextKey}`,
    f_contextValues
  );
  const stack = f_errorObject.stack
    .replace(f_errorObject.message, "")
    .replace(f_errorObject.name, "")
    .substring(2)
    .replace(/    at /gm, "");
  const code = (f_errorObject.code===undefined) ? "no" : f_errorObject.code;
  const all = {
    error: f_errorObject,
    errorStack: stack,
    errorCode: code,
    errorKey: f_errorKey,
    context,
    ...f_athorValues,
  }; //! should we remove f_athorValues from here?
  await webhook_reporter.error.post(
    f_lang,
    all,
    { author: f_athorValues?.user ? true : false },
    16711680// red
  );
}

export async function kira_error_throw(
  f_errorObject, //the error object itself
  f_errorKey, //personnal error key to be displayed (only to dev for now)
  f_errorContext, //the error context key for report
  //actuals aviable : ['command', 'remember', 'error', 'any']
  f_errorMessageKey, //the error message to be translated
  f_deep, //you know
  //f_cmd, //the command used to come here (to change : too specific parameter) (NOW IN F_DEEP)
  ifReport = true,
  ifPatch = true,
  ifThrow = true
) {
  //POST to admin webhook
  if (ifReport)
  await kira_error_report(
    f_errorObject,
    f_errorKey,
    f_errorContext,
    {
      user: f_deep.user,
      userdata: f_deep.userdata,
      channel: f_deep.channel,
      command: f_deep.cmd,
      type: f_deep.type,
    },
    { user: f_deep.user, userdata: f_deep.userdata },
    f_deep.lang
  );

  //PATCH user message
  if (ifPatch)
  await DiscordRequest(
    `webhooks/${process.env.APP_ID}/${f_deep.token}/messages/@original`,
    {
      method: "PATCH",
      body: {
        content: kira_error_msg(f_errorMessageKey, f_errorObject, f_deep.lang),
      },
    }
  );
  if (ifThrow) throw f_errorObject;
}

export function cmd_register(command = undefined) {
  let keys = command ? [ command ] : Object.keys(commands_structure);
  let r_commandsRegisterAll = [];
  for (let i of keys) {
    if (!commands_structure[i]) continue;
    if (commands_structure[i].register) {
      r_commandsRegisterAll.push(commands_structure[i].register);
    } else if (!commands_structure[i].atr?.systemOnly) {
      r_commandsRegisterAll.push({
        name: i,
        description: "<no register field>",
        type: 1,
      });
    }
  }
  return r_commandsRegisterAll;
}

//--- the checks ---
//

//"god" check
function check_is_god({ lang, userdata }) {
  if (!userdata.is_god) {
    return {
      content: translate(lang, "check.god.not"),
    };
  }
  return undefined;
}

//"alive" check
function check_is_alive({ lang, userdata }) {
  if (!userdata.is_alive) {
    return {
      content: translate(lang, "check.alive.not"),
    };
  }
  return undefined;
}

async function check_can_alive({ lang, userdata }) {
  if (userdata.is_alive) return undefined;
  //is not alive
  const h_gap = parseInt(
    (new Date(userdata.backDate).getTime() - new Date().getTime()) / 1000
  );
  if (h_gap > 0 || !SETT_CMD.kira.comebackBy.check.self.if) {
    //can not be bring back
    return {
      content: translate(lang, "check.alive.not", {
        time: time_format_string_from_int(h_gap, lang),
      }),
    };
  }

  //bring back
  await kira_user_set_life(userdata.id, true);

  //message
  if (SETT_CMD.kira.comebackBy.check.self.message) {
    //open DM
    const dm_id = await kira_user_dm_id(userdata);
    //send message
    try {
      //var h_victim_message =
      await DiscordRequest(`channels/${dm_id}/messages`, {
        method: "POST",
        body: {
          content: translate(lang, "cmd.comeback.check.self"),
        },
      });
    } catch (e) {
      let errorMsg = JSON.parse(e.message);
      if (!(errorMsg?.code === 50007)) throw e;
    }
  }
  //gud
  return undefined;
}

//"book" check
async function check_has_book({ lang, userbook, userdata }) {
  if (!userbook) {
    const booksId = await kira_user_get_owned_books_item(userdata.id);
    return {
      content: translate(lang, `check.hasbook.not.${booksId.length > 0 ? 'inhand' : 'inpocket'}`),
    };
  }
  return undefined;
}

function check_has_noDrop({ lang, userdata }) {
  let gap = 0;
  {
    //calculate drop
    const iso = userdata.giveUp;
    if (iso) {
      const span = Math.ceil(
        (new Date(iso).getTime() - new Date().getTime()) / 1000
      );
      if (span > 0) gap = span;
    }
  }
  if (gap > 0) {
    return {
      content: translate(lang, "check.nodrop.not", {
        time: time_format_string_from_int(gap, lang),
      }),
    };
  }
  return undefined;
}

//"ban" check
async function check_is_clean({ lang, userdata }) {
  switch (userdata.banValue) {
    case userBanType.NO: {
    }
    case userBanType.PARDON: {
    }
    case userBanType.EXPIRE: {
    }
    case null:
      {
        return undefined;
      }
      break;

    case userBanType.PERMA:
      {
        return {
          content: translate(lang, "check.ban.is.perma"),
        };
      }
      break;

    case userBanType.TEMP:
      {
        const gap = await kira_user_check_banTime(userdata.id); //something to check
        if (gap > 0) {
          return {
            content: translate(lang, "check.ban.is.temp", {
              time: time_format_string_from_int(gap, lang),
            }),
          };
        }
      }
      break;
  }
  return undefined;
}

//react check
function check_react_is_self({ lang, user, type, message }) {
  console.log(
    `check : check_react_is_self type=${type} IM=${message?.interaction?.user.id} I=${message?.interaction_metadata?.user.id}`
  );
  if (
    type === InteractionType.MESSAGE_COMPONENT &&
    message.interaction_metadata.user.id !== user.id
    //message.interaction.user.id !== user.id (does not works for userselect button)
  ) {
    return {
      content: translate(lang, "check.react.self.not"),
    };
  }
  return undefined;
}

//specific check
async function check_can_feedback({ lang, userdata }) {
  var h_gap = await kira_user_can_feedback(userdata.id);
  if (h_gap>0 && !userdata.is_god) {
    h_gap=Math.ceil(h_gap/60)*60;
    return {
      content: translate(lang, "check.feedback.not", {
        time: time_format_string_from_int(h_gap, lang),
        //time: time_format_string_from_int(SETT_CMD.feedback.couldown, lang),
      }),
    };
  }
  return undefined;
}

async function check_in_guild({ lang, guild }) {
  if (!guild) {
    return {
      content: translate(lang, "check.inguild.not", {"inviteLink": process.env.invite_bot, "joinLink": process.env.invite_realm, "discoverLink": process.env.invite_discover}),
    };
  }
  return undefined;
}

//--- the commands ---

//#god command
async function cmd_god({ userdata, userbook, data, lang, locale }) {
  const arg_sub = data.options.find((opt) => opt.name === "action")?.value; // also data.options[0].value
  const arg_user = data.options.find((opt) => opt.name === "user")?.value;
  const arg_amount = data.options.find((opt) => opt.name === "amount")?.value;
  const arg_texto = data.options.find((opt) => opt.name === "text")?.value;

  switch (arg_sub) {
    //#life subcommand (#revive & #kill)
    case "revive": {
    }
    case "kill":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        const targetId = arg_user;
        const targetdata = await kira_user_get(targetId, false);

        if (!targetdata) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.fail.notplayer"),
            },
          };
        }

        const h_life = arg_sub === "revive";

        if (targetdata.is_alive === h_life) {
          return {
            method: "PATCH",
            body: {
              content: translate(
                lang,
                `cmd.god.sub.life.fail.already.${h_life ? "alive" : "dead"}`,
                { targetId: targetId }
              ),
            },
          };
        }

        await kira_user_set_life(targetdata.id, h_life);

        return {
          method: "PATCH",
          body: {
            content: translate(
              lang,
              `cmd.god.sub.life.done.${h_life ? "revive" : "kill"}`,
              { targetId: targetId }
            ),
          },
        };
      }
      break;

    //#forcedrop subcommand
    case "forcedrop":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        if (arg_amount === undefined) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.amount"),
            },
          };
        }

        const targetdata = await kira_user_get(arg_user, false);

        await kira_user_set_drop(targetdata.id, arg_amount);

        return {
          method: "PATCH",
          body: {
            content: translate(
              lang,
              "cmd.god.sub.forcedrop.done." +
                (arg_amount == 0 ? "zero" : "more"),
              {
                targetId: arg_user,
                time: time_format_string_from_int(arg_amount, lang),
              }
            ),
          },
        };
      }
      break;

    //#nofeedback subcommand
    case "nofeedback":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        if (arg_amount === undefined) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.amount"),
            },
          };
        }

        await kira_user_set_feedback(
          userdata.id,
          FeedbackState.SENDED,
          arg_amount
        );
        return {
          method: "PATCH",
          body: {
            content: translate(
              lang,
              "cmd.god.sub.nofeedback.done." +
                (arg_amount === 0 ? "zero" : "more"),
              {
                targetId: arg_user,
                time:time_format_string_from_int(arg_amount, lang),
              }
            ),
          },
        };
      }
      break;

    //#ban subcommand
    case "ban":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }
        const targetdata = await kira_user_get(arg_user, false);

        if (arg_amount) {
          await kira_user_set_ban(targetdata.id, arg_amount);
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.sub.ban.done.temp", {
                targetId: arg_user,
                time: time_format_string_from_int(arg_amount, lang),
              }),
            },
          };
        } else {
          await kira_user_set_ban(targetdata.id);
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.sub.ban.done.perma", {
                targetId: arg_user,
              }),
            },
          };
        }
      }
      break;

    //#unban subcommand
    case "unban":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        await kira_user_remove_ban(userdata.id);
        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.god.sub.unban.done", {
                targetId: arg_user,
              }),
          },
        };
      }
      break;

    //#apple subcommand (#apple_fake & #apple_give)
    case "apple_fake": {
    }
    case "apple_give":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        const h_fake = !(arg_sub === "apple_give");

        if (!arg_amount) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.amount"),
            },
          };
        }

        const targetId = arg_user;
        const targetdata = await kira_user_get(targetId, false);

        if (!targetdata) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.fail.notplayer"),
            },
          };
        }

        const h_given = h_fake ? 0 : arg_amount;
        const h_identity = `${h_fake ? "fake" : "real"}.${
          h_given < 0 ? "remove" : "add"
        }`;

        kira_apple_send(
          targetdata.id,
          h_given,
          undefined,
          "admin." + h_identity,
          {
            displayed: Math.abs(arg_amount),
          }
        );

        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.god.sub.apple.done." + h_identity, {
              targetId: targetId,
              displayed: Math.abs(arg_amount),
              word: translate(
                lang,
                `word.apple${Math.abs(arg_amount) > 1 ? "s" : ""}`
              ),
            }),
          },
        };
      }
      break;

    //#mercy subcommand
    case "mercy":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }
        const done=await kira_run_mercy(arg_user);
        return {
          method: "PATCH",
          body: {
            content: translate(lang, `cmd.god.sub.mercy.${(done) ? "done" : "none"}`, {"targetId": arg_user}),
          },
        };
      };

    //#info subcommand
    case "info": 
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }
        
        let target_userdata = await kira_user_get(arg_user);
        let target_user = await DiscordUserById(arg_user);
        let nnone = something => something ? something : '<none>';//not none.
        
        
        let fields = [
          {
            name: "userId",
            value: nnone(arg_user),
          },
        ]
        if (target_userdata)
          fields.push(
            {
              name: "dataId",
              value: nnone(target_userdata.id),
            },
            {
              name: "lang",
              value: nnone(target_userdata.lang),
            },
            {
              name: "apples",
              value: nnone(target_userdata.apples),
            },
            {
              name: "version",
              value: nnone(target_userdata.version),
            },
            {
              name: "dmId",
              value: nnone(target_userdata.dmId),
            },
            {
              name: "ownedNoteBooksId",
              value: await kira_user_get_owned_books_item(target_userdata.id).then(array => array.join()),
            }
          );

        console.log("fields:",fields);

        return {
          method: "PATCH",
          body: {
            content: " ",
            embeds:
            [
              {
                description: (target_userdata)
                ? translate(lang, `cmd.god.sub.info.description.is`, {"targetId": arg_user } )
                : translate(lang, `cmd.god.sub.info.description.no`, {"targetId": arg_user } ),
                fields,
              }
            ]
          },
        };
      }

    //#tell subcommand
    case "tell":
      {
        const letter = data.options.find((opt) => opt.name === "letter")?.value;
        const author = data.options.find((opt) => opt.name === "author")?.value;
        let dmId = data.options.find((opt) => opt.name === "dmId")?.value;
        let targetId = data.options.find((opt) => opt.name === "targetid")?.value;

        if (!letter)
        {//then will send the form request
          if (!arg_user) {
            return {
              method: "PATCH",
              body: {
                content: translate(lang, "cmd.god.missing.user"),
              },
            };
          }

          //if (!arg_texto) {
          //  return {
          //    method: "PATCH",
          //    body: {
          //      content: translate(lang, "cmd.god.missing.message"),
          //    },
          //  };
          //}

          const targetId = arg_user;
          const targetdata = await kira_user_get(targetId, false);

          if (!targetdata) {
            return {
              method: "PATCH",
              body: {
                content: translate(lang, "cmd.god.fail.notplayer"),
              },
            };
          }

          let dmId = await kira_user_dm_id(targetdata);

          if (!dmId)
          {
            return {
              method: "PATCH",
              body: {
                content: translate(lang, "cmd.god.fail.nomp", {
                  targetId: targetId,
                })
              },
            };
          }
          
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.sub.tell.confirm", {
                targetId: targetId,
              }),
              components: [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `makecmd god_form true+${targetId}+${dmId}`,
                      label: translate(lang, "cmd.god.sub.tell.confirm.yes"),
                      emoji: sett_emoji_feedback_confirm,
                      style: ButtonStyleTypes.PRIMARY,
                    },
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `makecmd god_form false`,
                      label: translate(lang, "cmd.god.sub.tell.confirm.no"),
                      style: ButtonStyleTypes.SECONDARY,
                    },
                  ],
                }
              ]
            },
          };
        }
      else
      {// will post the message

        let embeds=[
          {
            color: userbook?.color.int,
            description: letter,
            footer: (author) 
            ? {
                text: author,
              }
            : undefined,
          }
        ];

        //send message
        await DiscordRequest(
          `channels/${dmId}/messages`,
          {
            method: "POST",
            body: {
              content: translate(lang, 'cmd.god.sub.tell.send.recipient.content'),//! is the lang of the sender and not of the reciepient
              embeds,
            },
          }
        );

        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.god.sub.tell.send.sender.content", {
              targetId,
            }),
            embeds,
          }
        }
      }
    }
    break;

    //#pen subcommand
    case "pen":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        
        const targetId = arg_user;
        const targetdata = await kira_user_get(targetId, false);

        let pentype = (arg_texto) ? arg_texto : "pen_black";

        const pen = await Item.create(targetdata.id, lang, pentype);
        await pen.equip(targetdata);
        await stats_simple_add(targetdata.statPtr.id, "ever_penBuy");


        return {
          method: "PATCH",
          body: {
            content: `
${translate(lang, "cmd.god.sub.pen.up", {targetId: targetdata.userId})}\`\`\`ansi
${pen_apply_filters(translate(lang, "cmd.god.sub.pen.in", { pentype }),pentype)}
\`\`\`
`
          }
        };
      }
      
    //#item subcommand
    case "item":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }
        
        if (!arg_texto) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.message"),
            },
          };
        }

        
        const targetId = arg_user;
        const targetdata = await kira_user_get(targetId, false);

        let itemName = arg_texto;

        const item=await Item.create(targetdata.id, lang, itemName);


        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.god.sub.item.up", { targetId: targetdata.userId, itemName })
          }
        };
      }
    
    //#gift_mp
    case "gift_mp":
      {
        if (!arg_user) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.missing.user"),
            },
          };
        }

        let targetId = arg_user;
        let targetdata = await kira_user_get(targetId);

        if (!targetdata) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.fail.notplayer"),
            },
          };
        }

        let appleAmount = arg_amount;
        let isApple = !(!appleAmount);
        let itemName = arg_texto;
        let item;
        let recipientId = arg_user;

        if (!isApple)
        {
          item = await Item.create(undefined, lang, itemName);
        }
        
        const response = await Gift.top_send(lang, true, recipientId, appleAmount, item)

        let dmId = await kira_user_dm_id(targetdata);

        if (!dmId)
        {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.fail.nomp", {
                targetId,
              })
            },
          };
        }

        await DiscordRequest(
          `channels/${dmId}/messages`,
          {
            method: "POST",
            body: {
              content: response.content,
              components: [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `makecmd giftclaim ${response.gift.id}`,
                      label: translate(lang, "cmd.gift.post.button.claim"),
                      style: ButtonStyleTypes.SUCCESS,
                      emoji: sett_emoji_gift_claim
                    }
                  ]
                }
              ]
            },
          }
        );
        
        
        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.god.sub.gift_mp.content."+ ((isApple) ? 'apple' : 'item'), {
              targetId: targetId,
              amount: appleAmount,
              itemName
            }),
          },
        };
      }


    //#test subcommand
    case "test":
      {
          //r = `\`\`ansi\n[2;31m${arg_texto}[0m\`\`\``;
        let r;

        //if (false) {
        //  let glob;
        //  {
        //    let local = " me";
        //    glob = () => {
        //      return "im" + local;
        //    };
        //  }
        //  r = glob();
        //}

        //if (false) {
        //  const userDay = time_userday_get(locale);
        //  r = `${userDay} - ${time_day_int(userDay)} - ${time_day_format(
        //    userDay
        //  )}`;
        //}

        //if (false) {
        //  //const arg_user_data = await kira_user_get(arg_user, false);
        //  console.time("test:cost");
        //  const repeat = arg_amount ? arg_amount : 11;
        //  let r_som = 0;
        //  let r_all = [];
        //  for (let i = 0; i < repeat; i++) {
        //    const start = Date.now();
        //    //the operation to test

        //    await Achievement.list["outerTime"].do_check(
        //      userdata,
        //      10000000,
        //      lang,
        //      {},
        //      (it) => time_format_string_from_int(it, lang)
        //    );

        //    const end = Date.now();
        //    const gap_ms = end - start;
        //    r_som += gap_ms;
        //    r_all.push(gap_ms);
        //  }
        //  r_all.sort((a, b) => a - b);
        //  r = `operation repeated ${repeat} times.\ntotal=${Math.round(
        //    r_som
        //  )}ms  average=${Math.round(r_som / repeat)}ms  median=${Math.round(
        //    r_all[Math.floor(repeat / 2)]
        //  )}ms  min=${Math.round(r_all[0])}ms  max=${Math.round(
        //    r_all[repeat - 1]
        //  )}ms`;
        //  console.log(` cmd : perf tester`, r);
        //  console.timeEnd("test:cost");
        //}

        //throw EvalError("found a cat in the code");

        //{
        //  let itemName = 'book_purple';
        //  let items = await Item.find_all({itemName: {equals: itemName}});
        //  r = `link books [${itemName}]`;
        //  for (let item of items)
        //  {
        //    console.log(`item.meta.bookId : ${item.meta.bookId} : ${item.meta}.bookId`);
        //    let book = await NoteBook.get(item.meta.bookId, false);
        //    await book.link_item(item);
        //  }
        //}

        //let target_userdata = await kira_user_get(arg_user);
        //let booksId = await kira_user_get_owned_books_item(target_userdata.id);
        //r = `books of @${target_userdata.userName} (did=${target_userdata.id}) are ${booksId} (length ${booksId.length})`;
        //const pen = await Item.get_equiped(target_userdata, itemType.PEN);
        //r = `pen of @${target_userdata.userName} (did=${target_userdata.id}) from ${userdata.equipedPen?.id} is ${pen} > ${pen?.itemName}`;


        return {
          method: "PATCH",
          body: {
            content:
              translate(lang, "cmd.god.sub.test.done") +
              (r ? " `" + r + "`" : ""),
          },
        };
      }
      break;

    //#update subcommand
    case "update":
      {
        if (arg_texto) {
          let response = await command_refresh_one(arg_texto);
          console.log("response:",response);
          let reponseText = { 404: 'fail.none', 200: 'update', 201: 'create', 204: 'delete' }[response];
          return {
            method: "PATCH",
            body: {
              content: translate(lang, `cmd.god.sub.update.done.command.` + reponseText, {name: arg_texto}),
            },
          };
        }

        if (!arg_user) {
          await commands_put();
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.sub.update.done.commands"),
            },
          };
        }

        const targetdata = await kira_user_get(arg_user, false);

        if (!targetdata) {
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.god.fail.notplayer"),
            },
          };
        }

        {
          console.time("checkup");
          console.log(` cmd : checkup user id=${arg_user}`);
          await stats_checkup(targetdata);
          console.timeEnd("checkup");
        }

        return {
          method: "PATCH",
          body: {
            embeds: [
              {
                color: 255 * 256,
                description: translate(lang, "cmd.god.sub.update.done.user", {
                  targetId: arg_user,
                }),
              },
            ],
          },
        };
      }
      break;

    default:
      {
        return {
          method: "PATCH",
          body: {
            content: kira_error_msg(
              "error.message.define.404",
              { message: `unknow god action [${data.options[0].value}]` },
              lang
            ),
          },
        };
      }
      break;
  }
}

async function cmd_god_form({ data, lang, token, id }) {
  
  if (!data.options[0].value) 
  {//"NO" button
    await DiscordRequest(`interactions/${id}/${token}/callback`, {
      method: "POST",
      body: {
        type: InteractionResponseType.UPDATE_MESSAGE,
      },
    });
    //else didnt valid token

    //remove the message
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}/messages/@original`,
      {
        method: "DELETE",
      }
    );
    return; //! return nothing withtout feedback
  }

  //POST input modal
  {
    await DiscordRequest(`interactions/${id}/${token}/callback`, {
      method: "POST",
      body: {
        type: InteractionResponseType.MODAL,
        data: {
          title: translate(lang, "cmd.god.sub.tell.modal.title"),
          custom_id: `makecmd god_submit ${data.options[1].value}+${data.options[2].value}`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  style: TextStyleTypes.PARAGRAPH,
                  custom_id: `godtellin`,
                  label: translate(lang, "cmd.god.sub.tell.modal.letter.label"),
                  placeholder: translate(
                    lang,
                    "cmd.god.sub.tell.modal.letter.placeholder"
                  ),
                  required: true,
                  //min_length: 13,
                  //max_length: 666,
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  style: TextStyleTypes.SHORT,
                  custom_id: `godtelllast`,
                  label: translate(lang, "cmd.god.sub.tell.modal.author.label"),
                  placeholder: translate(
                    lang,
                    "cmd.god.sub.tell.modal.author.placeholder"
                  ),
                  required: false,
                },
              ],
            },
          ],
        },
      },
    });
  }

  //remove buttons
  //cant be done before
  //await DiscordRequest(
  //  `webhooks/${process.env.APP_ID}/${token}/messages/@original`,
  //  {
  //    method: "PATCH",
  //    body: {
  //      components: [],
  //    },
  //  }
  //);
  //remove the message
  await DiscordRequest(
    `webhooks/${process.env.APP_ID}/${token}/messages/@original`,
    {
      method: "DELETE",
    }
  );
}



//#ping command
async function cmd_ping({ lang, userbook, clock, timespam }) {
  
  clock.emit("pong", true);
  
  const timeDefered = clock.read("sended defered")-clock.read("sending defered");
  const timeQueue = clock.read("queue")-clock.read("exe");
  const timeServer = clock.read("pong");
  const timeTravel = clock.epoch-timespam*1000;
  const timeFetch = clock.read("fetched")-clock.read("cmd");
  
  var timesDict = {
    timeTravel,
    timeDefered,
    timeFetch,
    timeQueue,
    timeCompute: timeServer - timeDefered - timeQueue - timeFetch,
    timeTotal: timeServer + timeTravel
  }

  for (let v in timesDict)
  {
    timesDict[v]= times_precise_string_from_int(timesDict[v])
  }
        
  
  return {
    method: "PATCH",
    body: {
      content: translate(lang, "cmd.ping.content"),
      embeds: [
        {
          color: userbook?.color.int,
          description: translate(lang, "cmd.ping.analyse", timesDict),
        },
      ],
    },
  };
}

//#feedback command
async function cmd_feedback({ data, userdata, lang, user }) {
  //is the command alone
  if (!data.options) {
    //PATCH confirmation
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.feedback.confirm"),
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `makecmd feedback_form true`,
                label: translate(lang, "cmd.feedback.confirm.yes"),
                emoji: sett_emoji_feedback_confirm,
                style: ButtonStyleTypes.PRIMARY,
                //style:ButtonStyleTypes.SECONDARY,
                disabled: false,
              },
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `makecmd feedback_form false`,
                label: translate(lang, "cmd.feedback.confirm.no"),
                //emoji: {name: "" },
                style: ButtonStyleTypes.SECONDARY,
                disabled: false,
              },
            ],
          },
        ],
      },
    };
  }

  const letter = data.options.find((opt) => opt.name === "letter").value;
  const last = data.options.find((opt) => opt.name === "last").value;

  //POST to admin webhook
  {
    const all = { letter, last, userdata, user };
    await webhook_reporter.feedback.post(
      lang,
      all,
      { footer: last.length > 0 },
      user.accent_color
      //15261768//yellow
    );
  }

  //set state
  //! before
  await kira_user_set_feedback(
    userdata.id,
    FeedbackState.SENDED,
    SETT_CMD.feedback.couldown
  );

  return {
    method: "PATCH",
    body: {
      content: translate(lang, "cmd.feedback.done", { letter, last }),
    },
  };
}

async function cmd_feedback_form({ data, message, lang, token, id }) {
  //its no button
  if (!data.options[0].value) {
    await DiscordRequest(`interactions/${id}/${token}/callback`, {
      method: "POST",
      body: {
        type: InteractionResponseType.UPDATE_MESSAGE,
      },
    });
    //else didnt valid token

    //remove the message
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}/messages/@original`,
      {
        method: "DELETE",
      }
    );
    return; //! return nothing withtout feedback
  }

  //call the form

  //POST input modal
  {
    await DiscordRequest(`interactions/${id}/${token}/callback`, {
      method: "POST",
      body: {
        type: InteractionResponseType.MODAL,
        data: {
          title: translate(lang, "cmd.feedback.modal.title"),
          custom_id: `makecmd feedback_submit`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  style: TextStyleTypes.PARAGRAPH,
                  custom_id: `feedbackin`,
                  label: translate(lang, "cmd.feedback.modal.letter.label"),
                  placeholder: translate(
                    lang,
                    "cmd.feedback.modal.letter.placeholder"
                  ),
                  value: translate(lang, "cmd.feedback.modal.letter.value"),
                  required: true,
                  min_length: 13,
                  max_length: 666,
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  style: TextStyleTypes.SHORT,
                  custom_id: `feedbacklast`,
                  label: translate(lang, "cmd.feedback.modal.last.label"),
                  placeholder: translate(
                    lang,
                    "cmd.feedback.modal.last.placeholder"
                  ),
                  value: translate(lang, "cmd.feedback.modal.last.value"),
                  required: false,
                  min_length: 0,
                  max_length: 46,
                },
              ],
            },
          ],
        },
      },
    });
  }

  //remove buttons
  //cant be done before
  await DiscordRequest(
    `webhooks/${process.env.APP_ID}/${token}/messages/@original`,
    {
      method: "PATCH",
      body: {
        components: [],
      },
    }
  );

  return; //! return nothing

  //send message
  if (false) {
    await DiscordRequest(`webhooks/${process.env.APP_ID}/${token}`, {
      method: "POST",
      body: {
        content: translate(lang, "cmd.feedback.writting"),
        /* didnt work
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
        },
        */
      },
    });
    return;
  }
}

//#invite command
async function cmd_invite({ lang })
{
  if (!parseInt(process.env.invite_enable))
  {
    var body_content=translate(lang, "cmd.invite.no", {"details": process.env.invite_disable_reason});
    return {
      method: "PATCH",
      body: {
        content: body_content,
      }
    }
  }


  var view_text=translate(lang, "cmd.invite.ad.view", {"inviteLink": process.env.invite_bot, "joinLink": process.env.invite_realm});
  //var view_text="\n-# "+process.env.invite_bot;
  //var view_text="";
  var body_content=translate(lang, "cmd.invite.ad.content", {"inviteLink": process.env.invite_bot, "joinLink": process.env.invite_realm, "view": view_text});
  var button_label_invite=translate(lang, "cmd.invite.button.invite");
  var button_label_join=translate(lang, "cmd.invite.button.join");

  return {
    method: "PATCH",
    body: {
      content: body_content,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              url: process.env.invite_bot,
              style: ButtonStyleTypes.LINK,
              emoji: sett_emoji_items.book_red,
              label: button_label_invite,
              disabled: false,
            },
          ]
        },
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              url: process.env.invite_realm,
              style: ButtonStyleTypes.LINK,
              emoji: sett_emoji_items.book_white,
              label: button_label_join,
              disabled: false,
            },
          ]
        }
      ]
    },
  };
}

//#claim command
async function cmd_claim({ userdata, user, data, userbook, channel, lang }) {
  //variables
  const h_book_amount = await stats_simple_get(
    userdata.statPtr.id,
    "ever_bookFirst"
  );

  //checks
  let fail_reason;

  if (userbook) {
    fail_reason = 'table';
  } else {
    const owned_books_id = await kira_user_get_owned_books_item(userdata.id);

    if (owned_books_id.length > 0)
    {
      let books_item = [];
      let carry_amount = 0;
      for (let itemId of owned_books_id)
      {
        console.log(`get item ${itemId}`);
        let item = await Item.get(itemId);
        if (!item) throw Error(`item is not. (${item}) from item id [${itemId}], in all [${owned_books_id.join()}]`);
        books_item.push(item);
        if (item.if_own(userdata.id))
        {
          carry_amount += 1;
        }
      }

      fail_reason = (carry_amount > 0) ? 'pocket' : 'given';
    }
  }


  if (fail_reason)
  {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, 'cmd.claim.fail.already.'+fail_reason)
      },
    };
  }

  // pass
  if (!h_book_amount > 0) {
    const all = { user, userdata, channel };
    await webhook_reporter.newbi.post(lang, all, {}, 
    user.accent_color
    );
  }

  let newUserbook = await Item.create(userdata.id, lang, 'book_black');
  await newUserbook.equip(userdata);
  //await stats_simple_add(userdata.statPtr.id, "ever_bookFirst"); //moved at item.ts, when equiped.

  return {
    method: "PATCH",
    body: {
      content: translate(
        lang,
        `cmd.claim.done.free`,
        { emoji: string_emoji(items_info[newUserbook.itemName].emoji) }
      ),
    },
  };
}

//#burn command
async function cmd_burn({
  message,
  type,
  data,
  userbook,
  userdata,
  lang,
  token,
}) {
  
  let state = data.options?.find((opt) => opt.name === "state")?.value;
  if (!state) state = 0;
  const bookId = data.options?.find((opt) => opt.name === "bookId")?.value;
  const lookedbook = (bookId) ? await NoteBook.get(bookId) : userbook;
  const lookedbookItem = await Item.get(lookedbook.itemId);

  if (!lookedbook) {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.burn.already"),
      },
    };
  }

  //confirmation message
  if (
    state === 1 || state === 0
  ) {
    //that not a message component interaction.
    let buttons = [];
    if (state === 0)
    {
      await stats_simple_add(userdata.statPtr.id, "misc_match"); //+stats
      buttons = [
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd burn_edit ${lookedbook.id}+1`,
          label: translate(lang, `cmd.burn.confirm.button.ok`),
          emoji: sett_emoji_burn_confirm,
          style: ButtonStyleTypes.DANGER,
          disabled: false,
        },
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd burn_edit ${lookedbook.id}+-1`,
          label: translate(lang, `cmd.burn.confirm.button.no`),
          style: ButtonStyleTypes.SECONDARY,
          disabled: false,
        },
      ]
    }
    else if (state === 1)
    {
      buttons = [
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd burn ${lookedbook.id}+-1`,
          label: translate(lang, `cmd.burn.confirm.button.nono`),
          style: ButtonStyleTypes.SECONDARY,
          disabled: false,
        },
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd burn ${lookedbook.id}+2`,
          label: translate(lang, `cmd.burn.confirm.button.okok`),
          emoji: sett_emoji_burn_confirm,
          style: ButtonStyleTypes.DANGER,
          disabled: false,
        },
      ]
    }



    
    return {
      method: "PATCH",
      body: {
        content: translate(lang, `cmd.burn.confirm.content`),
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: buttons,
          },
        ],
        embeds: [
          {
            description: translate(lang, `cmd.burn.confirm.description`),
            fields: [lookedbookItem.get_embed_field(userdata, lang)],
            footer: {
              text: translate(lang, `cmd.burn.confirm.footer`),
            }
          },
        ]
      },
    };
  }

  //remove buttons
  await DiscordRequest(
    `channels/${message.channel_id}/messages/${message.id}`,
    {
      method: "PATCH",
      body: {
        components: [],
        embeds: []
      },
    }
  );

  //if owner
  if (!lookedbookItem.if_own(userdata.id)) {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, `cmd.burn.fail.notown`),
      },
    };
  }

  //if time
  {
    const h_gap = parseInt(
      (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000
    );
    if (h_gap > 60) {
      return {
        method: "PATCH",
        body: {
          content: translate(lang, `cmd.burn.fail.expired`),
        },
      };
    }
  }

  //if cancel
  if (state != 2) {
    //remove components from the message
    //this does not works if know is used as a command
    return {
      method: "PATCH",
      body: {
        content: translate(lang, `cmd.burn.cancel`),
      },
    };
  }

  console.debug(`cmd : burn lookedbook=`, lookedbook);
  //throw new Error("you would have burned it with sucress.");
  const item = await Item.get(lookedbook.itemId);
  await item.delete(userdata);

  return {
    method: "PATCH",
    body: {
      content: translate(lang, "cmd.burn.done"),
    },
  };
}

//#apples command
async function cmd_apple({ userdata, user, locale, lang }) {
  let h_apples_claimed = 0; //only for display
  let h_txt_claims = "";
  let h_txt_more = "";

  if (check_has_noDrop({ userdata }) && userdata.apples >= 10)
    h_txt_more = "\n" + translate(lang, `cmd.apples.get.why`);

  //claims
  {
    //claims/daily
    {
      const h_dayGap = time_day_gap(
        await kira_user_get_daily(userdata.id),
        locale,
        true
      );
      const h_dayGapDiff = h_dayGap.now.day - h_dayGap.last.day;

      //if (true) {//!
      if (h_dayGapDiff != 0) {
        //claim you daily
        await kira_user_set_daily(userdata.id);
        await kira_apple_send(
          userdata.id,
          SETT_CMD.apple.dailyAmount,
          userdata.statPtr.id
        ); //!no claim message because rigth here
        h_apples_claimed += SETT_CMD.apple.dailyAmount;
        h_txt_claims +=
          translate(lang, `cmd.apples.claim.daily`, { added: SETT_CMD.apple.dailyAmount }) + "\n";

        //streak
        //+stats
        const streak_day =
          //(h_dayGapDiff === 1 || !h_dayGapDiff)//!
          (h_dayGapDiff === 1)
            ? await stats_simple_add(userdata.statPtr.id, "streak_appleDay")
            : await stats_simple_set(
                userdata.statPtr.id,
                "streak_appleDay",
                1
              );
        
        let streak_apple=0;
        for (let dic of SETT_CMD.apple.dailyStreakReward)
        {
          if (dic.day<=streak_day)
          {
            streak_apple=dic.apple;
          }
        }

        if (streak_apple>0)
        {
          await kira_user_set_daily(userdata.id);
          await kira_apple_send(
            userdata.id,
            streak_apple,
            userdata.statPtr.id
          ); //!no claim message because rigth here
          h_apples_claimed += streak_apple;
          h_txt_claims +=
            translate(lang, `cmd.apples.claim.streak`, { added: streak_apple, day: streak_day }) + "\n";
        }
        //await Achievement.list["appleDailyStreak"].do_check(userdata, stat, lang);
      }
    }

    //claim/event
    //!temporary
    //h_txt_claims += await event_claim_item(userdata, user, "event_egg_2025", lang);

    //claims/others
    const h_claims = await kira_apple_claims_get(userdata.id);
    await kira_apple_claims_set(userdata.id, []);

    if (h_claims.length > 0) {
      
      let too_much=false;
      let too_amount=0;

      for (let i = 0; i < h_claims.length; i++) {
        if (h_txt_claims.length>1750)
        {
          too_much=true;
        }
        if (too_much)
        {
          too_amount+=h_claims[i].added;
        } else {
          h_txt_claims +=
            translate(lang, `cmd.apples.claim.${h_claims[i].type}`, h_claims[i]) +
            "\n";
        }
      }

      if (too_much)
      {
        h_txt_claims +=
          translate(lang, `cmd.apples.claim.too`, {'added': too_amount} ) + "\n";
      }
    }
  }

  const displayed_apples = userdata.apples+h_apples_claimed;

  return {
    method: "PATCH",
    body: {
      content:
        h_txt_claims +
        translate(
          lang,
          `cmd.apples.get.${h_apples_claimed > 0 ? "changed" : "same"}`,
          {
            added: 1,
            amount: displayed_apples,
            word: translate(
              lang,
              `word.apple${displayed_apples > 1 ? "s" : ""}`
            ),
            emoji: kira_format_applemoji(displayed_apples),
          }
        ) +
        h_txt_more,
    },
  };
}

//#top command
async function cmd_top({ data, userdata, userbook, lang }) {
  const h_on = data.options[0].value;
  //get
  let h_ranks;
  let h_amountK;
  let if_parse = false;
  switch (h_on) {
    case "apple":
      {
        if_parse = false;
        h_ranks = await kira_users_rank("apples");
        h_amountK = "apples";
      }
      break;
    case "kill":
      {
        h_ranks = await stats_simple_rank("do_kill");
        h_amountK = "do_kill";
      }
      break;
    case "murder":
      {
        h_ranks = await stats_simple_rank("do_hit");
        h_amountK = "do_hit";
      }
      break;
    case "time":
      {
        if_parse = true;
        h_ranks = await stats_simple_rank("do_outerTime");
        h_amountK = "do_outerTime";
      }
      break;
  }

  //formating
  {
    let ifSelfOn = false;
    let h_txt = "";

    let h_nl = "";
    for (let i = 0; i < 3; i++) {
      let h_amount = h_ranks[i][h_amountK];
      if (if_parse) h_amount = stats_parse(h_amountK, h_amount, lang);
      if (h_ranks[i].userId === userdata.userId) ifSelfOn = true;
      h_txt +=
        h_nl +
        translate(lang, `cmd.top.get.${h_on}.place`, {
          rank: i + 1,
          playerId: h_ranks[i].userId,
          amount: h_amount,
        });
      h_nl = "\n";
    }

    {
      //+stat
      if (ifSelfOn) {
        await Achievement.list["onLeaderboard"].do_grant(userdata, lang, 1, {
          name: translate(lang, `cmd.top.get.${h_on}.name`),
        });
      }
    }

    return {
      method: "PATCH",
      body: {
        content: translate(lang, `cmd.top.get.${h_on}.title`),
        embeds: [
          {
            color: userbook?.color.int,
            description: h_txt,
          },
        ],
      },
    };
  }
}

//#stats command
async function cmd_stats({ data, userdata, userbook, lang }) {
  let r_text;
  let r_lore = "";

  switch (data.options[0].value) {
    case "broad":
      {
        for (const k of stats_order_broad) {
          const value = await stats_simple_get(userdata.statPtr.id, k);
          //if (!stats_simple_is_default(k, value))
          if (value && !stats_simple_is_default(k, value)) {
            r_lore = `${r_lore}\n${translate(lang, `stat.broad.show.${k}`, {
              value: stats_parse(k, value, lang),
            })}`;
          }
        }
        if (r_lore === "") {
          r_text = translate(lang, `stats.broad.fail.nothing`);
        } else {
          r_text = translate(lang, `stats.broad.show`);
        }
      }
      break;

    case "relation":
      {
        const pairs = await stats_pairs_get_all(userdata.userId);
        if (pairs.length > 0) {
          r_text = translate(lang, `stats.relation.show`);
          for (const v of pairs) {
            const pair_datas = await stats_pair_get_multiples(v, {
              by_hit: 3,
              userId: 2,
            });
            const hits = [pair_datas[0]["by_hit"], pair_datas[1]["by_hit"]];

            if (pair_datas[1]["userId"] === userdata.userId) {
              //suscide message

              if (hits[0] > 0) {
                r_lore = `${r_lore}\n${translate(lang, `stats.relation.self`, {
                  whoId: userdata.userId,
                  value: hits[0],
                  unit: translate(lang, `word.time${hits[0] > 1 ? "s" : ""}`),
                })}`;
              }
            } else {
              if (hits[0] > 0) {
                //you killed message
                r_lore = `${r_lore}\n${translate(
                  lang,
                  `stats.relation.person.u`,
                  {
                    whoId: pair_datas[1]["userId"],
                    value: hits[0],
                    unit: translate(lang, `word.time${hits[0] > 1 ? "s" : ""}`),
                  }
                )}`;
              }
              if (hits[1] > 0) {
                //killed you message
                r_lore = `${r_lore}\n${translate(
                  lang,
                  `stats.relation.person.e`,
                  {
                    whoId: pair_datas[1]["userId"],
                    value: hits[1],
                    unit: translate(lang, `word.time${hits[1] > 1 ? "s" : ""}`),
                  }
                )}`;
              }
            }
          }
        } else {
          r_text = translate(lang, `stats.relation.fail.nothing`);
        }
      }
      break;

    case "ratio":
      {
        for (const ratioKey in stats_order_ratio) {
          const dividend = await stats_simple_get(
            userdata.statPtr.id,
            stats_order_ratio[ratioKey][0]
          );
          const divider = await stats_simple_get(
            userdata.statPtr.id,
            stats_order_ratio[ratioKey][1]
          );
          if (
            !stats_simple_is_default(
              stats_order_ratio[ratioKey][0],
              dividend
            ) &&
            !stats_simple_is_default(stats_order_ratio[ratioKey][1], divider)
          ) {
            r_lore = `${r_lore}\n${translate(
              lang,
              `stat.ratio.show.${ratioKey}`,
              {
                value: Math.round((dividend / divider) * 1000) / 1000,
                dividend: dividend,
                divider: divider,
                //dividend: stats_parse(stats_order_ratio[ratioKey][0], dividend, lang),
                //divider: stats_parse(stats_order_ratio[ratioKey][1], divider, lang)
              }
            )}`;
          }
        }
        if (r_lore === "") {
          r_text = translate(lang, `stats.ratio.fail.nothing`);
        } else {
          r_text = translate(lang, `stats.ratio.show`);
        }
      }
      break;

    default:
      {
        return {
          method: "PATCH",
          body: {
            content: kira_error_msg(
              "error.message.define.404",
              { message: `unknow stats page [${data.options[0].value}]` },
              lang
            ),
          },
        };
      }
      break;
  }

  return {
    method: "PATCH",
    body: {
      content: r_text,
      embeds:
        r_lore === ""
          ? undefined
          : [
              {
                color: userbook?.color.int,
                description: r_lore,
              },
            ],
    },
  };
}

//#running
async function cmd_running({ userbook, user, lang }) {
  let h_runs_attacker = await kira_runs_by(undefined, user.id);

  let r_text;
  let r_lore = "";

  if (h_runs_attacker.length > 0) {
    r_text = translate(lang, `stats.running.show`);
    for (let v of h_runs_attacker) {
      const h_gap = parseInt(
        (new Date(v.finalDate).getTime() - new Date().getTime()) / 1000
      );
      r_lore += `\n${translate(lang, `stats.running.attacker`, {
        victimId: v.victimId,
        span: time_format_string_from_int(h_gap, lang),
      })}`;
    }
  } else {
    r_text = translate(lang, `stats.running.fail.nothing`);
  }

  return {
    method: "PATCH",
    body: {
      content: r_text,
      embeds:
        r_lore === ""
          ? undefined
          : [
              {
                color: userbook?.color.int,
                description: r_lore,
              },
            ],
    },
  };
}

//#quest
async function cmd_quest({ userdata, userbook, lang }) {
  return {
    method: "PATCH",
    body: await Achievement.display_get(
      userdata,
      userbook?.color.int,
      lang
    ),
  };
}

//#lang command
async function cmd_lang({ data, userdata, locale, lang }) {
  let r_txt;
  if (data.options) {
    let h_lang = data.options[0].value;
    if (h_lang === "mine") {
      let lore = lang_lore(locale);
      await lang_set(userdata.id, locale);
      r_txt = translate(locale, "cmd.lang.your.set") + lore;
    } else {
      let lore = lang_lore(h_lang);
      await lang_set(userdata.id, h_lang);
      r_txt = translate(h_lang, "cmd.lang.define.set") + lore;
    }
  } else {
    let lore = lang_lore(lang);
    if (userdata.lang) r_txt = translate(lang, "cmd.lang.define.get") + lore;
    else r_txt = translate(lang, "cmd.lang.your.get") + lore;
  }

  return {
    method: "PATCH",
    body: {
      content: r_txt,
    },
  };
}

//#see command
async function cmd_see({ data, userbook, lang }) {
  //arg/book
  const bookId = data.options?.find((opt) => opt.name === "bookId")?.value;
  const lookedbook = (bookId) ? await NoteBook.get(bookId) : userbook;

  //arg/page
  let show_page = data.options?.find((opt) => opt.name === "page")?.value;
  const last_page = await lookedbook.line_get_last_indexPage();
  if (!show_page)
  {
    show_page=last_page;
  }

  if (!(await lookedbook.line_if_pageGood(show_page - 1))) {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.page.fail.none", { number: show_page }),
      },
    };
  }

  //page/make
  const h_lines = await lookedbook.get_page(show_page - 1);
  let h_content = "";
  let t_delim = "";
  for (let i = 0; i < h_lines.length; i++) {

    let text = "—————————————————————————";
    if (h_lines[i])
    {
      text = h_lines[i].line.markdown;
      if (text[0] == "*" && text[1] == "*" && text[text.length-1] == "*" && text[text.length-2] == "*")
      {
        text = "[1;2m" + text.slice(2,text.length-2) + "[0m";
      }
      if (text[0] == "*" && text[text.length-1] == "*")
      {
        text = "[4;2m" + text.slice(1,text.length-1) + "[0m";
      }
    }
    
    h_content += t_delim + text;
    t_delim = "\n";
  }

  return {
    method: "PATCH",
    body: {
      content: translate(lang, "cmd.page.get.up", { number: show_page }),
      embeds: [
        {
          color: lookedbook.color.int,
          //description: h_content,
          description: `\`\`\`ansi\n${h_content}\`\`\``,
          footer: {
            text: `${show_page} / ${last_page}`,
          },
        },
      ],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd see_edit ${lookedbook.id}`,
              style: ButtonStyleTypes.SECONDARY,
              emoji: lookedbook.emoji,
              disabled: false,
            },
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd see_edit ${lookedbook.id}+${show_page - 1}`,
              label: translate(lang, "cmd.page.get.left", { page: show_page - 1 }),
              style: ButtonStyleTypes.SECONDARY,
              disabled: !(await lookedbook.line_if_pageGood(show_page - 2)),
            },
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd see_edit ${lookedbook.id}+${show_page + 1}`,
              label: translate(lang, "cmd.page.get.right", {
                page: show_page + 1,
              }),
              style: ButtonStyleTypes.SECONDARY,
              disabled: !(await lookedbook.line_if_pageGood(show_page)),
            },
          ],
        },
      ],
    },
  };
}

//#pocket command
async function cmd_pocket({ data, userdata, userbook, lang }) {
  const items_all = await Item.inventory_ids(userdata.id);

  if (items_all.length === 0)
  {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.pocket.nothing"),
      }
    }
  }
  
  //arg/page
  const action = (data.options?.find((opt) => opt.name === "action")?.value);//str
  const lastItemId = data.options?.find((opt) => opt.name === "itemId")?.value;
  const on_page = (() => {
    for (let i = 0; i<items_all.length; i++)
    {
      if (items_all[i].id === lastItemId) return i+1;
    }
    return;
  })();//1,n
  
  const unic = items_all.length === 1;
  const last_page = items_all.length;
  
  const actionEquip = (action == 'equip') ? 1 : 0;//0,1
  const actionThrowState = (action == 'throw_confirm') ? 2 : (action == 'throw') ? 1 : 0;//0,1,2
  const throwed = actionThrowState == 2;
  const gifted = (action == 'gift');
  
  let show_page = -1;
  if (unic)
  {
    show_page = 1;
  }
  else if (action == 'roll')
  {// random page
    if (on_page && on_page >= 0)
    {// cant get same page
      show_page = randomInt(last_page-1)+1;
      if (show_page >= on_page) show_page+=1;
    } else {
      show_page = randomInt(last_page)+1;
    }
  }
  else if (on_page)
  {
    show_page = on_page;
  }

  let fields=[];
  let item_components=[];
  let itemId;
  let content = translate(lang, "cmd.pocket.content."+((throwed) ? "gone" : (show_page == -1) ? "all" : "one"));


  if (show_page === -1)
  {// all items
    let typesAmount = {};
    for (let i=0; i<items_all.length; i++)
    {
      let item_selected = await Item.get(items_all[i].id, userdata.id);
      fields.push(item_selected.get_embed_field(userdata, lang, throwed));

      if (!typesAmount[item_selected.info.type]) typesAmount[item_selected.info.type] = 0;
      typesAmount[item_selected.info.type] += 1;
    }

    if (!typesAmount[itemType.PEN])
    {
      content += '\n' + translate(lang, 'cmd.pocket.content.more.pen');
    }
    if (!typesAmount[itemType.BOOK])
    {
      content += '\n' + translate(lang, 'cmd.pocket.content.more.book');
    }
    else if (typesAmount[itemType.BOOK] >= 2)
    {
      await Achievement.list['booksDouble'].do_grant(userdata, lang);
    }
  }
  else
  {// one item
    let item_selected = await Item.get(items_all[show_page-1]?.id, userdata.id);
    itemId = items_all[show_page-1]?.id;

    //ACTIONS

    //actions/equip
    let equiped;
    if (item_selected.info.actions.equip)
    {
      // do equipit
      if (actionEquip)
      {
        await item_selected.equip(userdata);
        equiped = items_types[item_selected.info.type].str;
      }
      // show
      if (item_selected.if_equiped(userdata))
      {
        equiped = items_types[item_selected.info.type].str;
      }
      item_components.push(
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd pocket_edit equip+${item_selected.id}`,
          label: translate(lang, "cmd.pocket.action.equip."+items_types[item_selected.info.type].str+"."+((equiped) ? "out" : "in")),
          style: ButtonStyleTypes.PRIMARY,
          disabled: (equiped != undefined || throwed)
        },
      )
    }

    //action/see
    if (item_selected.info.actions.see)
    {
      item_components.push(
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd see ${item_selected.meta.bookId}`,
          label: translate(lang, 'cmd.pocket.action.look.inside'),
          style: ButtonStyleTypes.SECONDARY,
          disabled: throwed
        },
      )
    }

    //show up before any delete
    fields.push(item_selected.get_embed_field(userdata, lang, throwed));

    //actions/throw
    if (item_selected.info.actions.throw)
    {
      // do throw
      if (throwed) 
      {
        await item_selected.delete(userdata);
        //item_selected = null;
      }
      item_components.push(
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd pocket_edit ${(actionThrowState==1) ? 'throw_confirm' : 'throw'}+${item_selected.id}`,
          label: translate(lang, "cmd.pocket.action.throw."+((actionThrowState) ? (throwed) ? "done" : "confirm" : "first")),
          style: ButtonStyleTypes.DANGER,
          disabled: throwed
        },
      )
    }
    
    //actions/gift
    if (item_selected.info.actions.gift)
    {
      item_components.push(
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd gift ${item_selected.id}`,
          label: translate(lang, "cmd.pocket.action.gift.link"),
          style: ButtonStyleTypes.DANGER,
          disabled: throwed
        },
      )
    }
    
    //actions/burn
    if (item_selected.info.actions.burn)
    {
      item_components.push(
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd burn ${item_selected.meta.bookId}`,
          label: translate(lang, "cmd.pocket.action.burn.link"),
          style: ButtonStyleTypes.DANGER,
          disabled: throwed
        },
      )
    }
  }

  let components = [];
  if (!unic)
  {
    components.push(
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: 
          [
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd pocket_edit all`,
              label: translate(lang, "cmd.pocket.get.all"),
              style: ButtonStyleTypes.SECONDARY,
              disabled: (show_page==-1)
            },
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd pocket_edit roll+${itemId}`,
              label: translate(lang, "cmd.pocket.get."+((show_page==-1) ? "one" : "other")),
              style: ButtonStyleTypes.SECONDARY,
              disabled: (last_page<2 && show_page>-1)
            },
          ]
        }
    )
  }
   
  if (item_components.length>0)
  {
    //to push them on the first row
    components.push(components[0]);
    components[0]=({
      type: MessageComponentTypes.ACTION_ROW,
      components: item_components
    })
  }
    
  return {
    method: "PATCH",
    body: {
      content,
      embeds: [
        {
          color: userbook?.color.int,
          //description: `${h_content}`,
          footer: {
            text: translate(lang, "cmd.pocket.capacity."+((show_page==-1) ? "all" : "one"), { at: show_page, in:last_page, max: SETT_CMD.pocket.maxCarryItems }),
          },
          fields,
        },
      ],
      components
    }
  }
}

//#shop command
async function cmd_shop({ data, userdata, userbook, lang, token }) {
  let items_shop = await shop_byable_items(userdata);

  //if (items_name.length === 0)
  //{
  //  return {
  //    method: "PATCH",
  //    body: {
  //      content: translate(lang, "cmd.pocket.nothing"),
  //    }
  //  }
  //}
  
  //arg/page
  let action_seed = data.options?.find((opt) => opt.name === "seed")?.value;//1,n
  const buyit = data.options?.find((opt) => opt.name === "buyit")?.value;//_,1,2
  const how = data.options?.find((opt) => opt.name === "how")?.value;//true,false

  let fields = [];
  let components=[];
  let content = translate(lang, "cmd.shop.content.all");
  let footer_text = "";
  let fail_reason = "";

  if (buyit === 2)
  {// check for buy
    let product = items_shop.find((prod) => (prod.seed == action_seed));
    if (product)
    {
      let items_all = await Item.inventory_ids(userdata.id);
      let toopoor = !await kira_apple_pay(userdata.id, product.price, true);
      if (toopoor)
      {
        fail_reason = "poor";
      }
      else if (items_all.length >= SETT_CMD.pocket.maxCarryItems)
      {
        fail_reason = "full";
      }
      else
      {// buy it defenetively
        await shop_buy_item(userdata.id, action_seed);
        var buy_item = await Item.create(userdata.id, lang, product.name);
        
        //+stats
        await stats_simple_add(userdata.statPtr.id, "ever_itemBuy");
        if (buy_item.info.type === itemType.PEN)
        {
          await stats_simple_add(userdata.statPtr.id, "ever_penBuy");
        }
        if (buy_item.info.type === itemType.PEN)
        {
          await stats_simple_add(userdata.statPtr.id, "ever_bookBuy");
        }
      }
    }
    //refresh
    items_shop = await shop_byable_items(userdata);
  }

  let buttonBuy_amount = 0;
  let empty_amount = 0;
  for (let product of items_shop)
  {
    if (product.already)
    {// nothing
      empty_amount++;
      let value = translate(lang, "cmd.shop.empty.value");
      if (product.older)
        value += "\n-# " + translate(lang, "cmd.shop.soon", {"time": time_format_string_from_int(shop_get_time_remain(), lang), "timestamp": shop_get_time_next()})

      fields.push(
        {
          name: translate(lang, "cmd.shop.empty.title"),
          value
        }
      )

    } else {
      const actioned = (product.seed == action_seed);
      
      let value = translate(lang, "cmd.shop.item.value", {"price": product.price});
      if (product.older)
        value += "\n-# " + translate(lang, "cmd.shop.soon", {"time": time_format_string_from_int(shop_get_time_remain(), lang), "timestamp": shop_get_time_next()})

      fields.push(
        {
          name: Item.static_title(product.name, lang, true),
          value
        }
      )
      let buy_action = 0;
      if (actioned) buy_action = buyit;
      let buy_state = ["one", "confirm", "done"][buy_action];
      if (actioned && fail_reason!="") buy_state = "fail."+fail_reason;

      let buttonBuy = 
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd shop_edit ${buy_action+1}+${product.seed}`,
          label: translate(lang, "cmd.shop.get."+buy_state, {"price": product.price, "unit": translate(lang, `word.apple${product.price > 1 ? "s" : ""}`), "itemTitle": Item.static_title(product.name, lang, false)}),
          style: (actioned && fail_reason!="") ? ButtonStyleTypes.DANGER : (product.price > userdata.apples) ? ButtonStyleTypes.SECONDARY : ButtonStyleTypes.SUCCESS,
          emoji: (product.price > 0) ? sett_emoji_apple_croc : sett_emoji_apple_none,
          disabled: (buy_state == "done" || (actioned && fail_reason!=""))
        }


      if (buttonBuy_amount < 4)
      {
        components.push(
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              buttonBuy
            ]
          }
        )
      } else {
        components[(buttonBuy_amount) % 4].components.push(buttonBuy);
      }
      buttonBuy_amount += 1;
    }
  }

  //if (!unic)
  {
    components.push(
      {
        type: MessageComponentTypes.ACTION_ROW,
        components: 
        [
          {
            type: MessageComponentTypes.BUTTON,
            custom_id: `makecmd shop_edit -2+0`,
            label: translate(lang, "cmd.shop.get.how"),
            style: ButtonStyleTypes.SECONDARY,
          }
        ]
      }
    )
  }

  if (how)
  {
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}`,
      {
        method: "POST",
        body: 
        {
          content: translate(lang, 'cmd.shop.get.how.respond'),
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    )
  }

  //+achiv
  if (empty_amount == items_shop.length)
  {
    await Achievement.list['shopEmpty'].do_grant(userdata, lang);
  }

  //content=content+"\n"+footer_text;
  return {
    method: "PATCH",
    body: {
      content,
      embeds: [
        {
          color: userbook?.color.int,
          //description: `${h_content}`,
          footer: {
            text: footer_text,
          },
          fields,
        },
      ],
      components
    }
  }
}

//#gift
async function cmd_gift({ data, userdata, user, lang, message, token}) {

  let itemId = data.options?.find((opt) => opt.name === "itemid")?.value;
  let gifted_id = data.options?.find((opt) => opt.name === "giftedid")?.value;

  if (message) {
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`,
      {
        method: "PATCH",
        body: {
          components: [],
        },
      }
    );
  }
  
  if (!itemId)
  {
    let options_objects = [];
    const items_all = await Item.inventory_ids(userdata.id);
    for (let item_minimal of items_all) {
      options_objects.push({
        value: item_minimal.id,
        emoji: items_info[item_minimal.itemName].emoji,
        label: Item.static_title(item_minimal.itemName, lang, false)
      });
    }
    
    let options_apples = [];
    for (let i = 0; i < sett_options_gift_apples.length; i++) options_apples.push(userdata.apples);//fill
    options_apples = options_apples.map((v,i) => sett_options_gift_apples[i](v));
    options_apples = [...new Set(options_apples)];//remove duplicates
    options_apples = options_apples.sort((a,b) => (a<b) ? -1 : 1);
    options_apples = options_apples.map(
      (v,i) => {return {
        value: v, 
        emoji: sett_emoji_apple_croc, 
        label: 
          translate(lang, `cmd.gift.pick.item.apple.label`, {
            price: v,
            unit: translate(
              lang,
              `word.apple${v > 1 ? "s" : ""}`
            ),
      }),
    }});
    
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.gift.pick.item"),
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.STRING_SELECT,
                options: options_objects,
                custom_id: `makecmd gift <value>`,
                placeholder: translate(lang, "cmd.gift.pick.item.object.place"),
                style: ButtonStyleTypes.PRIMARY,
              }
            ]
          },
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.STRING_SELECT,
                options: options_apples,
                custom_id: `makecmd gift -<value>`,
                placeholder: translate(lang, "cmd.gift.pick.item.apple.place"),
                style: ButtonStyleTypes.PRIMARY,
              }
            ]
          }
        ]
      }
    }
  }

  const isApple = (itemId<0);
  let item;
  let itemTitle;
  let appleAmount;
  if (isApple)
  {
    appleAmount = itemId*-1;
    itemTitle = translate(lang, "cmd.gift.pick.apple", {
      price: appleAmount,
      unit: translate(
        lang,
        `word.apple${(appleAmount > 1) ? "s" : ""}`
      )
    });
    if (appleAmount<0) throw Error(`trying to send negative amount of apples [${appleAmount}]`);
    if (appleAmount>userdata.apples)
    {
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.gift.fail.poor"),
        }
      }
    }
  } else {

    item = await Item.get(itemId, userdata.id);
    if (!item)
    {
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.gift.fail.noitem"),
        }
      }
    }
    itemTitle = item.get_title(lang);
  }

  if (!gifted_id)
  {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.gift.pick.user", {itemTitle}),
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.USER_SELECT,
                custom_id: `makecmd giftsend ${itemId}+<value>`,
                placeholder: translate(lang, "cmd.gift.pick.user.place"),
              }
            ]
          },
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `makecmd giftsend ${itemId}+@everyone`,
                label: translate(lang, "cmd.gift.pick.user.all"),
                style: ButtonStyleTypes.PRIMARY,
              }
            ]
          }
        ]
      }
    }
  }

  const recipientId = (gifted_id==="@everyone") ? undefined : gifted_id;

  const response = await Gift.top_send(lang, false, recipientId, appleAmount, item, userdata);

  return {
    method: "PATCH",
    body: {
      content : response.content,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd giftclaim ${response.gift.id}`,
              label: translate(lang, "cmd.gift.post.button.claim"),
              style: ButtonStyleTypes.SUCCESS,
              emoji: sett_emoji_gift_claim
            }
          ]
        }
      ]
    }
  }
}

//#gift_claim
async function cmd_gift_claim({ data, userdata, lang, message, token }) {
  let gift_id = data.options?.find((opt) => opt.name === "giftid")?.value;
  if (!gift_id) 
  {
    throw Error("no gift id provided.");
  }

  const gift = await Gift.get(gift_id);

  // checks
  let fail_reason = "";
  if (!gift)
  {
    fail_reason="disapear";
    
    await DiscordRequest(
      `channels/${message.channel_id}/messages/${message.id}`,{
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.gift.claim.fail."+fail_reason),
        components: [],
      }
    })
    return;
  }
  else if (gift.userIdRecipient && gift.userIdRecipient!==userdata.userId)
  {
    if (gift.userIdOwner===userdata.userId)
    {
      fail_reason="giver";
    } else {
      fail_reason="notu";
    }
  } else {
    
    let items_all = await Item.inventory_ids(userdata.id);
    if (items_all.length >= SETT_CMD.pocket.maxCarryItems)
    {
      fail_reason = 'full';
    }
  }
  
  if (fail_reason)
  {
    return {
      method: "POST",
      body: {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:
        {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: translate(lang, "cmd.gift.claim.fail."+fail_reason),
        }
      },
    };
  }


  await Gift.pick(gift, userdata);

  const ownerdata = await kira_user_get(gift.userIdOwner);
  const giftSelf = gift.userIdOwner === userdata.userId;
  //+stats
  await stats_simple_add(userdata.statPtr.id, "is_gift");
  //+achiv
  if (giftSelf)
  {
    await Achievement.list["giftSelf"].do_grant(userdata, lang);
  }
  
  const isApple = (gift.appleAmount!=null);
  let item;
  let itemTitle;
  if (isApple)
  {
    itemTitle = translate(lang, "cmd.gift.pick.apple", {
      price: gift.appleAmount,
      unit: translate(
        lang,
        `word.apple${(gift.appleAmount > 1) ? "s" : ""}`
      )
    });
    //+achiv
    if (!giftSelf && ownerdata && gift.appleAmount >= 3 && ownerdata.apples > userdata.apples)
    {
      await Achievement.list["giftAway"].do_grant(ownerdata, lang, 1, {personId: userdata.userId});
    }
  } else {
    item = await Item.get(gift.itemPtrId, userdata.id);
    if (!item)
    {
      throw Error("the item fled");
    }
    itemTitle = item.get_title(lang);
    //+achiv
    if (!giftSelf && item.info.type === itemType.JUNK)
    {
      await Achievement.list["giftJunk"].do_grant(userdata, lang);
    }
  }
  

  await DiscordRequest(
    `channels/${message.channel_id}/messages/${message.id}`,{
    method: "PATCH",
    body: {
      content: translate(lang, `cmd.gift.claim.sucess.${gift.anon ? 'anon' : 'human'}`, 
      {gifterId: gift.userIdOwner, giftedId: userdata.userId, itemTitle}),
      components: [],
    }
  })
}


//#drop command
async function cmd_drop({ data, token, userdata, message, lang }) {
  //take confirmation
  let h_span = 0;
  let h_price = 0;
  if (data.options) {
    h_span = sett_catalog_drops[data.options[0].value].span;
    h_price = sett_catalog_drops[data.options[0].value].price;
  }

  //is the command alone
  else {
    //send
    {
      let buttons = [];
      for (let i in sett_catalog_drops) {
        const v = sett_catalog_drops[i];
        buttons.push({
          value: String(i),
          emoji: sett_emoji_apple_croc,
          label: translate(lang, `cmd.drop.shop.button.label`, {
            price: v.price,
            time: time_format_string_from_int(v.span, lang),
            unit: translate(
              lang,
              `word.apple${v.price > 1 ? "s" : ""}`
            ),
          }),
          description:
            userdata.apples < v.price
              ? translate(lang, `cmd.drop.shop.button.poor`)
              : null,
        });
      }
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.drop.shop"),
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  custom_id: `makecmd drop <value>`, //"<value>" will be replaced with "value:" from button selected
                  placeholder: translate(lang, "cmd.drop.shop.sentence"),
                  options: buttons,
                },
              ],
            },
          ],
        },
      };
    }
  }

  //is confirmed
  {
    //price gud?
    if (h_price > 0) {
      //if (data.options[1])
      {
        //has clicked on the button
        if (userdata.apples < h_price) {
          //fail because too poor
          return {
            method: "PATCH",
            body: {
              content: translate(lang, "cmd.drop.fail.poor"),
            },
          };
        } else {
          //pay before continue
          await kira_apple_send(userdata.id, -1 * h_price);
        }
      }
    }
  }
  //alles kla

  //set
  await kira_user_set_drop(userdata.id, h_span);

  //+stats
  await stats_simple_add(userdata.statPtr.id, "count_dropTime", h_span);

  //remove components from the message
  //this does not works if drop is used as a command
  await DiscordRequest(
    `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`,
    {
      method: "PATCH",
      body: {
        components: [],
      },
    }
  );

  //send confirmation
  {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.drop.done", {
          time: time_format_string_from_int(h_span, lang),
        }),
      },
    };
  }
}

//#kira command
async function cmd_kira({
  data,
  locale,
  user,
  guild,
  userdata,
  userbook,
  channel,
  lang,
  token,
}) {
  //arg/victim
  const h_victim_id = data.options[0].value;
  let h_victim = await DiscordUserById(h_victim_id);
  //if (h_victim.global_name)
  let h_victim_name = h_victim.username;

  //arg/reason
  let h_txt_reason = data.options.find((opt) => opt.name === "reason");
  if (h_txt_reason) h_txt_reason = h_txt_reason.value;
  if (!h_txt_reason) h_txt_reason = translate(lang, `format.default.death`);

  //arg/span
  let h_span = data.options.find((opt) => opt.name === "span");
  if (h_span) h_span = h_span.value;
  if (!h_span) h_span = 40;

  //checks/first
  let h_will_ping_attacker = true;
  let h_will_ping_victim = true;
  let h_will_fail = false;

  if (h_victim.id === process.env.APP_ID) {
    //will fail because god of death
    h_will_ping_victim = false;
    h_will_fail = true;
  } else if (h_victim.bot || h_victim.system) {
    //instant fail because bot
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.kira.fail.bot"),
      },
    };
  }

  if (h_victim.id === user.id) {
    //will fail because urself
    h_will_ping_attacker = false;

    if (SETT_CMD.kira.noSuscide) {
      //instant fail because suicide disabled
      await Achievement.list["killU"].do_grant(userdata, lang);
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.kira.fail.suicide"),
        },
      };
    }
  }

  if (!guild) {
    //instant fail because victim not here
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.kira.fail.channel"),
      },
    };
  }

  try {
    let user = await DiscordRequest(
      `/guilds/${guild.id}/members/${h_victim_id}`,
      //`/users/${h_victim_id}`,
      {
        method: "GET",
      }
    ).then((res) => res.json());
  } catch (error) {
    console.debug(`kira : catch cant acess to user : ${error}`);
    if (JSON.parse(error.message)?.code === 10007) {
      //instant fail because victim not here
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.kira.fail.blind", {
            victimId: h_victim_id,
          }),
        },
      };
    }
    throw error;
  }

  let pen_ptr = userdata.equipedPen;
  if (!pen_ptr)
  {
    if (await stats_simple_get(
        userdata.statPtr.id,
        "ever_penBuy"
      ) > 0 )
    { // fail because of no pen
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.kira.fail.pen.no"),
        },
      };
    }
    else
    { // create it if has never got a pen
      console.log("create and equip a first new pen for",user.username);
      const pen=await Item.create(userdata.id, lang, "pen_black");
      await pen.equip(userdata);
      await stats_simple_set(userdata.statPtr.id, "ever_penBuy", 1);
      pen_ptr=pen;
    }
   
  }
  let h_attacker_pen = await Item.get_equiped(userdata, itemType.PEN);
  if (!h_attacker_pen)
  {
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.kira.fail.pen.broke"),
      },
    };
  }

  let h_victim_data = await kira_user_get(h_victim_id, !h_will_fail); //needed to know if alive

  if (!h_will_fail) {
    if (check_has_noDrop({ userdata: h_victim_data }) > 0) {
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.kira.fail.droped"),
        },
      };
    }
  }

  //check/others runs
  let run_combo = 1;
  {
    //if attacker is not already killing victim
    let h_run_same = await kira_run_of(h_victim_id, user.id);
    if (h_run_same) {
      console.log(` kira : A already killing V : `, h_run_same);
      //if (new Date(h_run_same.finalDate) < new Date(h_now.getTime() + 610000))//!if sentance late of 10 second
      return {
        method: "PATCH",
        body: {
          content: translate(lang, "cmd.kira.fail.edit"),
        },
      };
    }
  }

  {
    //if victim is not already killing attacker
    let h_run_reverse = await kira_run_of(user.id, h_victim_id);
    if (h_run_reverse) {
      console.log(` kira : V already killing A : `, h_run_reverse);
      run_combo = h_run_reverse.counterCombo + 1;

      if (run_combo >= SETT_CMD.kira.counterMax) {
        // too much combo
        console.log(` kira : counter is max combo=`, run_combo);
        {
          //+achiv
          await Achievement.list["counterMax"].do_grant(userdata, lang, 1, {
            personId: h_victim_id,
          });
        }
        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.kira.fail.maxcombo", {
              max: SETT_CMD.kira.counterMax,
            }),
          },
        };
      }

      //cancel death if itself
      console.log(` kira : countering... comobo=`, run_combo);
      await cmd_kira_cancel({ runId: h_run_reverse.id });
      console.log(` kira : countered`);
      {
        //+stats
        const h_pair = await stats_pair_get_id(
          userdata.id,
          user.id,
          h_victim_data.id,
          h_victim_data.userId
        );
        //simpler pair
        {
          const stat = await stats_simple_add(
            userdata.statPtr.id,
            "do_counter"
          );
          await Achievement.list["counter"].do_check(userdata, stat, lang);
        }
        await stats_simple_add(h_victim_data.statPtr.id, "is_countered");
        await stats_pair_add(h_pair, "by_counter", 1); //return the value

        {
          //+achiv
          const h_gap = parseInt(
            (new Date(userdata.finalDate).getTime() - new Date().getTime()) /
              1000
          );
          console.debug(
            `kira : countershort gap=${
              userdata.finalDate
            } - ${new Date()} = ${h_gap}`
          );
          if (h_gap < 6) {
            await Achievement.list["counterShort"].do_grant(userdata, lang, {
              time: time_format_string_from_int(lang, "cmd.kira.fail.maxcombo"),
            });
          }
        }
      }
      //and continue
    }
  }

  if (
    !h_will_fail && // if will fail = possibily no victim_data
    !h_victim_data.is_alive
  ) {
    //instant fail because is dead
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.kira.fail.isdead"),
      },
    };
  }

  //line
  let h_txt_span = time_format_string_from_int(h_span, lang);
  let h_line = translate(lang, "format.line", {
    victim: h_victim_name,
    reason: h_txt_reason,
    time: h_txt_span,
  });
  console.log("h_attacker_pen.itemName:", h_attacker_pen.itemName, h_attacker_pen);
  h_line = pen_apply_filters(h_line, h_attacker_pen.itemName);

  if (h_line.length > 256 && !userdata.is_god) {
    //54*3 : 3 less than lines
    //fail bcs too long
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.kira.fail.text.max"),
      },
    };
  }

  //checked !

  //validate writting
  const h_pen_remain = await pen_use(userdata, h_attacker_pen);
  const h_dayGap = time_day_gap(userbook.noteBook.updatedAt, locale, true, true);
  const h_dayGapDiff = h_dayGap.now.day - h_dayGap.last.day;
  const h_note = await userbook.line_append(h_line, h_dayGap);
  console.debug(
    `kira : h_dayGapDiff=${h_dayGapDiff}=${locale}-${userbook.updatedAt}`
  );

  {
    //+stats
    await stats_simple_add(userdata.statPtr.id, "do_try");
    if (h_victim_data?.id)
      await stats_simple_add(h_victim_data?.statPtr.id, "is_tried");

    if (h_dayGapDiff != 0) {
      //not the same day
      const stat =
        h_dayGapDiff === 1
          ? await stats_simple_add(userdata.statPtr.id, "streak_killDay")
          : await stats_simple_set(userdata.statPtr.id, "streak_killDay", 0);
      if (h_dayGapDiff === 1)
        await Achievement.list["killDailyStreak"].do_check(
          userdata,
          stat,
          lang
        );
      if (h_dayGapDiff >= 13)
        await Achievement.list["killDailyComeback"].do_grant(
          userdata,
          lang,
          1,
          { gap: h_dayGapDiff }
        );
    }

    if ((userbook.index + 1) % SETT_CMD.see.maxLines === 0) {
      const stat = await stats_simple_add(
        userdata.statPtr.id,
        "streak_pageFilled"
      );
      await Achievement.list["writtenPage"].do_check(userdata, stat, lang);
    }
  }

  //creat kira run
  let h_finalDate = new Date();
  h_finalDate.setSeconds(h_finalDate.getSeconds() + h_span);
  const h_run = await kira_run_create(
    h_finalDate,
    user.id,
    h_victim_id,
    h_victim_data?.id,
    run_combo
  );
  kira_remember_task_add(h_finalDate, rememberTasksType.KIRA, {
    runId: h_run.id,
  });

  var h_all_msg = translate(lang, "cmd.kira.start.guild", {
    attackerId: user.id,
    line: "```ansi\n"+h_line+"```",
    penmoji: `<:${items_info[h_attacker_pen.itemName].emoji.name}:${items_info[h_attacker_pen.itemName].emoji.id}>`
    //penmoji: "🪶a"
  });
  var isSilent = false;

  //message/victim
  const lang_victim = h_victim_data ? await lang_get(h_victim_data, lang) : lang;
  if (h_will_ping_victim) {
    let firstTime = (h_victim_data.justCreated===true);
    try {
      //open DM
      var h_victim_dm_id = await kira_user_dm_id(h_victim_data);

      //get lang

      //send message
      var h_victim_message = await DiscordRequest(
        `channels/${h_victim_dm_id}/messages`,
        {
          method: "POST",
          body: {
            content: translate(lang_victim, "cmd.kira.start.mp.victim", {
              time: time_format_string_from_int(h_span, lang_victim),
            }),
            components: (firstTime) ? undefined :
            [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: (() => {
                  let buttons = [];
                  for (let i in sett_catalog_knows) {
                    if (sett_catalog_knows[i].for === KnowUsableBy.VICTIM)
                      buttons.push({
                        type: MessageComponentTypes.BUTTON,
                        custom_id: `makecmd know ${i}+${h_run.id}`,
                        label: translate(
                          lang_victim,
                          `cmd.kira.start.mp.victim.pay.${i}`,
                          { price: sett_catalog_knows[i].price }
                        ),
                        emoji: sett_emoji_apple_croc,
                        style:
                          userdata.apples < sett_catalog_knows[i].price
                            ? ButtonStyleTypes.SECONDARY
                            : ButtonStyleTypes.SUCCESS,
                        disabled: false,
                      });
                  }
                  return buttons;
                })(),
              },
            ],
          },
        }
      ).then((res) => res.json());
      if (firstTime)
      {
        await DiscordRequest(
        `channels/${h_victim_dm_id}/messages`,
        {
          method: "POST",
          body: {
            content: translate(lang_victim, "cmd.kira.start.mp.victim.first", {channel: `<#${channel.id}>`})
            }
          }
        )
      }
    } catch (e) {
      let errorMsg = JSON.parse(e.message);
      if (errorMsg?.code === 50007) {
        h_all_msg +=
          translate(lang, "cmd.kira.warn.nomp", { userId: h_victim_id })+"\n";
        h_will_ping_victim = false;
      } else throw e;
    }
  }

  //message/attacker
  if (h_will_ping_attacker) {
    try {
      //open DM
      var h_attacker_dm_id = await kira_user_dm_id(userdata);

      //send message
      var h_attacker_message = await DiscordRequest(
        `channels/${h_attacker_dm_id}/messages`,
        {
          method: "POST",
          body: {
            content: translate(lang, "cmd.kira.start.mp.attacker", {
              victimId: h_victim.id,
              time: h_txt_span,
            }),
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: (() => {
                  let buttons = [];
                  for (let i in sett_catalog_knows) {
                    if (sett_catalog_knows[i].for === KnowUsableBy.ATTACKER)
                      buttons.push({
                        type: MessageComponentTypes.BUTTON,
                        custom_id: `makecmd know ${i}+${h_run.id}`,
                        label: translate(
                          lang,
                          `cmd.kira.start.mp.attacker.pay.${i}`,
                          { price: sett_catalog_knows[i].price }
                        ),
                        emoji: sett_emoji_apple_croc,
                        style:
                          userdata.apples < sett_catalog_knows[i].price
                            ? ButtonStyleTypes.SECONDARY
                            : ButtonStyleTypes.SUCCESS,
                        disabled: false,
                      });
                  }
                  return buttons;
                })(),
              },
            ],
          },
        }
      ).then((res) => res.json());
    } catch (e) {
      let errorMsg;
      try {
        errorMsg = JSON.parse(e.message);
      } catch (e2) {}
      if (errorMsg?.code === 50007) {
        h_all_msg +=
          translate(lang, "cmd.kira.warn.nomp", { userId: user.id })+"\n";
        h_will_ping_attacker = false;
      } else throw e;
    }
  }

  //others warnings
  if (items_info[h_attacker_pen.itemName].atr.silent)
  {
    isSilent = true;
  }
  if (h_pen_remain===penState.EMPTY)
  {
    h_all_msg += translate(lang, "cmd.kira.warn.pen.empty")+"\n";
    await stats_simple_add(userdata.statPtr.id, "ever_penEmpty");//+ stats
  }
  if (h_pen_remain===penState.BROKEN)
  {
    h_all_msg += translate(lang, "cmd.kira.warn.pen.broken")+"\n";
    const stat = await stats_simple_add(userdata.statPtr.id, "ever_penBroken");//+ stats
    await Achievement.list["penBreaker"].do_check(userdata, stat, lang);
  }

  //packing before wait
  await kira_run_pack(
    h_run.id,
    {
      //used to execute
      txt_reason: h_txt_reason,
      span: h_span,
      note_id: h_note.id,

      lang_attacker: lang,
      lang_victim: lang_victim,//used for counter

      will_ping_victim: h_will_ping_victim,
      will_ping_attacker: h_will_ping_attacker,
      will_fail: h_will_fail,

      victim_id: h_victim.id,
      victim_data_id: h_victim_data?.id, // is possibly undefined (when [will_fail])
      victim_username: h_victim_name,
      victim_dm_id: h_victim_dm_id, //can be undefined
      victim_message_id: h_victim_message?.id, //can be undefined
      attacker_id: user.id,
      // attacker_data_id: ?,
      attacker_dm_id: h_attacker_dm_id, //can be undefined
      attacker_message_id: h_attacker_message?.id, //can be undefined
      attacker_book_id: userbook.id,
    },
    {
      //used to know
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
  if (isSilent)
  {//silent
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}/messages/@original`,
      {
        method: "DELETE",
      }
    );
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}`,
      {
        method: "POST",
        body: {
          content: h_all_msg,
          flags: Math.pow(2, 12),
        },
      }
    );
    return;
  }

  return {
    method: "PATCH",
    body: {
      content: h_all_msg,
    }
  };

  //pretty old method
  //setTimeout(() => { cmd_kira_execute({ data, user, lang }); }, h_span * 1000);
}

//is executed by [./remember.js]
export async function cmd_kira_execute(data) {
  //if (!data.run)
  console.log(` kira : EXECUTE. runId=${data.runId}`);

  //run reading
  if (!data.runId) {
    console.error(`kira : runId not defined. data=`, data);
    return;
  }
  const pack = await kira_run_unpack_execute(data.runId);
  if (!pack) {
    console.error(`kira : run deleted. data=`, data);
    //await kira_run_delete(data.runId);
    return;
  }

  //datas reading again
  const user = await DiscordUserById(pack.attacker_id);
  const lang = pack.lang_attacker;
  const h_victim_data = await kira_user_get(pack.victim_id, !pack.will_fail); //needed to know if alive
  const lang_victim = h_victim_data ? await lang_get(h_victim_data, lang) : lang;
  const userdata = await kira_user_get(user.id, true);
  const h_attacker_book = await NoteBook.get(userdata.noteBookId);
  //const lang_victim = pack.lang_victim ? pack.lang_victim : pack.lang_attacker; //old

  //handle special case : burned book
  const h_will_book =
    h_attacker_book && h_attacker_book.id === pack.attacker_book_id;

  //run delete
  console.log(` kira : deleting... (runId=${data.runId})`);
  await kira_run_delete(data.runId, h_victim_data?.id);
  console.log(` kira : deleted. (runId=${data.runId})`);

  try {
    //message/victim/first/edit
    if (pack.will_ping_victim) {
      await DiscordRequest(
        `channels/${pack.victim_dm_id}/messages/${pack.victim_message_id}`,
        {
          method: "PATCH",
          body: {
            components: [],
          },
        }
      );
    }

    //message/attacker/first/edit
    if (pack.will_ping_attacker) {
      await DiscordRequest(
        `channels/${pack.attacker_dm_id}/messages/${pack.attacker_message_id}`,
        {
          method: "PATCH",
          body: {
            components: [],
          },
        }
      );
    }
  } catch (e) {
    let errorMsg = JSON.parse(e.message);
    if (!(errorMsg?.code === 50007)) throw e;
  }

  //check/second
  let h_return_msg_attacker = {
    message_reference: {
      message_id: pack.attacker_message_id,
    },
  };
  let h_return_msg_victim = {
    message_reference: {
      message_id: pack.victim_message_id,
    },
  };
  let stat_kill;
  let stat_avenge;
  let stat_repetition;
  let stat_outerTime;

  //date
  let h_finalDate = new Date();
  h_finalDate.setSeconds(h_finalDate.getSeconds() + pack.span);

  if (pack.victim_id === process.env.APP_ID) {
    //fail/god
    h_return_msg_attacker.content = translate(lang, "cmd.kira.fail.shini");
  } else if (!h_victim_data) {
    //will never happend
    h_return_msg_attacker.content = translate(lang, "cmd.kira.fail.notplayer");
  } else if (SETT_CMD.kira.cancelWhenDeadVictim && !h_victim_data.is_alive) {
    h_return_msg_attacker.content = translate(
      lang,
      "cmd.kira.fail.victim.dead.attacker"
    );
    h_return_msg_victim.content = translate(
      lang_victim,
      "cmd.kira.fail.victim.dead.victim"
    );
  } else if (SETT_CMD.kira.cancelWhenDeadAttacker && !userdata.is_alive) {
    h_return_msg_attacker.content = translate(
      lang,
      "cmd.kira.fail.attacker.dead.attacker"
    );
    h_return_msg_victim.content = translate(
      lang_victim,
      "cmd.kira.fail.attacker.dead.victim"
    );
  }

  //kill
  else {
    //sucess
    h_return_msg_attacker.content = translate(
      lang,
      "cmd.kira.finish.attacker",
      { victimId: pack.victim_id, reason: pack.txt_reason }
    );
    h_return_msg_victim.content = translate(lang, "cmd.kira.finish.victim", {//was using lang_victim here but no more
      reason: pack.txt_reason,
    });

    //kill
    {
      await kira_user_set_life(h_victim_data.id, false, h_finalDate);
      //revive
      kira_remember_task_add(h_finalDate, rememberTasksType.REVIVE, {
        userId: pack.victim_id,
        lang: lang_victim,
        ifSuicide: pack.victim_id == pack.attacker_id,
        msgReference: pack.victim_message_id,
      });
      if (h_will_book) await NoteBook.note_taste(pack.note_id, 1); //note need to exist
    }

    {
      //+stats
      //simpler pair
      {
        const stat_bulk = await stats_simple_bulkadd(userdata.statPtr.id, {
          do_hit: 1,
          do_outerTime: pack.span,
        });
        stat_outerTime = stat_bulk["do_outerTime"];
      }
      await stats_simple_bulkadd(h_victim_data.statPtr.id, {
        is_hited: 1,
        is_outedTime: pack.span,
      });
    }
    //need to be out in this scope because used after
    let h_pair = await stats_pair_get_id(
      userdata.id,
      user.id,
      h_victim_data.id,
      pack.victim_id
    );
    stat_repetition = await stats_pair_add(h_pair, "by_hit", 1); //return the value

    if (stat_repetition === 1) {
      //first time attacker kill victim

      //monetize kill
      let h_victim_kills = await stats_simple_get(
        h_victim_data.statPtr.id,
        "do_kill"
      );
      console.log(
        "DBUG : kira : kills by victim for apples : ",
        h_victim_kills
      );

      {
        //+stats
        await stats_pair_set(h_pair, "by_avenge", h_victim_kills);
        {
          const stat_bulk = await stats_simple_bulkadd(userdata.statPtr.id, {
            do_kill: 1,
            do_avenger: h_victim_kills,
          });
          stat_kill = stat_bulk["do_kill"];
          stat_avenge = h_victim_kills;
        }
        await stats_simple_bulkadd(h_victim_data.statPtr.id, {
          is_killed: 1,
          is_avenged: h_victim_kills,
        });
      }

      let h_apples = 0; //default
      if (h_victim_kills) {
        h_apples = SETT_CMD.apple.avangerAppleReward(h_victim_kills);
        kira_apple_send(userdata.id, h_apples, userdata.statPtr.id, "murderer", {
          victim: pack.victim_username,
          attacker: user.username,
          kill: h_victim_kills,
        });
      } else {
        kira_apple_send(userdata.id, h_apples, userdata.statPtr.id, "harmless", {
          victim: pack.victim_username,
          attacker: user.username,
        });
      }
      h_return_msg_attacker.content +=
        "\n" +
        translate(lang, "cmd.kira.finish.attacker.first", {
          number: h_apples,
          unit: translate(lang, `word.apple${h_apples > 1 ? "s" : ""}`),
        });
    } else {
      h_return_msg_attacker.content +=
        "\n" +
        translate(lang, "cmd.kira.finish.attacker.count", {
          number: stat_repetition,
        });
    }
  }

  //send messages in last

  try {
    //message/victim/second
    if (pack.will_ping_victim) {
      await DiscordRequest(`channels/${pack.victim_dm_id}/messages`, {
        method: "POST",
        body: h_return_msg_victim,
      });
    }

    //message/attacker/second
    if (pack.will_ping_attacker) {
      await DiscordRequest(`channels/${pack.attacker_dm_id}/messages`, {
        method: "POST",
        body: h_return_msg_attacker,
      });
    }
  } catch (e) {
    let errorMsg = JSON.parse(e.message);
    if (!(errorMsg?.code === 50007)) throw e;
  }

  //+achievements
  {
    if (stat_kill) {
      //only if new kill
      await Achievement.list["kill"].do_check(userdata, stat_kill, lang);
      await Achievement.list["avengeBest"].do_check(
        userdata,
        stat_avenge,
        lang
      );
    }

    if (stat_outerTime) {
      await Achievement.list["outerTime"].do_check(
        userdata,
        stat_outerTime,
        lang,
        {},
        (it) => time_format_string_from_int(it, lang)
      );
    }

    if (pack.victim_id === process.env.APP_ID)
      await Achievement.list["killShini"].do_grant(userdata, lang);
    else if (pack.victim_id === pack.attacker_id)
      await Achievement.list["killU"].do_grant(userdata, lang);
    //only if not itself
    else {
      if (stat_repetition) {
        await Achievement.list["murdersOn"].do_check(
          userdata,
          stat_repetition,
          lang,
          { personId: pack.victim_id }
        );
      }

      if (pack.span === 1987200)
        await Achievement.list["outer23d"].do_grant(userdata, lang, 1, {
          personId: pack.victim_id,
        });
    }
  }
}

//is not executed by [./remember.js]
export async function cmd_kira_cancel(data) {
  console.log(` kira : CANCEL. runId=${data.runId}`);

  //run reading
  if (!data.runId) {
    console.error(`kira : runId not defined. data=`, data);
    return;
  }
  const pack = await kira_run_unpack_execute(data.runId);
  if (!pack) {
    console.error(`kira : run deleted. data=`, data);
    //await kira_run_delete(data.runId);
    return;
  }

  //datas reading again
  const lang = pack.lang_attacker;
  const lang_victim = pack.lang_victim ? pack.lang_victim : pack.lang_attacker;
  //const user = await DiscordUserById(pack.attacker_id);
  // let h_victim_data = await kira_user_get(pack.victim_id, !pack.will_fail);//needed to know if alive

  //run delete
  await kira_run_delete(data.runId, pack.victim_data_id);

  //message/victim/first/edit
  try {
    if (pack.will_ping_victim) {
      await DiscordRequest(
        `channels/${pack.victim_dm_id}/messages/${pack.victim_message_id}`,
        {
          method: "PATCH",
          body: {
            components: [],
          },
        }
      );
    }

    //message/attacker/first/edit
    if (pack.will_ping_attacker) {
      await DiscordRequest(
        `channels/${pack.attacker_dm_id}/messages/${pack.attacker_message_id}`,
        {
          method: "PATCH",
          body: {
            components: [],
          },
        }
      );
    }

    //message/victim/second
    if (pack.will_ping_victim) {
      await DiscordRequest(`channels/${pack.victim_dm_id}/messages`, {
        method: "POST",
        body: {
          message_reference: {
            message_id: pack.victim_message_id,
          },
          content: translate(lang_victim, "cmd.kira.counter.victim", {
            victimId: pack.victim_id,
            attackerId: pack.attacker_id,
          }),
        },
      });
    }

    //message/attacker/second
    if (pack.will_ping_attacker) {
      await DiscordRequest(`channels/${pack.attacker_dm_id}/messages`, {
        method: "POST",
        body: {
          message_reference: {
            message_id: pack.attacker_message_id,
          },
          content: translate(lang, "cmd.kira.counter.attacker", {
            victimId: pack.victim_id,
            attackerId: pack.attacker_id,
          }),
        },
      });
    }
  } catch (e) {
    let errorMsg = JSON.parse(e.message);
    if (!(errorMsg?.code === 50007)) throw e;
  }
}

//is executed by [./remember.js]
export async function cmd_comeback(data) {
  const comeback_type = data.ifSuicide ? "suicide" : "other";

  //if comeback
  if (!SETT_CMD.kira.comebackBy.time[comeback_type].if) return;

  const userdata = await kira_user_get(data.userId, false);
  const lang = userdata.lang;

  const h_gap = parseInt(
    (new Date(userdata.backDate).getTime() - new Date().getTime()) / 1000
  );
  if (h_gap > 0) {
    //can not be bring back
    console.log(
      `cmd : comeback : cant bring back [${userdata.userId}] bcs gap=${h_gap}`
    );
    return;
  }

  //bring back
  console.log(`cmd : comeback : bringing back [${userdata.userId}]`);
  await kira_user_set_life(userdata.id, true);

  //if send message
  if (!SETT_CMD.kira.comebackBy.time[comeback_type].message) return;

  {
    //open DM
    const dm_id = await kira_user_dm_id(userdata);

    //send message
    try {
      //var h_victim_message =
      await DiscordRequest(`channels/${dm_id}/messages`, {
        method: "POST",
        body: {
          message_reference: {
            message_id: data.msgReference,
          },
          content: translate(lang, "cmd.comeback.time." + comeback_type),
        },
      });
    } catch (e) {
      let errorMsg = JSON.parse(e.message);
      if (!(errorMsg?.code === 50007)) throw e;
    }
  }
}

//#know command
async function cmd_know({ data, message, userdata, lang }) {
  //args

  let h_wh = data.options[0].value;
  let h_id = data.options[1].value;

  //if is a fake one
  if (h_wh < 0) {
    //this does not works if know is used as a command
    //remove components from the message
    await DiscordRequest(
      `channels/${message.channel_id}/messages/${message.id}`,
      {
        method: "PATCH",
        body: {
          components: [],
        },
      }
    );

    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.know.fail.fake"),
      },
    };
  }

  const pack = await kira_run_unpack_know(h_id);

  //fail bcs too late
  if (!pack) {
    //remove components from the message
    await DiscordRequest(
      `channels/${message.channel_id}/messages/${message.id}`,
      {
        method: "PATCH",
        body: {
          components: [],
        },
      }
    );

    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.know.fail.expired"),
      },
    };
  }

  const h_price = sett_catalog_knows[h_wh].price;

  //apples
  if (userdata.apples < h_price) {
    //if hasn't enougth
    return {
      method: "PATCH",
      body: {
        content: translate(lang, `cmd.know.fail.poor`, { price: h_price }),
      },
    };
  }
  await kira_apple_pay(userdata.id, h_price);

  //+stats
  await stats_simple_add(userdata.statPtr.id, "misc_know");

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
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${pack.the_token}/messages/@original`,
      {
        method: "DELETE",
      }
    );
  }

  //remove components from the message
  //this does not works if know is used as a command
  await DiscordRequest(
    `channels/${message.channel_id}/messages/${message.id}`,
    {
      method: "PATCH",
      body: {
        components: [],
      },
    }
  );

  //respond with a message
  //get the info
  return {
    method: "PATCH",
    body: {
      //content: `you are trying to know [${h_wh}] for id [${h_id}]`
      content: translate(lang, `cmd.know.get.${h_wh}`, {
        wh: h_info,
        price: h_price,
      }),
    },
  };
}

//#trick command
async function cmd_trick({ lang }) {
  //summon a new trick
  //is the command alone
  return {
    method: "PATCH",
    body: {
      content: translate(lang, "cmd.trick.shop"),
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.STRING_SELECT,
              custom_id: `makecmd <value>+0`, //"<value>" will be replaced with "value:" from button selected
              placeholder: translate(lang, "cmd.trick.shop.sentence"),
              options: (() => {
                let buttons = [];
                for (let i in tricks_all) {
                  let h_trick = tricks_all[i];

                  buttons.push({
                    value: `${
                      h_trick.ephemeral ? "trick_resp_eph" : "trick_resp"
                    } ${String(h_trick.name)}`,
                    emoji:
                      h_trick.price > 0
                        ? sett_emoji_apple_croc
                        : sett_emoji_apple_none,
                    label: translate(
                      lang,
                      `cmd.trick.item.${h_trick.name}.button.label`,
                      {
                        price: h_trick.price,
                        unit: translate(
                          lang,
                          `word.apple${h_trick.price > 1 ? "s" : ""}`
                        ),
                      }
                    ),
                    description: translate(
                      lang,
                      `cmd.trick.item.${h_trick.name}.button.desc`
                    ),
                  });
                }
                return buttons;
              })(),
            },
          ],
        },
      ],
    },
  };
}

async function cmd_trick_resp({ data, message, userdata, token, id, lang }) {
  //take confirmation
  if (!data.options) throw Error();

  //data.options
  //-[0] : trick id
  //-[1] : step index
  //  0 : first step
  //  -1 : second step
  //  ...
  //  -n : n+1 st step
  //  1 : payoff
  //-[2] : arguments pile
  //ALL of them have to be set
  const h_trick = tricks_all.find(
    (trick) => trick.name === data.options[0].value
  );
  const h_step = parseInt(data.options[1].value);
  const pile = data.options[2].value;

  //money check
  if (userdata.apples < h_trick.price) {
    //fail because too poor
    return {
      method: "PATCH",
      body: {
        content: translate(lang, "cmd.trick.fail.poor"),
      },
    };
  }

  //remove origin components
  if (data.name === "trick_resp_edit") {
  } else if (message) {
    await DiscordRequest(
      `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`,
      {
        method: "PATCH",
        body: {
          components: [],
        },
      }
    );
  }

  //steps
  if (h_trick.do?.step && h_step <= 0) {
    if (h_step * -1 >= h_trick.do.step.length)
      throw Error(
        `step [${h_step}] of trick [${h_trick.name}] called but didnt exist.`
      );
    //call TRICK's STEP[i]
    const r_back = h_trick.do.step[h_step * -1]({
      data,
      message,
      userdata,
      lang,
      pile,
      token,
      id,
    });
    if (r_back) return r_back;
  }

  //pay
  await kira_apple_pay(userdata.id, h_trick.price);

  //set
  //call TRICK's PAYOFF
  return h_trick.do.payoff({ data, message, userdata, lang, pile, token, id });
}