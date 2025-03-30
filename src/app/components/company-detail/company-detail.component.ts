import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CompanyService } from '../../services/company.service';
import { JobService } from '../../services/job.service';
import { Company } from '../../models/company.model';
import { Job } from '../../models/job.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    NgIf,
  ],
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss'],
})
export class CompanyDetailComponent {
  private companyService = inject(CompanyService);
  private jobService = inject(JobService);
  private route = inject(ActivatedRoute);

  companyWithJobs$: Observable<{ company: Company; jobs: Job[] }> =
    this.route.paramMap.pipe(
      switchMap((params) => {
        const companyId = params.get('id');
        return combineLatest([
          this.companyService.getCompanies(),
          this.jobService.getJobs(),
        ]).pipe(
          map(([companies, jobs]) => {
            const company = companies.find(
              (company) => company.id === companyId
            );
            if (!company) throw new Error('Bedrijf niet gevonden');
            return {
              company,
              jobs: jobs.filter((job) => job.companyId === company.id),
            };
          })
        );
      })
    );
}
