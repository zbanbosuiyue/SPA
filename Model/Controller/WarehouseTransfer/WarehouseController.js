var WarehouseController = function ($scope, $rootScope, $uibModal, Api, $routeParams) {
    var uibModalInstance = null;
    $scope.data = {
        WarehouseTransferInfo: {
            selectedTransfer : null,
            totalItems: 0,
            currentPage: 1,
            itemsperpage: 6,
            toLocations: [],
            fromLocation: [],
            data: []
        }
    };


    function GetData() {
        if ($scope.selectedFromLocation!=null){
            $scope.data.WarehouseTransferInfo.data = [];
            _models = angular.copy($scope.models);
            $scope.data.WarehouseTransferInfo.fromLocation = $scope.selectedFromLocation;

            _models.locations.forEach( function(loc, index) {
                if (loc.LocationName == $scope.selectedFromLocation.LocationName){
                    console.log(index);
                    _models.locations.splice(index,1);
                }
            });
            $scope.data.WarehouseTransferInfo.toLocations = _models.locations;
            
            var request = {
                locationId: $scope.selectedFromLocation.StockLocationId,
            };
            SetBusy($("body"));
            Api.PostApiCall("WarehouseTransfer", "GetActiveTransfersForLocation", request).then(function (event1) {
                if (event1.hasErrors == true) {
                    alert("Error Getting data: " + event1.error);
                } else {
                    if (event1.result.length > 0){
                        event1.result.forEach(function(element, index){
                            $scope.index = index;
                            request = {
                                pkTransferId: element.PkTransferId
                            }
                            Api.PostApiCall("WarehouseTransfer", "GetTransferItems", request).then(function (event2) {
                                 if (event2.hasErrors == true) {
                                    alert("Error Getting data: " + event2.error);
                                 } else {
                                    if (event2.result.length > 0){
                                        element.itemsData = event2.result;
                                        element.firstItemSKU = event2.result[0].SKU;
                                        element.firstItemRequestQty = event2.result[0].RequestedQuantity;
                                    }

                                    if ($scope.index == event1.result.length - 1) {
                                        SetBusy($("body"), true);
                                    }
                                 }
                            });
                        })
                    } else{
                        SetBusy($("body"), true);
                    }

                    $scope.data.WarehouseTransferInfo.totalItems = event1.result.length;
                    $scope.data.WarehouseTransferInfo.data = event1.result;
                }
            });
        }

    }

    $scope.pageChanged = function () {
        GetData();
    }


    $scope.$watch('selectedFromLocation', function () {
        $scope.data.WarehouseTransferInfo.currentPage = 1;
        GetData();
    });

    $rootScope.$on('GetData', function(event){
        GetData();
    });

    $scope.getTransferDetail = function(data){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'Model/View/WarehouseTransfer/GetTransferDetail.html',
            controller: 'GetTransferDetailController',
            size: "lg",
            ariaLabelledBy: 'modal-title',
            resolve: {
                data: data
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log(selectedItem);
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }


    $scope.createNewTransfer = function (element) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'Model/View/WarehouseTransfer/CreateNewTransferWindow.html',
            controller: 'CreateNewTransferController',
            size: "lg",
            ariaLabelledBy: 'modal-title',
            resolve: {
                data: element
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log(selectedItem);
            $scope.data.WarehouseTransferInfo.selectedItem = selectedItem;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }




}

WarehouseController.$inject = ['$scope', '$rootScope', '$uibModal', 'Api', '$routeParams'];
