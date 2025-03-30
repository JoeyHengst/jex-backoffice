import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { CompanyManageComponent } from './components/company/manage-company.component';
import { JobManageComponent } from './components/jobs/manage-jobs.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatExpansionModule,
    CompanyManageComponent,
    JobManageComponent,
  ],
  selector: 'app-manage',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Beheer</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-tab-group>
          <mat-tab label="Bedrijven">
            <app-manage-company></app-manage-company>
          </mat-tab>
          <mat-tab label="Vacatures">
            <app-manage-jobs></app-manage-jobs>
          </mat-tab>
        </mat-tab-group>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent {}
