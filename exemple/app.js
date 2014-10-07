angular.module('SampleApp.controllers', []).
    controller('mainController', function($scope) {

        $scope.title="Mango Tools - Angular-mt-calendar - Sample"

        $scope.calendarData=null;// Swill be filled by angular-mt-
        $scope.calendarRange = {};
        $scope.calendarConfig={

            minHeight:'400px',
            firstDayOfWeek:1, // Start on monday
            canGoBeforeToday:true,
            onTableUpdate: function(data){

                // Get the range of the current displayed days
                $scope.calendarRange = {
                    from: data.firstDay,
                    until: data.lastDay
                };
            },
            onDayClick:  function(day, week){
                if(week.class.selectable){
                    if(week.class.selected){
                        console.log('week selected');
                    }
                    else{
                        console.log('week unselected');
                    }
                }
                else if(day.class.selectable) {
                    if(day.class.selected){
                        console.log('day selected');
                    }
                    else{
                        console.log('day unselected');
                    }
                }

            }
        };

    });

angular.module('SampleApp', [
    'SampleApp.controllers', 'angular.mt.calendar'
]);