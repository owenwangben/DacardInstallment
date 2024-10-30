import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { ServiceHelper } from './app/shared/shared.module';

if (!window['site_config']?.isTMode) {
    enableProdMode();
}

fetch('api/misc/getMyHostInfo')
.then(response => { if (response.ok) return response.json(); else throw new Error(response.statusText); })
.then(info => {
    ServiceHelper.ClientIp = info.UserHostAddress;
    ServiceHelper.SessionId = info.SessionId
    platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
});
