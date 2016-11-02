var GridController = function ($scope, $uibModal, Api) {
    var uibModalInstance = null;
    $scope.data = {
        WarehouseTransferInfo: {
            totalitems: 0,
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

            console.log(_models.locations);
            $scope.data.WarehouseTransferInfo.toLocations = _models.locations;
            
            var request = {
                locationId: $scope.selectedFromLocation.StockLocationId,
            };
            SetBusy($("#ActiveTransferGrid"));
            Api.PostApiCall("WarehouseTransfer", "GetActiveTransfersForLocation", request, function (event) {
                SetBusy($("#ActiveTransferGrid"), true);
                if (event.hasErrors == true) {
                    alert("Error Getting data: " + event.error);
                } else {
                    $scope.data.WarehouseTransferInfo.totalitems = event.result.length;
                    $scope.data.WarehouseTransferInfo.data = event.result;
                    
                    event.result.forEach(function(element){
                        request = {
                            pkTransferId: element.PkTransferId
                        }

                        Api.PostApiCall("WarehouseTransfer", "GetTransferItems", request, function (event) {
                             if (event.hasErrors == true) {
                                alert("Error Getting data: " + event.error);
                             } else {
                                if (event.result.length > 0){
                                    element.firstItemSKU = event.result[0].SKU;
                                    element.firstItemTitle = event.result[0].ItemTitle;
                                }
                             }
                        });
                    })
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


    $scope.createNewTransfer = function (element) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/SPA/Views/CreateNewTransferWindow.html',
            controller: 'CreateNewTransferController',
            controllerAs: 'myCtrl',
            size: "lg",
            ariaLabelledBy: 'modal-title',
            resolve: {
                data: element
            }
        });

        console.log(modalInstance);

        modalInstance.result.then(function (selectedItem) {
            $scope.data.WarehouseTransferInfo.selectedItem = selectedItem;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });


    }
}

GridController.$inject = ['$scope','$uibModal','Api'];