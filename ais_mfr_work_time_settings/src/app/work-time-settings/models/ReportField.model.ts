import { ReportOption } from "./ReportOption.model";

export interface ReportField{

    uid: string;
    title: string;
    reportOptions: ReportOption[]
    dependReportOptions: ReportOption[]
    created_at: Date;
}