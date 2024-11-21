import { randomInt } from "crypto";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

import { translate } from "../lang.js";
import { time_format_string_from_int, sleep } from "../tools.js";

//things needed from outside
import { sett_knows, enum_know_for, sett_emoji_apple_eat } from "../cmd.js";
import { kira_user_add_apple, kira_user_get } from "../kira.js";

import { DiscordRequest, DiscordUserOpenDm } from "../../utils";

export const tricks_all = [
  
  {
    name: 'none',
    price: 0,
    
    ephemeral: true,
    do: 
    {

 
      payoff:
      async ({ lang }) =>
      {

        //message back
        return {
          method: "PATCH",
          body: {
            content: translate(
              lang,
              `cmd.trick.item.none.done`, {
                "price": tricks_all[0].price//self price
              }
            )
          },
        };
      }
    }
  },

  {
    name: 'fakemsg',
    price: 1,
    ephemeral: true,
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
                    custom_id: `makecmd trick_resp_eph fakemsg+1+<value>`,
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
                  {
                    "targetId": target_id,
                    "price": tricks_all[1].price//self price
                  }
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
              {
                "targetId": target_id,
                "price": tricks_all[1].price//self price
              }
            )
          },
        };
      }
    }
  },
  {
    name: 'coinflip',
    price: 3,
    ephemeral: false,
    do: {
      step: [


        //step 1
        async ({ data, message, userdata, token, lang }) =>
        {
          const bet = 6;
          const price = tricks_all[2].price;//self price
          
          return {
            method: "PATCH",
            body: 
            {
              content: translate(lang, "cmd.trick.item.coinflip.pick.user.content",
              {
                "userId": userdata.userId,
                "bet": bet,
                "price": price
              }),
              components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    custom_id: `makecmd trick_resp coinflip+-1+${userdata.userId}`,
                    label: translate(lang, "cmd.trick.item.coinflip.pick.user.button", {
                      "price": price
                    }),
                    emoji: sett_emoji_apple_eat,
                    style: ButtonStyleTypes.SUCCESS
                  }
                  ]
                },
              ],
            }
          };
        },



        //step 2
        async ({ data, message, userdata, lang, pile }) =>
        {
          const user_1_id = pile;
          const user_2_id = userdata.userId;
          const price = tricks_all[2].price;//self price
          
          //check apples
          {
            const user_1_data=await kira_user_get(user_1_id, true);
            if (user_1_data.apples < price) {
              //fail because too poor
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_1_id}),
                },
              };
            }

            const user_2_data=userdata;
            if (user_2_data.apples < price) {
              //fail because too poor
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_2_id}),
                },
              };
            }
          }

          return {
            method: "PATCH",
            body: 
            {
              content: translate(lang, "cmd.trick.item.coinflip.pick.side.content",
              {
                "firstUserId": user_1_id,
                "secondUserId": user_2_id,
                "price": price
              }),
              components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    custom_id: `makecmd trick_resp coinflip+1+${user_1_id}_${user_2_id}`,
                    label: translate(lang, "cmd.trick.item.coinflip.pick.side.button", {
                      "price": price
                    }),
                    emoji: {
                      "name": "🪙",//coin
                      "animated": false
                    },
                    style: ButtonStyleTypes.DANGER
                  }
                  ]
                },
              ],
            }
          };
        },



      ],
      
      payoff:
      async ({ data, message, userdata, token, lang, pile }) =>
      {
        pile = pile.split("_");
        const user_1_winer = (randomInt(2)===0);
        const user_winer_id = (user_1_winer) ? pile[0]:pile[1];
        const user_loser_id = (user_1_winer) ? pile[1]:pile[0];
        const bet = 6;
        const price = tricks_all[2].price;//self price

        //userdata must be retrive back because kira_user_add_apple cant be used twice on the same
        {
          const user_1_data=await kira_user_get(user_winer_id, true);
          if (user_1_data.apples < price) {
            //fail because too poor
            return {
              method: "PATCH",
              body: {
                content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_winer_id}),
              },
            };
          }
          //remove price apple
          await kira_user_add_apple(user_1_data, -1*price);
        }
        {
          const user_2_data=await kira_user_get(user_loser_id, true);
          if (user_2_data.apples < price) {
            //fail because too poor
            return {
              method: "PATCH",
              body: {
                content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_loser_id}),
              },
            };
          }
          //remove price apple
          await kira_user_add_apple(user_2_data, -1*price);
        }
        {
          //give bet apple
          const here_data=await kira_user_get(user_winer_id, true);
          await kira_user_add_apple(here_data, bet);
        }
        {
          //give back apple to the one who clicked on the flip button
          const here_data=await kira_user_get(userdata.userId, true);
          await kira_user_add_apple(here_data, price);
        }
        
        (async () => {
          await sleep(3000);
          await DiscordRequest(
            `webhooks/${process.env.APP_ID}/${token}`,
            {
              method: "POST",
              body: 
              {
                content: translate(
                  lang,
                  `cmd.trick.item.coinflip.done`,
                  {
                    "winerUserId": user_winer_id,
                    "loserUserId": user_loser_id,
                    "bet": bet,
                    "price": price
                  }
                )
              }
            }
          );
        })();

        //message back
        return {
          method: "PATCH",
          body: {
            content: translate(lang,`cmd.trick.item.coinflip.done.${(user_1_winer) ? "heads" : "tails"}`)
          },
        };
      }
    }
  }
]