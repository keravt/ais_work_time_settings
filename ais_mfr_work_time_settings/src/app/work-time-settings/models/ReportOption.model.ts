import { ReportField } from "./ReportField.model";

export interface ReportOption{
    uid: string;
    name: string
    reportField: ReportField
    dependReportFields: ReportField[]
}