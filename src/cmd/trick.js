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
import { kira_game_coin_clean, kira_game_coin_create, kira_game_coin_fail, kira_game_coin_get, kira_game_coin_pick_side, kira_game_coin_pick_user, kira_game_coin_pop } from "../use/game.js";


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
          
          //values
          const bet = tricks_all[2].price;//self price
          const reward = bet*2;
          
          //game
          const game_data_id = await kira_game_coin_create(bet, userdata.userId).then(obj => obj.id);
          console.log("hi : create game_data_id=",game_data_id);
          
          return {
            method: "PATCH",
            body: 
            {
              content: translate(lang, "cmd.trick.item.coinflip.pick.user.content",
              {
                "userId": userdata.userId,
                "bet": bet,
                "reward": reward
              }),
              components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    custom_id: `makecmd trick_resp coinflip+-1+${game_data_id}`,
                    label: translate(lang, "cmd.trick.item.coinflip.pick.user.button", {
                      "bet": bet
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
          
          //game
          const game_data=await kira_game_coin_get(pile);
          {//check
            if (!game_data)
            {
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.data"),
                },
              };
            }
            if (!(game_data.step===2))
            {
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.step"),
                },
              };
            }
          }
          
          //values
          /*
          const user_tree = {//[face] : id
            [game_data.user1Side]: {userId: game_data.user1Id},
            [game_data.user2Side]: {userId: game_data.user2Id},
          };
          */
          const user_list_id = [game_data.user1Id, userdata.userId];
          const bet = game_data.bet;
          //const reward = bet*2;

          //forward
          await kira_game_coin_pick_user(game_data.id, userdata.userId);
          
          //check apples
          {
            const user_1_data=await kira_user_get(user_list_id[0], true);
            if (user_1_data.apples < bet) {
              //fail because too poor
              await kira_game_coin_fail(game_data.id);
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_list_id[0]}),
                },
              };
            }

            const user_2_data=userdata;
            if (user_2_data.apples < bet) {
              //fail because too poor
              await kira_game_coin_fail(game_data.id);
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.poor", {"userId": user_list_id[1]}),
                },
              };
            }
          }

          //return the pick.side message
          const buttons_line = Array.from(
            { length: 2 }, (_, i) => 
            ({
              type: MessageComponentTypes.BUTTON,
              custom_id: `makecmd trick_resp_edit coinflip+-2+${game_data.id}_${i+1}`,
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
        {//comes from edit
          //pile = <gameId>
          //face : 0=None, 1=heads, 2=tails
          pile=pile.split("_");
          //game
          const game_data=await kira_game_coin_get(pile[0]);
          {//check
            if (!game_data)
            {
              return {
                method: "POST",
                body: {
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data:
                  {
                    flags: InteractionResponseFlags.EPHEMERAL,
                    content: translate(lang, "cmd.trick.item.coinflip.fail.data"),
                  }
                },
              };
            }
            if (!(game_data.step===3))
            {
              return {
                method: "POST",
                body: {
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data:
                  {
                    flags: InteractionResponseFlags.EPHEMERAL,
                    content: translate(lang, "cmd.trick.item.coinflip.fail.step"),
                  }
                },
              };
            }
          }
          const bet = game_data.bet;
          const self_face = parseInt(pile[1]);

          if ((userdata.userId === game_data.user1Id) && !(game_data.user1Id===game_data.user2Id && game_data.user1Side))
          {
            game_data.user1Side = self_face;
          }
          else if (userdata.userId === game_data.user2Id)
          {
            game_data.user2Side = self_face;
          } else {
            //error : ur not playing
            return {
              method: "POST",
              body: {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.EPHEMERAL,
                  content: translate(lang, "cmd.trick.item.coinflip.fail.alien", {'user1Id': game_data.user1Id, 'user2Id': game_data.user2Id})
                },
              },
            }
          }

          if (game_data.user1Side===game_data.user2Side)
          {
            //error : ur not playing
            return {
              method: "POST",
              body: {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.EPHEMERAL,
                  content: translate(lang, "cmd.trick.item.coinflip.fail.side")
                },
              },
            }
          }

          //forward
          await kira_game_coin_pick_side(game_data.id, game_data.user1Side, game_data.user2Side);
          //console.log(`trick : coin sides : ${user_1_id}_${user_1_face}_${user_2_id}_${user_2_face}=${self_face}`);

          if ((game_data.user1Side>0) && (game_data.user2Side>0))
          {
            //both face choosen
            
            //create the game
            
            //post the launch button
            return {
              method: "POST",
              body: 
              {
                type: InteractionResponseType.UPDATE_MESSAGE,
                data: {
                  content: translate(lang, "cmd.trick.item.coinflip.pick.throw.intro")
                  +"\n"+ translate(lang, "cmd.trick.item.coinflip.pick.throw.user", {
                    "userId": game_data.user1Id,
                    "face": translate(lang, `word.side.${int_to_coinSide[game_data.user1Side]}`),
                    "bet": bet
                  })
                  +"\n"+ translate(lang, "cmd.trick.item.coinflip.pick.throw.user", {
                    "userId": game_data.user2Id,
                    "face": translate(lang, `word.side.${int_to_coinSide[game_data.user2Side]}`),
                    "bet": bet
                  })
                  +"\n"+ translate(lang, "cmd.trick.item.coinflip.pick.throw.outro"),

                  components: [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        custom_id: `makecmd trick_resp coinflip+1+${game_data.id}`,
                        label: translate(lang, "cmd.trick.item.coinflip.pick.throw.button", {
                          "bet": bet
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
              custom_id: `makecmd trick_resp_edit coinflip+-2+${game_data.id}_${i+1}`,
              label: translate(lang, `word.side.${int_to_coinSide[i+1]}`),
              style: ButtonStyleTypes.SECONDARY,
              disabled: ((game_data.user1Side===(i+1)) || (game_data.user2Side===(i+1)))
            })
          );

          var content = translate(lang, "cmd.trick.item.coinflip.pick.face.intro")
          if (game_data.user1Side)
            content+="\n"+ translate(lang, "cmd.trick.item.coinflip.pick.face.user", {
                "userId": game_data.user1Id,
                "face": translate(lang, `word.side.${int_to_coinSide[game_data.user1Side]}`)
              })
          if (game_data.user2Side)
            content+="\n"+ translate(lang, "cmd.trick.item.coinflip.pick.face.user", {
                "userId": game_data.user2Id,
                "face": translate(lang, `word.side.${int_to_coinSide[game_data.user2Side]}`)
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

          {
            //give back apple to the one who clicked on the flip button
            await kira_user_add_apple(userdata.id, tricks_all[2].price);
          }

          const game_data= await kira_game_coin_pop(pile);
          console.log("hi : pop game_data=",game_data);
          {//check
            if (!game_data)
            {
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.data"),
                },
              };
            }
            if (!(game_data.step===4))
            {
              return {
                method: "PATCH",
                body: {
                  content: translate(lang, "cmd.trick.item.coinflip.fail.step"),
                },
              };
            }
          }
          
          //values
          const user_tree = {//[face] : id
            [game_data.user1Side]: {userId: game_data.user1Id},
            [game_data.user2Side]: {userId: game_data.user2Id},
          };
          const bet = game_data.bet;
          const reward = bet*2;

          /*
          pile = pile.split("_");
          const user_tree = {//[face] : id
            [parseInt(pile[1])]: {userId: pile[0]},
            [parseInt(pile[3])]: {userId: pile[2]},
          };
          */

          if (!(user_tree[1] && user_tree[2]))
          {
            throw Error(`invalid faces [${Object.keys(user_tree)}] for [${Object.values(user_tree).map(obj=>obj.userId)}] with pile [${pile}]`);
          }
          
          //roll
          const winer_index = (randomInt(2)===0) ? 1 : 2;//random
          const loser_index = (winer_index===1) ? 2 : 1;

          /*
          if (await DiscordMessageChanged(message, token))
          {
            throw Error(`double click detected.`);
          }

          await DiscordRequest(
            `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`,
            {
              method: "PATCH",
              body: {
                content: 'edit',
                components: [],
              },
            }
          );
          */

          //remove bet
          for (let i=1;i<3;i++) {
            console.log(`HI ${i} = ${user_tree[i].userId} bcs ${user_tree[i]} bcs ${user_tree}`);
            user_tree[i].userdata=await kira_user_get(user_tree[i].userId);
            //check if rich
            if (user_tree[i].userdata.apples<bet) {
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
            await kira_apple_send(user_tree[i].userdata.id, bet*-1, user_tree[i].userdata.statPtr.id, "coinflip.bet", {"opponentId": user_tree[(i===1) ? 2 : 1].userId});
          }
          
          //give reward
          await kira_apple_send(user_tree[winer_index].userdata.id, reward, user_tree[winer_index].userdata.statPtr.id, "coinflip.win", {"side": translate(lang, `word.side.${int_to_coinSide[winer_index]}`)});
          
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
                      "reward": reward,
                      "bet": bet
                    }
                  )
                }
              }
            );
          })();

          await kira_game_coin_clean();

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