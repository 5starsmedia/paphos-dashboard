export default
/*@ngInject*/
($rootScope, $translate) => {
    $rootScope.languages = [
        { code: 'en', title: 'English' },
        { code: 'uk', title: 'Українська' },
        { code: 'ru', title: 'Русский' }
    ];
    $rootScope.currentLanguage = $translate.use();
    $rootScope.$on('$translateChangeSuccess', (e, dest) => {
        $rootScope.currentLanguage = dest.language;
    })
    $rootScope.changeLanguage = function (key) {
        $translate.use(key);
    };
};