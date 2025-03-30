import { Component, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styles: [
    `
      mat-sidenav-container {
        height: 100vh;
      }
      mat-sidenav {
        width: 250px;
      }
      .content {
        padding: 20px;
      }
      .active {
        background-color: #e0e0e0;
      }
    `,
  ],
})
export class AppComponent {
  private router = inject(Router);
  currentTitle: string = 'Backoffice';

  private routeTitles: { [key: string]: string } = {
    '/manage': 'Beheer',
    '/companies-jobs': 'Bedrijven & Vacatures',
    '/job': 'Vacature Details',
    '/create-job': 'Vacature Aanmaken',
  };

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.router.url.split('?')[0])
      )
      .subscribe((url) => {
        const baseRoute =
          Object.keys(this.routeTitles).find((route) =>
            url.startsWith(route)
          ) || url;
        this.currentTitle = this.routeTitles[baseRoute] || 'Backoffice';
      });
  }
}
