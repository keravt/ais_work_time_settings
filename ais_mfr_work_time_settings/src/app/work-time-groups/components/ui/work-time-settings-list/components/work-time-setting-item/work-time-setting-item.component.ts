import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';



import { ActivatedRoute,  Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { WorkTimeSettingsApi } from 'src/app/work-time-groups/api/work-time-settings.api';
import { WorkTimeSetting } from 'src/app/work-time-groups/models/WorkTimeSetting.model';
import { DeleteWorkTimeSettingsComponent } from 'src/app/work-time-groups/components/modals/delete-work-time-settings/delete-work-time-settings.component';



@Component({
  selector: 'app-work-time-setting-item',
  templateUrl: './work-time-setting-item.component.html',
  styleUrls: ['./work-time-setting-item.component.scss']
})
export class WorkTimeSettingItemComponent implements OnInit {

  constructor( private workTimeSettingsApi: WorkTimeSettingsApi,
    private router: Router,
     private route: ActivatedRoute,
     public dialog: MatDialog,
     private cdr:ChangeDetectorRef,
     private elementRef: ElementRef,){
 
  }




  @Input() wts!:WorkTimeSetting 

  @Output() onSettingDelete = new EventEmitter<string>()
  @Output() onSettingCopy = new EventEmitter<WorkTimeSetting>()
  inputValue:string = ''
  changedName:boolean = false
  loader:boolean = false

  ngOnInit(): void {

 
      this.inputValue = this.wts.title
    
    
 
  }

  onItemClick(uid:string){
      if (this.changedName) return
    this.router.navigate([uid,new Date().getFullYear()],{relativeTo:this.route});
  
  
}

  changeName(event:MouseEvent){
    event.preventDefault()
    event.stopPropagation()
    this.changedName = true
    const elementRef = this.elementRef.nativeElement as HTMLElement
    const change = elementRef.querySelector('input') as HTMLElement
  
    
    change.focus()
   }

   updateTitle(event:MouseEvent){
    if (this.wts) {
      event.preventDefault()
      event.stopPropagation()
      this.workTimeSettingsApi.updateTitleWorkTime({uid:this.wts.uid,title:this.inputValue,isGeneral:this.wts.isGeneral}).subscribe(data=>{
        this.changedName = false
        if (this.wts) {
          this.wts.title = this.inputValue
        }
      
        this.cdr.markForCheck()
      })
    }
  
   }

   copyWts(event:MouseEvent){
    event.stopPropagation()
    if (!this.wts) {
      return
    }
    console.log();
    
    this.workTimeSettingsApi.copyWorkTimeSetting(this.wts).subscribe(data=>{
      console.log('workkk', data);
      
      this.onSettingCopy.emit(data)
      this.cdr.markForCheck()
    })
   }

   onInputClick(event:MouseEvent){
    event.stopPropagation()
   }

   slideToggleClick(event:MouseEvent){
    event.stopPropagation()
   }

   removeSetting(event:MouseEvent){
    event.stopPropagation()
    if (!this.wts) {
      return
    }
 const thisDialog = this.dialog.open(DeleteWorkTimeSettingsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {uid:this.wts.uid, type:'Setting'},
      width: '448px',
    
    });

    thisDialog.afterClosed().subscribe(action=>{
      if (!this.wts) {
        return
      }
      if (action === 'delete') {
        this.onSettingDelete.emit(this.wts.uid)
      }
      this.cdr.markForCheck()
    })

   }

   closeChanged(event:MouseEvent){
    event.stopPropagation()
    this.changedName = false
   }

   onKeyDown(event:KeyboardEventInit){
 
    
    if (!this.wts) {
      return
    }

    if (event.key === 'Escape') {
      this.changedName = false
    }
    if (event.key === 'Enter') {
      
      
      this.workTimeSettingsApi.updateTitleWorkTime({uid:this.wts.uid,title:this.inputValue,isGeneral:this.wts.isGeneral}).subscribe(data=>{
        if (!this.wts) {
          return
        }
        this.changedName = false
        
        this.wts.title = this.inputValue
        this.cdr.markForCheck()
      })
    }
   
   }

 




}
