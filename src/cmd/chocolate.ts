import { translate } from "../lang";
import { sett_emoji_chocolate_tip, sett_emoji_items } from "../sett";

import { MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";
import { creditory_list } from "../use/creditory";
import { creditoryType } from "../enum";

//#chocolate command
export async function cmd_chocolate({ data, lang }: {data: any, lang: string})
{
  //if (!parseInt(process.env.invite_enable))
  let section = data.options?.find((opt: any) => opt.name === "section").value ?? "supporters";

  let body_content = translate(lang, "cmd.chocolate.content");
  let button_label_tip = translate(lang, "cmd.chocolate.button.tip");
  let button_label_join = translate(lang, "cmd.chocolate.button.join");
  let embed_section;

  switch (section) {

    case "credits": {
      let credits_color = 5793266;
      let credits_dev_list = await creditory_list(creditoryType.DEV, true);
      let credits_translate_list = await creditory_list(creditoryType.TRANSLATE, true);
      let credits_special_list = await creditory_list(creditoryType.SPECIAL_THANK, true);
      embed_section = {
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
            value: ((credits_special_list.length > 0)
              ? translate(lang, "cmd.chocolate.embeds.credits.thanks.list") + "\n" + credits_special_list.join("\n") + "\n"
              : "")
              + translate(lang, "cmd.chocolate.embeds.credits.thanks.others"),
          },
          ],
        footer: {
          text: translate(lang, "cmd.chocolate.embeds.credits.origin"),
        },
        color: credits_color,
      };
    } break;

    case "supporters": {
      // customize supporters embed
      let supporters_color = 16736095;

      let supporters_desc_users = await creditory_list(creditoryType.TIPPER, true);
      
      let supporters_desc_specialmsg_state = process.env.tip_specialmsg_state;// aviables: cool, cost, warn, beg, final, troll

      // build supporters embed
      let supporters_parth_top;
      if (supporters_desc_users.length > 0)
      {
        supporters_parth_top = translate(lang, "cmd.chocolate.embeds.supporters.header")+"\n\n"+supporters_desc_users.join("\n");
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
      embed_section = {
        description: supporters_description,
        color: supporters_color,
      };
    } break;
  }
  
  // nav buttons
  let buttons_sections: any = ['supporters', 'credits'];
  buttons_sections = buttons_sections.map((loopSection: string) => ({
    type: MessageComponentTypes.BUTTON,
    style: ButtonStyleTypes.SECONDARY,
    label: translate(lang, `cmd.chocolate.nav.buttons.${loopSection}`),
    custom_id: `makecmd chocolate_edit ${loopSection}`,
    disabled: (loopSection == section)
  }));

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
        embed_section,
      ],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            button_tip,
            button_join
          ]
        },
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: buttons_sections
        },
      ]
    },
  };
}