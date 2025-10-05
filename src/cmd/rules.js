import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { translate } from "../lang";
import { Achievement } from "../achiv";

//rules
const all_rules = [
  //custom ones
  "new.1",
  "new.2",
  "how.I-1",
  "how.I-4",
  "how.II-1",
  "how.II-2",
  "how.II-3",
  "how.III-1",
  "how.IV-1",
  "how.IV-2",
  "how.IV-3",
  "how.V-1",
  "how.V-2",
  "how.V-3",
  "how.VII-2",
  "how.IX-1",
  "how.X-1",
  "how.XI-1",
  "how.XI-2",
  "how.XI-3",
  "how.XVI-1",
  "how.XVI-2",
  "how.XVII-1",
  "how.XVIII-3",
  "how.XXI-1",
  "how.XXIV-1",
  "how.XXV-1",
  "how.XXV-2",
  "how.XXVIII-2",
  "how.XXIX-1",
  "how.XXIX-2",
  "how.XXXI-1",
  "how.XXXIX-1",
  "how.XLI-1",
  "how.XLV-1",
  "how.XLVIII-1",
  "how.XLVIII-2",
  "how.LIII-1",
  "how.LX-1",
  "how.LXII-1",
  "how.LXV-1",
  "how.LXVI-1",
  "how.M-1",
  "how.M-2",
  //real ones
];

export function rule_key_random() {
  let h_index = Math.floor(Math.random() * all_rules.length);
  return all_rules[h_index];
}

export function rule_key_parse(f_key) {
  let slices = f_key.split(".");
  let r = "";
  switch (slices[0]) {
    case "how":
      {
        slices[1] = slices[1].split("-");
        r = "how to use it " + slices[1][0];
      }
      break;
    case "new":
      {
        r = "New rule";
      }
      break;
    default:
      {
        r = "<unknow ruletype>";
      }
      break;
  }
  return r;
}


//#rules command
export async function cmd_rules({ userdata, data, userbook, lang }) {

  let arg_action = data.options?.find((opt) => opt.name === 'action')?.value;
  
  if (!arg_action || arg_action == 'how') return cmd_rules_how({ userdata, userbook, lang });
  if (arg_action == 'random') return cmd_rules_random({ userdata, userbook, lang });

}

async function cmd_rules_how({ userdata, userbook, lang }) {
  //var view_text = (parseInt(process.env.invite_enable))
  //  ? translate(lang, "cmd.help.new.view", {"inviteLink": process.env.invite_bot, "joinLink": process.env.invite_realm})
  //  : "";

  let content=translate(lang, "cmd.rules.how.content");
  let title=translate(lang, "cmd.rules.how.title");
  let description=translate(lang, "cmd.rules.how.description");
  let buttonRandomLabel=translate(lang, "cmd.rules.random.button");

  return {
    method: "PATCH",
    body: {
      content,
      embeds: [
        {
          color: userbook.color.int,
          title,
          description
        }
      ],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.SECONDARY,
              custom_id: `makecmd rules random`,
              label: buttonRandomLabel,
            }
          ]
        }
      ]
    },
  };
}


async function cmd_rules_random({ userdata, userbook, lang }) {

  const ruleKey = rule_key_random();

  {
    //+achiv
    if (ruleKey === "new.2") {
      await Achievement.list["secretRule"].do_grant(userdata, lang);
    }
  }

  //let content = `${translate(lang, "cmd.rules.random.content")}\n-# ${translate(lang, "cmd.rules.random.english")}`;
  let content = ' ';

  return {
    method: "PATCH",
    body: {
      content,
      embeds: [
        {
          color: userbook.color.int,
          description: translate(lang, "rule." + ruleKey),
          footer: { text: rule_key_parse(ruleKey) },
        },
      ],
    },
  };
}
