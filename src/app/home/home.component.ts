import { AuthHelper } from 'src/app/shared/shared.module';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { error, required, RxFormBuilder } from '@rxweb/reactive-form-validators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { SiteConfigService } from '../shared/services/sinopac/site-config.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    isTMode = this.siteConfigService.getIsTMode();
    public constructor(
        private formBuilder: RxFormBuilder,
        private siteConfigService: SiteConfigService,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.siteConfigService.getProduction() && this.siteConfigService.getHome()) {
            window.location.href = this.siteConfigService.getHome();
        }

        this.form = this.formBuilder.formGroup(new HomeModel());
        this.form.patchValue({
            appToken: '2c3698ed4b874c76ba223833d087150a3b37ef7f5b28bdee6562687111e7f153',
            userAgent: 'sinopac://CaWhoPay?appVer=appVer&osType=Web&osVerName=osVerName&osVer=12&manufacturer=manufacturer&model=model'
        });
    }

    public ngAfterViewInit() {
    }

    public submit() {
        this.form['submitted'] = true;
        if (this.form.valid) {
            // AuthHelper.AppToken = this.form.value.appToken;
            environment.appToken = this.form.value.appToken;
            (window['navigator'] as any).userAgent = this.form.value.userAgent;
            Swal.fire({
                text: '已設定完成', icon: 'success', confirmButtonText: '確定',
                showClass: {
                    popup: 'animate__animated animate__fadeIn animate__faster'
                  },
                  hideClass: {
                    popup: 'animate__animated animate__fadeOut animate__faster'
                }
            });
        }
    }

    public get currentToken(): string {
        return AuthHelper.AppToken;
    }

    public get currentUserAgent(): string {
        return window.navigator.userAgent;
    }
    goCardReussieTest(flag:string){
        this.router.navigate(['/Application/CardReissue'], {
            state: {
                switchPage:flag
            }
        });

    }
}

// https://docs.rxweb.io/getting-started
// https://github.com/rxweb/rxweb/tree/master/client-side/angular/packages/reactive-form-validators
class HomeModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*AppToken不能空著唷。' })
    appToken: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*UserAgent不能空著唷。' })
    userAgent: string;
}
