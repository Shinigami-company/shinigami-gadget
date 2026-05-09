import { api } from "gadget-server";
import { kira_user_add_apple } from "./kira.js";
import { stats_simple_add } from "./stats.js";



//export async function lister_add() {
//  await api.KiraUsers.update(f_dataId, {
//    apples: f_apples - f_amountPay,
//  });
//}

export async function creditory_read(creditoryType) {
  return await api.KiraCreditory.findMany({
    filter: {
      hidden: {
        notEquals: true,
      },
      type: {
        equals: creditoryType,
      },
    },
    sort: {
      importance: 'Descending',
    },
  });
}

export async function creditory_list(creditoryType, allowMessage = true) {
  return await creditory_read(creditoryType).then(
    creditories =>
    creditories.map(creditor => {
      let line = `- \`${creditor.name}\``;
      if (allowMessage && creditor.message)
        line += `\n> ${creditor.message}`
      return line;
    })
  );
}