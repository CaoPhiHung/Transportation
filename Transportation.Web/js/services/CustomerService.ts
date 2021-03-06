/// <reference path="../../lib/angular/angular.d.ts" />
/// <reference path="../../lib/angular/angular-cookies.d.ts" />

module Clarity.Service {

  export class CustomerService extends BaseService {

    constructor($http: ng.IHttpService) {
      super($http);
      this.url = '/api/customers';
    }

    proccessFastPayment(id: number, successCallback: Function, errorCallback: Function) {
      this.http.post(`${this.url}/fastPayment/${id}`, null)
        .success((data) => { this.doCallback(successCallback, data); })
        .error((data, status) => { this.doCallback(errorCallback, data, status) });
    }
  }
}