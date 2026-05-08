import { translate } from "../lang";
import { sett_emoji_chocolate_tip, sett_emoji_items } from "../sett";

import { MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";
import { creditory_list } from "../use/creditory";
import { creditoryType } from "../enum";

//#chocolate command
export async function cmd_chocolate({ lang }: {lang: string})
{
  //if (!parseInt(process.env.invite_enable))

  let body_content=translate(lang, "cmd.chocolate.content");
  let button_label_tip=translate(lang, "cmd.chocolate.button.tip");
  let button_label_join=translate(lang, "cmd.chocolate.button.join");

  let credits_color = 5793266;
  let credits_dev_list = await creditory_list(creditoryType.DEV, true);
  let credits_translate_list = [" - some1","- some2"];
  let embed_credits = {
    title: translate(lang, "cmd.chocolate.embeds.credits.title"),
    fields: [
      {
        name: translate(lang, "cmd.chocolate.embeds.credits.dev.name"),
        value: credits_dev_list.join("\n")
      },
      {
        name: translate(lang, "cmd.chocolate.embeds.credits.translate.name"),
        value: credits_translate_list.join("\n")
      },
      {
        name: translate(lang, "cmd.chocolate.embeds.credits.thanks.name"),
        value: translate(lang, "cmd.chocolate.embeds.credits.thanks.value"),
      },
      ],
    color: credits_color,
  };

  // customize supporters embed
  let supporters_color = 16736095;

  let supporters_desc_users = ["- noone\n> empty quote","- anothernoone"];
  
  let supporters_desc_specialmsg_state = process.env.tip_specialmsg_state;// aviables: cool, cost, warn, beg, troll

  // build supporters embed
  let supporters_parth_top;
  if (supporters_desc_users)
  {
    supporters_parth_top = translate(lang, "cmd.chocolate.embeds.supporters.header")+"\n"+supporters_desc_users.join("\n");
  } else {
    supporters_parth_top = translate(lang, "cmd.chocolate.embeds.supporters.nohead");
  }
  
  let supporters_parth_down = translate(lang, "cmd.chocolate.embeds.supporters.footer", {"tipLink": process.env.tip_link!, "joinLink": process.env.invite_realm!});

  let supporters_parth_special;
  if (supporters_desc_specialmsg_state)
    supporters_parth_special = "-# "+translate(lang, `cmd.chocolate.embeds.supporters.special.${supporters_desc_specialmsg_state}`);
  
  let supporters_description = [supporters_parth_top, supporters_parth_down, supporters_parth_special]
    .filter(v => v !== undefined)
    .join("\n\n");
  let embed_supporters = {
    title: translate(lang, "cmd.chocolate.embeds.supporters.title"),
    description: supporters_description,
    color: supporters_color,
  };
  
  // button tip
  let button_tip = {
    type: MessageComponentTypes.BUTTON,
    //style: ButtonStyleTypes.PRIMARY,// does not works bcs of link
    url: process.env.tip_link,
    style: ButtonStyleTypes.LINK,
    emoji: sett_emoji_chocolate_tip,
    label: button_label_tip,
    disabled: false,
  };

  // button join
  let button_join = {
    type: MessageComponentTypes.BUTTON,
    //style: ButtonStyleTypes.SECONDARY,// does not works bcs of link
    url: process.env.invite_realm,
    style: ButtonStyleTypes.LINK,
    emoji: sett_emoji_items.book_white,
    label: button_label_join,
    disabled: false,
  };

  return {
    method: "PATCH",
    body: {
      content: body_content,
      embeds: [
        embed_credits,
        embed_supporters
      ],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            button_tip,
            button_join
          ]
        },
      ]
    },
  };
}