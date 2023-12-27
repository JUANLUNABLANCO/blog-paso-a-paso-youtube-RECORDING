import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { UsersComponent } from './components/users/users.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UpdateUserProfileComponent } from './components/update-user-profile/update-user-profile.component';
import { AuthGuard } from './guards/auth.guard';
import { ErrorTestComponent } from './core/errors/component-test/error.test.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'users',
    children: [
      {
        path: '',
        component: UsersComponent,
        // TODO canActivate: [AuthGuard, AdminGuard]
      },
      {
        path: ':id',
        component: UserProfileComponent,
        // canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'update-profile',
    component: UpdateUserProfileComponent,
    canActivate: [
      AuthGuard,
      // TODO UserIsUserGuard
    ],
  },
  {
    path: 'error-test',
    component: ErrorTestComponent,
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
