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
import { sett_emoji_apple_croc, sett_catalog_knows, sett_emoji_coin_throw } from "../sett.js";
import { KnowUsableBy } from "../enum.ts";
import { kira_user_add_apple, kira_user_get } from "../use/kira.js";

import { DiscordMessageChanged, DiscordRequest, DiscordUserOpenDm } from "../utils.js";
import { kira_apple_pay, kira_apple_send } from "../use/apple.js";


const int_to_coinSide = {
  0: 'none',
  1: 'heads',
  2: 'tails'
}

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
                      for (let i in sett_catalog_knows) {
                        if (sett_catalog_knows[i].for === KnowUsableBy.VICTIM)
                          buttons.push({
                            type: MessageComponentTypes.BUTTON,
                            custom_id: `makecmd know -1+qafbilwiv${i}`,
                            label: translate(
                              lang,
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
                    emoji: sett_emoji_apple_croc,
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
          //pile = "<userOne>"

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

          //return the pick.side message
          const buttons_line = Array.from(
            { length: 2 }, (_, i) => 
            ({
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd trick_resp_edit coinflip+-2+${user_1_id}_0_${user_2_id}_0_${i+1}`,
              label: translate(lang, `word.side.${int_to_coinSide[i+1]}`),
              style: ButtonStyleTypes.PRIMARY
            })
          );

          return {
            method: "PATCH",
            body: 
            {
              content: translate(lang, "cmd.trick.item.coinflip.pick.face.intro"),
              components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: buttons_line
              }]
            }
          };
        },




        //step 3
        async ({ data, message, userdata, lang, pile }) =>
        {
          pile = pile.split("_");
          //pile = "<userOne>_<faceOne>_<userTwo>_<faceTwo>_<faceChoose>"
          //face : 0=None, 1=heads, 2=tails

          const price = tricks_all[2].price;//self price

          
          const user_1_id = pile[0];
          let user_1_face = parseInt(pile[1]);
          const user_2_id = pile[2];
          let user_2_face = parseInt(pile[3]);
          const self_face = parseInt(pile[4]);
          //let self_i = -1;

          if (userdata.userId === user_1_id && !(user_1_id===user_2_id && user_1_face))
          {
            user_1_face = self_face;
          }
          else if (userdata.userId === user_2_id)
          {
            user_2_face = self_face;
          } else {
            //error : ur not playing
            return {
              method: "POST",
              body: {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.EPHEMERAL,
                  content: translate(lang, "cmd.trick.item.coinflip.fail.alien", {'user1Id': user_1_id, 'user2Id': user_2_id})
                },
              },
            }
          }

          console.log(`trick : coin sides : ${user_1_id}_${user_1_face}_${user_2_id}_${user_2_face}=${self_face}`);

          if ((user_1_face>0) && (user_2_face>0))
          {
            //both face choosen
            
            return {
              method: "POST",
              body: 
              {
                type: InteractionResponseType.UPDATE_MESSAGE,
                data: {
                  content: translate(lang, "cmd.trick.item.coinflip.pick.throw.intro")
                  +"\n"+ translate(lang, "cmd.trick.item.coinflip.pick.throw.user", {
                    "userId": user_1_id,
                    "face": translate(lang, `word.side.${int_to_coinSide[user_1_face]}`),
                    "price": price
                  })
                  +"\n"+ translate(lang, "cmd.trick.item.coinflip.pick.throw.user", {
                    "userId": user_2_id,
                    "face": translate(lang, `word.side.${int_to_coinSide[user_2_face]}`),
                    "price": price
                  })
                  +"\n"+ translate(lang, "cmd.trick.item.coinflip.pick.throw.outro"),

                  components: [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        custom_id: `makecmd trick_resp coinflip+1+${user_1_id}_${user_1_face}_${user_2_id}_${user_2_face}`,
                        label: translate(lang, "cmd.trick.item.coinflip.pick.throw.button", {
                          "price": price
                        }),
                        emoji: sett_emoji_coin_throw,
                        style: ButtonStyleTypes.DANGER
                      }
                      ]
                    },
                  ],
                }
              }
            };
          }

          //return the pick.side message
          const buttons_line = Array.from(
            { length: 2 }, (_, i) => 
            ({
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd trick_resp_edit coinflip+-2+${user_1_id}_${user_1_face}_${user_2_id}_${user_2_face}_${i+1}`,
              label: translate(lang, `word.side.${int_to_coinSide[i+1]}`),
              style: ButtonStyleTypes.SECONDARY,
              disabled: ((user_1_face===(i+1)) || (user_2_face===(i+1)))
            })
          );

          var content = translate(lang, "cmd.trick.item.coinflip.pick.face.intro")
          if (user_1_face)
            content+="\n"+ translate(lang, "cmd.trick.item.coinflip.pick.face.user", {
                "userId": user_1_id,
                "face": translate(lang, `word.side.${int_to_coinSide[user_1_face]}`)
              })
          if (user_2_face)
            content+="\n"+ translate(lang, "cmd.trick.item.coinflip.pick.face.user", {
                "userId": user_2_id,
                "face": translate(lang, `word.side.${int_to_coinSide[user_2_face]}`)
              })

          //reture a POST request!!
          return {
            method: "POST",
            body: 
            {
              type: InteractionResponseType.UPDATE_MESSAGE,
              data: {
                components: [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: buttons_line
                }
                ],
                content
              }
            }
          };

        },



      ],
      
      payoff:
      async ({ data, message, userdata, token, lang, pile }) =>
      {
        pile = pile.split("_");

        const user_tree = {//[face] : id
          [parseInt(pile[1])]: {userId: pile[0]},
          [parseInt(pile[3])]: {userId: pile[2]},
        };

        if (!(user_tree[1] && user_tree[2]))
        {
          throw Error(`invalid faces [${Object.keys(user_tree)}] for [${Object.values(user_tree).map(obj=>obj.userId)}] with pile [${pile}]`);
        }
        
        const winer_index = (randomInt(2)===0) ? 1 : 2;//random
        const loser_index = (winer_index===1) ? 2 : 1;
        const bet = 6;
        const price = tricks_all[2].price;//self price

        
        {
          //give back apple to the one who clicked on the flip button
          await kira_user_add_apple(userdata.id, price);
        }
        if (await DiscordMessageChanged(message, token))
        {
          throw Error(`double click detected.`);
        }

        await DiscordRequest(
          `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`,
          {
            method: "PATCH",
            body: {
              components: [],
            },
          }
        );

        //remove price
        for (let i=1;i<3;i++) {
          console.log(`HI ${i} = ${user_tree[i].userId} bcs ${user_tree[i]} bcs ${user_tree}`);
          user_tree[i].userdata=await kira_user_get(user_tree[i].userId);
          //check if rich
          if (user_tree[i].userdata.apples<price) {
            //fail because too poor
            return {
              method: "PATCH",
              body: {
                content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_tree[i].userId}),
              }
            };
          }
        }
        for (let i=1;i<3;i++) {
          await kira_apple_send(user_tree[i].userdata.id, price*-1, user_tree[i].userdata.statPtr.id, "coinflip.bet", {"opponentId": user_tree[(i===1) ? 2 : 1].userId});
        }
        
        //give bet
        await kira_apple_send(user_tree[winer_index].userdata.id, bet, user_tree[winer_index].userdata.statPtr.id, "coinflip.win", {"side": translate(lang, `word.side.${int_to_coinSide[winer_index]}`)});
        
        //will be executed after. async without await
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
                    "winerUserId": user_tree[winer_index].userId,
                    "loserUserId": user_tree[loser_index].userId,
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
            content: translate(lang,`cmd.trick.item.coinflip.done.${int_to_coinSide[winer_index]}`)
          },
        };
      }
    }
  }
]