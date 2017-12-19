import { Component, OnInit, ElementRef } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'epons-patient-list',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private baseUri: string = 'http://api.sadfm.co.za';
  // private baseUri: string = 'http://localhost:4484';

  public user: any = {};

  public permission: any = {};

  public facilityId: string;

  public patients: any[] = [];

  public pages: number[] = [];

  public currentPage: number = 1;

  public pageSize: number = 3;
  
  constructor(private http: Http, private el: ElementRef) {

  }

  public ngOnInit(): void {
    const userId = this.el.nativeElement.getAttribute('userId');
    this.loadUser(userId);
  }

  public onClick_PageNumber(page: number): void {
    this.currentPage = page;

    if (this.permission === 'Case Manager') {
      this.loadActivePatients(null, this.facilityId);
    } else {
      this.loadActivePatients(this.user.Id, this.facilityId);
    }
  }

  private loadUser(userId: string): void {

    this.get(`/api/User/FindById/${userId}`).map((x) => {
      const json: any = x.json();
      return json;
    }).subscribe((json) => {
      this.user = json;

      this.facilityId = this.el.nativeElement.getAttribute('facilityId');

      this.permission = this.user.Permissions.find((x) => x.Facility.Id === this.facilityId);

      if (this.permission === 'Case Manager') {
        this.loadActivePatients(null, this.facilityId);
      } else {
        this.loadActivePatients(userId, this.facilityId);
      }
    });
  }

  private loadActivePatients(userId: string, facilityId: string): void {

    this.get(`/api/Patient/List?userId=${userId}&type=0&start=${(this.currentPage - 1) * this.pageSize}&end=${this.currentPage * this.pageSize}&facilityId=${facilityId}`).map((x) => {
      const json: any = x.json();
      return json;
    }).subscribe((json) => {
      this.patients = json.Items;

      this.patients.forEach(element => {
        element.DateOfBirth = new Date(element.DateOfBirth);
        element.FacilitiesName = element.Facilities.map((x) => x.Name).join(', ');
      });

      this.pages = [];

      for (let i = 1; i < Math.ceil(json.Count / this.pageSize) + 1; i++) {
        this.pages.push(i);
      }
    });
  }

  protected post(uri: string, obj: any): Observable<Response> {
    const headers = new Headers();
    headers.append('apikey', '2c0d64c1-d002-45f2-9dc4-784c24e996');

    const jwtToken = localStorage.getItem('jwt.token');

    if (jwtToken !== null || jwtToken === '') {
      headers.append('Authorization', 'Bearer ' + jwtToken);
    }

    return this.http.post(`${this.baseUri}${uri}`, obj, {
      headers,
    });
  }

  protected get(uri: string): Observable<Response> {
    const headers = new Headers();
    headers.append('apikey', '2c0d64c1-d002-45f2-9dc4-784c24e996');

    const jwtToken = localStorage.getItem('jwt.token');

    if (jwtToken !== null || jwtToken === '') {
      headers.append('Authorization', 'Bearer ' + jwtToken);
    }

    return this.http.get(`${this.baseUri}${uri}`, {
      headers,
    });
  }
}
