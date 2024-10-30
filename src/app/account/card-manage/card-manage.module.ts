import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CardManageComponent } from './card-manage.component';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
	path: 'CardManage',
	component: CardManageComponent,
	canActivate: [AuthGuard]
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
	],
	declarations: [
		CardManageComponent
	],
	providers: [
	]
})
export class CardManageModule { }
