var DespatchConsoleController = function ($scope, $rootScope, $uibModal, Api , $routeParams) {
    var uibModalInstance = null;
    $scope.data = {
        orderPageInfo: {
            selectedOrder : null,
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 30,
            data: null,
        }
    };

    $scope.alerts = [];
    $scope.data.scanCode = null;

    function GetData() {
        console.log($scope.selectedFromLocation);
        if ($scope.selectedFromLocation!=null){
            SetBusy($("body"));

            var request = {
                fulfilmentCenter: $scope.selectedFromLocation.StockLocationId,
                entriesPerPage: 30,
                pageNumber: $scope.data.orderPageInfo.currentPage

            };

            Api.PostApiCall("Orders", "GetOpenOrders", request).then(function (event) {
                console.log(event);
                if(event.hasErrors == true) {
                    alert("Error Getting data: " + event.error);
                } else {
                    $scope.data.orderPageInfo.data = event.result.Data;
                    $scope.data.orderPageInfo.totalItems = event.result.TotalEntries;
                    $scope.data.orderPageInfo.itemsPerPage = event.result.EntriesPerPage;
                    $scope.data.orderPageInfo.totalPages = event.result.TotalPages;
                    $scope.data.orderPageInfo.currentPage = event.result.PageNumber;
                }
                SetBusy($("body"), true);
            });

        }
    }

    $scope.pageChanged = function () {
        GetData();
    };



    $scope.getOrderDetail = function (order) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'Model/View/DespatchConsole//GetOrderDetail.html',
            controller: GetOrderDetailController,
            size: "lg",
            ariaLabelledBy: 'modal-title',
            resolve: {
                data: order
            }
        });
    }


    $scope.showScanedOrders = function(){
        //Remove white space
        $scope.data.scanCode = $scope.data.scanCode.replace(" ", "");

        if ($scope.data.scanCode.length < 3){
            GetData();
            return;
        }
        console.log($scope.data.scanCode);
        var getOrderIdsQuery = `
        SELECT DISTINCT ooi.fkOrderId OpenOrderId
                FROM Open_OrderItem ooi 
                JOIN Stock_ChannelSKU scs ON ooi.fkStockItemId = scs.fkStockItemId
                JOIN StockItem si ON ooi.fkStockItemId = si.pkStockItemId
                WHERE scs.ChannelSKU like '%${$scope.data.scanCode}%' OR si.BarcodeNumber = '${$scope.data.scanCode}'
`
        var request = {
            script: getOrderIdsQuery
        }
        SetBusy($("body"));
        Api.PostApiCall("Dashboards", "ExecuteCustomScriptQuery", request).then(function (event) {
            SetBusy($("body"), true);
            if (!event.hasErrors){
                if(!event.result.IsError){
                    var orderIds = event.result.Results;
                    textRequest = "";
                    orderIds.forEach(function(id){
                        textRequest = `${textRequest},'${id.OpenOrderId}'`;
                    })
                    textRequest = textRequest.slice(1);
                    var _request = `pkOrderIds=[${textRequest}]`;
                    
                    SetBusy($("body"));
                    Api.SpecialPostApiCall("Orders", "GetOrdersById", _request).then(function (event) {
                        if (!event.hasErrors){
                            $scope.data.orderPageInfo.data = event.result;
                            $scope.data.orderPageInfo.totalItems = event.result.length;
                            $scope.data.orderPageInfo.totalPages = 1;
                            $scope.data.orderPageInfo.currentPage = 1;
                            $scope.data.orderPageInfo.itemsPerPage = event.result.length;
                        }
                        SetBusy($("body"), true);
                    });
                }
            }
        });
    }


    $scope.$watch('selectedFromLocation', function () {
        if($scope.selectedFromLocation){
            GetData();
        }
    });

    $scope.closeAlert = function(index){
        $scope.alerts.splice(index, 1);
    }

    $scope.showChildItems = function(x_index, y_index){
        if($(`.child-${x_index}-${y_index}`).is(':visible')){
            $(`.child-${x_index}-${y_index}`).hide('slow');
        }else{
            $(`.child-${x_index}-${y_index}`).show('slow');
        }
    }

}

DespatchConsoleController.$inject = ['$scope', '$rootScope', '$uibModal', 'Api', '$routeParams'];
