import { api } from "gadget-server";

import { cmd_kira_execute, kira_error_report, cmd_comeback } from "../cmd.js";

import { rememberTasksType } from "../enum.ts";

export async function kira_remember_task_add(f_date, f_type, f_data) {
  return await api.KiraRemember.create({
    executeDate: f_date,
    RememberingType: f_type,
    //RememberingId: f_id
    RememberingData: f_data,
  });
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

export async function kira_remember_task_clean(f_taskId) {
  return await api.KiraRemember.delete(f_taskId);
}

//this one not working
//function cmd_kira_wait({ api, more, user, lang }, f_time_ms, f_itr=0)
//{
//  console.debug(`kira : WAIT. wait for id=${more.runId}, minute=${f_itr}`);
//  if (f_time_ms < 60000)
//    setTimeout(() => { cmd_kira_execute({ api, more, user, lang }); }, f_time_ms);
//  else
//    setTimeout(() => { cmd_kira_wait({ api, more, user, lang }, f_time_ms-60000, f_itr+1); }, 60000);
//}

//this works FOREVER (and that cool)
setInterval(kira_remember_checkup, 1000);

var remembering = 0;
var ocurence = 0;
async function kira_remember_checkup() {
  //remembering

  //already
  if (remembering > 0) {
    remembering += 1;
    console.log(
      `ERROR : rem3mber : already remembering. remembering=${remembering} ocurence=${ocurence}`
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
        throw Error("that a fricking test");
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
    }
  } catch (e) {
    await kira_error_report('error.remember', e, 'en', 'remember', {});
  }

  //mrewing : log and keep awake
  if (ocurence % 60 === 0) {
    console.debug(` rem3mber : mrew (min=${ocurence / 60})`);
    let response = await fetch(`${process.env.URL}/awake`).then((raw) =>
      raw.json()
    );
    if (response.code !== 200)
      console.error(`rem3mber : mrew failed`, response);
  }

  ocurence += 1;
  remembering = 0;
}

export function linkme(f_txt) {
  console.log(` rem3mber : LINKED : `, f_txt);
  remembering = 0;
}
