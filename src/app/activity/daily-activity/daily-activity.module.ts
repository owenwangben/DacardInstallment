import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {
    AuthGuard,
    CommonModule,
    SharedModule,
} from 'src/app/shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { DailyActivityComponent } from './daily-activity.component';

const routes: Routes = [
    {
        path: 'DailyActivity',
        component: DailyActivityComponent,
    },
];

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        RouterModule.forChild(routes),
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
    ],
    declarations: [DailyActivityComponent],
    providers: [],
})
export class DailyActivityModule {}
