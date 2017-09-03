var App = angular.module('App', ['ngRoute', 'ui.bootstrap', 'ngFileUpload', 'chart.js']);

App.service('Api', ['$http', ApiService]);

App.controller('MainController', MainController);
App.controller('WarehouseController', WarehouseController);
App.controller('DespatchConsoleController', DespatchConsoleController);
App.controller('CreateNewTransferController', CreateNewTransferController);
App.controller('GetTransferDetailController', GetTransferDetailController);
App.controller('GetOrderDetailController', GetOrderDetailController);
App.controller('GetOrderByScanCodeController', GetOrderByScanCodeController);
App.controller('ScanItemController', ScanItemController);




App.run(['$http', function ($http) {
    var token = localStorage.getItem('token');
    $http.defaults.headers.common['Authorization'] = token;
    console.log(token);
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.patch['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    console.log($http.defaults.headers);
}]);


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


var configFunction = function ($routeProvider, $httpProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    
    $routeProvider
    .when('/', {
        templateUrl: 'Model/View/index.html',
        controller: MainController,
    })
    .when('/WarehouseTransfer', {
        templateUrl: 'Model/View/WarehouseTransfer/index.html',
        controller: WarehouseController
    })
    .when('/WarehouseTransfer/:type', {
        templateUrl: 'Model/View/WarehouseTransfer/index.html',
        controller: WarehouseController
    })
    .when('/WarehouseTransfer/:type/:id', {
        templateUrl: 'Model/View/WarehouseTransfer/index.html',
        controller: WarehouseController
    })
    .when('/DespatchConsole', {
        templateUrl: 'Model/View/DespatchConsole/index.html',
        controller: DespatchConsoleController
    })
    .when('/DespatchConsole/:type', {
        templateUrl: 'Model/View/DespatchConsole/index.html',
        controller: DespatchConsoleController
    })
    .when('/DespatchConsole/:type/:id', {
        templateUrl: 'Model/View/DespatchConsole/index.html',
        controller: DespatchConsoleController
    })
}
configFunction.$inject = ['$routeProvider', '$httpProvider', '$locationProvider'];

App.config(configFunction);

App.run(function ($rootScope, $timeout) {
    $rootScope.errorMessage = "";
    $rootScope.isError = false;

    $rootScope.setError = function (errorMessage) {
        $rootScope.errorMessage = errorMessage;
        if (errorMessage != null && errorMessage != "") {
            $rootScope.isError = true;
        } else {
            $rootScope.isError = false;
        }

    }
});


function SetBusy(element, hide) {
    if (hide == true) {
        element.LoadingOverlay("hide");
    } else {
        element.LoadingOverlay("show", {
            image: "",
            fontawesome: "fa fa-spinner fa-spin"
        });
    }
}
