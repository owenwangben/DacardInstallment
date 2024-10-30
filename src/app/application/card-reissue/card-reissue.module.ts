import { CardReissueComponent } from './card-reissue.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.gaurd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { MatStepperModule } from '@angular/material/stepper';
import { SharedModule } from 'src/app/shared/shared.module';


const routes: Routes = [{
    path: 'CardReissue',
    component: CardReissueComponent,
    canActivate: [AuthGuard],
    data: { Sso: false }
}];

@NgModule({
    declarations: [
        CardReissueComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MatStepperModule,
        NgxMaskModule.forRoot(),
        RouterModule.forChild(routes),
    ]
})
export class CardReissueModule { }
