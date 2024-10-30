import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { RightComponent } from './right.component';

const routes: Routes = [
    {
        path: 'Right',
        component: RightComponent,
    },
];

@NgModule({
    declarations: [RightComponent],
    imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class RightModule {}
