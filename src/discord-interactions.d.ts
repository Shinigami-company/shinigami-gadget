declare module "discord-interactions" {
  export enum MessageComponentTypes {
    ACTION_ROW = 1,
    BUTTON = 2,
    SELECT_MENU = 3,
    TEXT_INPUT = 4,
  }

  export enum ButtonStyleTypes {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4,
    LINK = 5,
  }

  export interface ButtonComponent {
    type: MessageComponentTypes.BUTTON;
    style: ButtonStyleTypes;
    label?: string;
    emoji?: { name?: string; id?: string; animated?: boolean };
    url?: string;
    disabled?: boolean;
    custom_id?: string;
  }

  export interface ActionRow {
    type: MessageComponentTypes.ACTION_ROW;
    components: ButtonComponent[];
  }
}
