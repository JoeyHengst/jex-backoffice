import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { JobService } from '../../services/job.service';
import { Company } from '../../models/company.model';
import { Job } from '../../models/job.model';
import { BehaviorSubject, switchMap } from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent {
  private companyService = inject(CompanyService);
  private jobService = inject(JobService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  companyColumns = ['name', 'address', 'actions'];
  jobColumns = ['title', 'description', 'actions'];

  private companyRefresh = new BehaviorSubject<void>(undefined);
  private jobRefresh = new BehaviorSubject<void>(undefined);

  companyDataSource = new MatTableDataSource<Company>([]);
  jobDataSource = new MatTableDataSource<Job>([]);

  companies$ = this.companyRefresh.pipe(
    switchMap(() => this.companyService.getCompanies())
  );
  jobs$ = this.jobRefresh.pipe(switchMap(() => this.jobService.getJobs()));

  companyForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
  });

  jobForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
  });

  loading = false;
  isEditingCompany = false;
  isEditingJob = false;
  editingCompanyId: number | null = null;
  editingJobId: number | null = null;

  constructor() {
    this.companies$.subscribe(
      (companies) => (this.companyDataSource.data = companies || [])
    );
    this.jobs$.subscribe((jobs) => (this.jobDataSource.data = jobs || []));
  }

  onCompanySubmit(): void {
    if (this.companyForm.invalid) return;

    this.loading = true;
    const companyData: Company = this.companyForm.value as Company;

    if (this.isEditingCompany && this.editingCompanyId) {
      this.companyService
        .updateCompany(this.editingCompanyId, companyData)
        .subscribe({
          next: () => this.handleSuccess('Bedrijf bijgewerkt'),
          error: () => this.handleError('Fout bij bijwerken bedrijf'),
          complete: () => {
            this.companyRefresh.next();
            this.resetCompanyForm();
          },
        });
    } else {
      this.companyService.createCompany(companyData).subscribe({
        next: () => this.handleSuccess('Bedrijf toegevoegd'),
        error: () => this.handleError('Fout bij toevoegen bedrijf'),
        complete: () => {
          this.companyRefresh.next();
          this.resetCompanyForm();
        },
      });
    }
  }

  onJobSubmit(): void {
    if (this.jobForm.invalid) return;

    this.loading = true;
    const jobData: Job = this.jobForm.value as Job;

    if (this.isEditingJob && this.editingJobId) {
      this.jobService.updateJob(this.editingJobId, jobData).subscribe({
        next: () => this.handleSuccess('Vacature bijgewerkt'),
        error: () => this.handleError('Fout bij bijwerken vacature'),
        complete: () => {
          this.jobRefresh.next();
          this.resetJobForm();
        },
      });
    } else {
      this.jobService.createJob(jobData).subscribe({
        next: () => this.handleSuccess('Vacature toegevoegd'),
        error: () => this.handleError('Fout bij toevoegen vacature'),
        complete: () => {
          this.jobRefresh.next();
          this.resetJobForm();
        },
      });
    }
  }

  editCompany(company: Company): void {
    this.isEditingCompany = true;
    this.editingCompanyId = company.id!;
    this.companyForm.patchValue({
      name: company.name,
      address: company.address,
    });
  }

  editJob(job: Job): void {
    this.isEditingJob = true;
    this.editingJobId = job.id!;
    this.jobForm.patchValue({
      title: job.title,
      description: job.description,
    });
  }

  deleteCompany(id: number): void {
    this.companyService.deleteCompany(id).subscribe({
      next: () => this.handleSuccess('Bedrijf verwijderd'),
      error: () => this.handleError('Fout bij verwijderen bedrijf'),
      complete: () => this.companyRefresh.next(),
    });
  }

  deleteJob(id: number): void {
    this.jobService.deleteJob(id).subscribe({
      next: () => this.handleSuccess('Vacature verwijderd'),
      error: () => this.handleError('Fout bij verwijderen vacature'),
      complete: () => this.jobRefresh.next(),
    });
  }

  resetCompanyForm(): void {
    this.companyForm.reset();
    this.isEditingCompany = false;
    this.editingCompanyId = null;
    this.loading = false;
  }

  resetJobForm(): void {
    this.jobForm.reset();
    this.isEditingJob = false;
    this.editingJobId = null;
    this.loading = false;
  }

  private handleSuccess(message: string): void {
    this.snackBar.open(message, 'Sluiten', { duration: 3000 });
    this.loading = false;
  }

  private handleError(message: string): void {
    this.snackBar.open(message, 'Sluiten', { duration: 3000 });
    this.loading = false;
  }
}
