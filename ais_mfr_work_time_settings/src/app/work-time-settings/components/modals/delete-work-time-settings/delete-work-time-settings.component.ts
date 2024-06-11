import { ChangeDetectorRef, Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { WorkTimeSettingsApi } from "src/app/work-time-settings/api/work-time-settings.api";
import { HistoryGroupService } from "src/app/work-time-settings/services/history-group.service";


@Component({
  selector: 'app-delete-work-time-settings',
  templateUrl: './delete-work-time-settings.component.html',
  styleUrls: ['./delete-work-time-settings.component.css']
})


export class DeleteWorkTimeSettingsComponent {


  constructor(
    private dialogRef: MatDialogRef<DeleteWorkTimeSettingsComponent>,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private cdr:ChangeDetectorRef,
    private historyGroupService:HistoryGroupService,
    @Inject(MAT_DIALOG_DATA) public data: {    
      uid:string
      type:'Setting' | 'Group'
  },
    ){}


    deleteWorkTime(){
      this.workTimeSettingsApi.deleteWorkTimeSetting(this.data.uid).subscribe((group)=>{
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
        this.dialogRef.close('delete')
        this.cdr.markForCheck()
      })
   

    }
  
  
  
    closeDialog(){
      this.dialogRef.close('close')
    }



}
