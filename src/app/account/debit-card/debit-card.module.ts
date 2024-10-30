import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DebitCardComponent } from './debit-card.component';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
	path: 'DebitCard',
	component: DebitCardComponent,
	canActivate: [AuthGuard]
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
	],
	declarations: [
		DebitCardComponent
	],
	providers: [
	]
})
export class DebitCardModule { }
