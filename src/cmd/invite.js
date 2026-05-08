import { translate } from "../lang";
import { sett_emoji_items } from "../sett";

import {
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";

//#invite command
export async function cmd_invite({ lang })
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
              style: ButtonStyleTypes.LINK,
              url: process.env.invite_bot,
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
              style: ButtonStyleTypes.LINK,
              url: process.env.invite_realm,
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