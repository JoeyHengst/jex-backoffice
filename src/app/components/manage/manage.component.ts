import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { JobService } from '../../services/job.service';
import { Company } from '../../models/company.model';
import { Job } from '../../models/job.model';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { CompanyManageComponent } from './components/company/manage-company.component';
import { JobManageComponent } from './components/jobs/manage-jobs.component';

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

  jobForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    companyId: [null, Validators.required],
  });

  loading = false;
  isEditingCompany = false;
  isEditingJob = false;
  editingCompanyId: string | string | null = null;
  editingJobId: string | null = null;

  constructor() {
    this.companies$.subscribe(
      (companies) => (this.companyDataSource.data = companies || [])
    );
    this.jobs$.subscribe((jobs) => (this.jobDataSource.data = jobs || []));
  }

  onCompanySubmit(): void {
    this.submitForm(
      this.companyForm,
      this.companyService,
      (data: Company) => this.companyService.createCompany(data),
      (id, data) => this.companyService.updateCompany(id, data),
      this.isEditingCompany,
      this.editingCompanyId,
      'Bedrijf toegevoegd',
      'Fout bij toevoegen bedrijf',
      this.companyRefresh,
      () => this.resetCompanyForm()
    );
  }

  onJobSubmit(): void {
    this.submitForm(
      this.jobForm,
      this.jobService,
      (data: Job) => this.jobService.createJob(data),
      (id, data) => this.jobService.updateJob(id, data),
      this.isEditingJob,
      this.editingJobId,
      'Vacature toegevoegd',
      'Fout bij toevoegen vacature',
      this.jobRefresh,
      () => this.resetJobForm()
    );
  }

  onQuickJobSubmit(companyId: string | string): void {
    this.jobForm.markAllAsTouched();
    if (this.jobForm.invalid) return;

    this.loading = true;
    const quickJob: Job = {
      title: this.jobForm.value.title!,
      description: this.jobForm.value.description!,
      companyId: companyId,
    };

    this.jobService.createJob(quickJob).subscribe({
      next: () => this.handleSuccess('Vacature toegevoegd'),
      error: () => this.handleError('Fout bij toevoegen vacature'),
      complete: () => {
        this.jobRefresh.next();
        this.jobForm.reset();
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

  editJob(job: Job): void {
    this.isEditingJob = true;
    this.editingJobId = job.id!;
    this.jobForm.patchValue({
      title: job.title,
      description: job.description,
    });
  }

  deleteCompany(id: string | string): void {
    this.companyService.deleteCompany(id).subscribe({
      next: () => this.handleSuccess('Bedrijf verwijderd'),
      error: () => this.handleError('Fout bij verwijderen bedrijf'),
      complete: () => this.companyRefresh.next(),
    });
  }

  deleteJob(id: string): void {
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

  private submitForm<T>(
    form: FormGroup,
    service: CompanyService | JobService,
    createFn: (data: T) => Observable<T>,
    updateFn: (id: string, data: T) => Observable<T>,
    isEditing: boolean,
    editingId: string | null,
    successMsg: string,
    errorMsg: string,
    refresh: BehaviorSubject<void>,
    resetFn: () => void
  ): void {
    if (form.invalid) return;

    this.loading = true;
    const data = form.value as T;

    const action =
      isEditing && editingId ? updateFn(editingId, data) : createFn(data);

    action.subscribe({
      next: () => this.handleSuccess(successMsg),
      error: () => this.handleError(errorMsg),
      complete: () => {
        refresh.next();
        resetFn();
      },
    });
  }
}
