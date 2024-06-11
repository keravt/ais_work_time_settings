import { WorkTimeSetting } from "../models/WorkTimeSetting.model";

export function isSetting(obj: any): obj is WorkTimeSetting {
    return (obj as WorkTimeSetting).isGeneral !== undefined;
}