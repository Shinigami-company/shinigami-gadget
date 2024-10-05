import { api } from "gadget-server";

/**
//the gpt tag function
function lb(strings, ...keys) {//lb = langbed
  return function (...values) {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = typeof dict[key] !== 'undefined' ? dict[key] : values[i];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  };
}
//my simple way todo
function dolar(f_text,f_value)
{
    let f_things=f_text.split("|");
    for (let i in f_things)
    {
    	if (f_value[f_things[i]]!=undefined)
      {
      	f_things[i]=f_value[f_things[i]];
      } 
      //else {f_things[i]='{'+i+'}'}
    }
    return f_things.join('');
}
*/

//varEx, from [https://github.com/OlaHulleberg/varEx/blob/main/index.js]
function varEx(inputString, inputObject) {
  // Early return if there are no $[] blocks
  if (!inputString.includes("$[")) return inputString;

  // Find all $[] blocks, and run a function for each block found.
  // Returns a complete string where all VarEx blocks have been parsed
  return inputString.replace(/\$\[(['"`\w[\].]+)\]/g, (_, key) => {
    // Initialize inputObject to be recursively parsed
    var resolvedValue = inputObject;

    // Check that we have equal amounts of open brackets [ as closing brackets ]
    // This allows us to check if the VarEx block is complete
    if (key.split("[").length !== key.split("]").length) return `$[${key}]`;

    // Replace all array blocks [] with .
    // eg. table['a'] becomes table.a
    // table[1] becomes table.1
    const cleanKey = key.replace(/\[["'`]?(\w*)["'`]?\]/g, ".$1");

    // Now we split the variable by . to resolve child elements if provided
    const variableBlocks = cleanKey.split(".");

    // Loop through each variableBlock variable (e.g variable.children.grandchildren.tableindex)
    variableBlocks.forEach((varKey) => {
      // Resolve value step-by-step
      // Prevent errors by checking if resolvedValue is set
      if (resolvedValue)
        resolvedValue =
          resolvedValue[varKey] !== null ? resolvedValue[varKey] : "";
    });

    // Return the resolved variable
    return resolvedValue;
  });
}

//all templates
const fileExists = (file) =>
  fetch(file, { method: "HEAD", cache: "no-store" })
    .then((response) => ({ 200: true, 404: false }[response.status]))
    .catch((exception) => undefined);
function lang_load() {
  let h_lang = require(`./lang/lang.json`);
  for (let i in h_lang) {
    if (h_lang[i].keys) h_lang[i].key = require(`./lang/keys/${i}.json`);
  }
  return h_lang;
}

const lang_texts = lang_load();

//for translations
export function translate(f_lang, f_key, f_dolarValues) {
  if (!lang_texts[f_lang]) {
    console.log(`ERROR : lang : unknown lang [${f_lang}]`);
    f_lang = "en";
  }
  while (!lang_texts[f_lang].keys || !lang_texts[f_lang].key[f_key]) {
    if (!lang_texts[f_lang].sublang)
      return `\`unknown translate key [${f_key}] for lang [${f_lang}]\``;
    else f_lang = lang_texts[f_lang].sublang;
  }

  return varEx(lang_texts[f_lang].key[f_key], f_dolarValues);
  //return lang_texts[f_lang].key[f_key](f_dolarValues);
}

const discordLang_to_timezone = {
  //updated the 25/9/24
  id: "Asia/Jakarta",
  da: "Europe/Copenhagen",
  de: "Europe/Berlin",
  "en-GB": "Europe/London",
  "en-US": "America/New_York",
  "es-ES": "Europe/Madrid",
  "es-419": "Europe/Madrid",
  fr: "Europe/Paris",
  hr: "Europe/Zagreb",
  it: "Europe/Rome",
  lt: "Europe/Vilnius",
  hu: "Europe/Budapest",
  nl: "Europe/Amsterdam",
  no: "Europe/Oslo",
  pl: "Europe/Warsaw",
  "pt-BR": "Europe/Lisbon",
  ro: "Europe/Bucharest",
  fi: "Europe/Helsinki",
  "sv-SE": "Europe/Stockholm",
  vi: "Asia/Ho_Chi_Minh",
  tr: "Europe/Istanbul",
  cs: "Europe/Prague",
  el: "Europe/Athens",
  bg: "Europe/Sofia",
  ru: "Europe/Moscow",
  uk: "Europe/Athens",
  hi: "Asia/Dili",
  th: "Asia/Bangkok",
  "zh-CN": "Asia/Shanghai",
  ja: "Asia/Tokyo",
  "zh-TW": "Asia/Hong_Kong",
  ko: "Asia/Seoul",
};

export function lang_get_timezone(f_discordLang) {
  return discordLang_to_timezone[f_discordLang];
}

//for lang command
export function lang_choice(r_choices = []) {
  for (let i in lang_texts) {
    if (lang_texts[i].selectable) {
      r_choices.push({
        name: lang_texts[i].name,
        value: i,
      });
    }
  }
  return r_choices;
}

export async function lang_set(f_dataId, f_lang) {
  return await api.KiraUsers.update(f_dataId, {
    lang: f_lang,
  });
}

export function lang_lore(f_lang) {
  //return "";
  let r_txt = "";
  let h_progress = lang_texts[f_lang].progress;
  let h_lore = lang_texts[f_lang].lore;

  if (h_lore) {
    r_txt += `\n\`${h_lore}\``;
  }

  if (h_progress) {
    if (h_progress <= 0) {
      r_txt += `\n\`⚠ not translated\``;
    } else if (h_progress < 100) {
      r_txt += `\n\`⚠ ${h_progress}% translated\``;
    }
  }
  return r_txt;
}

export function lang_get(f_deep) {
  //need userdata && request
  if (f_deep.userdata.lang) {
    return f_deep.userdata.lang;
  } else {
    return f_deep.source.locale;
  }
}
