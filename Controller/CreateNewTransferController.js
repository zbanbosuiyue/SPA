var CreateNewTransferController = function ($scope, $uibModalInstance, data, Upload, Api) {

	$scope.locations = data.toLocations;
	$scope.selectedToLocation = $scope.locations[0];
	$scope.fromLocation = data.fromLocation;

	$scope.data = {
		arrayInfo : {
			titles : null,
			currentPage: 1,
			itemsperpage: 10,
			data : []
		}
	};

	$scope.changeToLocation = function (loc) {
		$scope.selectedToLocation = loc;
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.submit= function (){
		var request1 = {
			fromLocationId : $scope.fromLocation.StockLocationId,
			toLocationId : $scope.selectedToLocation.StockLocationId
		}

		SetBusy($("#modal-body"));

		Api.PostApiCall("WarehouseTransfer", "CreateTransferRequestWithReturn", request1, function (createTransferEvent) {
		    SetBusy($("#modal-body"), true);
		    if (createTransferEvent.hasErrors == true) {
		        alert("Error Getting data: " + createTransferEvent.error);
		    } else {
		    	if(createTransferEvent.result.PkTransferId != null){
		    		$scope.fkStockItemIdArr.forEach(function(element){
		    			var request2 = {
		    				fkTransferId: createTransferEvent.result.PkTransferId,
		    				pkStockItemId: element.fkStockItemId
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
				$scope.bufferData = arrayBuffer;

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

				SetBusy($("#modal-body"));
				Api.PostApiCall("Dashboards", "ExecuteCustomScriptQuery", request, function(event){
					SetBusy($("#modal-body"), true);
					if (event.hasErrors == true) {
					    alert("Error Getting data: " + event.error);
					} else {
						if(event.result.IsError == false){
							$scope.fkStockItemIdArr = event.result.Results;
							$scope.fkStockItemIdArr.forEach(function (linnElement){
								$scope.bufferData.every(function (csvElement){
									if (linnElement.ChannelSKU == csvElement[$scope.skuIndex]){
										linnElement.requestQty = csvElement[$scope.requestQtyIndex];
										return false;
									} else return true;
								})
							});
							console.log($scope.fkStockItemIdArr);
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
			var itemsperpage = $scope.data.arrayInfo.itemsperpage;
			var startPoint = (currentPage - 1) * itemsperpage;
			for (i = 0; i < itemsperpage; i++){
				data = $scope.bufferData.slice(startPoint, startPoint + itemsperpage);
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
		return "SELECT  DISTINCT  fkStockItemId, ChannelSKU FROM Stock_ChannelSKU WHERE ChannelSKU in " + skuString;
	}
}

CreateNewTransferController.$inject = ['$scope','$uibModalInstance', 'data', 'Upload', 'Api'];


