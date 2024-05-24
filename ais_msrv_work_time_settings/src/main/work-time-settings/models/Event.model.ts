
interface Break{
    start:number,
    end:number
}


export interface Event {
    uid: string
    event_type?:string
    title: string,
    startDate: number,
    endDate: number,
    userUid:string,
    breaks:Break[]
    isFirstImport:boolean
}