import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateWorkTimeType } from 'src/app/work-time-groups/models/UpdateWorkTimeType.model';
import { WorkTimeModel } from 'src/app/work-time-groups/models/WorkTime.model';
import { HistoryService } from 'src/app/work-time-groups/services/history.service';
import { SideBarService } from 'src/app/work-time-groups/services/side-bar.service';



@Component({
  selector: 'app-delete-work-time',
  templateUrl: './delete-work-time.component.html',
  styleUrls: ['./delete-work-time.component.css']
})
export class DeleteWorkTimeComponent {

  type:UpdateWorkTimeType=  'one'
  aloowNext:boolean = true
  isDelete = false

  constructor(
    private dialogRef: MatDialogRef<DeleteWorkTimeComponent>,
    private sideBarService:SideBarService,
    public historyService:HistoryService,
    private cdr:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {    
      currentDate:number,
      workTime:WorkTimeModel,
      uid:string,
      year:string,
  },
    ){}


  ngOnInit(): void {
    if (this.data.currentDate === this.data.workTime.day ||
       this.data.currentDate === new Date(this.data.workTime.endDate).setHours(0)) {
      this.aloowNext = false
    }
  }


  async deleteWorkTime(){
    await this.sideBarService.deleteWorkTime(this.data.currentDate,this.type,this.data.workTime,this.data.uid,this.data.year).then(()=>{
    
      this.dialogRef.close('delete')
      this.cdr.markForCheck()
    })
   
  }



  closeDialog(){
    this.dialogRef.close()
  }

  
 
    



}
