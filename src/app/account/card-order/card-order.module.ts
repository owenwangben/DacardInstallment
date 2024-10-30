import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CardOrderComponent } from './card-order.component';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
	path: 'CardOrder',
	component: CardOrderComponent,
	canActivate: [AuthGuard]
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
	],
	declarations: [
		CardOrderComponent
	],
	providers: [
	]
})
export class CardOrderModule { }
