var ScanItemController = function ($scope, $uibModalInstance, data, Api) {
	$scope.data = data;
	console.log(data);

}
ScanItemController.$inject = ['$scope', '$uibModalInstance', 'data', 'Api'];