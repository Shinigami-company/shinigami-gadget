export enum KnowUsableBy {
  NONE = 0,
  VICTIM = 1,
  ATTACKER = 2,
}

export enum FeedbackState {
  NOTHING = 0,
  SENDED = 1,
  MAILED = 2,
  READED = 3,
}

export enum rememberTasksType {
  KIRA = 1,
  REVIVE = 2,
}

export enum deferedActionType {
  NO = 0, //do nothing
  DUMMY = 1, //do an dummy action //! only when type is components interaction
  WAIT_MESSAGE = 5,
  WAIT_UPDATE = 6,
  EDIT_CLEAN_BUTTONS = 7, //!not used
}

export enum userBanType {
  EXPIRE = -2,
  PARDON = -1,
  NO = 0,
  PERMA = 1,
  TEMP = 2,
}

export enum itemType {
  PEN = 3,
  COLLECTOR = 4,
  CONSOMABLE = 5,
  MISC = 6,
}