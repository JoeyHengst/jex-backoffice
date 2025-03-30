import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from '../../../../services/company.service';
import { JobService } from '../../../../services/job.service';
import { Company } from '../../../../models/company.model';
import { Job } from '../../../../models/job.model';
import { combineLatest, map, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  selector: 'app-manage-company',
  templateUrl: './manage-company.component.html',
  styleUrls: ['./manage-company.component.scss'],
})
export class CompanyManageComponent {
  private companyService = inject(CompanyService);
  private jobService = inject(JobService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  companies$ = this.companyService.getCompanies();
  jobs$ = this.jobService.getJobs();

  companiesWithJobs$ = combineLatest([this.companies$, this.jobs$]).pipe(
    switchMap(([companies, jobs]) =>
      this.companyService.getCompanies().pipe(
        map((companies) =>
          companies.map((company) => ({
            ...company,
            jobs: jobs.filter((job) => job.companyId === company.id),
          }))
        )
      )
    )
  );

  companyForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
  });

  quickJobForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
  });

  loading = false;
  isEditingCompany = false;
  editingCompanyId: string | null = null;

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
            this.resetCompanyForm();
          },
        });
    } else {
      this.companyService.createCompany(companyData).subscribe({
        next: () => this.handleSuccess('Bedrijf toegevoegd'),
        error: () => this.handleError('Fout bij toevoegen bedrijf'),
        complete: () => {
          this.resetCompanyForm();
        },
      });
    }
  }

  onQuickJobSubmit(companyId: string): void {
    if (this.quickJobForm.invalid) return;

    this.loading = true;
    const quickJob: Job = {
      title: this.quickJobForm.value.title!,
      description: this.quickJobForm.value.description!,
      companyId: companyId,
    };

    this.jobService.createJob(quickJob).subscribe({
      next: () => this.handleSuccess('Vacature toegevoegd'),
      error: () => this.handleError('Fout bij toevoegen vacature'),
      complete: () => {
        this.quickJobForm.reset();
        this.loading = false;
      },
    });
  }

  editCompany(company: Company): void {
    this.isEditingCompany = true;
    this.editingCompanyId = company.id!;
    this.companyForm.patchValue({
      name: company.name,
      address: company.address,
    });
  }

  deleteCompany(id: string): void {
    this.companyService.deleteCompany(id).subscribe({
      next: () => this.handleSuccess('Bedrijf verwijderd'),
      error: () => this.handleError('Fout bij verwijderen bedrijf'),
    });
  }

  deleteJob(id: string): void {
    this.jobService.deleteJob(id).subscribe({
      next: () => this.handleSuccess('Vacature verwijderd'),
      error: () => this.handleError('Fout bij verwijderen vacature'),
      complete: () => {},
    });
  }

  resetCompanyForm(): void {
    this.companyForm.reset();
    this.isEditingCompany = false;
    this.editingCompanyId = null;
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
