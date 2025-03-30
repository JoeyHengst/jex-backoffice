import { Job } from './job.model';

export interface Company {
  id?: number;
  name: string;
  address: string;
  createdAt?: Date;
  jobs?: Job[];
  updatedAt?: Date;
}
