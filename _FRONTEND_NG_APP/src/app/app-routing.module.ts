import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { UsersComponent } from './components/users/users.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UpdateUserProfileComponent } from './components/update-user-profile/update-user-profile.component';
import { ErrorTestComponent } from './core/errors/component-test/error.test.component';
import { PreserveUserGuard } from './guards/userIsUser.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/userIsAdmin.guard';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AdminGuard], // user is Admin
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
        canActivate: [AdminGuard], // User Is Admin
      },
      {
        path: ':id',
        component: UserProfileComponent,
        canActivate: [PreserveUserGuard], // User Is User
      },
    ],
  },
  {
    path: 'update-profile',
    component: UpdateUserProfileComponent,
    canActivate: [PreserveUserGuard], // User Is User
  },
  {
    path: 'error-test',
    component: ErrorTestComponent,
    // canActivate: [AuthGuard], // descomenta para probar error de athorizacion 401
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
