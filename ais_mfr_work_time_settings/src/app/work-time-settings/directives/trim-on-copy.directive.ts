import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appTrimOnCopy]'
})
export class TrimOnCopyDirective {

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent): void {
    
    
    const selection = window.getSelection();
    console.log('selection', selection);
    const selectedText = selection ? selection.toString() : '';

    // Удаляем пробелы по краям
    const trimmedText = selectedText.trim();

    // Модифицируем буфер обмена
    if (event.clipboardData) {
      event.clipboardData.setData('text/plain', trimmedText);
      event.preventDefault(); // Необходимо для предотвращения стандартного поведения
    }
  }
}
