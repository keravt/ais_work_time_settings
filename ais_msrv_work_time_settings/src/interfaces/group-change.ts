
import { WorkTimeGroup } from "src/schemas/WorkTimeGroup.schema"
import { WorkTimeSetting } from "src/schemas/WorkTimeSetting.schema"



type Method = 'create' | 'update' | 'delete'
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






