import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable()
export class CaptchaService {
	private captchaUrl = 'api/Captcha';

	public constructor(
		private http: HttpClient,
		private sanitizer: DomSanitizer
	) {
	}

	public async getCaptchaUrl(): Promise<SafeUrl | string> {
		const response: Blob = await this.http.get(
			this.captchaUrl + "?t=" + Date.now().toString(), { responseType: 'blob' }
		).toPromise();

		return this.sanitizer.bypassSecurityTrustUrl(
			window.URL.createObjectURL(response)
		);
	}

	public getCaptchaData(): Promise<any> {
		return this.http.get(this.captchaUrl + "?t=" + Date.now().toString()).toPromise();
	}
}
