module.exports = {
    baseHref: '/',
    heads: [],
    mode: 'full',
    title: 'ngnice',
    logoUrl: 'assets/images/logo.png',
    siteProjectName: 'site',
    repoUrl: 'https://github.com/ngnice/ngnice.com',
    navs: [
        null,
        {
            title: '微前端',
            path: 'https://github.com/worktile/ngx-planet',
            isExternal: true
        },
        {
            title: 'Angular 官网',
            path: 'https://angular.io',
            isExternal: true
        },
        {
            title: 'Angular 中文版',
            path: 'https://angular.cn',
            isExternal: true
        }
    ],
    locales: [
        {
            key: 'zh-cn',
            name: '中文'
        }
    ],
    defaultLocale: 'zh-cn'
};
