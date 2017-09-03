var MainController = function ($scope, Api, $location, $routeParams) {
    $scope.models = {
        locations: [
        ]
    };
    $scope.selectedFromLocation = null;
    $scope.selectedToLocation = null;
    var controllerPath = $location.path().split('/')[1];

    $scope.changeFromLocation = function (loc) {
        $scope.selectedFromLocation = loc;
        if (controllerPath)
            $location.path(controllerPath + '/' + loc.LocationName);
    }

    function GetLocations() {
        SetBusy($('body'));

        Api.GetApiCall("Inventory", "GetStockLocations").then(function(event) {
            SetBusy($('body'),true);
            if (event.hasErrors == true) {
                $scope.setError(event.error);
            } else {
                $scope.models.locations = event.result;
                if ($scope.models.locations.length > 0) {
                    if(!$routeParams.type){
                        $scope.selectedFromLocation = $scope.models.locations[0];
                    }else{
                        var locationName = $routeParams.type;
                        for(var loc of $scope.models.locations){
                            if(loc.LocationName == locationName){
                                $scope.selectedFromLocation = loc;
                                break;
                            }
                        }
                    }
                    if (controllerPath)
                        $location.path(controllerPath +'/'+$scope.selectedFromLocation.LocationName);
                    
                    $scope.selectedToLocation = $scope.models.locations[0];
                }
            }
        });
    }
    GetLocations();
}

MainController.$inject = ['$scope','Api', '$location', '$routeParams'];