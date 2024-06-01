import { APP_SHORT_NAME } from "../properties.js";
import { DEFAULT_SETTINGS } from "./app-default-settings.js";

const STORAGE = localStorage;
const appShortName = APP_SHORT_NAME;

export const setStorage = () => {
  if (STORAGE.getItem(`${appShortName}FirstTime`) === null) {
    STORAGE.setItem(`${appShortName}FirstTime`, '0');

    /*
    catch = {
      mapId: string,
      fishId: string,
      fishLength: number,
      fishMass: number,
      notation: number
    }
    */
    
    let userTMP = {
      currentCharacter: 3,
      currentRod: 1,
      catches: [],
      settings: DEFAULT_SETTINGS,
    };
    STORAGE.setItem(`${appShortName}User`, JSON.stringify(userTMP));
  }
}

export const getUser = () => {
  return JSON.parse(STORAGE.getItem(`${appShortName}User`));
}
export const setUser = (user) => {
  STORAGE.setItem(`${appShortName}User`, JSON.stringify(user));
}

/* ------------------------------------------------------------------------- */
export const getUserSetting = (id) => {
  let settingToReturn = '';
  const user = getUser();
  const settings = user.settings;
  settings.forEach(settingsGroups => {
    settingsGroups.settings.forEach(setting => {
      if (setting.id == id) {
        settingToReturn = setting;
      }
    });
  });
  return settingToReturn;
}