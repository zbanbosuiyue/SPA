var MainController = function ($scope, Api) {
    $scope.models = {
        locations: [
                       
        ]
    };
    $scope.selectedFromLocation = null;
    $scope.selectedToLocation = null;

    $scope.changeFromLocation = function (loc) {
        $scope.selectedFromLocation = loc;
    }




    function GetLocations() {
        SetBusy($('body'));

        Api.GetApiCall("Inventory", "GetStockLocations", function (event) {
            SetBusy($('body'),true);

            if (event.hasErrors == true) {
                $scope.setError(event.error);
            } else {
                $scope.models.locations = event.result;

                if ($scope.models.locations.length > 0) {
                    $scope.selectedFromLocation = $scope.models.locations[0];
                    $scope.selectedToLocation = $scope.models.locations[0];
                }
            }
        });
    }
    GetLocations();
}

MainController.$inject = ['$scope','Api'];