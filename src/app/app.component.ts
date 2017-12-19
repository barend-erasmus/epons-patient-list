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

  public patients: any = {};

  constructor(private http: Http, private el: ElementRef) {

  }

  public ngOnInit(): void {
    const userId = this.el.nativeElement.getAttribute('userId');
    this.loadUser(userId);
  }

  private loadUser(userId: string): void {

    this.get(`/api/User/FindById/${userId}`).map((x) => {
      const json: any = x.json();
      return json;
    }).subscribe((json) => {
      this.user = json;

      const facilityId = this.el.nativeElement.getAttribute('facilityId');

      const permission = this.user.Permissions.find((x) => x.Facility.Id === facilityId);

      if (permission === 'Case Manager') {
        this.loadActivePatients(null, facilityId);
      }else {
        this.loadActivePatients(userId, facilityId);
      }      
    });
  }

  private loadActivePatients(userId: string, facilityId: string): void {

    this.get(`/api/Patient/List?userId=${userId}&type=0&start=0&end=10&facilityId=${facilityId}`).map((x) => {
      const json: any = x.json();
      return json;
    }).subscribe((json) => {
      this.patients = json;

      this.patients.Items.forEach(element => {
        element.DateOfBirth = new Date(element.DateOfBirth);
        element.FacilitiesName = element.Facilities.map((x) => x.Name).join(', ');
      });
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
