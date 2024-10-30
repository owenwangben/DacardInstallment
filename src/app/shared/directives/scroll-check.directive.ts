import { Directive, ElementRef, Input, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[scrollCheck]'
})
export class ScrollCheckDirective implements AfterViewInit{
  @Output() changeState: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    private el: ElementRef
  ) { }

    ngAfterViewInit(): void {
        this.el.nativeElement.addEventListener('scroll', () =>{
            const domScrollTop = this.el.nativeElement.scrollTop; // div 以滾動多少
            const domInnerHeight = this.el.nativeElement.offsetHeight;
            const domScrollHeight = this.el.nativeElement.scrollHeight; // dom 包含scroll總高
            if(Math.round(domScrollTop + domInnerHeight + 30) >= domScrollHeight) {
                this.changeState.emit(true);
            }
        })
    }
}
