import { api } from "gadget-server";

import { kira_apple_claims_add } from "./apple.js";
import { translate } from "./lang.js";
import { roman_from_int } from "./tools.js";

import { DiscordRequest } from "../utils.js";

export class Achievement {
  //SELF/OBJECTS
  name;
  modelKey;
  maxLevel;
  hidden;
  graduations;
  rewards;
  constructor(
    name,
    modelKey,
    maxLevel = 1,
    hidden = false,
    graduations = undefined,
    rewards = undefined
  ) {
    Achievement.list[name] = this;
    this.name = name;

    this.modelKey = modelKey;
    this.maxLevel = maxLevel;
    this.hidden = hidden;
    this.graduations = graduations;
    this.rewards = rewards;
  }

  //SELF/STATIC
  static listDisplayed;
  static list = {};

  //MODEL/GET
  async #level_get(f_achivModelId) {
    const received_level = await api.KiraUserAchiv.findOne(f_achivModelId, {
      select: { [this.modelKey]: true },
    }).then((obj) => obj[this.modelKey]);
    return received_level === null ? 0 : received_level; //default is null
  }

  //MODEL/SET
  async #level_set(f_achivModelId, f_setLevel) {
    await api.KiraUserAchiv.update(f_achivModelId, {
      [this.modelKey]: f_setLevel,
    });
  }

  //VALUE/GET
  #level_graduate(f_value) {
    if (!this.graduations) return null;
    
    let i = 0;
    for (
      ;
      i < this.graduations.length && f_value >= this.graduations[i];
      i++
    ); //must have  ;  or  {}  at the end !
    return i;
  }

  //USER/SET
  async do_check(f_userModel, f_value, f_lang, f_doneDolarValues = {}, parseGrad = (it) => it) {
    return await this.do_grant(
      f_userModel,
      f_lang,
      this.#level_graduate(f_value),
      f_doneDolarValues,
      parseGrad
    );
  }

  async do_grant(f_userModel, f_lang, f_newLevel = 1, f_doneDolarValues = {}, parseGrad = (it) => it) {
    //values
    const achivModelId = f_userModel.achivPtr.id;
    //new level maxed to maxlevel
    const maxLevel = this.maxLevel;
    if (f_newLevel > maxLevel) f_newLevel = maxLevel;
    //get actual level
    const h_registerLevel = await this.#level_get(achivModelId);
    //used
    const h_gap = f_newLevel - h_registerLevel;
    let h_apples = 0;

    if (!(f_newLevel > h_registerLevel)) {//didnt has a greater level
      return h_gap;
    }

    console.log(
      `LOG : achiv.js : model id [${f_userModel.statPtr.id}]  pass [${this.name}] from ${f_newLevel} to ${h_registerLevel}`
    );
    //set the level
    await this.#level_set(achivModelId, f_newLevel);

    //reward
    if (this.rewards) {
      //all level passed
      for (let level = h_registerLevel; level < f_newLevel; level++) {
        h_apples += this.rewards[level];
      }

      //add apple
      if (h_apples > 0)
        await kira_apple_claims_add(f_userModel.id, {
          added: h_apples,
          type: "quest",
          name: this.name,
          level: f_newLevel,
        });
    }

    //message
    {
      const yayTypeStr =
        maxLevel === 1 ? "unic" : maxLevel === f_newLevel ? "maxed" : "level";
      let sending_content = translate(
        f_lang,
        `achievement.done.yay.${yayTypeStr}`,
        {
          "name": translate(f_lang, `achievements.${this.name}.title`),
          "level": roman_from_int(f_newLevel),
        }
      );

      if (this.graduations && this.graduations[f_newLevel])
      {
        //show landing amount
        //if must be 15, and your are at 17, show parseGrad(17)
        f_doneDolarValues["landing"]=parseGrad(this.graduations[f_newLevel]);
      }
      
      const doneMessage = translate(
        f_lang,
        `achievements.${this.name}.done`,
        f_doneDolarValues
      );
      sending_content += "\n" + doneMessage;

      if (h_apples > 0)
        sending_content +=
          "\n" +
          translate(f_lang, "achievement.done.apple", {
            number: h_apples,
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
      } catch (e) {
        let errorMsg = JSON.parse(e.message);
        if (errorMsg?.code === 50007) {
        } else throw e;
      }
    }

    return h_gap;
  }

  //STR/GET
  static async display_get(f_userdata, f_bookColor, f_lang) {
    const userAchiv = await api.KiraUserAchiv.findOne(f_userdata.statPtr.id);
    let r_list_txt = "";
    let h_displayedLines = 0;

    let countAchivShowed = 0;
    let countAchivFinish = 0;

    for (const achivKey of Achievement.listDisplayed) {
      const achiv = Achievement.list[achivKey];

      const achivValue = userAchiv[achiv.modelKey];
      let translateKey = "achievement.line";
      let translateInfos = {};

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
        amount: countAchivFinish,
        max: countAchivShowed,
      }),
      embeds: [
        {
          color: f_bookColor,
          description: r_list_txt,
          //color: book_colors[userbook.color].int,
        },
      ],
    };
  }
}

class Schedule {
  constructor()
  {
    this.tasks = [];
  }
  
  add(f_task)
  {
    this.tasks.push(f_task);
  }
  async do()
  {
    for (v of this.tasks)
    {
      await v();
    }
    this.tasks = [];
  }
}

new Achievement("test1", "done_test1", 1, undefined, undefined, [10]);
new Achievement(
  "test2",
  "level_test2",
  8,
  false,
  [5, 10, 20, 50, 100, 200, 500, 1000],
  [1, 2, 3, 4, 5, 6, 7, 8]
);

new Achievement("kill", "level_kill", 5, false[(5, 10, 20, 50, 100)]);
new Achievement("counter", "level_counter", 5, false, [5, 10, 20, 50, 100]);
new Achievement("outerTime", "level_outerTime", 5, false, [
  1 * 3600,
  24 * 3600,
  7 * 24 * 3600,
  30 * 24 * 3600,
  365.25 * 24 * 3600,
]);
new Achievement("writtenPage", "level_writtenPage", 3, false, [3, 10, 70]);
new Achievement("avengeBest", "level_avengeBest", 3, false, [5, 30, 100]);
new Achievement(
  "killDailyStreak",
  "level_killDailyStreak",
  3,
  false,
  [3, 7, 30]
);
new Achievement("killU", "done_killU", 1, false);
new Achievement("killShini", "done_killShini", 1, false);
new Achievement("outer23d", "done_outer23d", 1, false);
new Achievement("counterMax", "done_counterMax", 1, false);
new Achievement("counterShort", "done_counterShort", 1, false);
new Achievement("murdersOn", "done_murdersOn", 1, false, [10]);
new Achievement("onLeaderboard", "done_onLeaderboard", 1, false);
new Achievement("secretRule", "done_secretRule", 1, false);
new Achievement("killDailyComeback", "done_killDailyComeback", 1, false);

//dont put the achievement here to be invisible
Achievement.listDisplayed = [
  "kill",
  "counter",
  "outerTime",
  "writtenPage",
  "avengeBest",
  "killDailyStreak",
  "killU",
  "killShini",
  "outer23d",
  "counterMax",
  "counterShort",
  "murdersOn",
  "onLeaderboard",
  "secretRule",
  "killDailyComeback",
];
