import { api } from "gadget-server";

import { kira_apple_claims_add } from "./apple.js";
import { translate } from "./lang.js";
import { DiscordRequest } from "../utils.js";


const achievements = {
	"test1": {
		modelKey: "done_test1",
		maxLevel: 1,
		rewards: [10],
	},
	"test2": {
		modelKey: "level_test2",
		maxLevel: 5,
		rewards: [1, 2, 3, 4, 5],
		//graduateValues: {"common":1, "nice":2, "cool":3, "great":4, "increadible":5},
		graduateFunction: (value) => (Math.floor(value/10))
	}
}

//GET
async function achiv_get_level(f_achivModelId, f_achivKey)
{
	const received_level=await api.KiraUserAchiv.findOne(f_achivModelId, {select: {[achievements[f_achivKey].modelKey]: true}}).then(obj => obj[achievements[f_achivKey].modelKey]);
	return ((received_level===null) ? 0 : received_level);//need in particular for when new achievements added
}

async function achiv_set_level(f_achivModelId, f_achivKey, f_setLevel)
{
	await api.KiraUserAchiv.update(f_achivModelId, {[achievements[f_achivKey].modelKey]: f_setLevel});
}

export async function achiv_graduate_level(f_achivKey, f_value)
{
	//if (achievements[f_achivKey].graduateValues && achievements[f_achivKey].graduateValues[f_value])
	//	return achievements[f_achivKey].graduateValues[f_value];
	return achievements[f_achivKey].graduateFunction(f_value);
}


//SET
export async function achiv_grant_level(f_userModel, f_lang, f_achivKey, f_newLevel=1)
{
	const achivModelId=f_userModel.achivPtr.id;
	//get actual level
	const h_registerLevel=await achiv_get_level(achivModelId, f_achivKey);
	//new level maxed to maxlevel
	if (f_newLevel>achievements[f_achivKey].maxLevel)
		f_newLevel=achievements[f_achivKey].maxLevel;
	//values
	const h_gap=f_newLevel - h_registerLevel;
	let h_apples=0;
	//if has a greater level
	if (f_newLevel > h_registerLevel)
	{
		console.log(`DBUG : achiv : pass [${f_achivKey}] from ${f_newLevel} to ${h_registerLevel}`)
		//set the level
		await achiv_set_level(achivModelId, f_achivKey, f_newLevel);
		//all level passed
		for (let level=h_registerLevel;level<f_newLevel;level++)
		{
			console.log(`HI : ${h_apples}+=${achievements[f_achivKey].rewards[level]}=achievements[${f_achivKey}].rewards[${level}]`);
			h_apples+=achievements[f_achivKey].rewards[level];
		}
		console.log(`HI : ${h_registerLevel}<${f_newLevel} : ${h_apples} | ${achievements[f_achivKey].rewards}`);

		//add apple
		if (h_apples>0)
	    await kira_apple_claims_add(f_userModel.id, {
	      added: h_apples,
	      type: "quest",
	      achievementKey: f_achivKey,
				levelNew: f_newLevel,
	    });

		//message
		{
			let sending_content=translate(f_lang, "achievement.done.yay", {achievementKey: f_achivKey, levelNew: f_newLevel});
			if (h_apples>0)
				sending_content+="\n"+translate(f_lang, "achievement.done.apple", {number: h_apples, unit: translate(f_lang, `word.apple${h_apples > 1 ? "s" : ""}`),});

	    //open DM
	    const received_dm = await DiscordRequest(`users/@me/channels`, {
	      method: "POST",
	      body: {
	        recipient_id: f_userModel.userId,
	      },
	    }).then((res) => res.json());
	    //send message
	    try {
	      await DiscordRequest(
	        `channels/${received_dm.id}/messages`,
	        {
	          method: "POST",
	          body: {
	            content: sending_content
	          },
	        }
	      ).then((res) => res.json());
	    } catch (e) {
	      let errorMsg = JSON.parse(e.message);
	      if (errorMsg?.code === 50007) {
	      } else throw e;
	    }
		}

	}
	return h_gap;
}