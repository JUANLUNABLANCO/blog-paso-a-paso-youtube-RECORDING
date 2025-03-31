import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { IUser } from '../../../interfaces/user.interface';
import { UsersService } from '../../../services/users/users.service';
import { environment } from '../../../../environments/environment';
import { AuthenticationService } from '../../../services/auth/authentication.service';

const BASE_URL = `${environment.API_URL}`;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userId: number | null = null;
  private subscription: Subscription;
  protected baseUrl: string = BASE_URL;

  user: IUser = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private usersService: UsersService,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.subscription = this.activatedRoute.params.subscribe((params) => {
      // TODO  aquí podrías habilitar una lógica llamando al authService.getUserBehaviorId, para ver si ambos son iguales y si no es admin, no permitirle acceso, pero vamos eso se soluciona con el guatd UserIsUserGuard
      this.userId = parseInt(params['id']);
      this.usersService
        .getUserById(this.userId)
        .pipe(
          map((user: IUser) => {
            if (user) {
              this.user = user;
            } else {
              console.log('#### Hacemos logout directamente');
              this.authService.logout();
            }
          }),
        )
        .subscribe();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
