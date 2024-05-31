import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css']
})
export class FilterDropdownComponent {
  @Input() isLast!: boolean;
  @Input() column!: string;
  @Input() isMonth: boolean = false;
  @Output() applyFilter = new EventEmitter<{filterValue: string, filterType: string}>();
  @Output() filterOpened = new EventEmitter<FilterDropdownComponent>();
  openDropdown = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {filterValue: string, filterType: string},
    private dialogRef: MatDialogRef<FilterDropdownComponent>,
  ){}

  @Input() filterValue: string = this.data.filterValue;
  @Input() filterType: string = this.data.filterType  ; 
  toggleDropdown() {
    this.openDropdown = !this.openDropdown;
    if (this.openDropdown) {
      this.filterOpened.emit(this);
    }
  }

  onFilterTypeChange(event: Event) {
    this.filterType = (event.target as HTMLInputElement).value;
  }

  onFilterInput(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.applyFilter.emit({filterValue, filterType: this.filterType});
  }

  onButtonClick(event: Event) {
    event.stopPropagation();
    const elem: HTMLInputElement = document.getElementsByClassName("filter-date")[0] as HTMLInputElement;
    elem.value = '';

    const inputEvent: Event = new Event('change', {
      bubbles: true,
      cancelable: true
    });
    elem.dispatchEvent(inputEvent);
    this.onFilterInput(event);
  }
}
