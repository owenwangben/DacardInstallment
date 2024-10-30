import { tranSharedModule } from '../shared/tranShared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { PermCliStatusComponent } from './perm-cli-status.component';

const routes: Routes = [{
    path: 'PermCLIStatus',
    component: PermCliStatusComponent,
    canActivate: [AuthGuard],
    data: { Sso: false }
}];

@NgModule({
    declarations: [
        PermCliStatusComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        tranSharedModule,
        RouterModule.forChild(routes),
    ]
})
export class PermCliStatusModule { }
