import { api } from "gadget-server";

import { cmd_kira_execute, kira_error_report, cmd_comeback } from "../cmd.js";

import { rememberTasksType } from "../enum.ts";

const wakeup_minutes = 3;
const checkup_seconds = 1;

var remember_interval_id = -1;
var wakeup_interval_id = -1;

async function kira_remember_set_interval() {
  //check if checkup needed and set interval
  var is_remaining = await kira_remember_task_soon();

  if (is_remaining != (remember_interval_id != -1)) {
    if (is_remaining) {
      remember_interval_id = setInterval(
        kira_remember_checkup,
        1000 * checkup_seconds
      );
      console.log(
        `rem3mber : one pending task. start checkup. interval=${remember_interval_id}`
      );
    } else {
      console.log(
        `rem3mber : no pending task. clear checkup. interval=${remember_interval_id}`
      );
      clearInterval(remember_interval_id);
      remember_interval_id = -1;
    }
  }

  if (wakeup_interval_id === -1) {
    //this works FOREVER (and that cool)
    wakeup_interval_id = setInterval(
      kira_remember_wakeup,
      60 * 1000 * wakeup_minutes
    );
    console.log(`rem3mber : start wakeup. interval=${wakeup_interval_id}`);
  }
}

export async function kira_remember_task_add(f_date, f_type, f_data) {
  await api.KiraRemember.create({
    executeDate: f_date,
    RememberingType: f_type,
    //RememberingId: f_id
    RememberingData: f_data,
  });
  if (remember_interval_id === -1) await kira_remember_set_interval();
}

export async function kira_remember_task_after(f_date) {
  return await api.KiraRemember.findMany({
    filter: {
      executeDate: { before: f_date.toISOString() },
    },
    //sort: { finalDate: "Ascending" },//!better for manual search, but unefficient here
    /*
    select: {
      //! acually need all
      id: true,
    },
    */
  });
}

export async function kira_remember_task_soon() {
  //remember tasks before last wakeup
  var rememberTime = new Date();
  rememberTime.setSeconds(rememberTime.getSeconds() + 60 * wakeup_minutes);
  rememberTime = rememberTime.toISOString();
  var element = await api.KiraRemember.maybeFindFirst({
    select: { id: true },
    filter: {
      executeDate: { before: rememberTime },
    },
  });
  //console.log("element:", element, Boolean(element));
  return Boolean(element);
}

export async function kira_remember_task_clean(f_taskId) {
  return await api.KiraRemember.delete(f_taskId);
}

var remembering = 0;
var ocurence_checkup = 0;
async function kira_remember_checkup() {
  //remembering

  //already
  if (remembering > 0) {
    remembering += 1;
    console.log(
      `ERROR : rem3mber : already remembering. remembering=${remembering} ocurence=${ocurence_checkup}`
    );
    if (remembering < 10) return; //!only if AFK < 10s
  }
  remembering = 1;

  //retrive
  let f_tasks = await kira_remember_task_after(new Date());

  //execute
  try {
    if (f_tasks.length > 0) {
      //console.log(` rem3mber : execute ${f_tasks.length} runs...`);
      for (let i = 0; i < f_tasks.length; i += 1) {
        console.log(
          ` rem3mber : execute ${i} (taskType=${f_tasks[i].RememberingType}) : `,
          f_tasks[i]
        );
        //remove the task from database
        kira_remember_task_clean(f_tasks[i].id);
        //data
        const data = f_tasks[i].RememberingData;

        //case
        switch (f_tasks[i].RememberingType) {
          //remembering type
          case rememberTasksType.KIRA:
            {
              await cmd_kira_execute(data);
            }
            break;

          case rememberTasksType.REVIVE:
            {
              await cmd_comeback(data);
            }
            break;
        }
      }
      await kira_remember_set_interval();
    }
  } catch (e) {
    await kira_error_report(e, "AnyJS", "remember", {}, {}, "en");
  }

  ocurence_checkup += 1;
  remembering = 0;
}

var ocurence_wakeup = 0;
async function kira_remember_wakeup() {
  console.debug(` rem3mber : mrew (min=${ocurence_wakeup * wakeup_minutes})`);
  ocurence_wakeup+=1;
  let response = await fetch(`${process.env.URL}/awake`).then((raw) =>
    raw.json()
  );
  if (response.code !== 200) console.error(`rem3mber : mrew failed`, response);
  await kira_remember_set_interval();
}

export async function linkme(f_txt) {
  console.log(` rem3mber : LINKING...`);
  await kira_remember_set_interval();
  console.log(` rem3mber : LINKED : `, f_txt);
  //remembering = 0;
}
