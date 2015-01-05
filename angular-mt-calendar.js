/*
 * mt-calendar
 * https://github.com/MangoTools/mt-calendar

 * Version:
 * License: MIT
 *
 * require moment.js
 */
'use strict';

angular.module('angular.mt.calendar', [])
    .directive('mtCalendar', [ function() {
        return {
            restrict: 'AE',
            scope: {
                model:'=ngModel',
                lastSelection:'=',
                config: '='
            },
            replace: true,
            template:
                '<div class="mt-calendar">' +
                '   <div class="mg-header">' +
                '       <h2 class="mg-title-left"><a class="previews-month" ng-click="gotoPreviewsMonth($event)">&laquo; </a></h2>' +
                '       <h2 class="mg-title-right"><a class="next-month" ng-click="gotoNextMonth($event)"> &raquo;</a></h2>' +
                '       <div class="mg-title"><h2>{{base.format(\'MMMM YYYY\')}}</h2></div>' +
                '   </div>' +
                '   <div class="mg-body">' +
                '       <table ng-style="{{tableStyle}}">' +
                '           <thead><tr><th ng-repeat="header in headers">{{header}}</th></tr></thead>' +
                '           <tbody>' +
                '               <tr ng-repeat="week in model.weeks" class="mg-week" ng-class="week.class">' +
                '                   <td ng-repeat="day in week.days" class="mg-day" ng-class="day.class" ng-click="onClick($event, day, week, $index)">' +
                '                       <div><div class="mg-number">{{day.date.date()}}</div></div>' +
                '                       <div class="mg-day-text" ng-bind-html="day.text"></div>' +
                '                       <div class="mg-week-text" ng-if="$first" ng-bind-html="week.text"></div>' +
                '                   </td>' +
                '               </tr>' +
                '           </tbody>' +
                '       </table>' +
                '   </div>' +
                '</div>',

            link: function postLink(scope, element) {
                if(angular.isFunction(window.$)){ // If jquery available
                    $(element).disableSelection();
                }
            },
            controller: function($scope, $element){

                $scope.config.firstDayOfWeek = $scope.config.firstDayOfWeek || 1;
                $scope.config.minHeight = $scope.config.minHeight || '300px';
                $scope.config.singleSelect = $scope.config.singleSelect || false;
                $scope.config.goToSelection = $scope.config.goToSelection || false;

                $scope.firstDayOfWeek=$scope.config.firstDayOfWeek;
                $scope.lastDayOfWeek=($scope.firstDayOfWeek+6)%7;

                $scope.tableStyle = {'min-height':$scope.config.minHeight};

                $scope.lastSelected = null;

                $scope.headers=[];//'sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
                for(var i=$scope.firstDayOfWeek; i<$scope.firstDayOfWeek+7; i++){
                    $scope.headers.push(moment().day(i%7).format("ddd"));
                }

                var now = moment.utc();

                //if it's a single date-picker, go directly to this date and not to today
                if($scope.config.goToSelection && angular.isDefined($scope.lastSelection) && angular.isDefined($scope.lastSelection._isAMomentObject)){
                    $scope.base = moment.utc({y: $scope.lastSelection.year(), M: $scope.lastSelection.month(), d: 1});
                }
                else{
                    $scope.base = moment.utc({y:now.year(), M:now.month(), d:1});
                }
                $scope.$watch('lastSelection', function(){
                    if($scope.config.goToSelection && angular.isDefined($scope.lastSelection) && angular.isDefined($scope.lastSelection._isAMomentObject)){
                        $scope.base = moment.utc({y: $scope.lastSelection.year(), M: $scope.lastSelection.month(), d: 1});
                    };
                });
                var updateTable = function(base){

                    var firstMonthDay = moment.utc(base);

                    // First week that include the first day of the month
                    var firstDay = moment.utc(firstMonthDay);
                    if(firstDay.day()!==$scope.firstDayOfWeek){
                        firstDay.day($scope.firstDayOfWeek).subtract(7, 'd');
                    }

                    // Last day of the month
                    var lastMonthDay = moment.utc(base).endOf('month');
                    // Last day of the week that include the last day of the month
                    var lastDay = moment.utc(lastMonthDay).day(($scope.firstDayOfWeek+6)%7); // End on friday

                    $scope.model.firstDay=firstDay;
                    $scope.model.lastDay=lastDay;
                    $scope.model.firstMonthDay=firstMonthDay;
                    $scope.model.lastMonthDay=lastMonthDay;
                    $scope.model.weeks=[];
                    $scope.model.isReady=false;

                    for(var i=moment.utc(firstDay); i.isBefore(lastDay); i.add(7,'d')) { // For each week

                        var firstWeekDay = moment.utc(i);
                        var nextWeekDay = moment.utc(i).add(7,'d');

                        var customWeekClass={};

                        customWeekClass['selectable']= true;   // Selectable par default
                        customWeekClass['selected']= false;

                        var week={
                            date: firstWeekDay,
                            class: customWeekClass,
                            text:'',
                            days:[]
                        };

                        for(var j=moment.utc(firstWeekDay); j.isBefore(nextWeekDay); j.add(1,'d')){

                            var customDayClass={};

                            customDayClass['selectable']= false;
                            customDayClass['selected']= false;
                            customDayClass['otherMonth']= false;
                            customDayClass['today']= false;

                            if(j.isBefore(firstMonthDay) || j.isAfter(lastMonthDay)){
                                customDayClass['otherMonth']=true;
                            }
                            if(j.isSame(now, 'day')){
                                customDayClass['today']=true;
                            }

                            week.days.push({
                                date: moment.utc(j),
                                text:'',
                                class: customDayClass
                            });
                        }
                        $scope.model.weeks.push(week);
                        $scope.model.isReady = true;
                    }

                    //console.log('calendarData: ' + angular.isDefined($scope.model));

                    if(angular.isFunction($scope.config.onTableUpdate)){
                        $scope.config.onTableUpdate($scope.model);
                    }
                };

                $scope.$watch('base | json', function(){
                    updateTable($scope.base);
                });

                $scope.gotoPreviewsMonth = function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    if($scope.config.canGoBeforeToday || moment.utc().isBefore(moment.utc($scope.base), 'months')){
                        $scope.base.subtract(1, 'months');
                    }
                }
                $scope.gotoNextMonth = function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    $scope.base.add(1, 'months');
                }

                $scope.onClick = function(event, day, week, dayIndex){
                    event.preventDefault();
                    event.stopPropagation();

                    if(day.class.selectable===false && week.class.selectable===false){
                        return;
                    }

                    if(day.class.selectable){
                        day.class['selected'] = !day.class['selected'];
                    }

                    if(week.class.selectable){
                        week.class['selected'] = !week.class['selected'];
                    }

                    if(angular.isFunction($scope.config.onDayClick)){
                        $scope.config.onDayClick(day, week, dayIndex);
                    }

                    if($scope.config.singleSelect && $scope.lastSelected!==null){
                        if(day.class['selected'] || week.class['selected']){
                            $scope.lastSelected.class['selected'] = false;
                        }
                    }

                        // In case of modifications
                    if(day.class.selectable){
                        if(day.class['selected']){
                            $scope.lastSelected = day;
                        }
                        else{
                            $scope.lastSelected = null;
                        }
                    }
                    else if(week.class.selectable){
                        if(week.class['selected']){
                            $scope.lastSelected = week;
                        }
                        else{
                            $scope.lastSelected = null;
                        }
                    }

                }
            }
        };
    }])
    .directive('mtDateFilter', [ function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelController) {
                var mangoDateFilter = attrs.mangoDateFilter || "DD-MM-YYYY";
    /*
                ngModelController.$parsers.push(function(data) {
                    //convert data from view format to model format
                    return data; //converted
                });
    */

                ngModelController.$formatters.push(function(data) {
                    //convert data from model format to view format
                    if(!angular.isDefined(data)){
                        return data;
                    }
                    if(angular.isFunction(data.format))
                        return data.format(mangoDateFilter); //converted
                    else
                        return moment.utc(data).format(mangoDateFilter); //converted
                });
            }
        }
    }])
    .directive('mtDatePicker', ['$document', function($document) {
        return {
            restrict: 'AE',
            scope: {
                model:'=ngModel',
                config: '=',
                isOpen: '=',
                dateDisabled: '&'
            },
            replace:true,
            transclude: true,
            template:
                '<div class="mt-date-picker">' +
                '   <div ng-transclude></div>' +
                '   <div class="mt-date-picker-popup" ng-if="isOpen">' +
                '       <mt-calendar ng-model="calendar" data-config="calendarConfig" last-selection="model"></mt-calendar>' +
                '   </div>' +
                '</div>',

            link: function postLink(scope, element, attrs, $parse) {
                scope.uniqueId = 'mt-date-picker-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
                element.addClass(scope.uniqueId);

                $document.bind('click', function(event) {
                    var $datePicker= $('.'+scope.uniqueId);
                    var $popup =$datePicker.find('.mt-date-picker-popup');
                    if (!$popup.find(event.target).length &&
                        $popup!==$(event.target)) {
                        // Hide the menus.
                        scope.isOpen = false;
                        scope.$apply();
                    }
                })
            },
            controller: function($scope, $parse){
                $scope.calendar = {};
                $scope.calendarRanger = {};

                $scope.calendarConfig={
                    minHeight:'220px',
                    firstDayOfWeek:6,
                    canGoBeforeToday:false,
                    goToSelection: true,
                    onTableUpdate: function(data){
                        var modelDate;
                        if(angular.isDefined($scope.model))
                            modelDate = $scope.model._isAMomentObject?$scope.model:moment.utc($scope.model);

                        for(var i=0; i<data.weeks.length; i++){
                            data.weeks[i].class.selectable=false;

                            for(var j=0; j<data.weeks[i].days.length; j++){
                                var day = data.weeks[i].days[j];
                                day.class.selectable=!$scope.dateDisabled({ date: day.date });
                                if(!angular.isDefined(day.class.selectable)){
                                    day.class.selectable=true;
                                }
                                if(angular.isDefined($scope.model) && day.class.selectable && day.date.isSame(modelDate, 'day')){
                                    day.class.selected=true;
                                }
                            }
                        }
                    },
                    onDayClick:  function(day){
                        day.class.selected=true;
                        $scope.model = moment.utc(day.date);
                        $scope.isOpen = false;
                    }
                };

            }
        };
    }]);
