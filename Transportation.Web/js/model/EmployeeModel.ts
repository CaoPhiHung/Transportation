/// <reference path="BaseModel.ts" />

module Clarity.Model {
  export class EmployeeModel extends Model.BaseModel {
    public fullName: string;
    public cardId: string;
    public address: string;
    public mobile: string;
    public driverLicenseRank: string;
    public driverLicenseId: string;
    public driverLicenseAddress: string;
    public driverLicenseDate: string;
    public driverLicenseExpirationDate: string;
    public startDate: string;
    public violation: string;
    public notes: string;
    public title: string;
		public isDeleted: boolean;
  }

  export class EmployeeViewModel extends Model.BaseModel {
    public fullName: string;
    public mobile: string;
    public title: string;
    public startDate: string;
    public status: string;
    public isChecked: boolean;
  }
}