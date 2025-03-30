import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CompanyService } from '../../services/company.service';
import { JobService } from '../../services/job.service';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, debounceTime, map } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    FormsModule,
  ],
  selector: 'app-company-job-list',
  templateUrl: './company-job-list.component.html',
  styleUrls: ['./company-job-list.component.scss'],
})
export class CompanyJobListComponent {
  private companyService = inject(CompanyService);
  private jobService = inject(JobService);

  searchTerm: string = '';
  private searchSubject = new BehaviorSubject<string>('');

  filteredCompanies$ = combineLatest([
    this.companyService.getCompanies(),
    this.jobService.getJobs(),
    this.searchSubject.asObservable().pipe(debounceTime(300)),
  ]).pipe(
    map(([companies, jobs, search]) => {
      const filteredJobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );

      const companiesWithJobs = companies.map((company) => ({
        ...company,
        jobs: filteredJobs.filter((job) => job.companyId === company.id),
      }));

      return companiesWithJobs.filter((company) => company.jobs.length > 0);
    })
  );

  onSearchChange(searchValue: string): void {
    this.searchSubject.next(searchValue);
  }
}
