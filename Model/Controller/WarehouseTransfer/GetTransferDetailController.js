var GetTransferDetailController = function ($scope, $uibModalInstance, data, Api) {
	$scope.data = data;
	$scope.currentPage = 1;

	$scope.itemsperpage = 5;
	console.log(data);

	$scope.close = function(){
		$uibModalInstance.close(data);
	}

	function GetData(){
		if ($scope.data.itemsData.length > 0){
			var currentPage = $scope.currentPage;
			var itemsperpage = $scope.itemsperpage;
			var startPoint = (currentPage - 1) * itemsperpage;
			for (i = 0; i < itemsperpage; i++){
				tmpData = $scope.data.itemsData.slice(startPoint, startPoint + itemsperpage);
			}
			$scope.pageData = tmpData;
		}
	}
	$scope.pageChanged = function () {
	    GetData();
	}
	GetData();
}


GetTransferDetailController.$inject = ['$scope', '$uibModalInstance', 'data', 'Api'];