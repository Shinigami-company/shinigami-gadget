import { translate } from "./lang.js"

const times = [
  {
    divider: 86400,
    key: "day"
  },
  {
    divider : 3600,
    key : "hour"
  },
  {
    divider : 60,
    key : "minute"
  },
  {
    divider : 1,
    key : "second"
  }
]


export function format_time_string_from_int(f_s, lang)
{
  //console.log("timef :",f_s)
  let r_texts = [];

  //find values
  {
    //let i = 0;//can be set to the shortest
    //console.log("timef : values (loop ", times.length, "times)");
    for (let i = 0;i<times.length;i++)
    {
      let f_v = parseInt(f_s/times[i].divider);
      if (f_v>0)
      {
        f_s = f_s % times[i].divider;
        r_texts.push(`${f_v} ${translate(lang, `format.time.unit.${times[i].key}${(f_v > 1) ? "s" : ""}`)}`);
      }
      //console.log("timef : values :",i);
    }
    //console.log("timef : values ebd");
  }

  {
    let r_text = r_texts[0];
    //console.log("timef : between", r_texts);
    if (r_texts.length > 1)
    {
      for (var i = 1;i<r_texts.length-1;i++)
      {
        r_text = translate(lang, `format.time.between.other`, { "chunk": r_text, "piece": r_texts[i] });
      }
      //console.log("timef : lester",i);
      r_text = translate(lang, `format.time.between.last`, { "chunk": r_text, "piece": r_texts[i] });
    }
    return r_text;
  }
};

export function format_time_int_from_string(f_text)
{ };





//rules
const all_rules = [
//custom ones
//"**The ony way to cancel your death is to write the name of your killer in your death note.**",

//real ones
"**The human whose name is written in this note shall die.**",
"**If the cause of death is not specified, the person will simply die of a heart attack.**",
"This note shall become the property of the human world, once it touches the ground of (arrives in) the human world.",
"The owner of the note can recognize the image and voice of the original owner, i.e. a god of death.",
"**The human who uses this note can neither go to Heaven nor Hell.**",
"**If the time of death is written within 40 seconds after writing the cause of death as a heart attack, the time of death can be manipulated, and the time can go into effect within 40 seconds after writing the name.**",
"The person in possession of the Death Note is possessed by a god of death, its original owner, until they die.",
"Gods of death, the original owners of the Death Note, do not do, in principle, anything which will help or prevent the deaths in the note.",
"A god of death has no obligation to completely explain how to use the note ",
"A god of death can extend their own life by putting a name on their own note, but humans cannot.",
"**A person can shorten his/her own life by using the note.**",
"A god of death cannot be killed even if stabbed in his heart with a knife or shot in the head with a gun. However, there are ways to kill a god of death, which are not generally known to the god of death.",
"Even the original owners of Death Note, gods of death, do not know much about the note.",
"The Death Note will not affect those under 780 days old.",
"Suicide is a valid cause of death. Basically, all humans are thought to possess the possibility to commit suicide. It is, therefore, not something unbelievable to think of.",
"**Even after the individual's name, the time of death, and death condition on the Death Note were filled out, the time and condition of death can be altered as many times as you want, as long as it is changed within 6 minutes and 40 seconds from the time it was filled in. But, of course, this is only possible before the victim dies.**",
"Whenever you want to change anything written on the Death Note within 6 minutes and 40 seconds after you wrote, you must first rule out the characters you want to erase with two straight lines.",
"As you see above, the time and conditions of death can be changed, but once the victim's name has been written, the individual's death can never be avoided.",
"The god of death must at least own one Death Note. That Death Note must never be lent to or written on by a human.",
"Exchanging and writing on the Death Note between the gods of death is no problem.",
"If the god of death decides to use the Death Note to kill the assassin of an individual he favors, the individual's life will be extended, but the god of death will die.",
"The god of death must not tell humans the names or life spans of individuals he/she sees. This is to avoid confusion in the human world.",
"Those with the eye power of the god of death will have the eyesight of over 3.6 in the human measurement, regardless of their original eyesight.",
"The god of death must not stay in the human world without a particular reason. Conditions to stay in the human world are as follows:",
"The god of death must not hand the Death Note directly to a child under 6 years of age based on the human calendar.",
"The Death Note must not be handed to a child under 6 years of age, but Death Notes that have been dropped into the human world, and are part of the human world, can be used upon humans of any age with the same effect.",
"**When rewriting the cause and/or details of death it must be done within 6 minutes and 40 seconds. You cannot change the victim's time of death, however soon it may be.**",
"You cannot kill humans at the age of 124 or over with the Death Note.",
"You cannot kill humans with less than 12 minutes of life left in human calculations.",
"**The number of pages of the Death Note will never run out.**",
"Humans that have traded for the eye power of a god of death cannot see the name or life span of humans who have already passed away by looking at their photos.",
"**It is useless trying to erase names written in the Death Note with erasers or white-out.**",
"As long as the god of death has at least once seen a human and knows his/her name and life-span, the god of death is capable of finding that human from a hole in the world of the gods of death.",
"The god of death will not die from lack of sleep. Moreover, gods of death do not really need sleep. The meaning of sleep for gods of death is essentially different from humans and is merely laziness.",
"Especially gods of death living in the human world that have passed on their Death Note shouldn't be lazy, as they are required to see the death of the human, but it is not that they are not allowed to sleep.",
"The Death Note will not take effect if you write a specific victims name using several different pages.",
"After a god of death has brought the Death Note to the human world and given its ownership to a human, that god of death has the right to kill the human using his/her own Death Note for reasons such as disliking the owner.",
"Once the victim's name, cause of death and situation of death have been written down in the Death Note, this death will still take place even if that Death Note or the part of the note in which it has been written is destroyed, for example, burned into ashes, before the stated time of death.",
"In the world of gods of death there are a few copies of what humans may call user guidebook for using the Death Note in the human world. However, the guidebook is not allowed to be delivered to humans.",
"Some limited number of Death Notes have white or red front covers, but they would make no difference in their effects, as compared with the black cover Death Notes.",
"**All humans will, without exception, eventually die.**",
"After they die, the place they go is MU. (Nothingness)",
  "Once dead, they can never come back to life."
]

export function random_rule()
{
  let h_index=Math.floor(Math.random() * all_rules.length);
  return all_rules[h_index];
}


export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//export async function sleep(f_delay) {await setTimeout((), f_delay);}


