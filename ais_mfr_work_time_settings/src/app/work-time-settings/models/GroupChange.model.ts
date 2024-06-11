import { WorkTimeGroup } from "./WorkTimeGroup.model"
import { WorkTimeSetting } from "./WorkTimeSetting.model"


type Method = 'create' | 'update' | 'delete'
type Action = 'undo' | 'redo'
type Schema = 'group' | 'setting' 

export interface GroupChangeObj{
    method:Method,
    schema:Schema,
    obj:WorkTimeGroup | WorkTimeSetting 
}

export interface GroupChange{
    undo:GroupChangeObj,
    redo:GroupChangeObj
}










