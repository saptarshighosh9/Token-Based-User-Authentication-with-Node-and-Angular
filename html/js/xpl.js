angular.module('jwtAuthapp',['ui.router','angular-storage','angular-jwt'
]).config(['$stateProvider','$urlRouterProvider','$httpProvider','jwtInterceptorProvider',function($stateProvider,$urlRouterProvider,$httpProvider,jwtInterceptorProvider){
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    jwtInterceptorProvider.tokenGetter = function(store){
        return store.get('jwt');
    }
    $httpProvider.interceptors.push('jwtInterceptor');
    $urlRouterProvider.otherwise("/login");
	$stateProvider
    .state('login',{
        url: '/login',
        templateUrl: 'views/login.html',
        controller : 'loginregCtrl'
    })    
    .state('home',{
        url: '/home',
        templateUrl: 'views/home.html'
    });   
}]).run(['$rootScope','$http',function($rootScope,$http){
    console.log("Angular Modules Loaded Successfully");
}]).controller('headerCtrl',['store','$scope','$rootScope','$state',function(store,$scope,$rootScope,$state){
    $rootScope.allownav=true;
}]).controller('homeCtrl',['store','$rootScope','$scope','$http','$state','$stateParams',function(store,$rootScope,$scope,$http,$state,$stateParams){
    $rootScope.allownav=true;
    window.scrollTo(0, 0);
    function getprofile() {
        $http({
            method : 'GET',
            url :  "http://localhost:8080/profile"
        }).success(function(data,status){
            if(data.message == "success"){
                $rootScope.isauth=true;
                $scope.profiledata = data;
            }else{
                $rootScope.isauth=false;
            }
        }).error(function(data,status){
            $rootScope.isauth=false;
        });
    };
    $scope.logout = function(){
        store.remove('jwt');
        $rootScope.isauth=false;
        $state.go('login');
    };
    getprofile();
}]).controller('loginregCtrl', ['$rootScope','$scope','$http','$state','$stateParams','store','jwtHelper',function($rootScope,$scope,$http,$state,$stateParams,store,jwtHelper){
    $rootScope.allownav=false;
    window.scrollTo(0, 0);
    $scope.logint=true;
    $scope.reg=false;
    $scope.login = function(){
        angular.element( document.querySelector( '#loginbtn' ) ).addClass('disabled'); 
        $scope.loginerr=false;
        $http({
            method : 'POST',
            url    :  "http://localhost:8080/login",
            data : {
                username :  this.loginemail,
                password :  this.loginpassword
            }
        }).success(function(data,status){
            if(data.message == "success"){
                store.set('jwt',data.id_token);
                $rootScope.isauth=true;
                if($state.current.name=='login'){
                    $state.go('home',{},{reload:true});   
                };
            }else{
                $rootScope.isauth=false;
                $scope.loginerr=true;   
                angular.element( document.querySelector( '#loginbtn' ) ).removeClass('disabled'); 
            }
        }).error(function(data,status){
          $rootScope.isauth=false;
          $scope.loginerr=true;
            angular.element( document.querySelector( '#loginbtn' ) ).removeClass('disabled'); 
        });
    };
    $scope.regerr=false;
    $scope.user = {};
    $scope.register=function(){
        angular.element( document.querySelector( '#usersignup' ) ).addClass('disabled'); 
        $http({
            method : 'POST',
            url    : "http://localhost:8080/signup",
            data   : {
                "user" : $scope.user
            }
        }).success(function(data, status, headers, config){
            if(data.message=="success"){
                store.set('jwt',data.id_token);
                console.log(data.id_token);
                $state.go('home',{},{reload:true});
            }else{
                $scope.regerr=true;
                angular.element( document.querySelector( '#usersignup' ) ).removeClass('disabled'); 
            };
        }).error(function(data,status){
            $scope.regerr=true;
            angular.element( document.querySelector( '#usersignup' ) ).removeClass('disabled'); 
        });
    };
    $scope.registershow = function(){
        $scope.logint=false;
        $scope.reg = true;
    };
    $scope.registerhide = function(){
        $scope.logint=true;
        $scope.reg = false;
    };
    /* Main Login checker */
    function getloginstat() {
        if(store.get('jwt') && !jwtHelper.isTokenExpired(store.get('jwt'))){
            $http({
                method : 'POST',
                url :  "http://localhost:8080/loginstat"
            }).success(function(data,status){
                if(data.message == "success"){
                    $rootScope.isauth=true;
                    $rootScope.userpname=data.username;
                    if($state.current.name=='login'){
                        $state.go('home',{},{reload:true});   
                    };
                }else{
                    $scope.checkinglogedin = false;
                }
            }).error(function(data,status){
                $scope.checkinglogedin = false;
            });
        }else{
            $scope.checkinglogedin = false;
            angular.element( document.querySelector( '#loginbtn' ) ).addClass('enabled'); 
        }
    };
    getloginstat();  
}]);


