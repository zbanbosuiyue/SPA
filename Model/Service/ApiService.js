var ApiService = function ($http) {
    baseURL = "https://us.linnworks.net//api/";
    appId = "2abb5f32-76d3-4875-96c8-b81377c830dc";
    appSecret = "ec16ba28-2b70-42c0-8345-087942528f64";
    token = "cc759b0b7d564d3d03f54f7187a2598e";

    this.GetApiCall = function (controllerName, methodName, callback) {
        var AuthToken = this.AuthToken;

        return $http.get(`${baseURL}${controllerName}/${methodName}`).then(function success(res){
            console.log(res);
            var event = {
                result: res.data,
                hasErrors: false
            };
            return event;
        }, function error(res){
            if (res.data){
                if (res.data.Message.includes("Token")){
                    AuthToken().then(function(event){
                        var token = event.result.Token;
                        localStorage.setItem('token', token);
                        location.reload();
                    })
                }
            }
            var event = {
                result: "",
                hasErrors: true,
                error: res
            };
            return event;
        });
    }

    this.PostApiCall = function (controllerName, methodName, obj, callback) {

        return $http.post(`${baseURL}${controllerName}/${methodName}`, this.transFromRequest(obj)).then(function success(res){
            var event = {
                result: res.data,
                hasErrors: false
            };
            return event;
        }, function error(res){
            var event = {
                result: "",
                hasErrors: true,
                error: res
            };
            return event;
        });
    };


    this.SpecialPostApiCall = function (controllerName, methodName, obj, callback) {

        return $http.post(`${baseURL}${controllerName}/${methodName}`, obj).then(function success(res){
            var event = {
                result: res.data,
                hasErrors: false
            };
            return event;
        }, function error(res){
            var event = {
                result: "",
                hasErrors: true,
                error: res
            };
            return event;
        });
    };



    this.AuthToken = function () {
        var request = {
            applicationId: appId,
            applicationSecret: appSecret,
            token: token
        }

        return $http.post(`https://api.linnworks.net//api/Auth/AuthorizeByApplication`, transFromRequest(request)).then(function success(res){
            var event = {
                result: res.data,
                hasErrors: false
            };
            return event;
        }, function error(res){
            var event = {
                result: "",
                hasErrors: true,
                error: res
            };
            return event;
        });
    }

    this.transFromRequest = function(obj){
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }

    transFromRequest = function(obj){
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }

}