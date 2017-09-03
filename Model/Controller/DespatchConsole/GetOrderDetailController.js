var GetOrderDetailController = function ($scope, $uibModalInstance, $uibModal, data, Api) {
	$scope.currentOrder = {
		shippingInfo: {
			postalServiceId: null
		},
		lastScannedItemText: null,
		totalScannedItems: null,
	};

	$scope.orderTitles = {
		name: 	[
			"Scan Order", "Details", "Items", "Notes", "Audit Trail", "Relations", "Package Split", "Extended properties"
		],
		icon: [
			"fa-tasks", "fa-list-alt", "fa-square", "fa-comments-o", "fa-archive", "fa-sitemap", "fa-th-large", "fa-th-large"
		]
	};

	$scope.orderItems = null;
	$scope.textHTML = 'Model/View/DespatchConsole/OrderContent/test.html';

	$scope.orderPackagingCalculation = null;

	$scope.selectTitle = function(name){
		$scope.orderContentHTML = 'Model/View/DespatchConsole/OrderContent/'+ name.toLowerCase().replace(/ /g,"_") + '.html';
		if(!$scope.finalOrderItems){
			setTimeout(function(){
				console.log($('.dynamic-content'));
				SetBusy($(".dynamic-content"));
				var request = {
				    orderId: data.OrderId,
				    fulfilmentCenter: data.GeneralInfo.Location
				}

				Api.PostApiCall("Orders", "GetOrderItems", request).then(function (event) {
				    if(event.hasErrors == true) {
				        alert("Error Getting data: " + event.error);
				    } else {
				        $scope.orderItems = event.result;
				    }

				    $scope.normalizeOrderItems($scope.orderItems);
				    SetBusy($(".dynamic-content"), true);
				});
			 }, 0);
		}
	}

	$scope.close = function(){
		$uibModalInstance.dismiss('cancel');
	}

	$scope.showChildItems = function(index){
		if($(`.child-${index}`).is(':visible')){
			$(`.child-${index}`).hide('slow');
		}else{
			$(`.child-${index}`).show('slow');
		}
	}

	$scope.showEditAddress = function(){
		var modalInstance = $uibModal.open({
		  templateUrl: 'Model/View/DespatchConsole/OrderContent/Edit/edit_address.html',
		  controller: 'GetOrderDetailController',
		  animation: true,
		  size: "sm edit-address",
		  ariaLabelledBy: 'modal-title',
		  appendTo: $('body'),
		  resolve: {
		      data: $scope.data
		  }
		});
	}

	$scope.getShippingMethods = function(){
		Api.PostApiCall('Orders', 'GetShippingMethods', null).then(function (event){
			if(event.hasErrors == true) {
			    alert("Error Getting data: " + event.error);
			} else {
				var shippingMethodArr = [];
				for(var shippingMethod of event.result){
					for(var postalSerivce of shippingMethod.PostalServices){
						shippingMethodArr.push(postalSerivce);
					}
				}
				$scope.shippingMethods = shippingMethodArr;
			}
		});
	}

	$scope.shippingInfoChanged = function() {
		console.log($scope.currentOrder.shippingInfo.postalServiceId);
	}

	$scope.getOrderPackagingCal = function(orderId){
		var request =`request={"pkOrderIds":["${orderId}"]}`;
		Api.SpecialPostApiCall('Orders', 'GetOrderPackagingCalculation', request).then(function (event){
			if(event.hasErrors == true) {
			    alert("Error Getting data: " + event.error);
			} else {
				console.log(event);
				$scope.orderPackagingCalculation = event.result[0];
			}
		})
	}

	$scope.getOrderDetail = function(data){
		var request = {
			orderId: data.OrderId,
			fulfilmentLocationId: data.GeneralInfo.Location,
			loadItems: true,
			loadAdditionalInfo: true
		}

		console.log(angular.element('.dynamic-content'));

		Api.PostApiCall('Orders', 'GetOrder', request).then(function (event){
			if(event.hasErrors == true) {
			    alert("Error Getting data: " + event.error);
			} else {
				$scope.data = event.result;
				

				var addressObj = $scope.data.CustomerInfo.Address;
var addressStr = 
`${addressObj.FullName}
${addressObj.Address1}
${addressObj.Address2}
${addressObj.Address3}
${addressObj.Town}
${addressObj.Region} ${addressObj.PostCode}
${addressObj.Country}
`;
				$scope.data.shippingAddress = addressStr;

				$scope.currentOrder.shippingInfo.postalServiceId = $scope.data.ShippingInfo.PostalServiceId;
				console.log($scope.data);
			}
			
		});
	}

	$scope.test = function(){
		console.log($scope.data.ShippingInfo.TrackingNumber);
	}

	// Scan Barcode
	$scope.scanItem = function(){
		$scope.currentOrder.lastScannedItemText = $scope.currentOrder.lastScannedItemText.replace(" ", "");
		var scanText = $scope.currentOrder.lastScannedItemText;
		var isFound = false;
		for(var item of $scope.finalOrderItems){
			console.log(item);
			if (item.SKU.replace(" ", "") == scanText || item.BarcodeNumber.replace(" ", "") == scanText || item.Title.replace(" ", "") == scanText){
				if (item.checkedQty < item.qty){
					item.checkedQty++;
				}else{
					alert(`"${scanText}" has checked all, please review your process.`);
				}
				isFound = true;
				break;
			}
		}
		if (!isFound){
			alert(`Cannot find your scanned item, please check again.`);
		}
	}

	$scope.normalizeOrderItems = function(orderItems){
		var orderItemArr = [];
		for(var orderItem of orderItems){
			if (orderItem.CompositeSubItems.length > 0){
				for (var childItem of orderItem.CompositeSubItems){
					orderItemArr.push(childItem);
				}
			}
			else{
				orderItemArr.push(orderItem);
			}
		}

		var finalOrderItemIdSet = new Set();

		for(var i = 0; i < orderItemArr.length; i++){
			finalOrderItemIdSet.add(orderItemArr[i].StockItemId);
		}

		var finalOrderItems = [];

		for(var itemId of finalOrderItemIdSet){
			var obj = {};
			obj.StockItemId = itemId;
			obj.qty = 0;
			obj.checkedQty = 0;


			for(item of orderItemArr){
				if (item.StockItemId == obj.StockItemId){
					obj.qty += item.Quantity;
					item.BarcodeNumber ? obj.BarcodeNumber = item.BarcodeNumber : obj.BarcodeNumber = '';
					item.Title ? obj.Title = item.Title : obj.Title = '';
					item.SKU ? obj.SKU = item.SKU : obj.SKU = '';
				}
			}
			finalOrderItems.push(obj);
		}

		$scope.finalOrderItems = finalOrderItems;
	}

	$scope.getOrderDetail(data);
	$scope.getShippingMethods();
	$scope.selectTitle("Scan Order");
	$scope.getOrderPackagingCal(data.OrderId);
}


GetOrderDetailController.$inject = ['$scope', '$uibModalInstance', '$uibModal', 'data', 'Api'];