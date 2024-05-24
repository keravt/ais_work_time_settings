import { WorkTimeSchema } from "src/schemas/WorkTime.schema"
import { WorkTimeDayCloneSchema } from "src/schemas/WorkTimeDayClone.schema"
import { WorkTimeDaysCloneSchema } from "src/schemas/WorkTimeDaysClone.schema"



type Method = 'create' | 'update' | 'delete'
type Schema = 'main' | 'clone' | 'clones'
type Action = 'undo' | 'redo'

export interface WorkTimeChangeObj{
    method:Method,
    schema:Schema
    obj:WorkTimeSchema | WorkTimeDayCloneSchema | WorkTimeDaysCloneSchema
}

export interface WorkTimeChange{
    undo:WorkTimeChangeObj,
    redo:WorkTimeChangeObj
}






