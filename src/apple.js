import { api } from "gadget-server";

export async function kira_apple_claims_set(f_userdataId, f_claim) {
  return await api.KiraUsers.update(f_userdataId, {
    apples_claim: f_claim,
  });
}

export async function kira_apple_claims_add(f_userdataId, f_claim) {
  return await api.KiraUsers.update(f_userdataId, {
    apples_claim: await kira_apple_claims_get(f_userdataId).then((h) =>
      h.concat(f_claim)
    ),
  });
}

export async function kira_apple_claims_get(f_userdataId) {
  return await api.KiraUsers.findOne(f_userdataId, {
    select: {
      apples_claim: true,
    },
  }).then((obj) => obj.apples_claim);
}

const apples_emoji = {
  0: "<:apples_0:1255900070117773313>",
  1: "<:apples_1:1255878968058445894>",
  2: "<:apples_2:1255879833829900378>",
  3: "<:apples_3:1255900026215993405>",
  4: "<:apples_4:1256013377151569972>",
  5: "<:apples_5:1256013392158658632>",
  10: "<:apples_10:1281258612299137075>",
	100: "<:apples_100:1288987115736273048>"
};
const apples_stack = [100, 10, 5, 4, 3, 2, 1];

export function kira_format_applemoji(f_apples) {
  if (f_apples === 0) return apples_emoji[0];

  let r_txt = "";
  let i = 0;
  while (f_apples > 0) {
    if (f_apples < apples_stack[i]) {
      i++;
    } else {
      f_apples -= apples_stack[i];
      r_txt = r_txt + apples_emoji[apples_stack[i]];
    }
  }
  return r_txt;
}
