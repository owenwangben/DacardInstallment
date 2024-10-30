import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { CardBillComponent } from './card-bill.component';

const routes: Routes = [{
	path: 'CardBill',
	component: CardBillComponent,
	canActivate: [AuthGuard],
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
	],
	declarations: [
		CardBillComponent
	],
	providers: [
	]
})
export class CardBillModule { }
