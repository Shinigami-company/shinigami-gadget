import { ButtonStyleTypes, MessageComponentTypes } from 'discord-interactions';
import { translate } from '../lang';
import { SETT_CMD_HELP, sett_emoji_gift_claim } from '../sett';
import { stats_simple_get, stats_simple_set } from '../use/stats'
import { Achievement } from '../achiv';
import { Item } from '../use/item';
import { Gift } from './gift';
import { kira_user_dm_id } from '../use/kira';
import { DiscordRequest } from '../utils';

export const help_steps = [// step propety is just indicative.
  {step: 0, ifQuest: false},
  
  {step: 1, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'ever_bookFirst');
    return (amount > 0);
  }},
  
  {step: 2, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'do_try');
    return (amount > 0);
  }},

  {step: 3, ifQuest: false},
  
  {step: 4, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'do_counter');
    return (amount > 0);
  }},
  
  {step: 5, ifQuest: false},

  {step: 6, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'streak_appleDay');//or 'ever_apple'
    return (amount >= 0);
  }},

  {step: 7, ifQuest: false},//! pen
  
  {step: 8, ifQuest: false},

  {step: 9, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'do_gift');
    return (amount > 0);
  }},

  {step: 10, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'misc_trickFake');
    return (amount > 0);
  }},

  {step: 11, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'count_dropTime');
    return (amount > 0);
  }},

  {step: 12, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, 'misc_know');
    return (amount > 0);
  }},
  
  {step: 13, ifQuest: false},
  
  {step: 14, ifQuest: false},
  
  {step: 15, ifQuest: false},

  {step: 16, ifQuest: false, special: { invite: true }},

  {step: 17, ifQuest: false},

  {step: 18, ifQuest: false, special: { end: true }},
]








//#help
export async function cmd_help({ data, userbook, userdata, lang }) {
  const arg_action = data.options?.find((opt) => opt.name === 'action')?.value;

  if (!arg_action || arg_action == 'tuto') return cmd_help_tuto({ data, userdata, userbook, lang });
  if (arg_action == 'complete') return cmd_help_complete({ data, userdata, userbook, lang });
  if (arg_action == 'command') return cmd_help_command({ data, userdata, userbook, lang });
}


async function cmd_help_tuto({ data, userbook, userdata, lang }) {
  let buttonsObj = new HelpButtons();
  const done = await Achievement.list['help'].level_get(userdata.achivPtr.id)
  //arg/page
  let show_page = data.options?.find((opt) => opt.name === 'page')?.value;
  let last_page = await stats_simple_get(userdata.statPtr.id, 'help_state');
  if (last_page===null)
  {
    stats_simple_set(userdata.statPtr.id, 'help_state', 0);
    last_page = 0;
  }
  const max_page = help_steps.length - 1;
  const min_page = 0;
  if (show_page===undefined)
  {
    if (done && last_page == max_page)
      show_page = 0;
    else
      show_page = last_page;
  }

  if (show_page < min_page || show_page > max_page) {
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.help.tuto.fail.none`, { number: show_page }),
        components: buttonsObj.generate(lang, userdata, done),
        embeds: []
      }
    };
  }

  //page/make
  let content = ' ';

  if (show_page > last_page + 1)
  {//fail bcs jumped over a step
  
    content = translate(lang, `cmd.help.tuto.fail.jump`);
    buttonsObj.add_action(
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: `makecmd help_edit tuto`,
        label: translate(lang, `cmd.help.tuto.button.path`),
        style: ButtonStyleTypes.SECONDARY,
      }
    );

    return {
      method: 'PATCH',
      body: {
        content,
        components: buttonsObj.generate(lang, userdata, done),
        embeds: []
      },
    };
  }
  
  let ifFirstTimeThisStep = (show_page === last_page + 1);
  let ifFailedNextQuest = false;
  if (ifFirstTimeThisStep)
  {
    let lastHelpStep = help_steps[show_page - 1];
    let ifLastQuestDone = (((!lastHelpStep) || (!lastHelpStep.ifQuest) || (await lastHelpStep.checkQuest(userdata.statPtr.id))));
    
    if (ifLastQuestDone)
    {
      await stats_simple_set(userdata.statPtr.id, 'help_state', show_page);
      last_page = show_page;
    } else {
      show_page -= 1;
      ifFirstTimeThisStep = false;
      ifFailedNextQuest = true;
    }

  }
  
  let ifFirstTimeNextStep = ((show_page === last_page) || ifFirstTimeThisStep) && !(show_page >= max_page);
  let thisHelpStep = help_steps[show_page];
  let ifQuest = thisHelpStep.ifQuest;
  let ifQuestDone = (!ifQuest || await thisHelpStep.checkQuest(userdata.statPtr.id));// true if !ifQuest
  let dolarDesc = {};

  let footer_text = `${SETT_CMD_HELP.footBarFull.repeat(show_page)}/${SETT_CMD_HELP.footBarFull.repeat(last_page - show_page)}${SETT_CMD_HELP.footBarVoid.repeat(max_page - last_page)}`;

  // specials
  if (thisHelpStep.special?.invite)
  {
    dolarDesc['inviteLink'] = process.env.invite_bot;
    dolarDesc['joinLink'] = process.env.invite_realm;
  }


  // done : show up
  let description = translate(lang, `cmd.help.tuto.step.${show_page}`, dolarDesc);
  buttonsObj.add_action(
    {
      type: MessageComponentTypes.BUTTON,
      custom_id: `makecmd help_edit tuto+${show_page - 1}`,
      label: translate(lang, `cmd.help.tuto.button.back`, { page: show_page - 1 }),
      style: ButtonStyleTypes.SECONDARY,
      disabled: (show_page <= min_page),
    },
  );
  buttonsObj.add_action(
    {
      type: MessageComponentTypes.BUTTON,
      custom_id: `makecmd help_edit tuto+${show_page + 1}`,
      label: translate(lang, `cmd.help.tuto.button.${(!ifFirstTimeNextStep) ? 'next' : (ifQuest) ? (ifFailedNextQuest) ? 'notdone' : 'done' : 'ok'}`, { page: show_page + 1 }),
      style: (ifFailedNextQuest) ? ButtonStyleTypes.DANGER : (ifFirstTimeNextStep && ifQuestDone) ? ButtonStyleTypes.SUCCESS : ButtonStyleTypes.SECONDARY,
      disabled: (show_page >= max_page),// || !ifQuestDone
    },
  );


  if (thisHelpStep.special?.end && !done)
  {
    buttonsObj.add_special(
      {
        type: MessageComponentTypes.BUTTON,
        style: ButtonStyleTypes.SUCCESS,
        custom_id: `makecmd help_edit complete`,
        label: translate(lang, `cmd.help.tuto.button.complete`),
        emoji: sett_emoji_gift_claim
      },
    );
  }

  return {
    method: 'PATCH',
    body: {
      content,
      embeds: [
        {
          color: 2326507,
          description,
          footer: {
            text: footer_text,
          },
        },
      ],
      components: buttonsObj.generate(lang, userdata, done),
    },
  };
}



class HelpButtons {

  buttons_special = [];
  buttons_action = [];
  buttons_nav = [];
  doneNav = true;

  constructor()
  {

  }

  add_special(button)
  {
    this.buttons_special.push(button);
  }
  add_action(button)
  {
    this.buttons_action.push(button);
  }
  add_nav(button)
  {
    this.buttons_nav.push(button);
  }

  generate(lang, userdata, done)
  {
    let components = [];
    
    // add nav
    if (done && this.doneNav)
    {
      let sections = ['tuto', 'command'];
      for (let sectionText of sections)
      {
        this.add_nav(
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.SECONDARY,
            label: translate(lang, `cmd.help.nav.buttons.${sectionText}`),
            custom_id: `makecmd help_edit ${sectionText}`,
          }
        )
      }
    }

    // ACTION_ROW
    if (this.buttons_special.length)
    {
      components.push(
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: this.buttons_special,
        },
      )
    }
    if (this.buttons_action.length)
    {
      components.push(
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: this.buttons_action,
        },
      )
    }
    if (this.buttons_nav.length)
    {
      components.push(
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: this.buttons_nav,
        },
      )
    }

    return components;    
  }
}


async function cmd_help_complete({ data, userbook, userdata, lang }) {
  let last_page = await stats_simple_get(userdata.statPtr.id, 'help_state');
  const done = await Achievement.list['help'].level_get(userdata.achivPtr.id);
  const max_page = help_steps.length - 1;
  let buttonsObj = new HelpButtons();
  
  // checks
  let fail_reason;
  if (last_page < max_page)
  {
    fail_reason = 'notdone';
  }
  else if (done)
  {
    fail_reason = 'already';
  }

  // then fail
  if (fail_reason)
  {
    if (!done)
    {
      buttonsObj.add_action(
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `makecmd help_edit tuto`,
          label: translate(lang, `cmd.help.tuto.button.path`),
          style: ButtonStyleTypes.SECONDARY,
        }
      );
    }
    return {
      method: 'PATCH',
      body: {
        content: translate(lang, `cmd.help.complete.fail.${fail_reason}`),
        embeds: [],
        components: buttonsObj.generate(lang, userdata, done),
      },
    };
  }


  // do it
  await Achievement.list['help'].do_grant(userdata, lang);

  // gift
  const item = await Item.create(undefined, lang, 'pen_cool');
  const response = await Gift.top_send(lang, true, userdata.userId, undefined, item)

  let dmId = await kira_user_dm_id(userdata);

  if (dmId)
  {
    try
    {
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
      })
    } catch (e) {
      let errorMsg;
      try {
        errorMsg = JSON.parse(e.message);
      } catch (e2)
      {
        throw e;
      }
      if (errorMsg?.code === 50007) {
        dmId = undefined;
      } else throw e;
    }
  }

  if (!dmId)
  {
    buttonsObj.doneNav = false;
    buttonsObj.add_special(
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: `makecmd giftclaim ${response.gift.id}`,
        label: translate(lang, "cmd.gift.post.button.claim"),
        style: ButtonStyleTypes.SUCCESS,
        emoji: sett_emoji_gift_claim
      }
    );
  }



  // message
  let description = translate(lang, `cmd.help.complete.done.description`);
  let footer_text = ' ';
  let content = ' ';

  return {
    method: 'PATCH',
    body: {
      content,
      embeds: [
        {
          color: 2326507,
          description,
          footer: {
            text: footer_text,
          },
        }],
      components: buttonsObj.generate(lang, userdata, true),
    },
  };
}


async function cmd_help_command({ data, userbook, userdata, lang }) {
  let last_page = await stats_simple_get(userdata.statPtr.id, 'help_state');
  const max_page = help_steps.length - 1;
  if (last_page === max_page)
  {

  }
}