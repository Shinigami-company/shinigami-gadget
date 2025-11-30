import { api } from "gadget-server";

export class UserDataInterface {
  
  // construct with raw model
  private id : number;
  private data : any;
  constructor(userdata : any) {
    this.id = userdata.id;
    this.data = userdata;
  }
  
  // interface propeties
  public get lifesteal() : number {
    return this.data.lifesteal;
  }
  public set lifesteal(value : number) {
    this.data.lifesteal = value;
    api.KiraUsers.update(this.id, {
      lifesteal: value
    })
  }
}