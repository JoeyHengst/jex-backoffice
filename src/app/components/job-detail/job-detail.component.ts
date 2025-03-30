import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { JobService } from '../../services/job.service';
import { map, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterLink],
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styles: [
    `
      .job-detail {
        max-width: 600px;
        margin: 20px auto;
      }
    `,
  ],
})
export class JobDetailComponent {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);

  job$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));
      return this.jobService
        .getJobs()
        .pipe(map((jobs) => jobs.find((job) => job.id === id)));
    })
  );
}
