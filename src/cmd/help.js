import { stats_simple_get } from "../use/stats"

export const help_steps = [// step propety is just indicative.
  {step: 0, ifQuest: false},
  
  {step: 1, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "ever_bookFirst");
    return (amount > 0);
  }},
  
  {step: 2, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "do_try");
    return (amount > 0);
  }},

  {step: 3, ifQuest: false},
  
  {step: 4, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "do_counter");
    return (amount > 0);
  }},
  
  {step: 5, ifQuest: false},

  {step: 6, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "streak_appleDay");//or "ever_apple"
    return (amount >= 0);
  }},

  {step: 7, ifQuest: false},//! pen
  
  {step: 8, ifQuest: false},

  {step: 9, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "do_gift");
    return (amount > 0);
  }},

  {step: 10, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "misc_trickFake");
    return (amount > 0);
  }},

  {step: 11, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "count_dropTime");
    return (amount > 0);
  }},

  {step: 12, ifQuest: true, checkQuest: async (statPtr) => {
    let amount = await stats_simple_get(statPtr, "misc_know");
    return (amount > 0);
  }},
  
  {step: 13, ifQuest: false},
  
  {step: 14, ifQuest: false},
  
  {step: 15, ifQuest: false},

  {step: 16, ifQuest: false, special: { invite: true }},

  {step: 17, ifQuest: false},

  {step: 18, ifQuest: false, special: { end: true }},
]