export default
class AnalyticsCtrl {
    /*@ngInject*/
    constructor($scope, $http, $timeout, ngAnalyticsService, SatellizerPopup, $auth) {

        $scope.authenticate = function (provider) {
            $auth.authenticate(provider).then(data => {
                console.info(data)
            }).catch(function (res) {
                console.info(res.data)
            });
        };

        $scope.user = {};

        $scope.signUp = user => {
            console.info(user);
            $http.post(settings.apiEntryPoint + '/auth/signup', user).then((res) => {
                console.info(res)
            });
        };


        var sites = [
            {siteUrl: 'http://news.vn.ua/'},
            {siteUrl: 'http://esvit.name/'},
            {siteUrl: 'http://test.com/'},
            {siteUrl: 'http://mistinfo.com/'},
            {siteUrl: 'http://www.gabelstapler-zentrum.de/'}
        ];

        var loadSites = () => {
            $scope.hasUnknown = false;
            $http.post('http://analytics.5stars.link/api/sites/find', _.pluck(sites, 'siteUrl')).then((res) => {
                $scope.sites = res.data;

                $scope.hasUnknown = _.filter(res.data, { isUnknown: true }).length > 0;
            });
        };
        loadSites();


        $scope.signIn = () => {
            $http.get('http://analytics.5stars.link/api/auth/google').then((res) => {
                var openPopup = SatellizerPopup.open(res.data.url, 'Google Auth', { width: 452, height: 633 }, window.location.origin).pollPopup();

                openPopup.then(function(token) {
                    console.info('updae')
                    loadSites();
                });
            });
        };

        $scope.updateSite = (site) => {
            $http.put('http://analytics.5stars.link/api/sites/' + site._id, site).then((res) => {
            });
        };

        $scope.scanSite = (site) => {
            $http.post('http://analytics.5stars.link/api/sites/' + site._id + '/scan');
        };

        $scope.getPages = (site) => {

            $scope.selectedSite = null;
            $http.get('http://analytics.5stars.link/api/sites/' + site._id).then((res) => {
                ngAnalyticsService.serviceAuthToken = res.data.tokens.access_token;
                ngAnalyticsService.authorize();

                $scope.charts = [{
                    reportType: 'ga',
                    query: {
                        metrics: 'ga:sessions',
                        dimensions: 'ga:date',
                        'start-date': '30daysAgo',
                        'end-date': 'yesterday',
                        ids: 'ga:' + site.analytics.profileId
                    },
                    chart: {
                        container: 'chart-container-1',
                        type: 'LINE',
                        options: {
                            width: '100%'
                        }
                    }
                }, {
                    reportType: 'ga',
                    query: {
                        metrics: 'ga:sessions',
                        dimensions: 'ga:browser',
                        'start-date': '30daysAgo',
                        'end-date': 'yesterday',
                        ids: 'ga:' + site.analytics.profileId
                    },
                    chart: {
                        container: 'chart-container-2',
                        type: 'PIE',
                        options: {
                            width: '100%',
                            is3D: true,
                            title: 'Browser Usage'
                        }
                    }
                }];
                $scope.extraChart = {
                    reportType: 'ga',
                    query: {
                        metrics: 'ga:sessions',
                        dimensions: 'ga:date',
                        'start-date': '30daysAgo',
                        'end-date': 'yesterday',
                        ids: 'ga:' + site.analytics.profileId
                    },
                    chart: {
                        container: 'chart-container-3',
                        type: 'LINE',
                        options: {
                            width: '100%'
                        }
                    }
                };
                $scope.defaultIds = {
                    ids: 'ga:' + site.analytics.profileId
                };
                $scope.queries = [{
                    query: {
                        ids: 'ga:' + site.analytics.profileId,
                        metrics: 'ga:sessions',
                        dimensions: 'ga:city'
                    }
                }];

                $timeout(function () {
                    $scope.selectedSite = site;
                }, 1);

            });

            $http.get('http://analytics.5stars.link/api/pages?site._id=' + site._id).then((res) => {
                $scope.pages = res.data;
            });
        };

        $scope.getQueries = (page) => {
            var keywords = {};
            $http.get('http://analytics.5stars.link/api/statistics?page._id=' + page._id + '&sort=clicks').then((res) => {

                _.each(res.data, (item) => {
                    keywords[item.query.keyword] = keywords[item.query.keyword] || {};
                    keywords[item.query.keyword][item.date] = item.position;
                });
                $scope.queries = keywords;
                console.info(keywords)
            });
        };

        $scope.$on('$gaReportSuccess', function (e, report, element) {
            console.log(report, element);
        });

        $scope.sites = sites;
        console.info('AnalyticsCtrl');

    }
}