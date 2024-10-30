import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Directive, ElementRef, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { AuthHelper} from '../shared.module';
/**
 *
 * example: <div loadHtml="assets/perm-cli-memo.html"></div>
 * @export
 * @class LoadHtmlDirective
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@Directive({
	selector: '[loadHtml]'
})
export class LoadHtmlDirective implements OnInit, OnChanges {
	@Input('loadHtml') url: string;

	constructor(private _elementRef: ElementRef, private http: HttpClient) { }

	ngOnInit() {
		// this.loadHtml();
	}

	async ngOnChanges(changes: SimpleChanges) {
        $(".link").prop('onclick', null).off('click')
		if (changes.url.currentValue !== changes.url.previousValue) {
			await this.loadHtml();
		}
	}

	async loadHtml() {
		if (this.url) {
			const response = await this.http.get(this.url, {  responseType: 'text' }).toPromise();
			this._elementRef.nativeElement.innerHTML = await (response || '');
		}
	}
}
