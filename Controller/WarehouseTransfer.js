function WarehouseTransferModule($scope, $element) {
    var self = this;
    var transSvc = null;
    var lastTime = null;
    self.canClose = function () { }
    self.onMessage = function (msg) {
        switch (msg.key) {
            case Core.Messenger.MESSAGE_TYPES.INITIALIZE:
                Initialize();
                break;

            case "STOCK_LOCATIONS":
                $scope.locations = msg.data.result;
                LoadedLocations();
                break;
        }
    };

    $scope.selectedLocation = {};
    $scope.locations = [];
    $scope.dropDownLocations = [];
    $scope.searchTypes = [];
    $scope.selectedSearchType = null;
    $scope.searchText = "";
    $scope.isLoaded = false;
    $scope.visibleCardIDs = null;
    $scope.selectedCard = null;
    $scope.myLocation = '';
    $scope.lastLocation = '';

    $scope.lastSearchType = "";
    $scope.loadingCard = null;
    $scope.loadingCardAdditionalInfo = null;

    function Initialize() {

        // Assign the scope to the helpers so we can access data in here
        WarehouseTransfer.Helpers.Scope = $scope;
        WarehouseTransfer.Helpers.Element = $element;

        // show loading
        Core.Dialogs.BusyWorker.showBusy($element);

        $scope.searchTypes = WarehouseTransfer.Classes.Cards.SearchTypes;



        if ($scope.searchTypes.length > 0) {
            $scope.selectedSearchType = $scope.searchTypes[0];
        }

        //Services.WarehouseTransferService.GetActiveTransfersForLocation

        transSvc = new Services.WarehouseTransferService(self.options);
        WarehouseTransfer.Helpers.transSvc = transSvc;

        transSvc.GetServerTime(function (event) {
            if (event.hasErrors() == false) {
                WarehouseTransfer.Classes.Time.CalculateOffset(event.result);
                lastTime = new Date();
                //$scope.pullUpdates();
            }
            else {
                serverTimeOffset = null;
            }
        });

        // Load stock locations
        Core.DataKeeper.getData(self.options, "STOCK_LOCATIONS", {}, true);

    }

    $scope.isLocationVisible = function (locationName) {
        // My location always visible (when it's in the list)
        if (locationName == $scope.myLocation) {
            return 1;
        }

        // Selected location always visible 
        if (locationName == $scope.selectedLocation.LocationName) {
            return 1;
        }

        // Check other locations for cards to work out whether or not to display them
        for (var i = 0; i < $scope.cards.length; ++i) {
            if ($scope.cards[i].FromLocation == locationName || $scope.cards[i].ToLocation == locationName) {
                if ($scope.visibleCardIDs == null || $scope.visibleCardIDs.Contains($scope.cards[i].PkTransferId)) {
                    return 1;
                }
            }
        }
        return 0;
    }

    $scope.getCards = function (locationName, columnNumber) {
        if ($scope.cards == null) {
            return [];
        }
        var tmp = [];
        for (var i = 0; i < $scope.cards.length; ++i) {
            // TODO: Fix visible
            if (($scope.cards[i].FromLocation == locationName || $scope.cards[i].ToLocation == locationName)
                && CalculateColumn(locationName, $scope.cards[i]) == columnNumber
                && $scope.cards[i].nStatus != WarehouseTransfer.Classes.Cards.CardStates.Delivered
                && $scope.cards[i].BLogicalDelete != true) {

                if ($scope.visibleCardIDs == null || $scope.visibleCardIDs.contains($scope.cards[i].PkTransferId)) {
                    tmp.push($scope.cards[i]);
                }

            }
            //if (((columnNumber == 0 && $scope.cards[i].FromLocation == locationName && $scope.cards[i].nStatus != 5)
            //    || (columnNumber == 2 && $scope.cards[i].ToLocation == locationName && $scope.cards[i].nStatus != 5)
            //    || (columnNumber == 1 && $scope.cards[i].nStatus == 5 && ($scope.cards[i].ToLocation == locationName || $scope.cards[i].FromLocation == locationName)))
            //        && $scope.cards[i].nStatus != WarehouseTransfer.Classes.Cards.CardStates.Delivered
            //        && $scope.cards[i].BLogicalDelete != true) {
            //    if ($scope.visibleCardIDs == null || $scope.visibleCardIDs.Contains($scope.cards[i].PkTransferId)) {
            //        tmp.push($scope.cards[i]);
            //    }
            //}
        }

        tmp.sort(function (a, b) {
            if (a.OrderDate == b.OrderDate) {
                return 0;
            }
            else if (a.OrderDate < b.OrderDate) {
                return -1;
            }
            else if (a.OrderDate > b.OrderDate) {
                return 1;
            }
        });
        return tmp;
    }

    $scope.getLocations = function () {
        if ($scope.selectedLocation.StockLocationId != null) {
            return [$scope.selectedLocation];
        }

        return $scope.locations;
        //// Sort the location list - put our location at the top
        //var tmp = $scope.locations.valueOf();
        //tmp.sort(locationSort);

        //return tmp;
    }

    function locationSort(a, b) {
        if (a.LocationName == $scope.myLocation) {
            return -1;
        }
        else if (b.LocationName == $scope.myLocation) {
            return 1;
        }
        else if (a.LocationName == b.LocationName) {
            return 0;
        }
        else if (a.LocationName < b.LocationName) {
            return -1;
        }
        else if (a.LocationName > b.LocationName) {
            return 1;
        }
    };

    $scope.getDirection = function (locationName, card) {
        if (card.nStatus != WarehouseTransfer.Classes.Cards.CardStates.CheckingIn && card.nStatus != WarehouseTransfer.Classes.Cards.CardStates.InTransit) {
            return 0;
        }

        return CalculateDirection(locationName, card);
    }

    $scope.getButtonType = function (locationName, columnIndex) {
        if (columnIndex == 1) {
            return 0;
        }

        //var myLoc = (locationName == $scope.myLocation ? 1 : 0);

        //if (myLoc) {
        //    if (columnIndex == 0) {
        //        return 1;
        //    }
        //    else if (columnIndex == 2) {
        //        return 2;
        //    }
        //}
        //else {
        //    if (columnIndex == 0) {
        //        return 4;
        //    }
        //    else if (columnIndex == 2) {
        //        return 3;
        //    }
        //}

        if (columnIndex == 0) {
            return 1;
        }
        else if (columnIndex == 2) {
            return 2;
        }
    }

    // Handle locations
    function LoadedLocations() {
        // Get my location name and assign to cards object
        var LocationId = '00000000-0000-0000-0000-000000000000';
        var clientElement = $("#linnworksClientTag");
        LocationId = clientElement != null && clientElement.length > 0 ? clientElement.attr("location") : LocationId;
        $scope.myLocation = WarehouseTransfer.Helpers.nameByPkStockLocationId(LocationId);


        for (var i = $scope.locations.length - 1; i > 0; --i) {
            if ($scope.locations[i].IsFulfillmentCenter) {
                $scope.locations.splice(i, 1);
            }
        }

        // Sort Locations
        $scope.locations.sort(locationSort);

        // Set the selected location to my location
        $scope.selectedLocation = $scope.locations.findLambda(function (loc) { return loc.LocationName == $scope.myLocation; });

        // If this has failed, find the first location and use that
        if ($scope.selectedLocation == null && $scope.locations.length > 0) {
            $scope.selectedLocation = $scope.locations[0];
        }

        $scope.dropDownLocations = $scope.locations.distinct();
        // If we have more than one location
        if ($scope.dropDownLocations.length > 1)
            $scope.dropDownLocations.splice(0, 0, {
                StockLocationId: null,
                LocationName: Core.Localization.translateKey(self.options, "allLocations")
            });


        $scope.cards = [];
        LoadCardsByLocation($scope.selectedLocation.LocationName, $scope.selectedLocation.StockLocationId, false);
    }

    function CheckLoadComplete() {
        if ($scope.locations.length == 0) {
            return;
        }

        Core.Dialogs.BusyWorker.hideBusy($element);
        if ($scope.isLoaded) {
            $scope.$apply();
            return;
        }
        $scope.isLoaded = true;

        $scope.$apply();



        //$("#dropzone").droppable({
        //    accept: ".card",
        //    tolerance: "pointer",
        //    activeClass: "showBin",
        //    drop: function (event, ui) {

        //        alert("score!");

        //    }
        //});

        //$("#dropzone").hide();
    }

    $scope.selectLocation = function () {
        LoadCardsByLocation($scope.selectedLocation.LocationName, $scope.selectedLocation.StockLocationId, $scope.selectedLocation.StockLocationId == null);
    }

    //SEARCH -------------------------

    $scope.onKeyPress = function (e) {
        if (e.which == 13) {
            performSearch();
        }
    }

    $scope.selectSearchType = function (searchType) {
        $scope.selectedSearchType = searchType;
    }

    // Returns transfer ID guids or null
    function search(searchType, searchText, callback) {
        if (searchText.trim() == "") {
            callback(null);
            return;
        }

        var opts = { message: "Searching..." };
        opts.element = $element;
        Core.Dialogs.BusyWorker.showBusy(opts);


        var resultMethod = function (event) {
            if (event.hasErrors() == false) {
                callback(event.result);
            }
            else {
                Core.Dialogs.addNotify(event.error.errorMessage, "ERROR");
            }
        };

        transSvc.SearchTransfersAllLocations(searchType, searchText, resultMethod);
    }

    $scope.performSearch = function () {
        performSearch();
    }

    // Filter using search
    function performSearch() {
        search($scope.selectedSearchType.value, $scope.searchText, function (newCardIDs) {


            var oldCardIDs = $scope.visibleCardIDs;

            if (newCardIDs == null) {
                $scope.visibleCardIDs = null;
                if (!$scope.$$phase)
                    $scope.$apply();
                return;
            }

            var cardsToLoad = [];
            for (var i = 0; i < newCardIDs.length; ++i) {
                if ($scope.cards.findLambda(function (x) { return x.PkTransferId == newCardIDs[i]; }) == null) {
                    cardsToLoad.push(newCardIDs[i]);
                }
            }

            $scope.visibleCardIDs = newCardIDs;
            if (cardsToLoad.length > 0) {
                transSvc.GetListTransfers(cardsToLoad, LoadedCards);
            }
            else {
                if (!$scope.$$phase)
                    $scope.$apply();
            }

            var opts = { message: "Searching..." };
            opts.element = $element;
            Core.Dialogs.BusyWorker.hideBusy(opts);
        });
    }

    //----------------------

    $scope.isMyLocation = function (location) {
        if (typeof location == "object" && location.LocationName == $scope.myLocation) {
            return true;
        }
        else if (typeof location == "string" && location == $scope.myLocation) {
            return true;
        }
        else {
            return false;
        }
    }

    function PromptLocation(event, from, to) {

        var tmp = $scope.locations.distinct();
        //tmp.remove(tmp.findLambda(function (l) { return l.LocationName == $scope.myLocation; }));
        tmp.remove(tmp.findLambda(function (l) { return l.LocationName == from || l.LocationName == to; }));

        var ctrl = new Core.Control({
            data: { locations: tmp, mess: Core.Localization.translateKey(self.options, "Please select the location to transfer stock " + (from == '' ? 'from' : 'to')) },
            element: event.target,
            position: "TOP",
            moduleName: "WarehouseTransfer",
            controlName: "LocationSelect"
        }, self.options);
        ctrl.onGetEvent = function (event) {

        };

        ctrl.onControlClosed = function (event) {
            switch (event.action) {
                case "CONFIRM":
                    if (from == '') {
                        from = event.result.LocationName;
                    }
                    else if (to == '') {
                        to = event.result.LocationName;
                    }

                    $scope.createTransfer(event, from, to);
                    break;
                case "CLOSE":
                    // Do nothing
                    break;
            }
        };
        ctrl.open();
    }

    $scope.createTransfer = function (event, from, to) {
        //if (from != $scope.myLocation && to != $scope.myLocation) {
        //    return;
        //}

        if ($scope.locations.length < 2) {
            Core.Dialogs.warning({
                //message: '<div style="text-align: center !important;">' + Core.Localization.translateKey(self.options, "You only have one non-fulfilment location. As such, you are not able to create any transfers.<br><br>Please create a new location and try again.") + '</div>',
                message: Core.Localization.translateKey(self.options, "You only have one non-fulfilment location. As a result, you are not able to create any transfers. Please create a new location and try again."),
                title: Core.Localization.translateKey(self.options, "No additional locations")
            }, self.options);
            return;
        }

        from = (from == null ? '' : from);
        to = (to == null ? '' : to);

        if (from == '' || to == '') {
            PromptLocation(event, from, to);
            return;
        }

        var fromId = WarehouseTransfer.Helpers.pkStockLocationIdByName(from);
        var toId = WarehouseTransfer.Helpers.pkStockLocationIdByName(to);

        transSvc.CheckForDraftTransfer(toId, fromId, function (result) {
            if (result.hasErrors() == false) {
                if (result.result == '00000000-0000-0000-0000-000000000000') {
                    createTransfer_Internal(fromId, toId);
                }
                else {
                    Core.Dialogs.question({
                        message: "A draft transfer already exists between these locations. Do you want to edit the existing transfer?",
                        title: "Edit existing transfer?",
                        callback: function (event) {
                            switch (event.action) {
                                case "YES":
                                    $scope.viewCard(result.result);
                                    break;

                                default:
                                    createTransfer_Internal(fromId, toId);
                                    break;

                            }
                        }
                    }, self.options);

                }
            }
            else {
                createTransfer_Internal(fromId, toId);
            }
        });
    }

    function createTransfer_Internal(fromId, toId) {
        transSvc.CreateNewTransferRequest(fromId, toId, function (event) {
            if (event.hasErrors() == false) {
                event.result.isNewCard = true;
                $scope.cards.push(event.result);
                $scope.viewCard(event.result.PkTransferId);
                $scope.$apply();
            }
            else {
                Core.Dialogs.addNotify(event.error.errorMessage, "ERROR");
            }
        });
    }

    $scope.openWindow = function (winName) {

        // get current scroll position
        var doc = document.documentElement, body = document.body;
        var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
        var top = (doc && doc.scrollTop || body && body.scrollTop || 0);

        var win = new Core.Window({
            moduleName: "WarehouseTransfer",
            windowName: winName,
            title: "",
            builtIn: $element,
            data: $scope.locations
        }, self.options);
        win.onWindowClosed = function (event) {
            switch (event.action) {
                default:
                    // scroll back to original position
                    $element.find("#WarehouseTransferModuleContainer").css({ "display": "block" });
                    window.scrollTo(left, top);
                    break;
            }
        };
        win.open();
    }

    $scope.viewCard = function (PkTransferId, additionalInfo, element, openedByArchive) {
        if (!element) {
            element = $element;
        }
        var card = $scope.cards.findLambda(function (x) { return x.PkTransferId == PkTransferId; });
        $scope.selectedCard = card;

        if ($scope.selectedCard == null || openedByArchive) {
            $scope.loadingCard = PkTransferId;
            $scope.loadingCardAdditionalInfo = additionalInfo;
            transSvc.GetListTransfers([PkTransferId], LoadedCards);
            return;
        }

        var handleShowCard = function (innerCard) {

            // get current scroll position
            var doc = document.documentElement, body = document.body;
            var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
            var top = (doc && doc.scrollTop || body && body.scrollTop || 0);

            // scrolling is done within EditTransfer as it will occur after EditTransfer loads and not be noticed by the user.

            var winName = "";

            if (innerCard.BLogicalDelete == false) {
                switch (innerCard.nStatus) {
                    default:
                    case WarehouseTransfer.Classes.Cards.CardStates.Draft:
                    case WarehouseTransfer.Classes.Cards.CardStates.Request:
                        winName = "EditTransfer";
                        break;
                    case WarehouseTransfer.Classes.Cards.CardStates.Packing:
                    case WarehouseTransfer.Classes.Cards.CardStates.Accepted:
                    case WarehouseTransfer.Classes.Cards.CardStates.InTransit:
                    case WarehouseTransfer.Classes.Cards.CardStates.CheckingIn:
                        winName = "PackTransfer";
                        break;
                    case WarehouseTransfer.Classes.Cards.CardStates.Delivered:
                        winName = "DeliveredTransfer";
                        break;
                }
            }
            else {
                winName = "DeliveredTransfer";
            }

            var win = new Core.Window({
                moduleName: "WarehouseTransfer",
                windowName: winName,
                title: "",
                builtIn: element,
                data: [innerCard, null, $scope.locations, additionalInfo]
            }, self.options);
            win.onWindowClosed = function (event) {
                switch (event.action) {
                    default:
                        // scroll back to original position
                        window.scrollTo(left, top);
                        $element.find("#WarehouseTransferModuleContainer").css({ "display": "block" });
                        $scope.selectedCard = null;
                        CheckDeleteTransfer(card);
                        break;
                }
            };
            win.open();
        };

        if ($scope.loadingCard != null && $scope.loadingCard == PkTransferId) {
            handleShowCard(card);
        } else {
            // Check we have the most up to date transfer info
            transSvc.GetListTransfers([PkTransferId], function (event) {
                if (event.hasErrors() == false) {
                    // Transfer must've been deleted
                    if (event.result.length == 0) {
                        card.BLogicalDelete = true;
                        if (!$scope.$$phase) {
                            $scope.$apply();
                            return;
                        }
                    }
                    var innerCard = event.result[0];
                    handleShowCard(innerCard);
                    // Update transfer
                    setTimeout(function () {
                        var madeChanges = false;
                        for (var attribute in card) {
                            if (card[attribute] != event.result[0][attribute]) {
                                card[attribute] = event.result[0][attribute];
                                madeChanges = true;
                            }
                        }

                        if (!$scope.$$phase && madeChanges) {
                            $scope.$apply();
                        }
                    }, 1000);
                }
                else {

                }
            });
        }
    }

    function CheckDeleteTransfer(srcCard) {
        var card = $scope.cards.findLambda(function (x) { return x.PkTransferId == srcCard.PkTransferId; });
        if (card == null || card.nStatus != WarehouseTransfer.Classes.Cards.CardStates.Draft || card.isNewCard == undefined || card.isNewCard == null || card.isNewCard == false) {
            if (card == null)
                return;
            else {
                if (card.NumberOfItems > 0)
                    return;
            }
        }
        card.isNewCard = false;

        transSvc.IsDraftTransferChanged(card.PkTransferId, function (result) {
            if (result.hasErrors() == false && result.result == false) {

                Core.Dialogs.question({
                    message: "Do you want to delete this empty transfer?",
                    title: "Delete transfer?",
                    callback: function (event) {
                        switch (event.action) {
                            case "YES":
                                transSvc.DeleteEmptyDraftTransfer(card.PkTransferId, function (event) {
                                    if (event.hasErrors() == false) {
                                        $scope.deleteCardsByIDs([card.PkTransferId]);
                                        if (!$scope.$$phase) {
                                            $scope.$apply();
                                        }
                                    }
                                    else {
                                        Core.Dialogs.addNotify(event.error.errorMessage, "ERROR");
                                    }
                                });
                                break;

                            case "CLOSE":
                                return;
                                break;
                        }
                    }
                }, self.options);

            }
            else if (result.hasErrors()) {
                Core.Dialogs.addNotify(result.error.errorMessage, "ERROR");
            }
        });
    }

    $scope.deleteCardsByIDs = function (cardIDArray) {
        for (var i = 0; i < cardIDArray.length; ++i) {
            for (var j = 0; j < $scope.cards.length; ++j) {
                if ($scope.cards[j].PkTransferId == cardIDArray[i]) {
                    $scope.cards.splice(j, 1);
                    break;
                }
            }
        }
    }

    function CalculateColumn(cardLocation, card) {
        var status = card.nStatus;
        if (status >= WarehouseTransfer.Classes.Cards.CardStates.InTransit) {
            return 1;
        }

        if (cardLocation == card.FromLocation) {
            return 0;
        }
        else {
            return 2;
        }
    }

    function CalculateDirection(cardLocation, card) {
        var status = card.nStatus;

        if (status == WarehouseTransfer.Classes.Cards.CardStates.CheckingIn || status == WarehouseTransfer.Classes.Cards.CardStates.InTransit) {
            if (cardLocation == card.FromLocation) {
                return -1;
            }
            else if (cardLocation == card.ToLocation) {
                return 1;
            }
        }

        return 0;
    }

    function LoadCardsByLocation(locationName, pkStockLocationId, bAllLocations) {

        if ($scope.cards == null) {
            return;
        }

        // does sweet f/a at the moment
        var lastLocation = $scope.lastLocation.valueOf();
        if (locationName == lastLocation) {
            return;
        }
        $scope.lastLocation = locationName.valueOf();

        Core.Dialogs.BusyWorker.showBusy($element);

        if (bAllLocations) {
            transSvc.GetActiveTransfersAllLocations(LoadedCards);
        } else {
            transSvc.GetActiveTransfersForLocation(pkStockLocationId, LoadedCards);
        }

        Core.Dialogs.BusyWorker.hideBusy($element);
    }

    $scope.pullUpdates = function () {

        transSvc.GetModifiedBasic(WarehouseTransfer.Classes.Time.ToServerTime(lastTime), LoadedCards);
        lastTime = new Date();

        //setTimeout($scope.pullUpdates, 60000);
    }

    $scope.getLocalDate = function (date) {
        return WarehouseTransfer.Classes.Time.GetLocalDate(date);
    }

    function LoadedCards(event) {
        if (event.hasErrors() == false) {
            for (var i = 0; i < event.result.length; ++i) {
                var scopeCard = $scope.cards.findLambda(function (x) { return x.PkTransferId == event.result[i].PkTransferId; });

                // Create
                if (scopeCard == null) {
                    $scope.cards.push(event.result[i]);
                }
                else { // Update
                    //scopeCard.FromLocation = event.result[i].FromLocation;
                    //scopeCard.ToLocation = event.result[i].ToLocation;
                    //scopeCard.NumberOfItems = event.result[i].NumberOfItems;
                    //scopeCard.nStatus = event.result[i].nStatus;
                    //scopeCard.ReferenceNumber = event.result[i].ReferenceNumber;
                    for (var attribute in scopeCard) {
                        scopeCard[attribute] = event.result[i][attribute];
                    }
                }

                if ($scope.loadingCard == event.result[i].PkTransferId) {
                    $scope.viewCard(event.result[i].PkTransferId, $scope.loadingCardAdditionalInfo);
                    $scope.loadingCard = null;
                    $scope.loadingCardAdditionalInfo = null;
                }
            }
            //$scope.cards = $scope.cards.concat(event.result);
            //$scope.cards = $scope.cards.distinct();
        }
        else {

        }

        CheckLoadComplete();
    }
}