---
title: 依赖提供者
order: 3
---

Angular 官方文档对于依赖提供者，也就是`providers`的解释如下：

通过配置提供者，你可以把服务提供给那些需要它们的应用部件。
<alert>By configuring providers, you can make services available to the parts of your application that need them.</alert>

依赖提供者会使用 DI 令牌来配置注入器，注入器会用它来提供这个依赖值的具体的、运行时版本
<alert>A dependency provider configures an injector with a DI token, which that injector uses to provide the runtime version of a dependency value.</alert>

简单总结`依赖提供者`做了两件事：

- **告诉注入器如何提供依赖值**
- **限制服务可使用的范围**

在之前的示例中，当使用`@Inject(HeroService)`注入一个服务时，Angular 注入器会通过`new HeroService()`实例化一个类返回依赖值，类实例化其实就是一种**如何提供依赖值**的方式，那么 Angular 中除了类实例化提供依赖值外还提供给了如下类型的`Provider`，每种`Provider`都有其使用场景。

```ts
export declare type Provider = TypeProvider | ValueProvider | ClassProvider 
| ConstructorProvider | ExistingProvider | FactoryProvider | any[];

export declare type StaticProvider = ValueProvider | ExistingProvider | 
  StaticClassProvider | ConstructorProvider | FactoryProvider | any[];
```

关于**限制服务可使用的范围**就更好理解了，满足只能在某个模块或者组件注入`HeroService`的场景。

## 如何定义提供者

在组件或者模块中通过装饰器元数据`providers`定义提供者。

比如:**类提供者**

![image.png](assets/images/di/provider-02.png)


- **provide** 属性是依赖令牌，它作为一个 key，在定义依赖值和配置注入器时使用，可以是一个**类的类型**、  **InjectionToken**、或者字符串，甚至对象，但是不能是一个 Interface、数字和布尔类型
- 第二个属性是一个提供者定义对象，它告诉注入器要如何创建依赖值。 提供者定义对象中的 key 可以是   `useClass`   —— 就像这个例子中一样。 也可以是 `useExisting`、`useValue`或`useFactory`, 每一个 key 都用于提供一种不同类型的依赖。

![image.png](assets/images/di/provider-03.png)

## 类提供者

类型: `TypeProvider`和`ClassProvider`，类提供者应该是最常用的一种，在[依赖注入简介](docs/di/intro)章节的示例就是，简写和全写的配置如下：

```ts
{
  provides: [ Logger ]   // 简写
  provides: [{ provide: Logger, useClass: Logger }]  // 全写  
}
```

- `provide: Logger` 意思是把类的类型作为 **DI Token（依赖令牌）**
- `useClass` 表示使用此类实例化作为依赖值，其实就是通过`new Logger()`返回依赖值


**使用场景：**

- 所有 class 定义的服务默认都是用**类提供者**
- 指定替代性的类提供者，替换原有服务的行为实现可扩展性，这样我在使用的时候还是注入`Logger`，但是实际返回的对象是`BetterLogger`示例


```ts
[{ provide: Logger, useClass: BetterLogger }] 
// 当使用 Logger 令牌请求 Logger 时，返回一个 BetterLogger
```


## 别名类提供者
类型: `ExistingProvider`，在下面的例子中，当组件请求新的或旧的 Logger 时，注入器都会注入一个   `NewLogger`   的实例。 通过这种方式，  `OldLogger`就成了`NewLogger`的别名。

```ts
[ 
  NewLogger,
  // Alias OldLogger reference to NewLogger
  { provide: OldLogger, useExisting: NewLogger}
]
```

那么别名类提供者和类提供者有什么区别呢？

```ts
[ 
  NewLogger,
  { provide: OldLogger, useClass: NewLogger}
]
```

- `useExisting`   值是一个   **DI Token**  ，provide 也是一个   **DI Token，**  2个 Token 指向同一个实例
- `useClass`   值是一个可以实例化的类，也就是可以 new 出来的类，这个类可以是任何类


**使用场景：**

- 收窄类型，比如`Logger`类的返回的方法和属性太多，当前场景只需要使用少量的属性和函数，可以定义一个简化版的 **MinimalLogger**，通过注入`MinimalLogger`使用，运行时返回的其实还是`Logger`对象
- 重构，替换命名，一次性无法完全修改，先临时提供一个新的别名，将来逐步替换
- 解决循环引用问题，为类接口(抽象)指定别名


```ts
// Class used as a "narrowing" interface that exposes a minimal logger
// Other members of the actual implementation are invisible
export abstract class MinimalLogger {
  abstract logs: string[];
  abstract logInfo: (msg: string) => void;
}

{ provide: MinimalLogger, useExisting: LoggerService },
```

```ts
// parent.ts
class abstract Parent {
     ...
}

// alex.component.ts
providers: [{ provide: Parent, useExisting: forwardRef(() => AlexComponent) }]
class AlexComponent {
   // ChildComponent
}

// child.component.ts
class ChildComponent {
    constructor(parent: Parent)
}

```

## 对象提供者

类型: `ValueProvider`，要注入一个对象，可以用`useValue`选项来配置注入器，下面的提供者定义对象使用`useValue`作为 key 来把该变量与`Logger`令牌关联起来。

```ts
// An object in the shape of the logger service
function silentLoggerFn() {}

export const silentLogger = {
  logs: ['Silent logger says "hahaha!". Provided via "useValue"'],
  log: silentLoggerFn
};

[{ provide: Logger, useValue: silentLogger }]
```

**使用场景：**

通过对象提供者注入一个配置对象，一般推荐使用`InjectionToken`作为令牌。

```ts
// src/app/app.config.ts
import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export const HERO_DI_CONFIG: AppConfig = {
  apiEndpoint: 'api.heroes.com',
  title: 'Dependency Injection'
};
```

```ts
// src/app/app.module.ts (providers)
providers: [
  { provide: APP_CONFIG, useValue: HERO_DI_CONFIG }
],
```

当使用`InjectionToken`作为令牌时，在组件或者服务中必须借助参数装饰器`@Inject()`，才可以把这个配置对象注入到构造函数中。

```ts
// src/app/app.component.ts
constructor(@Inject(APP_CONFIG) config: AppConfig) {
  this.title = config.title;
}
```

<alert>Inject, 类构造函数中依赖项参数上的参数装饰器，用于指定依赖项的自定义提供者，参数传入 DI Token，映射到要注入的依赖项。</alert>

同时在定义`InjectionToken`的时候还可以设置`providedIn`和`factory`。

```ts
export const TOKEN_FACTORY = new InjectionToken('factory-token', {
    providedIn: 'root',
    factory: () => {
        return 'I am from InjectionToken factory';
    }
});
```



## 工厂提供者

类型: `FactoryProvider`，要想根据运行前尚不可用的信息创建可变的依赖值，可以使用工厂提供者。也就是完全自己决定如何创建依赖。

比如：只有授权用户才能看到`HeroService`中的秘密英雄。

```ts
// src/app/heroes/hero.service.ts (excerpt)
constructor(
  private logger: Logger,
  private isAuthorized: boolean) { }

getHeroes() {
  const auth = this.isAuthorized ? 'authorized ' : 'unauthorized';
  this.logger.log(`Getting heroes for ${auth} user.`);
  return HEROES.filter(hero => this.isAuthorized || !hero.isSecret);
}
```

```ts
// src/app/heroes/hero.service.provider.ts (excerpt)

const heroServiceFactory = (logger: Logger, userService: UserService) => {
  return new HeroService(logger, userService.user.isAuthorized);
};

export const heroServiceProvider =
  { 
    provide: HeroService,
    useFactory: heroServiceFactory,
    deps: [Logger, UserService]
  };
```

- `useFactory`字段指定该提供者是一个工厂函数，其实现代码是`heroServiceFactory`
- `deps`属性是一个提供者令牌数组，`Logger`和`UserService`类都是类提供者的令牌。该注入器解析了这些令牌，并把相应的服务注入到`heroServiceFactory`工厂函数的参数中。


理解了工厂提供给者后再回过头看，`useValue`、`useClass`和`useExisting`的区别就更简单了，`provider`就是在装饰器中通过`providers`数组配置的元数据对象。

![image.png](assets/images/di/provider-04.png)

## 接口和依赖注入

虽然 TypeScript 的`AppConfig`接口可以在类中提供类型支持，但它在依赖注入时却没有任何作用。在 TypeScript 中，接口只能作为类型检查，它没有可供 DI 框架使用的运行时表示形式或令牌。

- 当转译器把 TypeScript 转换成 JavaScript 时，接口就会消失，因为 JavaScript 没有接口。
- 由于 Angular 在运行期没有接口，所以该接口不能作为令牌，也不能注入它。

```ts
// Can't use interface as provider token
[{ provide: AppConfig, useValue: HERO_DI_CONFIG })]

// Can't inject using the interface as the parameter type
constructor(private config: AppConfig){ }
```

## multi 多个依赖值

当配置提供者时设置`multi`为 true 时，通过`@Inject(DIToken)`参数注入获取的依赖值就会返回一个数组。

```ts
export declare interface ClassProvider extends ClassSansProvider {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
```

**使用场景：**

内置 API ，比如：`NG_VALUE_ACCESSOR`、`HTTP_INTERCEPTORS`、`APP_INITIALIZER`等

```ts
@Component({
    selector: 'select',
    templateUrl: './select.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ThySelectComponent),
            multi: true
        }
    ]
})
export class ThySelectComponent implements ControlValueAccessor {}
```

以上就是依赖提供者 provider 相关的介绍，理解了 factory 提供依赖值后再看其他类型就会简单很多，其他的类型就是 factory 之上高级的 API 而已，满足不同的场景需要，这是 Angular 依赖注入入门比较难懂的知识，那么接下来的多级注入器是另一个重要的知识点，这两部分都深入理解那么 Angular 依赖注入就不在是难点了。
