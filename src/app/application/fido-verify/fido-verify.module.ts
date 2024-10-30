import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { FidoVerifyComponent } from './fido-verify.component';

const routes: Routes = [{
	path: 'FidoVerify',
	component: FidoVerifyComponent,
}];

@NgModule({
	imports: [
		SharedModule,
        CommonModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot()
	],
	declarations: [
        FidoVerifyComponent
	],
	providers: [
	]
})
export class FidoVerifyModule { }
