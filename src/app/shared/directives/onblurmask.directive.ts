import { AfterViewInit, Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
	selector: '[onblur-mask]'
})
export class OnblurMaskDirective {
    @Input() start: number = 0;
    @Input() end: number = 0;
    @Input() number;
	private value: string;

	constructor(private _elementRef: ElementRef) {
        this.value = this._elementRef.nativeElement.value;
	}

    @HostListener('ngModelChange', ['$event'])
    ngModelChange($event){
        this.value = $event;
    }

    @HostListener('focus', ['$event'])
	onFocus($event) {
        this._elementRef.nativeElement.value = this.value;
    }

    @HostListener('blur', ['$event'])
	onBlur($event) {
        this.invisibleIdNumber();
    }

    async ngOnInit(){
        if(this.number){
            this._elementRef.nativeElement.value = await this.number;
            await this.invisibleIdNumber()
        }
    }

    // 隱碼
    invisibleIdNumber(){
        this.value = this._elementRef.nativeElement.value;
        const first = this.value.substr(0, this.start);
        const second = '●'.repeat(this.value.length >= this.start ? Math.min(this.end, this.value.length) - this.start : 0);
        const third = this.value.substr(this.end, this.value.length - this.end);
        this._elementRef.nativeElement.value = first + second + third;
    }
}
