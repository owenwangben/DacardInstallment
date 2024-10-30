import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CardQueryComponent } from './card-query.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
        path: 'CardQuery/Sso',
        component: CardQueryComponent,
        canActivate: [AuthGuard],
        data: { Sso: true }
    }, {
        path: 'CardQuery',
        component: CardQueryComponent,
        data: { Sso: false }
    }
];

@NgModule({
	imports: [
        CommonModule,
        MatStepperModule,
		SharedModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
		RouterModule.forChild(routes)
	],
	declarations: [
        CardQueryComponent,
	],
	providers: [
	]
})
export class CardQueryModule { }
