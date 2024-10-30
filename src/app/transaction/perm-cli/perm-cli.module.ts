import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { PermCliComponent } from './perm-cli.component';
import { FileUploadModule } from 'ng2-file-upload';

const routes: Routes = [{
    path: 'PermCLI',
    component: PermCliComponent,
    canActivate: [AuthGuard],
    data: { Sso: false }
}];

@NgModule({
    declarations: [
        PermCliComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MatStepperModule,
        NgxMaskModule.forRoot(),
        RouterModule.forChild(routes),
        FileUploadModule
    ]
})
export class PermCliModule { }
