import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueAccessor } from '@angular/forms';
import { Directive, ElementRef, HostListener, Output, forwardRef } from '@angular/core';
@Directive({
  selector: '[numberOnly]'
})
export class NumberOnlyDirective implements ControlValueAccessor {
    private maxlength;
	private onChange: any = (evt: any) => { };
	private onTouched: any = (evt: any) => { };

	get nativeElement() {
		return this._elementRef.nativeElement;
	}

	constructor(private _elementRef: ElementRef) {
        this.maxlength = this.nativeElement.attributes.maxlength;
	}

	@HostListener('change', ['$event'])
	change($event) {
		if (isNaN($event.target.value)) {
			$event.target.value = "";
		}
		this.onChange($event.target.value);
	}

	@HostListener('keyup', ['$event']) onKeyup(event) {
		if (this.maxlength) {
			this.nativeElement.value =
				this.nativeElement.value.substr(0, this.maxlength.value);
			this.onChange(this.nativeElement.value);
		}
	}

	@HostListener('keypress', ['$event']) onKeypress(event) {
		return event.charCode >= 48 && event.charCode <= 57;
	}

	@HostListener('paste', ['$event']) onPaste(event) {
		// Get pasted data via clipboard API
		const pastedData = event.clipboardData.getData('text/plain');
		if (isNaN(pastedData)) {
			// Stop data actually being pasted into div
			event.stopPropagation();
			event.preventDefault();
		}
	}

	writeValue(obj: any): void {
		this.nativeElement.value = obj !== undefined ? obj : null;
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	setDisabledState?(isDisabled: boolean): void {
	}
}
