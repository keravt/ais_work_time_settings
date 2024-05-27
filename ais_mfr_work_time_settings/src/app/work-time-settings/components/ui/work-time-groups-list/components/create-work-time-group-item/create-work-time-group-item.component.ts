import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';


@Component({
  selector: 'app-create-work-time-group-item',
  templateUrl: './create-work-time-group-item.component.html',
  styleUrls: ['./create-work-time-group-item.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CreateWorkTimeGroupItemComponent {

  newGroupTitle:string = ''
  @Output() onGroupCreate = new EventEmitter<string>()
  @Output() onGroupClose = new EventEmitter<string>()

  constructor(
    private cdr:ChangeDetectorRef,
    private workTimeGroupApi:WorkTimeGroupsApi,

  ) {}

  ngAfterViewInit(): void {
    const createWorkTimeSetting = document.getElementById('createGroup') as HTMLElement
    createWorkTimeSetting.focus()
  }

  createGroup(event:Event){
    event.preventDefault()

          
        if (this.newGroupTitle !== '') {
          this.workTimeGroupApi.createWorkTimeGroup(this.newGroupTitle).
          subscribe(newWorkTimeGroup => {
            this.newGroupTitle = ''
            this.onGroupCreate.emit()
           this.cdr.markForCheck()
          });
        }

    
       
      }
  closeGroupCreator(){
    this.onGroupClose.emit()
  }

}
