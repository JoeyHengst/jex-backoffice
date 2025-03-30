import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { JobService } from '../../services/job.service';
import { CompanyService } from '../../services/company.service';
import { Job } from '../../models/job.model';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule,
    NgIf,
  ],
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss'],
})
export class CreateJobComponent {
  private jobService = inject(JobService);
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  companies$ = this.companyService.getCompanies();
  jobForm: FormGroup;
  loading = false;

  constructor() {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      companyId: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.jobForm.invalid) return;

    this.loading = true;
    const newJob: Job = this.jobForm.value as Job;
    this.jobService.createJob(newJob).subscribe({
      next: () => {
        this.snackBar.open('Vacature succesvol aangemaakt', 'Sluiten', {
          duration: 3000,
        });
        this.router.navigate(['/manage']);
      },
      error: () => {
        this.snackBar.open('Fout bij aanmaken vacature', 'Sluiten', {
          duration: 3000,
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
