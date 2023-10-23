import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'register', component: RegisterComponent
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'users',
    children: [
      {
        path: '',
        component: UsersComponent,
        // TODO canActivate: [AuthGuard, AdminGuard]
      },
      // TODO {
      //   path: ':id',
      //   component: UserProfileComponent
      //   canActivate: [AuthGuard, AdminGuard]
      // }
    ]
  },
  // TODO {
  //   path: 'update-profile',
  //   component: UpdateUserProfileComponent,
  //   canActivate: [AuthGuard, UserIsUserGuard]
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
