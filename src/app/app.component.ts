import { Component, OnInit, ElementRef } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'epons-patient-list',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private baseUri = 'http://api.sadfm.co.za';
  // private baseUri: string = 'http://localhost:4484';

  public currentPage = 1;

  public dateOfBirthFilter: string = null;

  public facilityId: string;

  public firstNameFilter: string = null;

  public genderFilter: string = null;

  public lastNameFilter: string = null;

  public medicalSchemeFilter: string = null;

  public pageSize = 10;

  public pages: number[] = [];

  public patients: any[] = [];

  public permission: any = {};

  public raceFilter: string = null;

  public type: string = null;

  public user: any = {};

  constructor(private http: Http, private el: ElementRef) {

  }

  public ngOnInit(): void {
    this.type = this.el.nativeElement.getAttribute('type');

    const userId = this.el.nativeElement.getAttribute('userId');
    this.loadUser(userId);
  }

  public onClick_PageNumber(page: number): void {
    this.currentPage = page;

    if (this.permission.Permission.Name === 'Case Manager') {
      this.loadPatients(null, this.user.IsSuperAdmin ? null : this.facilityId);
    } else {
      this.loadPatients(this.user.Id, this.user.IsSuperAdmin ? null : this.facilityId);
    }
  }

  public onClick_Search(): void {
    this.currentPage = 1;

    if (this.permission.Permission.Name === 'Case Manager') {
      this.loadPatients(null, this.user.IsSuperAdmin ? null : this.facilityId);
    } else {
      this.loadPatients(this.user.Id, this.user.IsSuperAdmin ? null : this.facilityId);
    }
  }

  private loadPatients(userId: string, facilityId: string): void {

    this.get(`/api/Patient/List?userId=${userId}&type=${this.type === 'active' ? 1 : (this.type === 'discharged' ? 2 : (this.type === 'deceased' ? 3 : 0))}&start=${(this.currentPage - 1) * this.pageSize}&end=${this.currentPage * this.pageSize}&facilityId=${facilityId}&firstName=${this.firstNameFilter ? this.firstNameFilter : ''}&lastName=${this.lastNameFilter ? this.lastNameFilter : ''}&dateOfBirth=${this.dateOfBirthFilter ? this.dateOfBirthFilter : ''}&gender=${this.genderFilter ? this.genderFilter : ''}&race=${this.raceFilter ? this.raceFilter : ''}&medicalScheme=${this.medicalSchemeFilter ? this.medicalSchemeFilter : ''}&superAdmin=${this.user.IsSuperAdmin}`).map((x) => {
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

  private loadUser(userId: string): void {

    this.get(`/api/User/FindById/${userId}`).map((x) => {
      const json: any = x.json();
      return json;
    }).subscribe((json) => {
      this.user = json;

      this.facilityId = this.el.nativeElement.getAttribute('facilityId');

      this.permission = this.user.Permissions.find((x) => x.Facility.Id === this.facilityId);

      if (this.permission.Permission.Name === 'Case Manager') {
        this.loadPatients(null, this.user.IsSuperAdmin ? null : this.facilityId);
      } else {
        this.loadPatients(userId, this.user.IsSuperAdmin ? null : this.facilityId);
      }
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
}
