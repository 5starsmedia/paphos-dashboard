export default
/*@ngInject*/
($translateProvider) => {
    /**
     * @todo change template path when add site config in system
     */
    $translateProvider.useStaticFilesLoader({
            prefix: 'locale/',
            suffix: '.json'
        })
        .fallbackLanguage('en')
        .preferredLanguage('en')
        .useSanitizeValueStrategy(null)
        .useLocalStorage();
};