---
title: 快速上手
order: 20
---

## 安装 Angular CLI

强烈推荐大家使用 Angular CLI 来创建项目，初始化生成应用和类库代码，首先需要使用`npm`命令安装全局 CLI。

```bash
npm install -g @angular/cli
```

## 创建应用

执行 CLI 命令`ng new`创建初始化应用，并输入应用的名称`my-app`

```bash
ng new my-app
```
执行上述命令后需要根据提示输入必要的参数，是否需要路由和选择哪种样式格式，推荐使用`scss`，输入完参数后 CLI 会默认帮助我们安装所需要的`npm`依赖包，成功安装后结果如下:

![](assets/images/intro/cli-ng-new.png)

## 启动应用

应用创建后，切换到应用目录`my-app`下，执行`ng serve`或者`npm run serve`命令启动应用。

```bash
cd my-app
ng serve --open
```
使用`--open`启动后会自动打开默认浏览器，并访问`http://localhost:4200`。
如果一切顺利，你将要看到如下页面:

![](assets/images/intro/ng-serve-default-page.png)


## StackBlitz 创建应用
如果你本地没有安装`Node.js`和`npm`，想体验一下 Angular 的开发，可以直接通过 StackBlitz 在线创建一个 Angular 应用。

![](assets/images/intro/stackblitz-new.png)

创建后展示的效果如下，StackBlitz 创建的应用默认不带路由，使用 css 而没有使用 scss，和 CLI 初始化的应用不完全一样。

![](assets/images/intro/stackblitz-serve-default-page.png)

## Angular 应用目录介绍

一个完整的 Angular 应用大致的目录结构如下所示:

```bash
.
├── README.md
├── angular.json
├── karma.conf.js
├── package-lock.json
├── package.json
├── src
│   ├── app
│   │   ├── app-routing.module.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   └── app.module.ts
│   ├── assets
│   ├── environments
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── favicon.ico
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── styles.scss
│   └── test.ts
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

以下针对核心的文件/文件夹做了一下简单的介绍:

文件/文件夹|描述 
--- | --- 
`angular.json` | 这个是 Angular 应用工作区的配置文件，一个工作区可以有多个应用或者类库，每个应用如何构建、本地开发的端口等等配置都在此文件中。
`src` | 默认应用的源代码，包含`app`应用代码、`assets`资源文件、入口 HTML 文件和 TS 等。
`src/main.ts` | 入口 TS 文件，主要包含 Angular 应用的启动。
`src/index.html` | 单页应用的入口 HTML 文件，包含 HTML 的 head 和 body，body 中会使用启动组件`<app-root></app-root>`。
`src/assets` | 资源文件，包含图片、字体等，Angular 本地启动后通过`assets/**` URL 访问资源文件。
`src/app/app.module.ts` | 每个 Angular 应用都需要一个启动模块`AppModule`，而且只能有一个。
`src/app/app.component.ts` | 启动模块配置的启动组件，此组件的 selector 默认是`app-root`，需要和`index.html`中的元素对应，Angular 应用启动会渲染此组件，并动态替换 index.html 中的入口元素。
`src/app/app-routing.module.ts` | Angular 应用的路由模块，配置路由以及导入官方的 `@angular/router`。
`src/environments` | 环境变量，针对开发环境和生产环境使用不同的配置使用，构建时会动态根据环境替换。
`src/polyfills.ts` | 浏览器所需要的填充库，默认包含 `zone.js`。
`src/styles.scss` | 样式入口文件。
`tsconfig.json` | TypeScript 的配置文件，此文件只包含基本配置。
`tsconfig.app.json` | Angular 默认应用的 TypeScript 配置文件，继承`tsconfig.json`文件。
`tsconfig.spec.json` | Angular 默认应用的测试 TypeScript 配置文件，继承`tsconfig.json`文件。
`karma.conf.js` | 默认应用测试的 Karma 配置。

## 数据渲染

我们可以先把`app.component.html`的内容清空，使用简洁的模板语法将数据渲染到 DOM 中，修改代码如下:

```html
// app.component.html
<div>{{ message }}</div>
```

```ts
// app.component.ts
import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent  {
  message = 'Hello Angular!';
}
```

<example-hello></example-hello>

## 循环渲染列表
Angular 提供了丰富的指令，比如`*ngFor`实现循环渲染一个列表：

```html
// app.component.html
<ol>
  <li *ngFor="let item of items">
    {{ item.title }}
  </li>
</ol>
```

```ts
// app.component.ts
import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent  {
  items = [
        {
            id: 1,
            title: 'Angular 怎么不火呢?'
        },
        {
            id: 2,
            title: 'Angular 太牛逼了!'
        },
        {
            id: 3,
            title: '优秀的前端工程师和框架无关，但是 Angular 会让你更快的成为优秀前端工程师!'
        }
    ];
}
```
<alert>注意`*ngFor`结构性指令在`CommonModule`中提供，需要在`AppModule`中引入`@angular/common`方可使用，代码如下。</alert>

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';

@NgModule({
  imports:      [ BrowserModule, CommonModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
```
<example-for></example-for>

## 条件判断
控制切换一个元素是否显示，通过`*ngIf`指令实现属性的判断即可。

```html
// app.component.html
<div *ngIf="found">我是一只🐱，你怎么这么快就找到我了。</div>
<button (click)="findCat()">开始找猫猫</button>
```

```ts
// app.component.ts
import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent  {
  found = false;

  findCat() {
      this.found = true;
  }
}
```

<example-if></example-if>
