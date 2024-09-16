import { api } from "gadget-server";

import { cmd_kira_execute } from './cmd.js';
import { kira_runs_after } from './kira.js';


//this one not working
//function cmd_kira_wait({ api, more, user, lang }, f_time_ms, f_itr=0)
//{
//  console.log(`WAIT. wait for id=${more.runId}, minute=${f_itr}`);
//  if (f_time_ms < 60000)
//    setTimeout(() => { cmd_kira_execute({ api, more, user, lang }); }, f_time_ms);
//  else
//    setTimeout(() => { cmd_kira_wait({ api, more, user, lang }, f_time_ms-60000, f_itr+1); }, 60000);
//}


//this works FOREVER (and that cool)
setInterval(kira_remember_checkup, 1000);

var remembering = false;
var ocurence = 0;
async function kira_remember_checkup()
{
  //remembering
  if (remembering) return;//!dangerous
  remembering=true;


  //retrive
  let f_runs = await kira_runs_after(new Date());

  //execute
  if (f_runs.length>0)
  {
    console.log(`LOG : rem3mber : execute ${f_runs.length} runs...`);
    for (let i=0;i<f_runs.length;i+=1)
    {
      //console.log(`DBUG : rem3mber : run ${i} : `, f_runs[i]);
      await cmd_kira_execute({ more: { runId: f_runs[i].id}});
    }
  }
  
  //log
  if (ocurence%60===0)
  {
    console.log(`LOG : rem3mber : mrew (min=${ocurence/60})`);
    let response = await fetch('https://shinigami--development.gadget.app/awake').then(raw => raw.json());
    if (response.code!==200)
    console.log(`ERROR : rem3mber : mrew failed`,response);
  }
  ocurence+=1;
  
  remembering=false;
};

export function linkme(f_txt) 
{
  console.log("LOG : rem3mber : LINKED : ",f_txt)
  remembering=false;
};