var GetOrderByScanCodeController = function ($scope, $uibModalInstance, data, Api) {
	$scope.data = data;
	$scope.orderTitles = {
		name: 	[
			"Details", "Items", "Notes", "Audit Trail", "Relations", "Package Split", "Extended properties"
		],
		icon: [
			"fa-list-alt", "fa-square", "fa-comments-o", "fa-archive", "fa-sitemap", "fa-th-large", "fa-th-large"
		]
	};

	console.log(data);



	$scope.selectTitle = function(name){
		$scope.orderContentHTML = 'Model/View/DespatchConsole/OrderContent/'+ name.toLowerCase() + '.html';
		if (name == 'Items' && !$scope.orderItems){
			SetBusy($(".dynamic-content"));

			var request = {
				orderId: $scope.data.OrderId,
				fulfilmentCenter: $scope.data.GeneralInfo.Location
			}

			Api.PostApiCall("Orders", "GetOrderItems", request).then(function (event) {
				if(event.hasErrors == true) {
				    alert("Error Getting data: " + event.error);
				} else {
					$scope.orderItems = event.result;
				}
				SetBusy($(".dynamic-content"), true);
			});
		}
	}

	$scope.close = function(){
		$uibModalInstance.dismiss('cancel');
	}


	$scope.selectTitle("Details");
}


GetOrderByScanCodeController.$inject = ['$scope', '$uibModalInstance', 'data', 'Api'];