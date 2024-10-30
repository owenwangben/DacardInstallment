import { CaptchaService } from './captcha.service';
import { Component, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-captcha',
    templateUrl: './captcha.component.html',
    styleUrls: ['./captcha.component.scss']
})
export class CaptchaComponent implements OnInit {
    public captchaUrl: SafeUrl | string;
    constructor(private captchaService: CaptchaService) {}

    ngOnInit() {
        this.refreshCaptcha();
    }

    async refreshCaptcha() {
        this.captchaUrl = await this.captchaService.getCaptchaUrl();
    }
}
