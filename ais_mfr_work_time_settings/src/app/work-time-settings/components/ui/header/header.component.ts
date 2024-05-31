import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChildren } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import {MatSortModule} from '@angular/material/sort';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,

  ) {}
  ngOnInit(): void {
    this.routerName = this.type === '../work-time' ? 'рыбочее время' : 'группы рабочего времени'
    this.iconType  = this.type === '../work-time' ? 'access_time' : 'groups'
  }

  @Input() title:string = ''
  @Input() type!:string
  @Output() onSort  = new EventEmitter<Sort>()
  routerName = ''
  iconType = 'groups'

  sortData(sort: any) {
    this.onSort.emit(sort)
  }
  
 
}


