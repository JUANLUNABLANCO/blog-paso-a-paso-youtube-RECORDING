import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { UsersComponent } from './components/user/users/users.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { UpdateUserProfileComponent } from './components/user/update-user-profile/update-user-profile.component';
import { ErrorTestComponent } from './core/errors/component-test/error.test.component';
import { PreserveUserGuard } from './guards/userIsUser.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/userIsAdmin.guard';
import { HomeComponent } from './components/home/home.component';
import { CreateBlogEntryComponent } from './components/blog-entry/create-blog-entry/create-blog-entry.component';
import { ViewBlogEntryComponent } from './components/blog-entry/view-blog-entry/view-blog-entry.component';
import { AuthorPostsComponent } from './components/author-posts/author-posts.component';

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
        path: ':id',
        component: UserProfileComponent,
      },
      {
        path: 'admin',
        component: UsersComponent,
        canActivate: [AdminGuard], // User Is Admin
      },
    ],
  },
  {
    path: 'update-profile',
    component: UpdateUserProfileComponent,
    canActivate: [PreserveUserGuard], // User Is User
  },

  {
    path: 'create-blog-entry',
    component: CreateBlogEntryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'blog-entries/:id',
    component: ViewBlogEntryComponent,
  },
  {
    path: 'authors/:id',
    component: AuthorPostsComponent,
  },
  {
    path: 'error-test',
    component: ErrorTestComponent,
    // canActivate: [AuthGuard], // descomenta para probar error de athorizacion 401
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
