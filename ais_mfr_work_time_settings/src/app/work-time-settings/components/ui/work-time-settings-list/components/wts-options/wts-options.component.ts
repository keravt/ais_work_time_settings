import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { DeleteWorkTimeSettingsComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-settings/delete-work-time-settings.component';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';

@Component({
  selector: 'app-wts-options',
  templateUrl: './wts-options.component.html',
  styleUrls: ['./wts-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WtsOptionsComponent implements OnChanges {

  constructor(

    private workTimeSettingsApi: WorkTimeSettingsApi,
    private cdr:ChangeDetectorRef,
    private dialog:MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,

  ) {}


  @Input() wts:WorkTimeSetting | null = null
  @Output() onSettingSave = new EventEmitter()
  @Output() onClose = new EventEmitter()
  @Output() onSettingDelete = new EventEmitter<string>()
  @Output() onSettingCopy = new EventEmitter<string>()
  @Output() onPreviewVisible = new EventEmitter<boolean>()





  isLoading = false
  isLoadingSettings = false
  isUpdate = false
  option = 1
  inputValue = ''
  previewVisible = false



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wts']) {

      
      if (this.wts) {
 
        this.inputValue =this.wts.title ;
      }
    }
  }

  

  chooseOption(option:number){
    this.option = option
    }

  close(){
    this.previewVisible = false
    this.onClose.emit()
  }

  onItemClick(uid:string){
   
  this.router.navigate([uid,new Date().getFullYear()],{relativeTo:this.route});


}

 copyWtg(){
    if (!this.wts) {
      return
    }

    
    this.workTimeSettingsApi.copyWorkTimeSetting(this.wts).subscribe(data=>{
      this.onSettingCopy.emit()
      this.cdr.markForCheck()
    })
  }

  deleteWtg(){
   
    if (!this.wts) {
      return
    }
 const thisDialog = this.dialog.open(DeleteWorkTimeSettingsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {uid:this.wts.uid, type:'Group'},
      width: '448px',
    
    });

    thisDialog.afterClosed().subscribe((action:any)=>{
    if (action == 'delete') {
      this.onSettingDelete.emit()
      this.cdr.markForCheck()
    }
  
    })

  }

  openPreview(){
    if (!this.wts) return
    this.previewVisible = !this.previewVisible
    this.onItemClick(this.wts.uid)
    this.onPreviewVisible.emit(this.previewVisible)
  }

  updateWorkTimeSetting() {
    this.isUpdate = true


     if (!this.wts) return
     
      this.workTimeSettingsApi.updateTitleWorkTime({uid:this.wts.uid, isGeneral:this.wts.isGeneral,  title:this.inputValue }).subscribe({next:(setting)=>{
        
           
    
        this.snackBar.open(`рабочее время обновлено`, undefined,{
          duration: 2000
        }); 
        this.onSettingSave.emit()
        this.cdr.markForCheck()
      },
    complete:()=>{
      this.isUpdate = false
      this.cdr.markForCheck()
    }
  })
    }

}
