import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, CommonModule, SharedModule } from 'src/app/shared/shared.module';
import { SingleInstallmentComponent } from './single-installment.component';
import { MatStepperModule } from '@angular/material/stepper';

const routes: Routes = [
    {
        path: 'RTE/Sso',
        component: SingleInstallmentComponent,
        canActivate: [AuthGuard],
        data: { Sso: true }
    },
    {
        path: 'RTE',
        component: SingleInstallmentComponent,
        data: { Sso: false }
    }
];

@NgModule({
	imports: [
        CommonModule,
        MatStepperModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
	declarations: [
        SingleInstallmentComponent,
	],
	providers: [
	]
})
export class SingleInstallmentModule { }
