import { Routes } from '@angular/router';
import { CompanyJobListComponent } from './components/company-job-list/company-job-list.component';
import { JobDetailComponent } from './components/job-detail/job-detail.component';
import { ManageComponent } from './components/manage/manage.component';
import { CreateJobComponent } from './components/create-job/create-job.component';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/companies-jobs', pathMatch: 'full' },
  { path: 'manage', component: ManageComponent },
  { path: 'companies-jobs', component: CompanyJobListComponent },
  { path: 'company/:id', component: CompanyDetailComponent },
  { path: 'job/:id', component: JobDetailComponent },
  { path: 'create-job', component: CreateJobComponent },
];
