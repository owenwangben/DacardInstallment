import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CardActivateComponent } from './card-activate.component';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
        path: 'CardActivate/Sso',
        component: CardActivateComponent,
        canActivate: [AuthGuard],
        data: { Sso: true }
    }, {
        path: 'CardActivate',
        component: CardActivateComponent,
        data: { Sso: false }
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MatStepperModule,
		NgxMaskModule.forRoot(),
		RouterModule.forChild(routes),
    ],
	declarations: [
        CardActivateComponent
	],
	providers: [
	]
})
export class CardActivateModule { }
