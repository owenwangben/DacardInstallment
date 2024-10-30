import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CardLoseComponent } from './card-lose.component';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
	path: 'CardLose',
	component: CardLoseComponent,
	canActivate: [AuthGuard],
    data: { Sso: true }
}];

@NgModule({
	imports: [
		SharedModule,
        CommonModule,
        MatStepperModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot()
	],
	declarations: [
        CardLoseComponent
	],
	providers: [
	]
})
export class CardLoseModule { }
