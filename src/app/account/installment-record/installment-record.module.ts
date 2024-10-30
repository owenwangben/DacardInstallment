import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { InstallmentRecordComponent } from './installment-record.component';
import { CommonModule } from '@angular/common';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
        path: 'InstallmentRecord',
        component: InstallmentRecordComponent,
        canActivate: [AuthGuard],
    }
];

@NgModule({
	imports: [
        CommonModule,
        MatStepperModule,
		SharedModule,
        // ReactiveFormsModule,
        NgxMaskModule.forRoot(),
		RouterModule.forChild(routes)
	],
	declarations: [
        InstallmentRecordComponent,
	],
	providers: [
	]
})
export class InstallmentRecordModule { }
