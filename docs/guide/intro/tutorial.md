---
title: 教程指南
order: 30
---

通过[快速上手](docs/getting-started)相信你对 Angular 有了一定的了解，那么接下来就是如何一步一步深入学习。

Angular 的核心知识点为:

![](assets/images/angular-core-knowledge.png)

## 快速上手
Angular 官方也有一个快速上手文档，基本包含了: 
- 什么是 Angular？
- 环境搭建
- Angular 入门的示例（一步一步搭建一个带有路由的购物车小应用）

官方的入门示例包含了很多知识点，初学者可以先跟着一步一步做一下，哪怕是赋值粘贴先走完，不理解的知识点后期再回顾，这个示例会教会我们:
- 创建一个示例项目
- 创建一个列表组件
- 将数据传递给子组件
- 添加路由包含列表页和详情页
- 创建一个服务管理数据
- 使用 HttpClient 和服务端进行 API 通讯
- 在组件中使用服务获取数据并调用服务的方法更新数据
- 创建一个表单并添加数据
- 构建和部署应用

<alert>这个示例包含的功能很完善，对于初学者来说会接触到很多 Angular 的概念，难度系统还是挺高的，读完一篇没有理解并没有关系，主要是针对 Angular 有个整体的了解。</alert>

## 组件、模板和指令

`组件`、`模板`和`指令`是 Angular 最底层也是最核心的知识点，是必须要掌握的知识点，请耐心的一步一步看完。

- [组件](https://angular.cn/guide/component-overview)
- [模板](https://angular.cn/guide/template-syntax)
- [指令](https://angular.cn/guide/built-in-directives)
- [管道](https://angular.cn/guide/pipes) （包含在模板分组下）

## 路由、表单和 HttpClient

`路由`、`表单`和`HttpClient`虽然不是核心知识点，但是对于开发一个单页 Web 应用来说，基本是必须的，Angular 官方提供了相关实现，需要一一了解，对于这三个模块只需要大致了解也就可以正常开发前端应用了，如果要成为中高级的水平甚至是架构师，还是需要深入的掌握的。

- [路由](https://angular.cn/guide/routing-overview)
- [表单](https://angular.cn/guide/forms-overview)
- [HttpClient](https://angular.cn/guide/http)

## 模块、服务和依赖注入
[NgModule](https://angular.cn/guide/ngmodules) 是 Angular 中新增的概念，不同与 ES 的模块，`NgModule`在中大型项目中会起到特别重要的作用，是模块化的进一步增强，多个模块的隔离。当然对于中小型项目来说或许有点多余，Angular 在后续的版本中会把`NgModule`变成可选项。

服务和依赖注入是密不可分的两个概念，服务简单理解就是: `特定功能的类`，更多知识参考: [服务与依赖注入简介](https://angular.cn/guide/architecture-services)

关于依赖注入，官方文档太过分散，NgNice 进行了重组，建议按照下列顺序阅读：
- [依赖注入概念](/docs/di/concept)
- [依赖注入简介](/docs/di/intro)
- [依赖提供者](/docs/di/provider)
- [层级注入器](/docs/di/hierarchical-di)
- [高级进阶](/docs/di/advanced)


## 测试、国际化、动画

想要成为一个高级工程师，测试是必不可少的，Angular 提供了丰富的测试套件让我们轻松编写单元测试，其次对于 Web 动画也提供了较好的支持，国际化也是。

- [测试](https://angular.cn/guide/testing)
- [国际化](https://angular.cn/guide/i18n-overview)
- [动画](https://angular.cn/guide/animations)

## 远不止于此

Angular 是一个工程标本，提供的功能远不止于此，在此列举一些比较重要的其他知识点:

- [Angular CLI](https://angular.cn/cli)
- [Service Worker 和 PWA](https://angular.cn/guide/service-worker-intro)
- [Web Worker](https://angular.cn/guide/web-worker)
- [Angular Universal 服务端渲染](https://angular.cn/guide/universalhttps://angular.cn/guide/universal)
- [预渲染](https://angular.cn/guide/prerendering)
- [安全](https://angular.cn/guide/security)
- [无障碍性](https://angular.cn/guide/accessibility)
- [DevTools](https://angular.cn/guide/devtools)
- [原理图（Schematic）](https://angular.cn/guide/schematics)
- [Angular 开发类库](https://angular.cn/guide/libraries)
- [Angular 语言服务](https://angular.cn/guide/language-service)
- [CLI 构建器](https://angular.cn/guide/cli-builder)
- [部署](https://angular.cn/guide/deployment)
- [AOT 编译](https://angular.cn/guide/aot-compiler)
- [代码风格指南](https://angular.cn/guide/docs-style-guide)



<alert>Angular 官方文档整体质量还是相当高的，虽然没有做到渐进式，对于完全的新手或许不太友好。</alert>
