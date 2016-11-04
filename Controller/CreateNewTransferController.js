var CreateNewTransferController = function ($scope, $uibModalInstance, $rootScope, data, Upload, Api) {

	$scope.locations = data.toLocations;
	$scope.selectedToLocation = $scope.locations[0];
	$scope.fromLocation = data.fromLocation;

	$scope.data = {
		arrayInfo : {
			titles : null,
			currentPage: 1,
			itemsPerPage: 5,
			data : []
		}
	};

	$scope.alerts = [];
	$scope.goodAlerts = [];

	$scope.addAlert = function(message) {
	  $scope.alerts.push({msg: message});
	};

	$scope.closeAlert = function(index) {
	  $scope.alerts.splice(index, 1);
	};

	$scope.addGoodAlert = function(message){
		$scope.goodAlerts.push({msg: message});
	};

	$scope.closeGoodAlert = function(index){
		$scope.goodAlerts.splice(index,1);
	};

	$scope.changeToLocation = function (loc) {
		$scope.selectedToLocation = loc;
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.submit= function (){
		if ( $scope.skuIndex == null || $scope.requestQtyIndex == null){
			$scope.addAlert('Error:  Not found "sku" or "request_qty" in file!!!');
			return;
		}


		var request1 = {
			fromLocationId : $scope.fromLocation.StockLocationId,
			toLocationId : $scope.selectedToLocation.StockLocationId
		}
		SetBusy($("#modal-all"));

		Api.PostApiCall("WarehouseTransfer", "CreateTransferRequestWithReturn", request1, function (createTransferEvent) {
		    
		    if (createTransferEvent.hasErrors == true) {
		        alert("Error Getting data: " + createTransferEvent.error);
		    } else {
		    	if(createTransferEvent.result.PkTransferId != null){
		    		$scope.fkStockItemIdArr.forEach(function(element, index){
		    			$scope.arrayIndex = index;

		    			var request2 = {
		    				fkTransferId: createTransferEvent.result.PkTransferId,
		    				pkStockItemId: element.pkStockItemId
		    			}
		    			Api.PostApiCall("WarehouseTransfer", "AddItemToTransfer", request2, function (addTransferItemEvent){
		    				if (addTransferItemEvent.hasErrors == true) {
		    				    alert("Error Getting data: " + addTransferItemEvent.error);
		    				} else {
		    					console.log(createTransferEvent.result);
		    					var request3 = {
		    						pkTransferId: createTransferEvent.result.PkTransferId,
		    						pkTransferItemId: addTransferItemEvent.result.PkTransferItemId,
		    						Quantity: element.requestQty
		    					}

		    					Api.PostApiCall("WarehouseTransfer", "ChangeTransferItemRequestQuantity", request3, function(changeTransferItemEvent){
		    						
		    						if (changeTransferItemEvent.hasErrors == true) {
		    						    alert("Error Getting data: " + changeTransferItemEvent.error);
		    						} else {
		    							if($scope.arrayIndex == $scope.fkStockItemIdArr.length - 1){
		    								SetBusy($("#modal-all"), true);
		    								$scope.cancel();
		    								$rootScope.$emit('GetData');
		    							}
		    						}
		    					});
		    				}
		    			});
		    		});
		    	}
		    }
		});
	}



	$scope.onFileSelect = function($files) {
	    //$files: an array of files selected, each file has name, size, and type.
	    for (var i = 0; i < $files.length; i++) {
			var $file = $files[i];
			var reader = new FileReader();
			var arrayBuffer;
			reader.onload = function(){
				arrayBuffer = CSVToArray(this.result, ',');
				$scope.data.arrayInfo.titles = arrayBuffer.shift();
				clearArr = [];
				arrayBuffer.forEach(function(element){
					isNull = false;
					element.forEach(function(sub_element) {
						if (sub_element == ""){
							isNull = true;
						}
					});

					if (!isNull){
						clearArr.push(element);
					}
				})
				$scope.bufferData = clearArr;



				$scope.data.arrayInfo.titles.forEach(function (element, index){
					if (element.toLowerCase() == 'sku'){
						$scope.skuIndex = index;
					} 

					if (element.toLowerCase() == 'request_qty'){
						$scope.requestQtyIndex = index;
					}
				});


				$scope.uploadSuccess = true;


				query = buildQuery($scope.bufferData, $scope.skuIndex);

				var request = {
					script: query
				};

				SetBusy($("#modal-all"));
				Api.PostApiCall("Dashboards", "ExecuteCustomScriptQuery", request, function(event){
					
					if (event.hasErrors == true) {
					    alert("Error Getting data: " + event.error);
					} else {
						if(event.result.IsError == false){
							$scope.fkStockItemIdArr = event.result.Results;
							$scope.fkStockItemIdArr.forEach(function (linnElement){
								$scope.bufferData.every(function (csvElement){
									if (linnElement.ItemNumber == csvElement[$scope.skuIndex]){
										linnElement.requestQty = csvElement[$scope.requestQtyIndex];
										return false;
									} else return true;
								})
							});
							SetBusy($("#modal-all"), true);
							if ($scope.bufferData.length != $scope.fkStockItemIdArr.length){
								alertString = 'CSV file contain ' + $scope.bufferData.length + ' rows. But found ' +  $scope.fkStockItemIdArr.length 
								+ ' rows in Linnworks. Please check your file';
								$scope.addAlert(alertString);

								$scope.bufferData.forEach(function(element) {
									// statements
									sku = element[$scope.skuIndex];
									isExist = false;
									$scope.fkStockItemIdArr.every(function(linn_element) {

										if(sku == linn_element.ItemNumber) {
											isExist = true;
											return false;
										}
										return true;
									});
									if (!isExist){
										alertString = 'SKU: ' + sku + '  not found in linnworks';
										$scope.addAlert(alertString);
									}
								});
							}
							else{
								alertString = "Great. All SKU match to linnworks."
								$scope.addGoodAlert(alertString);
							}
						}
					}
				});

				GetData();
			};
			reader.readAsText($file);

/*
			Upload.upload({
			url: 'php-controller/upload.php',
			file: $file,
			progress: function(e){}
			}).then(function(data, status, headers, config) {
				// file is uploaded successfully
				if(data.data.Success != null){
					$scope.uploadSuccess = true;
					$scope.successMsg = data.data.Success;
				} else{
					$scope.uploadError = true;
					$scope.errorMsg = data.data.Error;
				}
	      	}); 

	      	*/
		}
	}

	function GetData(){
		if ($scope.bufferData != null){
			var currentPage = $scope.data.arrayInfo.currentPage;
			var itemsPerPage = $scope.data.arrayInfo.itemsPerPage;
			var startPoint = (currentPage - 1) * itemsPerPage;
			for (i = 0; i < itemsPerPage; i++){
				data = $scope.bufferData.slice(startPoint, startPoint + itemsPerPage);
			}
			$scope.data.arrayInfo.data = data;

		}
	}


	$scope.pageChanged = function () {
	    GetData();
	}


	$scope.$watch('selectedFromLocation', function () {
	    $scope.data.arrayInfo.currentPage = 1;
	    GetData();
	});

	function CSVToArray( strData, strDelimiter ){
		strDelimiter = (strDelimiter || ",");
		var objPattern = new RegExp(
		(
		"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
		// Quoted fields.
		"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
		// Standard fields.
		"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);
		var arrData = [[]];
		var arrMatches = null;
		while (arrMatches = objPattern.exec( strData )){
		var strMatchedDelimiter = arrMatches[ 1 ];
		if (
		strMatchedDelimiter.length &&
		strMatchedDelimiter !== strDelimiter
		){
		arrData.push( [] );
		}
		var strMatchedValue;
		if (arrMatches[ 2 ]){
		strMatchedValue = arrMatches[ 2 ].replace(
		new RegExp( "\"\"", "g" ),
		"\""
		);
		} else {
		strMatchedValue = arrMatches[ 3 ];
		}
		arrData[ arrData.length - 1 ].push( strMatchedValue );
		}
		return( arrData );
	}

	function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	Array.prototype.remove = function() {
	    var what, a = arguments, L = a.length, ax;
	    while (L && this.length) {
	        what = a[--L];
	        while ((ax = this.indexOf(what)) !== -1) {
	            this.splice(ax, 1);
	        }
	    }
	    return this;
	};

	function buildQuery(array, skuIndex){
		var SKUString = "";
		array.forEach(function(element){
			if (element != ""){
				var channelSKU = "'" + element[$scope.skuIndex] + "'";
				SKUString += channelSKU + ', ';
			}
		})
		SKUString = "(" + SKUString.slice(0, -2) + ")";
		return buildString(SKUString);

	}

	function buildString(skuString){
		return "SELECT  DISTINCT  pkStockItemId, ItemNumber FROM StockItem WHERE ItemNumber in " + skuString;
	}
}

CreateNewTransferController.$inject = ['$scope','$uibModalInstance', '$rootScope', 'data', 'Upload', 'Api'];


