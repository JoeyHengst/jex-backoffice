import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http
      .get<Company[]>(`${this.API_URL}/companies`)
      .pipe(catchError(this.handleError));
  }

  createCompany(company: Company): Observable<Company> {
    return this.http
      .post<Company>(`${this.API_URL}/companies`, company)
      .pipe(catchError(this.handleError));
  }

  updateCompany(id: string, company: Company): Observable<Company> {
    return this.http
      .put<Company>(`${this.API_URL}/companies/${id}`, company)
      .pipe(catchError(this.handleError));
  }

  deleteCompany(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/companies/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred in CompanyService:', error);
    return throwError(
      () =>
        new Error(
          'Something went wrong with company operations; please try again later.'
        )
    );
  }
}
