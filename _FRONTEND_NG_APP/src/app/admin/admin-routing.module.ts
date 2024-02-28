import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent,
    // TODO canAvtivate: ['AuthGuard', 'AdminGuard']
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
