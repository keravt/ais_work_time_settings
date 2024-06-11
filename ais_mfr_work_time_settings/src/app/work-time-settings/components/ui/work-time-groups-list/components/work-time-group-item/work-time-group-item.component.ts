import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { DeleteWorkTimeGroupComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-group/delete-work-time-group..component';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';

@Component({
  selector: 'app-work-time-group-item',
  templateUrl: './work-time-group-item.component.html',
  styleUrls: ['./work-time-group-item.component.scss']
})
export class WorkTimeGroupItemComponent implements OnInit, OnChanges {

  @Input() wtg!:WorkTimeGroup
  @Input() opened!:boolean
  @Input() checkedGroup!:WorkTimeGroup | null
  changedName:boolean = false
  inputValue:string = ''
  
  @Output() onGroupDelete = new EventEmitter<string>()
  @Output() onClick = new EventEmitter<WorkTimeGroup>()
  @Output() onGroupCopy = new EventEmitter<WorkTimeGroup>()
  @Output() onGroupUpdate = new EventEmitter()

  constructor( 
    private elementRef: ElementRef,
     public dialog: MatDialog,
     private workTimeGroupApi:WorkTimeGroupsApi,
     private historyGroupService:HistoryGroupService,
     private router: Router,
     private route: ActivatedRoute,
     private cdr:ChangeDetectorRef
){
 
  }
  ngOnChanges(changes: SimpleChanges): void {
   if ( changes['opened']) {
      if (this.opened) {
        
      }
   }
  }

  ngOnInit(): void {

 
    this.inputValue = this.wtg.title
  
  

}




  removeGroup(event:MouseEvent){
    event.stopPropagation()
    if (!this.wtg) {
      return
    }
 const thisDialog = this.dialog.open(DeleteWorkTimeGroupComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {uid:this.wtg.uid, type:'Group'},
      width: '448px',
    
    });

    thisDialog.afterClosed().subscribe(action=>{
      if (!this.wtg) {
        return
      }
      if (action === 'delete') {
        this.onGroupDelete.emit(this.wtg.uid)
      }
      this.cdr.markForCheck()
    })

   }


   changeName(event:MouseEvent){
    event.preventDefault()
    event.stopPropagation()
    this.changedName = true
    const elementRef = this.elementRef.nativeElement as HTMLElement
    const change = elementRef.querySelector('input') as HTMLElement
    change.focus()
   }

   onInputClick(event:MouseEvent){
    event.stopPropagation()
   }

   updateTitle(event:MouseEvent){
    if (this.wtg) {
      event.preventDefault()
      event.stopPropagation()
      this.workTimeGroupApi.updateWorkTimeGroup({...this.wtg, title:this.inputValue}).subscribe(group=>{
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
        this.changedName = false
        if (this.wtg) {
          this.wtg.title = this.inputValue
        }
        this.onGroupUpdate.emit()
    
        this.cdr.markForCheck()
      })
    }
  
   }


   copyWtg(event:MouseEvent){
    event.stopPropagation()
    if (!this.wtg) {
      return
    }

    
    this.workTimeGroupApi.copyWorkTimeGroup(this.wtg).subscribe(group=>{
      this.historyGroupService.setUndoArray(group)
      this.historyGroupService.redoArray$.next([])
      this.onGroupCopy.emit(group[0].redo.obj  as WorkTimeGroup)
      this.cdr.markForCheck()
    })
   }

   closeChanged(event:MouseEvent){
    event.stopPropagation()
    this.changedName = false
   }

   
   onKeyDown(event:KeyboardEventInit){
 
    
    if (!this.wtg) {
      return
    }

    if (event.key === 'Escape') {
      this.changedName = false
    }
    if (event.key === 'Enter') {
      
      
      this.workTimeGroupApi.updateWorkTimeGroup({...this.wtg, title:this.inputValue}).subscribe(group=>{
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
        if (!this.wtg) {
          return
        }
        this.changedName = false
        
        this.wtg.title = this.inputValue
        this.cdr.markForCheck()
      })
    }
   
   }

   navigateToPreview(event:MouseEvent){
    event.preventDefault()
    event.stopPropagation()
 
    this.router.navigate([this.wtg.uid,new Date().getFullYear()],{relativeTo:this.route});
  
  

   }

}
