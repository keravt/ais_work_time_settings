export enum EventType {
    report = "Report",
    meeting = "Meeting",
}



export const eventTypeRussianNames: Record<EventType, string> = {
    [EventType.report]: "Отчет",
    [EventType.meeting]: "Встреча",
};