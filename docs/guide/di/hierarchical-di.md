---
title: 层级注入器
order: 4
---

通过依赖注入的概念我们知道，创建实例的工作都交给`Ioc 容器`（也叫注入器）了，通过构造函数参数装饰器`@Inject(DIToken)`告诉注入器我们需要注入`DIToken`对应的依赖值，注入器就会帮我们查找依赖并返回值，Angular 应用启动会默认创建相关的注入器，而且 Angular 的注入器是有层级的，类似于一个 Dom 树。

## 两个注入器层级

Angular 中有两个注入器层次结构：

- `ModuleInjector` 层次结构 —— 使用`@NgModule()`或`@Injectable()`装饰器在此层次结构中配置   `ModuleInjector`。
- `ElementInjector` 层次结构 —— 在每个 DOM 元素上隐式创建。除非你在`@Directive()`或`@Component()`   的   `providers`属性中进行配置，否则默认情况下，`ElementInjector`为空


## ModuleInjector

可以通过以下两种方式之一配置`ModuleInjector`：

- 使用`@Injectable()`的`providedIn`属性引用`NgModuleType`、`root`、`platform`或者`any`。
- 使用 `@NgModule()`的 `providers`数组中配置不同类型的提供者。


<alert>摇树优化与 @Injectable()，使用`@Injectable()`的`providedIn`属性优于`@NgModule()`的`providers`数组，因为使用`@Injectable()`的`providedIn`时，优化工具可以进行摇树优化，从而删除你的应用程序中未使用的服务，以减小捆绑包尺寸。  摇树优化对于库特别有用，因为使用该库的应用程序不需要注入它。在 服务与依赖注入简介了解关于可摇树优化的提供者的更多信息。</alert>

**需要特别注意：**

- `ModuleInjector`由`@NgModule.providers`和`NgModule.imports`属性配置。`ModuleInjector`是可以通过   `NgModule.imports`递归找到的所有`providers`数组的扁平化。
- 子`ModuleInjector`是在惰性加载其它`@NgModules`时创建的。


第一点的意思就是`AppModule`导入了`FeatureAModule`和`FeatureBModule`，那么 Angular 会根据模块树找到所有模块配置的`providers`并打平存放到一起，这就意味着整个应用程序所有地方都可以注入这些打平的`providers`，这就是 Angular 模块下的服务与组件/指令/管道所不同的地方，组件/指令/管道在某个模块定义，只要没有导出，其他模块都无法使用，必须导出才可以被导入该模块的组件使用，其次就是当有重复 DI Token 提供的依赖时，后提供的会覆盖之前提供的。

第二点可以不严谨的认为整个应用程序只有一个根模块注入器，只有通过路由的懒加载才会创建子模块注入器，当懒加载模块  `FeatureCModule`还没有被加载时，`AppModule`并不能通过模块树找到`FeatureCModule`，那么处理这种问题有两种做法:
- 第一种就是现在的行为，创建一个子模块注入器
- 第二种就是把`FeatureCModule`中的所有`providers`动态追加到根模块注入器中

第二种做法显然会造成前后不一致的问题，那么只能选择第一种，因为选择了第一种，所以会导致惰性加载的模块注入服务和根模块注入器注入不一致的一些列行为。

## **Platform 和 Root 注入器**

除了惰性加载模块提供的供应商外，所有模块的`providers`和`@Injectable({providedIn: "root"})`供应商都时在  `root`根注入器中提供，其实在`root`之上还有两个注入器，一个是额外的平台`ModuleInjector`，一个是   `NullInjector`。

![image.png](assets/images/di/hierarchical-01.png)

我们简单看一下 Angular 应用的启动过程

```ts
platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {...})
```

- `bootstrapModule()`方法会创建一个由`AppModule`配置的注入器作为平台注入器的子注入器，也就是`root`ModuleInjector`
- `platformBrowserDynamic()`方法创建一个由`PlatformModule`配置的注入器，该注入器包含特定平台的依赖项，这允许多个应用共享同一套平台配置。例如，无论你运行多少个应用程序，浏览器都只有一个 URL 栏，你可以使用`platformBrowser()` 函数提供`extraProviders`，从而在平台级别配置特定平台的额外提供者。
- 层次结构中的顶级父注入器是`NullInjector()`，它是树的顶部。如果你在树中向上走了很远，以至于要在`NullInjector()`中寻找服务，那么除非使用` @Optional()`，否则将收到错误消息。


对于普通的开发者而言，我们一般接触不到平台注入器和`NullInjector`，可以假设整个应用程序只有一个 root 模块注入器。

## **ElementInjector**

除了模块注入器外，`Angular`会为每个 DOM 元素隐式创建`ElementInjector`

可以用`@Component()`装饰器中的`providers`或`viewProviders`属性来配置`ElementInjector`以提供服务。

```ts
@Component({
  ...
  providers: [{ provide: ItemService, useValue: { name: 'lamp' } }]
})
export class TestComponent
```

- 在组件中提供服务时，可以通过`ElementInjector`在该组件以及子组件/指令处通过注入令牌使用该服务
- 当组件实例被销毁时，该服务实例也将被销毁
- 组件是一种特殊类型的指令，这意味着`@Directive()`和`@Component()`都具有`providers`属性


## 解析规则

前面已经介绍了 Angular 会有2个层级的注入器，那么当组件/指令解析令牌时，Angular 分为两个阶段来解析它：

- 针对`ElementInjector`层次结构（其父级）
- 针对`ModuleInjector`层次结构（其父级）

Angular 会先从当前组件/指令的`ElementInjector`查找令牌，找不到会去父组件中查找，直到根组件，如果根还找不到，就去当前组件所在的模块注入器中查找，如果不是懒加载那么就是根注入器，一步一步到最顶层的`NullInjector`，整个解析过程如下所示：

![image.png](assets/images/di/hierarchical-02.png)

## 解析修饰符

默认情况下，`Angular`始终从当前的`Injector`开始，并一直向上搜索，修饰符可以更改开始（默认是自己）或结束位置，从而达到一些高级的使用场景，Angular 中可以使用`@Optional()`，`@Self()`，`@SkipSelf()`和`@Host()`来修饰 Angular 的解析行为，每个修饰符的说明如下：

**@Optional()**

`@Optional()`   允许 Angular 将你注入的服务视为可选服务。这样，如果无法在运行时解析它，Angular 只会将服务解析为 null，而不会抛出错误。

```ts
export class OptionalComponent {
  constructor(@Optional() public optional?: OptionalService) {}
}
```

**@Self()**

使用`@Self()`让 Angular 仅查看当前组件或指令的`ElementInjector`。

```ts
@Component({
  selector: 'app-self',
  templateUrl: './self.component.html',
  styleUrls: ['./self.component.css'],
  providers: [{ provide: FlowerService, useValue: { emoji: '🌼' } }]

})
export class SelfComponent {
  constructor(@Self() public flower: FlowerService) {}
}
```

和`@Optional()`组合使用。

```ts
@Component({
  selector: 'app-self-no-data',
  templateUrl: './self-no-data.component.html',
  styleUrls: ['./self-no-data.component.css']
})
export class SelfNoDataComponent {
  constructor(@Self() @Optional() public flower?: FlowerService) { }
}
```

**@SkipSelf()**

`@SkipSelf()`与`@Self()`相反，使用`@SkipSelf()`，Angular 在父`ElementInjector`中开始搜索服务，而不是从当前 `ElementInjector`中开始搜索服务。

```ts
@Injectable({
    providedIn: 'root'
})
export class FlowerService {
    emoji = '🌿';
    constructor() {}
}
```

```ts
import { Component, OnInit, SkipSelf } from '@angular/core';
import { FlowerService } from '../flower.service';

@Component({
    selector: 'app-skipself',
    templateUrl: './skipself.component.html',
    styleUrls: ['./skipself.component.scss'],
    providers: [{ provide: FlowerService, useValue: { emoji: '🍁' } }]
})
export class SkipselfComponent implements OnInit {
    constructor(@SkipSelf() public flower: FlowerService) {}

    ngOnInit(): void {}
}

```

上面的示例会得到 root 注入器中的 🌿，而不是组件所在的`ElementInjector`中提供的 🍁。

如果值为 null 可以同时使用`@SkipSelf()`和`@Optional()`来防止错误。

```ts
class Person {
  constructor(@Optional() @SkipSelf() parent?: Person) {}
}
```

**@Host()**

`@Host()`使你可以在搜索提供者时将当前组件指定为注入器树的最后一站，即使树的更上级有一个服务实例，Angular 也不会继续寻找。

```ts
@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
  //  provide the service
  providers: [{ provide: FlowerService, useValue: { emoji: '🌼' } }]
})
export class HostComponent {
  // use @Host() in the constructor when injecting the service
  constructor(@Host() @Optional() public flower?: FlowerService) { }
}
```

由于`HostComponent`在其构造函数中具有`@Host()`，因此，无论`HostComponent`的父级是否可能有`flower.emoji`   值，该`HostComponent`都将使用 🌼（黄色花朵）。

那么问题来了**@Host** 和 **@Self** 到底有什么区别？

<alert>`**@Host**`属性装饰器会禁止在宿主组件以上的搜索，宿主组件通常就是请求该依赖的那个组件，不过，当该组件投影进某个父组件时，那个父组件就会变成宿主，意思就是 ng-content 中的组件所在的宿主组件不是自己，而是 ng-content 提供的父组件。</alert>

注：

<alert>所有修饰符都可以组合使用，但是不能互斥，比如：**@Self()** 和 **@SkipSelf** ，**@Host()**  和   **@Self()**</alert>

## 在 @Component() 中提供服务

Angular 中所有的依赖都是单例的，由于存在模块和 Element 注入器层级，导致可以在不同的注入器中提供同一个令牌，从而实现非全局单例的效果，在组件中提供服务达到限制某些依赖只能在当前组件/指令以及子元素中使用，或者不同的组件注入各自的单独实例。

在组件/指令中可以通过`providers`与`viewProviders`分别提供服务依赖项，可以通过阅读[guide/hierarchical-dependency-injection#providing-services-in-component](https://angular.io/guide/hierarchical-dependency-injection#providing-services-in-component) 章节深入理解，官方文档内容有点多，我尝试简化一下。

首先在 Angular 中定义一个如下模板，实际的逻辑结构中会多一个 VIEW 视图的概念：

```html
<app-root>
    <app-child></app-child>
</app-root>
```

```html
<app-root>
  <#VIEW>
    <app-child>
     <#VIEW>
       ...content goes here...
     </#VIEW>
    </app-child>
  <#VIEW>
</app-root>
```

如果`<app-child></app-child>`模板内部有一个 A 组件，A 组件注入服务会先从虚拟的 #VIEW 中查找依赖，然后再到 app-child 组件，解析顺序为`app-child #VIEW => app-child => app-root #View => app-root`，那么  `providers`提供的服务其实就是挂载在组件上，`viewProviders`提供的服务挂载在 #VIEW 这个虚拟结构之上。

正常情况下，`providers`和`viewProviders`没有任何区别，只要当在组件中使用投影时会不同的表现，比如下面的示例：

```html
<app-root>
    <app-child>
      <a-component></a-component>
    </app-child>
</app-root>
```

`a-component`是通过 ng-content 投影传递到 app-child 组件中的，那么如果在 a-component 中注入  `FlowerService`，此时如果`app-child`是通过`viewProviders`提供的依赖，那么 A 组件会找不到依赖值，有投影时实际逻辑图如下：

```html
<app-root>
  <#VIEW>
    <app-child>
     <#VIEW>
       ...content goes here...
     </#VIEW>
     <a-component>
       <#VIEW>
       </#VIEW>
     </a-component>
    </app-child>
  <#VIEW>
</app-root>
```

此时，a-component 和 app-child 的 #VIEW 是平级的，所以往上找不到 <#VIEW> 中提供的依赖项（也就是   `viewProviders`提供的依赖性）

解析和查找的逻辑关系如下所示，其实关于`viewProviders`我们基本上很少使用，所以不理解或者不知道也没有关系，但是通过这个可以深入的理解 Angular 关于视图相关的依赖注入底层逻辑。

```html
<app-root @NgModule(AppModule)
        @Inject(AnimalService) animal=>"🐳">
  <#VIEW>
    <app-child>
      <#VIEW
       @Provide(AnimalService="🐶")
       @Inject(AnimalService=>"🐶")>
       <!-- ^^using viewProviders means AnimalService is available in <#VIEW>-->
       <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
      </#VIEW>
      <app-inspector>
        <#VIEW>
          <p>Emoji from AnimalService: {{animal.emoji}} (🐳)</p>
        </#VIEW>
      </app-inspector>
     </app-child>
  </#VIEW>
</app-root>
```


## ng-template 注入器

ng-template 在定义的视图层级上下找注入器，并不是在渲染的视图层级找注入器的。这一点特别容易踩坑，当我们编写高度的灵活的组件时经常会支持模板传递，那么渲染模板的节点注入器模板中不一定能够找到，感兴趣不理解的可以看示例：  [https://stackblitz.com/edit/angular-ivy-9tsdhh](https://stackblitz.com/edit/angular-ivy-9tsdhh)  


## provideIn: "any" | "root" | "platform" | NgModuleType

- `root`表示在根模块注入器（root `ModuleInjector`）提供依赖
- `platform` 表示在平台注入器提供依赖
- 指定模块表示在特定的特性模块提供依赖（注意循环依赖）
- `any`所有急性加载的模块都会共享同一个服务单例，惰性加载模块各自有它们自己独有的单例


## ElementInjector 使用场景

- 服务隔离（多个详情页、编辑器）
- 多重编辑会话
- 在当前组件替换使用第三方服务的行为


当我们理解了 Angular 依赖注入的基本使用，依赖提供者的作用和常用的提供者类型，以及多级注入器的原理，那么可以说 Angular 依赖注入已经达到中高级水平了，那么接下来就是通过这些基础知识学习一些高级的使用技巧，知识死的，如何灵活应用才是关键，建议看到这可以喝杯茶休息一会，接下来会简单介绍一下 Angular 依赖注入的一些高级技巧。
