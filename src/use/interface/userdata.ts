import { api } from "gadget-server";
import { BaseInterface } from "./parent.ts";

const saveCheckRegistry = new FinalizationRegistry<{ id: number; saved: boolean }>((info) => {
  if (!info.saved) {
    console.warn(`Object ${info.id} was garbage collected without saving!`);
  }
});

export class UserDataInterface extends BaseInterface {
  
  // interface propeties
  public get lifesteal() : number {
    return this.data.lifesteal;
  }
  public set lifesteal(value : number) {
    this.data.lifesteal = value;
    this.tosave('lifesteal', value);
  }
}