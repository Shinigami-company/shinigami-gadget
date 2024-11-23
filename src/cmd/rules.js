
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
export async function cmd_rules({ userdata, userbook, lang }) {
  const ruleKey = rule_key_random();

  {
    //+achiv
    if (ruleKey === "new.2") {
      await Achievement.list["secretRule"].do_grant(userdata, lang);
    }
  }

  return {
    method: "PATCH",
    body: {
      content:
        translate(lang, "cmd.rules.english") +
        "\n" +
        translate(lang, "cmd.rules.preamble"),
      embeds: [
        {
          color: book_colors[userbook.color].int,
          description: translate(lang, "rule." + ruleKey),
          footer: { text: rule_key_parse(ruleKey) },
        },
      ],
    },
  };
}
