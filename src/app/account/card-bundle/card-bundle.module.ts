import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CardBundleComponent } from './card-bundle.component';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
	path: 'CardBundle',
	component: CardBundleComponent,
	canActivate: [AuthGuard]
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
	],
	declarations: [
		CardBundleComponent
	],
	providers: [
	]
})
export class CardBundleModule { }
