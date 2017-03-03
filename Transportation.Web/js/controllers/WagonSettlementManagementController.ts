/// <reference path="../../lib/angular/angular.d.ts" />
/// <reference path="../../lib/angular/angular-cookies.d.ts" />
/// <reference path="IController.ts" />
/// <reference path="../services/AuthenticationService.ts" />

declare var VERSION_NUMBER;

module Clarity.Controller {
	import service = Clarity.Service;
	import helper = Clarity.Helper;

  export class WagonSettlementManagementController {
    public currentWagonSettlement: Model.WagonSettlementModel;
    public wagonSettlementService: service.WagonSettlementService;

    public truckList: Array<Model.TruckModel>
    public employeeList: Array<Model.EmployeeModel>
    public customerList: Array<Model.CustomerModel>
    public truckService: service.TruckService;
    public employeeService: service.EmployeeService;
    public customerService: service.CustomerService;
    public exportService: service.ExportService;

    public wagonSettlementList: Array<Model.WagonSettlementModel>;
    public wagonSettlementListTmp: Array<Model.WagonSettlementModel>;
    public numOfPages: number;
    public currentPage: number;
    public pageSize: number;

    constructor(private $scope,
      private $rootScope: IRootScope,
      private $http: ng.IHttpService,
      private $location: ng.ILocationService,
      private $window: ng.IWindowService,
      private $filter: ng.IFilterService,
      private $routeParams: any) {

      this.wagonSettlementService = new service.WagonSettlementService($http);
      this.truckService = new service.TruckService($http);
      this.employeeService = new service.EmployeeService($http);
      this.customerService = new service.CustomerService($http);
      this.exportService = new service.ExportService($http);
      $scope.viewModel = this;

      this.pageSize = 5;
      this.initWagonSettlement();

      var self = this;
      $scope.$watch('searchText', function (value) {
        if (self.wagonSettlementListTmp && self.wagonSettlementListTmp.length > 0) {
          self.wagonSettlementList = $filter('filter')(self.wagonSettlementListTmp, value);
          self.initPagination();
        }
      });
    }

    initWagonSettlement() {
      var wagonId = this.$routeParams.wagonSettlement_id;
      if (wagonId) {
        if (this.$location.path() === '/ql-toa-hang/quyet-toan/' + wagonId) {
          this.wagonSettlementService.getById(wagonId, (data) => {
            this.currentWagonSettlement = data;
          }, null);
        }
      } else {
        if (this.$location.path() === '/ql-toa-hang/quyet-toan') {
          this.initWagonSettlementList();
        }
      }
    }

    initWagonSettlementList() {
      this.wagonSettlementService.getAll((results: Array<Model.WagonSettlementModel>) => {
        this.wagonSettlementList = results;
        this.wagonSettlementList.sort(function (a: any, b: any) {
          return a.id - b.id;
        });
        this.wagonSettlementListTmp = this.wagonSettlementList;
        this.initPagination();
      }, null);
    }

    initPagination() {
      this.currentPage = 1;
      this.numOfPages = this.wagonSettlementList.length % this.pageSize === 0 ?
        this.wagonSettlementList.length / this.pageSize : Math.floor(this.wagonSettlementList.length / this.pageSize) + 1;
    }

    getWagonSettlementListOnPage() {
      if (this.wagonSettlementList && this.wagonSettlementList.length > 0) {
        var startIndex = this.pageSize * (this.currentPage - 1);
        var endIndex = startIndex + this.pageSize;
        return this.wagonSettlementList.slice(startIndex, endIndex);
      }
    }

    getNumberPage() {
      if (this.numOfPages > 0) {
        return new Array(this.numOfPages);
      }
      return new Array(0);
    }

    goToPage(pageIndex: number) {
      this.currentPage = pageIndex;
    }

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.goToPage(this.currentPage);
      }
    }
    goToNextPage() {
      if (this.currentPage < this.numOfPages) {
        this.currentPage++;
        this.goToPage(this.currentPage);
      }
    }

	}
}