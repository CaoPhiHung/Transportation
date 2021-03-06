/// <reference path="../../lib/angular/angular.d.ts" />
/// <reference path="../../lib/angular/angular-cookies.d.ts" />
/// <reference path="IController.ts" />
/// <reference path="../services/AuthenticationService.ts" />

declare var VERSION_NUMBER;

module Clarity.Controller {
  import service = Clarity.Service;
  import helper = Clarity.Helper;

  const formatSuffix = 'Formatted';

  export class CustomerManagementController {
    public customerService: service.CustomerService;
    public employeeService: service.EmployeeService;
    public mainHelper: helper.MainHelper;

    public currentCustomer: Model.CustomerModel;
    public employeeList: Array<Model.EmployeeModel>;
    public customerList: Array<Model.CustomerModel>;
    public customerListView: Array<Model.CustomerViewModel>;

    public numOfPages: number;
    public currentPage: number;
    public pageSize: number;

    public isCheckedAll: boolean;
    public isLoading: boolean;
    public searchText: string;
    public errorMessage: string;
    public months: Array<number>;
    public isSubmitting: boolean;

    constructor(private $scope,
      public $rootScope: IRootScope,
      private $http: ng.IHttpService,
      public $location: ng.ILocationService,
      public $window: ng.IWindowService,
      public $filter: ng.IFilterService,
      private $routeParams: any,
      private $cookieStore: ng.ICookieStoreService,
      private $timeout: ng.ITimeoutService) {

      this.customerService = new service.CustomerService($http);
      this.employeeService = new service.EmployeeService($http);
      this.mainHelper = new helper.MainHelper($http, $cookieStore, $filter);
      $scope.viewModel = this;

      this.currentPage = 0;
      this.pageSize = 10;
      this.searchText = '';
      this.errorMessage = '';
      this.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      this.initCustomer();

      var self = this;
      $scope.$watch('viewModel.searchText', (newValue, oldValue) => {
        if (newValue === oldValue) return;
        this.currentPage === 0 ? this.fetchCustomerListPerPage() : (() => { this.currentPage = 0; })();
        this.fetchNumOfPages();
      });

      $scope.$watch('viewModel.currentPage', (newValue, oldValue) => {
        if (newValue === oldValue) return;
        this.fetchCustomerListPerPage();
      });

      $scope.$watch('viewModel.pageSize', (newValue, oldValue) => {
        if (newValue === oldValue) return;
        this.clearSearchText();
        this.initCustomerList();
      });
    }

    isEditMode() {
      var customerId = this.$routeParams.customer_id;
      return !!customerId;
    };

    initCustomer() {
      if (this.isEditMode()) {
        var customerId = this.$routeParams.customer_id;
        this.initCurrentCustomer(customerId);
        this.initEmployeeList();
      } else {
        if (this.$location.path() === '/ql-toa-hang/khach-hang/tao') {
          this.currentCustomer = new Model.CustomerModel();
          this.initEmployeeList();
        } else if (this.$location.path() === '/ql-toa-hang/khach-hang') {
          this.initCustomerList();
        }
      }
    }

    initCurrentCustomer(customerId: number) {
      if (this.currentCustomer == null) {
        this.$rootScope.showSpinner();
        this.customerService.getById(customerId, (data) => {
          this.currentCustomer = data;
          this.currentCustomer.paymentMonth = (new Date()).getMonth() + 1;
          this.currentCustomer.paymentYear = (new Date()).getFullYear();
          this.mainHelper.initCurrencyFormattedProperty(this.currentCustomer,
            ['totalOwned', 'totalPay', 'totalDebt'], formatSuffix);
          this.$rootScope.hideSpinner();
        }, null);
      }
    }

    initCustomerList() {
      this.currentPage = 0;
      this.fetchCustomerListPerPage();
      this.fetchNumOfPages();
    }

    fetchCustomerListPerPage() {
      this.isLoading = true;
      this.customerService.getPerPage(this.currentPage, this.pageSize, this.searchText, (results: Array<Model.CustomerModel>) => {
        this.customerList = results;
        this.mapToCustomerListView();
        this.isLoading = false;
      });
    }

    fetchNumOfPages() {
      this.customerService.getNumOfPages(this.pageSize, this.searchText, (results: number) => {
        this.numOfPages = parseInt(results['pages']);
      });
    }

    initEmployeeList() {
      this.employeeService.getAllCurtail((results: Array<Model.EmployeeModel>) => {
        this.employeeList = results;
      }, null);
    }

    mapToCustomerListView() {
      this.customerListView = this.customerList.map((customer: Model.CustomerModel) => {
        this.mainHelper.initCurrencyFormattedProperty(customer,
          ['totalOwned', 'totalPay', 'totalDebt'],formatSuffix);
        const customerView = new Model.CustomerViewModel();
        customerView.id = customer.id;
        customerView.code = customer.code;
        customerView.fullName = customer.fullName;
        customerView.phoneNo = customer.phoneNo;
        customerView.totalOwned = customer.totalOwnedFormatted;
        customerView.totalPay = customer.totalPayFormatted;
        customerView.totalDebt = customer.totalDebtFormatted;
        return customerView;
      });
    }

    selectAllCustomersOnPage() {
      this.customerListView.map(customer => customer.isChecked = this.isCheckedAll);
    }

    removeCustomers() {
      var confirmDialog = this.$window.confirm('Bạn có muốn xóa những khách hàng được chọn?');
      if (confirmDialog) {
        for (let i = 0; i < this.customerListView.length; i++) {
          const customer = this.customerListView[i];
          if (customer.isChecked) {
            this.customerService.deleteEntity(customer, (data) => {
              this.initCustomerList();
            }, (error) => {
              this.errorMessage = 'Khách hàng được chọn đã có trong Quyết toán';
              this.$timeout(() => {
                this.errorMessage = '';
              }, 8000);
            });
          }
        }
      }
    }

    removeCustomerInDetail(customer: Model.CustomerModel) {
      var confirmDialog = this.$window.confirm('Bạn có muốn xóa khách hàng này?');
      if (confirmDialog) {
        this.customerService.deleteEntity(customer, (data) => {
          this.$location.path('/ql-toa-hang/khach-hang');
        }, (error) => {
          this.errorMessage = 'Khách hàng đã có trong Quyết toán';
          this.$timeout(() => {
            this.errorMessage = '';
          }, 8000);
        });
      }
    }

    createCustomer(customer: Model.CustomerModel) {
      this.isSubmitting = true;
      this.customerService.create(customer, (data) => {
        this.isSubmitting = false;
        this.$location.path('/ql-toa-hang/khach-hang');
      }, null);
    }

    updateCustomer(customer: Model.CustomerModel) {
      this.isSubmitting = true;
      this.customerService.update(customer, (data) => {
        this.isSubmitting = false;
        this.$location.path('/ql-toa-hang/khach-hang');
      }, null);
    }

    goToCustomerForm() {
      this.$location.path('/ql-toa-hang/khach-hang/tao');
    }

    goToCustomerEditForm(event: Event, customerId: number) {
      event.stopPropagation();
      this.$location.path(`/ql-toa-hang/khach-hang/sua/${customerId}`);
    }

    proccessFastPayment(event: Event, customerId: number) {
      event.stopPropagation();
      var confirmDialog = this.$window.confirm('Bạn có muốn thanh toán nhanh cho khách hàng này?');
      if (confirmDialog) {
        this.customerService.proccessFastPayment(customerId, (data) => {
          this.initCustomerList();
        }, (error) => {
          this.errorMessage = 'Thanh toán nhanh lỗi!';
          this.$timeout(() => {
            this.errorMessage = '';
          }, 8000);
        });
      }
    }

    clearSearchText() {
      this.searchText = '';
    }

    updateNewPayment() {
      this.mainHelper.onCurrencyPropertyChanged(this.currentCustomer, 'newPayment', `newPayment${formatSuffix}`);
    }

    hasSelectedCustomer() {
      if (!this.customerListView) return false;
      return this.customerListView.some(customer => customer.isChecked);
    }
	}
}