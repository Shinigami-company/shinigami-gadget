import { api } from "gadget-server";

import { kira_apple_send } from "./use/apple.js";
import { translate } from "./lang";
import { roman_from_int } from "./tools.js";

import { DiscordRequest } from "./utils.js";

export class Achievement {
  //SELF/OBJECTS
  name : string;
  modelKey : string;
  maxLevel : number;
  hidden : boolean;
  graduations : number[] | undefined;
  rewards : number[] | number | undefined;
  constructor(
    name : string,
    modelKey : string,
    maxLevel : number = 1,
    hidden : boolean = false,
    rewards : number[] | number | undefined = 1,
    graduations : number[] | undefined = undefined
  ) {
    Achievement.list[name] = this;
    this.name = name;

    this.modelKey = modelKey;
    this.maxLevel = maxLevel;
    this.hidden = hidden;
    if (rewards) this.rewards = rewards;
    if (graduations) this.graduations = graduations;
  }

  //SELF/STATIC
  static listDisplayed : string[];
  static list : {[key : string] : Achievement} = {};

  //MODEL/GET
  async level_get(f_achivModelId : string) {
    const received_level = await api.KiraUserAchiv.findOne(f_achivModelId, {
      select: { [this.modelKey]: true },
    }).then((obj : any) => obj[this.modelKey]);
    return received_level === null ? 0 : received_level; //default is null
  }

  //MODEL/SET
  async #level_set(f_achivModelId : string, f_setLevel : number) {
    await api.KiraUserAchiv.update(f_achivModelId, {
      [this.modelKey]: f_setLevel,
    });
  }

  //VALUE/GET
  #level_graduate(f_value : number) {
    if (!this.graduations)
      throw `no graduation.\nkey [${this.modelKey}] cant be checked !`;

    let i = 0;
    for (; i < this.graduations.length && f_value >= this.graduations[i]; i++); //must have  ;  or  {}  at the end !
    return i;
  }
  level_graduate(f_value : number) {
    return this.#level_graduate(f_value);
  }

  //USER/SET
  async do_check(
    f_userModel : any,
    f_value : number,
    f_lang : string,
    f_doneDolarValues : any = {},
    parseGrad = (it : any) => it
  ) {
    return await this.do_grant(
      f_userModel,
      f_lang,
      this.#level_graduate(f_value),
      f_doneDolarValues,
      parseGrad
    );
  }

  async do_grant(
    f_userModel : any,
    f_lang : string,
    f_newLevel = 1,
    f_doneDolarValues : any = {},
    parseGrad = (it : any) => it
  ) {
    //values
    const achivModelId = f_userModel.achivPtr.id;
    //new level maxed to maxlevel
    const maxLevel = this.maxLevel;
    if (f_newLevel > maxLevel) f_newLevel = maxLevel;
    //get actual level
    const h_registerLevel = await this.level_get(achivModelId);
    //used
    const h_gap = f_newLevel - h_registerLevel;
    let h_apples = 0;

    if (!(f_newLevel > h_registerLevel)) {
      //didnt has a greater level
      return h_gap;
    }

    console.log(
      `LOG : achiv : model id [${f_userModel.statPtr.id}]  pass [${this.name}] from ${h_registerLevel} to ${f_newLevel}`
    );
    //set the level
    await this.#level_set(achivModelId, f_newLevel);
    let achievementTitle = translate(f_lang, `achievements.${this.name}.title`);

    //reward
    if (this.rewards) {
      //all level passed
      for (let level = h_registerLevel; level < f_newLevel; level++) {
        h_apples += (typeof this.rewards == "number") ? this.rewards : this.rewards[level];
      }

      //add apple
      //if (h_apples > 0)
      //  await kira_apple_send(
      //    f_userModel.id, h_apples, f_userModel.statPtr.id,
      //    'quest.' + ((this.maxLevel > 1) ? 'level' : 'done'),
      //    {name: this.name, title: achievementTitle, level: f_newLevel}
      //  );
    }

    //message
    {
      const yayTypeStr =
        maxLevel === 1 ? "unic" : maxLevel === f_newLevel ? "maxed" : "level";
      let sending_content = translate(
        f_lang,
        `achievement.done.yay.${yayTypeStr}`,
        {
          name: achievementTitle,
          level: roman_from_int(f_newLevel),
        }
      );

      if (this.graduations && this.graduations[f_newLevel]) {
        //show landing amount
        //if must be 15, and your are at 17, show parseGrad(17)
        f_doneDolarValues["landing"] = parseGrad(
          this.graduations[f_newLevel - 1]
        );
      }

      const doneMessage = translate(
        f_lang,
        `achievements.${this.name}.done`,
        f_doneDolarValues
      );
      sending_content += "\n" + doneMessage;

      if (h_apples > 0)
        sending_content +=
          translate(f_lang, "achievement.done.apple", {
            number: h_apples.toString(),
            unit: translate(f_lang, `word.apple${h_apples > 1 ? "s" : ""}`),
          });

      //open DM
      const received_dm = await DiscordRequest(`users/@me/channels`, {
        method: "POST",
        body: {
          recipient_id: f_userModel.userId,
        },
      }).then((res) => res.json());
      //send message
      try {
        await DiscordRequest(`channels/${received_dm.id}/messages`, {
          method: "POST",
          body: {
            content: sending_content,
          },
        }).then((res) => res.json());
      } catch (e : any) {
        let errorMsg = JSON.parse(e.message);
        if (errorMsg?.code === 50007) {
        } else throw e;
      }
    }

    return h_gap;
  }

  //STR/GET
  static async display_get(f_userdata : any, f_bookColor : string, f_lang : string) {
    const userAchiv = await api.KiraUserAchiv.findOne(f_userdata.statPtr.id);
    let r_list_txt = "";
    let h_displayedLines = 0;

    let countAchivShowed = 0;
    let countAchivFinish = 0;

    for (const achivKey of Achievement.listDisplayed) {
      const achiv = Achievement.list[achivKey];

      const achivValue = userAchiv[achiv.modelKey];
      let translateKey = "achievement.line";
      let translateInfos : any = {};

      if (achivValue === undefined) {
        throw new Error(
          `KiraUserAchiv attribute is expected, but is not defined.\nis key [${achiv.modelKey}] in the database?`
        );
      }

      if (achiv.hidden && (achivValue === 0 || achivValue === null)) {
        //hidden
        translateKey += ".hidden";
      } else {
        //show
        translateInfos = {
          title: translate(f_lang, `achievements.${achivKey}.title`),
          lore: translate(f_lang, `achievements.${achivKey}.lore`),
        };

        if (achiv.maxLevel === 1) {
          //unic level
          translateKey += ".done";
          countAchivShowed += 1;
          if (achiv.maxLevel === achivValue) {
            countAchivFinish += 1;
            translateKey += ".finish";
          } else {
            translateKey += ".zero";
          }
        } else {
          translateKey += ".level";
          countAchivShowed += achiv.maxLevel;
          countAchivFinish += achivValue;
          translateInfos["level"] = roman_from_int(achivValue);
          translateInfos["max"] = roman_from_int(achiv.maxLevel);
          if (achivValue === 0 || achivValue === null) {
            translateKey += ".zero";
          } else if (achiv.maxLevel === achivValue) {
            translateKey += ".finish";
          } else {
            translateKey += ".step";
          }
        }
      }

      {
        if (h_displayedLines > 0) r_list_txt += "\n";
        h_displayedLines += 1;

        r_list_txt += translate(f_lang, translateKey, translateInfos);
      }
    }

    return {
      content: translate(f_lang, "achievement.show", {
        amount: countAchivFinish.toString(),
        max: countAchivShowed.toString(),
      }),
      embeds: [
        {
          color: f_bookColor,
          description: r_list_txt,
        },
      ],
    };
  }
}

//class Schedule {
//  tasks : any[];
//  constructor() {
//    this.tasks = [];
//  }

//  add(f_task) {
//    this.tasks.push(f_task);
//  }
//  async do() {
//    for (let v of this.tasks) {
//      await v();
//    }
//    this.tasks = [];
//  }
//}

new Achievement("test1", "done_test1", 1, undefined, 1, [10]);
new Achievement(
  "test2",
  "level_test2",
  8,
  false,
  [1, 2, 3, 4, 5, 6, 7, 8],
  [5, 10, 20, 50, 100, 200, 500, 1000]
);

new Achievement("kill", "level_kill", 5, false, 1, [5, 10, 20, 50, 100]);
new Achievement("counter", "level_counter", 5, false, 1, [5, 20, 50, 200, 500]);
new Achievement("outerTime", "level_outerTime", 5, false, 1, [
  1 * 3600,
  24 * 3600,
  7 * 24 * 3600,
  30 * 24 * 3600,
  365.25 * 24 * 3600,
]);
new Achievement("writtenPage", "level_writtenPage", 3, false, 1, [2, 10, 70]);
new Achievement("avengeBest", "level_avengeBest", 3, false, 1, [5, 30, 100]);
new Achievement(
  "killDailyStreak",
  "level_killDailyStreak",
  3,
  false,
  1,
  [3, 7, 30]
);
new Achievement("killU", "done_killU", 1, false, 1);
new Achievement("killShini", "done_killShini", 1, false, 1);
new Achievement("outer23d", "done_outer23d", 1, false, 1);
new Achievement("counterMax", "done_counterMax", 1, false, 1);
new Achievement("counterShort", "done_counterShort", 1, false, 1);
new Achievement("murdersOn", "done_murdersOn", 1, false, 1, [10]);
new Achievement("onLeaderboard", "done_onLeaderboard", 1, false, 1);
new Achievement("secretRule", "done_secretRule", 1, false, 1);
new Achievement("killDailyComeback", "done_killDailyComeback", 1, false, 1);

new Achievement("help", "done_help", 1, false, 1);
new Achievement("shopEmpty", "done_shopEmpty", 1, false, 1);
new Achievement("booksDouble", "done_booksDouble", 1, false, 1);
new Achievement("giftAway", "done_giftAway", 1, false, 1);
new Achievement("giftJunk", "done_giftJunk", 1, false, 1);
new Achievement("giftSelf", "done_giftSelf", 1, false, 1);
new Achievement("penBreaker", "level_penBreaker", 3, false, 1, [1, 5, 15]);

//dont put the achievement here to be invisible
Achievement.listDisplayed = [
  "help",
  "kill",
  "counter",
  "outerTime",
  "writtenPage",
  "penBreaker",
  "avengeBest",
  "killDailyStreak",
  "killU",
  "killShini",
  "outer23d",
  "counterMax",
  "counterShort",
  "murdersOn",
  "shopEmpty",
  "booksDouble",
  "giftAway",
  "giftJunk",
  "giftSelf",
  "onLeaderboard",
  "secretRule",
  "killDailyComeback",
];
