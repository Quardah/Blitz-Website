import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import GlobalService from './globalService';
import { environment } from '../../environments/environment';
import { Period } from '../models/period';

@Injectable()
export class PeriodService extends GlobalService {

  url_periods = environment.url_base_api + environment.paths_api.periods;

  constructor(public http: HttpClient) {
    super();
  }

  create(period: Period): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(
      this.url_periods,
      period,
      {headers: headers}
    );
  }

  list(limit = 100, offset = 0): Observable<any> {
    const headers = this.getHeaders();
    let params = new HttpParams();
    params = params.set('limit', limit.toString());
    params = params.set('offset', offset.toString());
    return this.http.get<any>(
      this.url_periods,
      {headers: headers, params: params}
    );
  }

  get(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(
      this.url_periods + '/' + id,
      {headers: headers}
    );
  }

  update(url: string, period: Period): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch<any>(
      url,
      period,
      {headers: headers}
    );
  }

  remove(period: Period): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(
      period.url,
      {headers: headers}
    );
  }
}