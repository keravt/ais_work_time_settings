import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';


@Component({
  selector: 'app-delete-work-time-group',
  templateUrl: './delete-work-time-group.component.html',
  styleUrls: ['./delete-work-time-group.component.css']
})
export class DeleteWorkTimeGroupComponent {


  constructor(
    private dialogRef: MatDialogRef<DeleteWorkTimeGroupComponent>,
    private workTimeGroupsApi:WorkTimeGroupsApi,
    private historyGroupservice:HistoryGroupService,
    private cdr:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {    
      uid:string
      type:'Setting' | 'Group'
  },
    ){}


    deleteWorkTime(){

      this.workTimeGroupsApi.deleteWorkTimeGroup(this.data.uid).subscribe((group)=>{
        this.historyGroupservice.setUndoArray(group)
        this.historyGroupservice.redoArray$.next([])
        this.dialogRef.close('delete')
        this.cdr.markForCheck()
      })

    }
  
  
  
    closeDialog(){
      this.dialogRef.close('close')
    }



}
