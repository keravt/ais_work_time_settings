import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  }

  @Input() title:string = ''
  @Input() type!:string
  routerName = ''
 
}
