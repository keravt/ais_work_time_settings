import { WorkTimeModel } from "./WorkTime.model"



type Method = 'create' | 'update' | 'delete'
type Schema = 'main' | 'clone' | 'clones'
type Action = 'undo' | 'redo'

export interface WorkTimeChangeObj{
    method:Method,
    schema:Schema
    obj:WorkTimeModel 
}

export interface WorkTimeChange{
    undo:WorkTimeChangeObj,
    redo:WorkTimeChangeObj
}


export interface WorkTimeChangeWithAction{
    action:Action,
    WorkTimeChange:WorkTimeChangeObj[]
}







