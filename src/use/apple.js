import { api } from "gadget-server";
import { kira_user_add_apple } from "./kira.js";
import { stats_simple_add } from "./stats.js";



export async function kira_apple_pay(f_dataId, f_amountPay, f_poorHandle=false) {
  if (f_amountPay<0)
    throw new Error("try to pay negative value");

  //get
  const f_apples = await api.KiraUsers.findOne(f_dataId, {
    select: { apples: true },
    }).then((data) => data.apples);
  //check
  if (f_apples<f_amountPay)
  {
    if (f_poorHandle)
      return false;
    else
      throw new Error(`cant affroad it. dataId=${f_dataId} need [${f_amountPay}] apples but have [${f_apples}]`)
  } 
  //set
  await api.KiraUsers.update(f_dataId, {
    apples: f_apples - f_amountPay,
  });
  return true;
}


export async function kira_apple_send(f_dataId, f_amount, f_userdataStatId=undefined, f_claimType="", f_claimValue={}) {
  //add apples
  await kira_user_add_apple(f_dataId, f_amount);
  //add stats
  if (f_amount>0 && f_userdataStatId)
    await stats_simple_add(f_userdataStatId, "ever_apple", f_amount); //+stats
  //add a claim message
  if (f_claimType!="")
  {
    if (f_amount<0)
      f_claimValue['removed']=f_amount*-1;
    else
      f_claimValue['added']=f_amount;
    f_claimValue['type']=f_claimType;
    await kira_apple_claims_add(f_dataId, f_claimValue);
  }
}

export async function kira_apple_claims_set(f_dataId, f_claim) {
  return await api.KiraUsers.update(f_dataId, {
    apples_claim: f_claim,
  });
};

async function kira_apple_claims_add(f_dataId, f_claim) {
  return await api.KiraUsers.update(f_dataId, {
    apples_claim: await kira_apple_claims_get(f_dataId).then((h) =>
      h.concat(f_claim)
    ),
  });
};

export async function kira_apple_claims_get(f_dataId) {
  return await api.KiraUsers.findOne(f_dataId, {
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
  100: "<:apples_100:1288987115736273048>",
  'too': "<:gap:1291127709539368971>",
};
const apples_stack = [100, 10, 5, 4, 3, 2, 1];
const apples_too = 666;

export function kira_format_applemoji(f_apples) {
  if (f_apples === 0) return apples_emoji[0];
  if (f_apples > apples_too) return apples_emoji['too'];

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
