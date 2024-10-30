import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthHelper, AuthService, LoaderService, ServiceHelper } from './shared/shared.module';
import { SiteConfigService } from './shared/services/sinopac/site-config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, AfterViewChecked{
    public title = 'cawho-web';
    public loading = false;

	public constructor(
        private authService: AuthService,
        private loader: LoaderService,
        private siteConfigService: SiteConfigService,
		private changeDetector: ChangeDetectorRef
	) {
        this.loader.Status.subscribe((val: boolean) => {
			this.loading = val;
		});

        window['AuthHelper'] = AuthHelper;
    }

    public async ngOnInit() {
        // console.log('AppComponent.ngOnInit');
        setInterval(async () => {
            if (AuthHelper.WebToken) {
                const diff = (new Date(AuthHelper.TokenExpiredAt).getTime() - new Date().getTime());
                if (diff < 1000 * 60 * 5) {   // 5 minutes
                    const response = await this.authService.verifyToken({ AppToken: AuthHelper.AppToken, WebToken: AuthHelper.WebToken });
                    if (ServiceHelper.ifSuccess(response, false)) {
                        AuthHelper.storeAuthData({
                            Token: response.Result.NewToken,
                            TokenExpiredAt: response.Result.TokenExpiredAt,
                            CustomerId: response.Result.CustomerId
                        });
                    }
                }
             }
        }, 1000 * 60);  // 1 minute

        try {
            if (window['site_config']) {
              const config = window['site_config'];
              if (config.hasOwnProperty('production')) {
                this.siteConfigService.setProduction(config.production);
              }
              if (config.hasOwnProperty('isTMode')) {
                this.siteConfigService.setIsTMode(config.isTMode);
              }
              if (config.hasOwnProperty('home')) {
                this.siteConfigService.setHome(config.home);
              }
            }
        } catch (error) {
            console.error('Error setting site_config:', error);
        }
	}

	public ngAfterViewInit() {
        const script = document.createElement('script');
        script.src = 'assets/js/sensorstracker.securejs';
        document.body.appendChild(script);
        // console.log('load sensorstracker');
	}

	public ngAfterViewChecked() {
		this.changeDetector.detectChanges();
	}
}
