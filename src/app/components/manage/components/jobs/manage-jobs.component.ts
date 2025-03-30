import { Component, inject } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JobService } from '../../../../services/job.service';
import { CompanyService } from '../../../../services/company.service';
import { Job } from '../../../../models/job.model';
import { BehaviorSubject, switchMap, take } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss'],
})
export class JobManageComponent {
  private jobService = inject(JobService);
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  jobColumns = ['title', 'description', 'company', 'actions'];
  jobDataSource = new MatTableDataSource<Job>([]);

  companies$ = this.companyService.getCompanies();
  jobs$ = this.jobService.getJobs();

  jobForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    companyId: ['', Validators.required],
  });

  loading = false;
  isEditingJob = false;
  editingJobId: string | null = null;

  companyMap: { [key: number]: string } = {};

  constructor() {
    this.jobs$.pipe(take(1)).subscribe((jobs) => {
      this.jobDataSource.data = jobs;
    });
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
          this.resetJobForm();
        },
      });
    } else {
      this.jobService.createJob(jobData).subscribe({
        next: () => this.handleSuccess('Vacature toegevoegd'),
        error: () => this.handleError('Fout bij toevoegen vacature'),
        complete: () => {
          this.resetJobForm();
        },
      });
    }
  }

  editJob(job: Job): void {
    this.isEditingJob = true;
    this.editingJobId = job.id!;
    this.jobForm.patchValue({
      title: job.title,
      description: job.description,
      companyId: job.companyId,
    });
  }

  deleteJob(id: string): void {
    this.jobService.deleteJob(id).subscribe({
      next: () => this.handleSuccess('Vacature verwijderd'),
      error: () => this.handleError('Fout bij verwijderen vacature'),
    });
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
