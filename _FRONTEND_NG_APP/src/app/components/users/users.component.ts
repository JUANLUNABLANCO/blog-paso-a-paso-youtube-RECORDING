import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, map, throwError } from 'rxjs';
import { UsersPaginated } from 'src/app/interfaces/user.interface';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  // tabla
  dataSource: UsersPaginated;
  displayedColumns: string[] = ['id', 'name', 'email', 'role'];

  // paginator
  pageEvent: PageEvent;
  pageSizeOptions = [5, 10, 25, 100];

  // filtering
  filterValue: string;

  // control errores
  errMessage!: string;

  constructor(
    private userService: UsersService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initDataSource();
  }

  initDataSource() {
    this.userService
      .findAll()
      .pipe(
        map((usersPaginated: UsersPaginated) => {
          this.dataSource = usersPaginated;
          // console.log('### DATA SOURCE: ', this.dataSource);
          return usersPaginated;
        })
      )
      .subscribe();
  }
  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex + 1;
    const size = event.pageSize;

    if (this.filterValue == null || this.filterValue == '') {
      this.userService
        .findAll(page, size)
        .pipe(
          map((usersPaginated: UsersPaginated) => {
            this.dataSource = usersPaginated;
            return usersPaginated;
          })
        )
        .subscribe();
    } else {
      this.userService
        .paginateByName(page, size, this.filterValue)
        .pipe(
          map((usersPaginated: UsersPaginated) => {
            this.dataSource = usersPaginated;
            return usersPaginated;
          })
        )
        .subscribe();
    }
  }
  findByName(name: string) {
    this.userService
      .paginateByName(0, 10, name)
      .pipe(map((usersPaginated) => (this.dataSource = usersPaginated)))
      .subscribe();
  }
  navigateToProfile(id: number) {
    this.router.navigate(['/users/' + id], { relativeTo: this.activatedRoute });
  }
}
