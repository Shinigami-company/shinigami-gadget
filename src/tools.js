import { translate, lang_get_timezone } from "./lang.js";

const times = [
  {
    divider: 86400,
    key: "day",
  },
  {
    divider: 3600,
    key: "hour",
  },
  {
    divider: 60,
    key: "minute",
  },
  {
    divider: 1,
    key: "second",
  },
];

export function time_format_string_from_int(f_s, lang) {
  let r_texts = [];

  if (f_s<0)
  {
    return translate(lang, `format.time.unic.negative`);
  }
  if (f_s===0)
  {
    return translate(lang, `format.time.unic.zero`);
  }

  //find values
  {
    //let i = 0;//can be set to the shortest
    for (let i = 0; i < times.length; i++) {
      let f_v = parseInt(f_s / times[i].divider);
      if (f_v > 0) {
        f_s = f_s % times[i].divider;
        r_texts.push(
          translate(lang, `format.time.between.unit`, {
            number: f_v,
            unit: translate(
              lang,
              `format.time.unit.${times[i].key}${f_v > 1 ? "s" : ""}`
            ),
          })
        );
      }
    }
  }

  {
    let r_text = r_texts[0];
    if (r_texts.length > 1) {
      for (var i = 1; i < r_texts.length - 1; i++) {
        r_text = translate(lang, `format.time.between.other`, {
          chunk: r_text,
          piece: r_texts[i],
        });
      }
      r_text = translate(lang, `format.time.between.last`, {
        chunk: r_text,
        piece: r_texts[i],
      });
    }
    return r_text;
  }
}

function time_format_int_from_string(f_text) {}

function time_now_utc(f_offset = 0, f_timeMs = undefined) {
  const now = f_timeMs ? new Date(f_timeMs) : new Date();
  const localTime = now.getTime();
  const localOffset = now.getTimezoneOffset() * 60000;
  // obtain UTC time in msec
  const utc = localTime + localOffset;

  return new Date(utc + 3600000 * f_offset);
}

function time_get_offset(f_timezone) {
  const now = new Date();
  // Use Intl.DateTimeFormat with timeZone option
  const options = {
    timeZone: f_timezone,
    hour12: false,
    timeZoneName: "short",
  };
  const formatter = new Intl.DateTimeFormat([], options);
  // Format the date and extract the time zone name (e.g., "GMT+2")
  const parts = formatter.formatToParts(now);
  const timeZoneName = parts.find((part) => part.type === "timeZoneName").value;
  // Extract the UTC offset from the time zone name (e.g., "+2" from "GMT+2")
  const match = timeZoneName.match(/([+-]\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function time_userday_get(f_discordLang, f_dateArg = undefined) {
  return time_now_utc(
    time_get_offset(lang_get_timezone(f_discordLang)),
    f_dateArg
  );
}

export function time_day_int(f_date) {
  return Math.floor(f_date.getTime() / 86400000);
}

export function time_day_format(f_date) {
  return f_date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
}

export function time_day_gap(
  f_lastDateArg,
  f_discordLang,
  f_ifGetDayInt,
  f_ifGetDayFormated
) {
  let r_now = time_userday_get(f_discordLang);
  let r = {
    last: {
      date: f_lastDateArg
        ? time_userday_get(f_discordLang, f_lastDateArg)
        : r_now,
    },
    now: {
      date: r_now,
    },
  };
  if (f_ifGetDayInt) {
    for (const k in r) {
      r[k].day = time_day_int(r[k].date);
    }
  }
  if (f_ifGetDayFormated) {
    for (const k in r) {
      r[k].format = time_day_format(r[k].date);
    }
  }
  return r;
}

//
const roman_letters = {
  0: "-",
  1: "I",
  4: "IV",
  5: "V",
  9: "IX",
  10: "X",
  40: "XL",
  50: "L",
  90: "XC",
  100: "C",
  400: "CD",
  500: "D",
  900: "CM",
  1000: "M",
};
const roman_stack = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
export function roman_from_int(f_int) {
  if (f_int === 0) return roman_stack[0];

  let r_txt = "";
  let i = 0;
  while (f_int > 0) {
    if (f_int < roman_stack[i]) {
      i++;
    } else {
      f_int -= roman_stack[i];
      r_txt = r_txt + roman_letters[roman_stack[i]];
    }
  }
  return r_txt;
}

export const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));
//export async function sleep(f_delay) {await setTimeout((), f_delay);}
