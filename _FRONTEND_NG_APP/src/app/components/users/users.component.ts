import { Component, OnInit } from '@angular/core';
import { UsersPaginated } from '../../interfaces/user.interface';
import { UsersService } from '../../services/users/users.service';
import { map } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  // tabla
  dataSource: UsersPaginated;
  displayedColumns = ['id', 'name', 'email', 'role'];

  // paginator
  pageEvent: PageEvent;
  pageSizeOptions = [5, 10, 25, 100];

  // filtering
  filterValue: string;

  // control de errores
  // public errorMessage!: string;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.initDataSource();
  }

  initDataSource() {
    this.usersService
      .getUsersPaginated()
      .pipe(
        // TODO control de errores suscribe({next, error, complete})
        map(
          (usersPaginated: UsersPaginated) =>
            (this.dataSource = usersPaginated),
        ),
      )
      .subscribe();
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    const size = event.pageSize;

    if (this.filterValue == null) {
      page = page + 1;
      this.usersService
        .getUsersPaginated(page, size)
        .pipe(
          map(
            (usersPaginated: UsersPaginated) =>
              (this.dataSource = usersPaginated),
          ),
        )
        .subscribe();
    } else {
      this.usersService
        .paginateByName(page, size, this.filterValue)
        .pipe(
          map(
            (usersPaginated: UsersPaginated) =>
              (this.dataSource = usersPaginated),
          ),
        )
        .subscribe();
    }
  }

  navigateToProfile(id) {
    this.router.navigate(['./' + id], { relativeTo: this.activatedRoute });
  }

  findByName(name: string) {
    this.usersService
      .paginateByName(0, 10, name)
      .pipe(
        map(
          (usersPaginated: UsersPaginated) =>
            (this.dataSource = usersPaginated),
        ),
      )
      .subscribe();
  }
}
