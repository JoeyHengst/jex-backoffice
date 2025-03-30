import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Job } from '../models/job.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJobs(): Observable<Job[]> {
    return this.http
      .get<Job[]>(`${this.API_URL}/jobs`)
      .pipe(catchError(this.handleError));
  }

  createJob(job: Job): Observable<Job> {
    return this.http
      .post<Job>(`${this.API_URL}/jobs`, job)
      .pipe(catchError(this.handleError));
  }

  updateJob(id: string, job: Job): Observable<Job> {
    return this.http
      .put<Job>(`${this.API_URL}/jobs/${id}`, job)
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/jobs/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred in JobService:', error);
    return throwError(
      () =>
        new Error(
          'Something went wrong with job operations; please try again later.'
        )
    );
  }
}
