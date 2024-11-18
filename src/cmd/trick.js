import { randomInt } from "crypto";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

import { translate } from "../lang.js";
import { time_format_string_from_int } from "../tools.js";

//things needed from outside
import { sett_knows, enum_know_for, sett_emoji_apple_eat } from "../cmd.js";


import { DiscordRequest, DiscordUserOpenDm } from "../../utils";

export const tricks_all = [
  {
    name: 'fakemsg',
    price: 1,
    do: {
      step: [

        //step 1
        async ({ data, message, userdata, lang }) => 
        {
        return {
          method: "PATCH",
          body: {
            content: translate(lang, "cmd.trick.item.fakemsg.pick.user"),
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.USER_SELECT,
                    custom_id: `makecmd trick fakemsg+1+<value>`,
                    placeholder: translate(lang, "cmd.trick.shop.step.sentence"),
                  }
                  ]
                },
              ],
            },
          };
        },      
      ],
      
      payoff:
      async ({ data, message, userdata, lang, pile }) =>
      {
        //analyse pile
        const slices=pile.split("_");
        const target_id=slices[0];
        const span=40;//slices[1];
        const txt_span = time_format_string_from_int(span, lang);

        //send fake attack

        //message/victim

        try {
          //open DM
          const victim_dm_id = await DiscordUserOpenDm(target_id);
          //send message

          var victim_message_id = await DiscordRequest(
            `channels/${victim_dm_id}/messages`,
            {
              method: "POST",
              body: {
                content: translate(lang, "cmd.kira.start.mp.victim", {
                  time: txt_span,
                }),
                components: [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: (() => {
                      let buttons = [];
                      for (let i in sett_knows) {
                        if (sett_knows[i].for === enum_know_for.VICTIM)
                          buttons.push({
                            type: MessageComponentTypes.BUTTON,
                            custom_id: `makecmd know -1+qafbilwiv${i}`,
                            label: translate(
                              lang,
                              `cmd.kira.start.mp.victim.pay.${i}`,
                              { price: sett_knows[i].price }
                            ),
                            emoji: sett_emoji_apple_eat,
                            style:
                              userdata.apples < sett_knows[i].price
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
          ).then((res) => res.json()).then((msg) => msg.id);
        } catch (e) {
          let errorMsg;
          try {
            errorMsg = JSON.parse(e.message);
          }
          catch (ee) {
            throw e;
          }
          if (errorMsg?.code === 50007) {
            //cant send message
            return {
              method: "PATCH",
              body: {
                content: translate(
                  lang,
                  `cmd.trick.item.fakemsg.fail.nomp`,
                  {"targetId": target_id}
                )
              },
            };
          } else throw e;
        }



        //message back
        return {
          method: "PATCH",
          body: {
            content: translate(
              lang,
              `cmd.trick.item.fakemsg.done`,
              {"targetId": target_id}
            )
          },
        };
      }
    }
  },
  {
    name: 'coinflip',
    price: 1,
    do: {
      
      payoff:
      ({ data, message, userdata, lang }) =>
      {

        //message back
        return {
          method: "PATCH",
          body: {
            content: translate(
              lang,
              `cmd.trick.item.coinflip.done.${(randomInt(2)===0) ? "heads" : "tails"}`,
            )
          },
        };
      }
    }
  }
]