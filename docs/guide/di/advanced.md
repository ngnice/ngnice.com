---
title: 高级进阶
order: 5
---

接下来我简单的列举一些使用 Angular 依赖注入比较重要的高级技巧，也是官方文档中涵盖的知识点：

![image.png](assets/images/di/advanced-01.png)

## 轻量级注入令牌

在我们开发类库的时候，支持摇树优化是一个重要的特性，要减少体积，那么在 Angular 类库中需要做以下几点：

- 分模块打包和导入，按钮模块和模态框模块分别打包。
- 服务尽量使用`@Injectable({ provideIn: "root" | "any"})`优先。
- 使用轻量级注入 Token。

### 令牌什么时候会被保留

那么在同一个组件模块中，提供了很多个组件，如果只想打包被使用的组件如何做呢？

比如我们定义如下的一个 card 组件，包含了 header，同时 card 组件中需要获取 header 组件实例引用。

```html
<lib-card>
  <lib-header>...</lib-header>
</lib-card>
```

```ts
@Component({
  selector: 'lib-header',
  ...,
})
class LibHeaderComponent {}

@Component({
  selector: 'lib-card',
  ...,
})
class LibCardComponent {
  @ContentChild(LibHeaderComponent)
  header: LibHeaderComponent | null = null;
}
```

因为`<lib-header>`是可选的，所以元素可以用最小化的形式`<lib-card></lib-card>`出现在模板中，在这个例子中，   `<lib-header>`没有用过，你可能期望它会被摇树优化掉。

但是因为代码中出现了如下的一段导致无法被优化：

`@ContentChild(LibHeaderComponent) header: LibHeaderComponent;`

- 其中一个引用位于 **类型位置** 上 - 它把`LibHeaderComponent`用作了类型：`header: LibHeaderComponent; `。
- 另一个引用位于 **值的位置** - 即，`LibHeaderComponent`是`@ContentChild()`参数装饰器的值：   `@ContentChild(LibHeaderComponent)`。


编译器对这些位置的令牌引用的处理方式时不同的。

- 编译器在从 TypeScript 转换完后会删除这些 **类型位置** 上的引用，所以它们对于摇树优化没什么影响。
- 编译器必须在运行时保留 **值位置** 上的引用，这就会阻止该组件被摇树优化掉。

### 什么时候使用轻量级注入令牌模式

当一个组件被用作注入令牌时，就会出现摇树优化的问题，有两种情况:

- 令牌用在内容查询中值的位置上， 也就是`@ContentChild`或者`@ViewChild`等查询装饰器。
- 该令牌用作构造函数注入的类型说明符，`@Inject(OtherComponent)`, 下面的代码虽然没有出现`@Inject()`，通过前面的章节可以知道这只是简写而已。

```ts
class MyComponent {
  constructor(@Optional() other: OtherComponent) {}

  @ContentChild(OtherComponent)
  other: OtherComponent|null;
}
```

### 使用轻量级注入令牌

解决上述的问题最好就是引入轻量级注入令牌设计模式: **使用一个小的抽象类作为注入令牌，并在稍后为它提供实际实现，该抽象类固然会被留下（不会被摇树优化掉），但它很小，对应用程序的大小没有任何重大影响。**

```ts
abstract class LibHeaderToken {}

@Component({
  selector: 'lib-header',
  providers: [
    {provide: LibHeaderToken, useExisting: LibHeaderComponent}
  ]
  ...,
})
class LibHeaderComponent extends LibHeaderToken {}

@Component({
  selector: 'lib-card',
  ...,
})
class LibCardComponent {
  @ContentChild(LibHeaderToken) header: LibHeaderToken|null = null;
}
```

总结一下，轻量级注入令牌模式由以下几部分组成。

- 一个轻量级的注入令牌，它表现为一个抽象类。
- 一个实现该抽象类的组件定义。
- 注入这种轻量级模式时使用`@ContentChild()`或者`@ContentChildren()`。
- 实现轻量级注入令牌的提供者，它将轻量级注入令牌和它的实现关联起来。




### 使用轻量级注入令牌进行 API 定义

为了有类型提示，我们可以为这个轻量级令牌定义函数和属性，不管这个抽象类加多少个 API 定义都不会影响体积，因为 TS 编译后类型都会丢失，加类型只是为了在开发模式下类型更加安全而已。

```ts
abstract class LibHeaderToken {
  name: string;
  abstract doSomething(): void;
}

@Component({
  selector: 'lib-header',
  providers: [
    {provide: LibHeaderToken, useExisting: LibHeaderComponent}
  ]
  ...,
})
class LibHeaderComponent extends LibHeaderToken {
  doSomething(): void {
    // Concrete implementation of `doSomething`
  }
}

@Component({
  selector: 'lib-card',
  ...,
})
class LibCardComponent implement AfterContentInit {
  @ContentChild(LibHeaderToken)
  header: LibHeaderToken|null = null;

  ngAfterContentInit(): void {
    this.header && this.header.doSomething();
  }

```

### 轻量级注入令牌命名

轻量级注入令牌只对组件有用。

- **LibHeaderComponent** 遵循 **Component** 后缀命名约定。
- **LibHeaderToken** 遵循轻量级注入令牌命名约定。推荐的写法是使用组件基本名加上后缀 **Token**。

### 解决组件循环引用

使用轻量级 Token 不仅仅可以减少体积，还可以解决循环引用的问题，具体可以查看 [https://angular.cn/errors/NG3003](https://angular.cn/errors/NG3003)  



## 惰性加载特性模块

默认情况下，`NgModule`都是急性加载的，也就是说它会在应用加载时尽快加载。

对于带有很多路由的大型应用，肯定会使用惰性加载(一种按需加载 NgModule 的模式)。

### 惰性加载入门
路由定义时使用`loadChildren`，动态 import 并返回模块:
```ts
const routes: Routes = [
  {
    path: 'items',
    loadChildren: () => import('./items/items.module').then(m => m.ItemsModule)
  }
];
```

惰性加载模块使用`forChild`定义路由:

```ts
RouterModule.forChild([
   {
     path: '',
     component: ItemsComponent
   }
]),
```
<alert>确保从`AppModule`中移除了`ItemsModule`模块。</alert>

### 如何设置惰性加载

建立惰性加载的特性模块有两个主要步骤：

- 使用`--route`标志，用 CLI 创建特性模块。`ng generate module customers --route customers --module app.module`。
- 配置相关路由。


### 懒加载和急性加载的区别？

唯一区别就是会：**创建子`ModuleInjector`**

<alert>意味着所有的 providers 和 imports 模块的 providers 都是独立的，急性模块并不知道懒加载模块的 providers。</alert>



## forRoot() 模式

`forRoot()`与`forChild()`的区别？

如果模块同时定义了`providers`（服务）和`declarations`（组件、指令、管道），那么，当你同时在多个懒加载的特性模块中引入此模块时，这些服务就会被注册在多个地方。这会导致出现多个服务实例，并且该服务的行为不再像单例一样。


防止这种现象：

- 用`providedIn: "root"`语法代替在模块中注册服务的方式。
- 把你的服务分离到它们自己的模块中。
- 在模块中分别定义`forRoot()`和`forChild()`方法。


```ts
static forRoot(config: UserServiceConfig): ModuleWithProviders<GreetingModule> {
  return {
    ngModule: GreetingModule,
    providers: [
      {provide: UserServiceConfig, useValue: config }
    ]
  };
}
```

我们在开发类库或者使用第三库时经常会用到`forRoot`模式，比如官方的路由模块，这种模式的本质还是因为惰性加载的模块会独立创建子模块注入器，但是模块中的组件/指令/管道和服务处理模式不一样导致，这也是 Angular 模块一大难点之一（也可以说是坑）。


## `providedIn: 'any'`

通过使用`providedIn: 'any'`，所有急性加载的模块都会共享同一个服务单例，但是惰性加载模块各自有它们自己独有的单例。和在模块中使用`providers`提供依赖的效果是类似的，区别就是会摇树优化。

![image.png](assets/images/di/advanced-02.png)

## ReflectiveInjector 和 StaticInjector 

在 Angular V5 版本之前，内部的注入器是   **ReflectiveInjector**  ，服务不需要通过 @Injectable 标记也可以被使用

```ts
class B {}

class A {
  constructor(@Inject(B) b) { }
}

const i = ReflectiveInjector.resolveAndCreate([A, B]);
const a = i.get(A);
```

下面是`Inject`装饰器实现的代码片段：

```ts
function ParamDecorator(cls: any, unusedKey: any, index: number) {
  ...
  // parameters here will be [ {token: B} ]
  Reflect.defineMetadata('parameters', parameters, cls);
  return cls;
}
```

`ReflectiveInjector`依赖于`Reflect`对象提供的反射能力，来搜集隐式依赖，并通过 reflect-metadata 增强包实现相关功能，但是这种处理方式有一些问题：

- `ReflectiveInjector`依赖`Reflect`和 reflect-metadata 增强包，兼容性差。
- 包体积变大。
- 性能问题，使用反射需要维护一个大的 Map。


使用`StaticInjector`的代码如下：

```ts
class B {}
class A { constructor(b) {} }
const i = Injector.create([{provide: A, useClass: A, deps: [B]]};
const a = i.get(A);
```

为什么叫静态注入器，是因为很多依赖关系在编译时就已经确定，我不需要在运行时通过反射获取。

## 注入组件/指令/模块/管道 

在 Angular 中不仅仅服务可以注入，所有的内置装饰器`@Component()`、`@Directive()`、`@Module()`、`@Pipe()`等都可被注入，注入的解析逻辑和服务一样，先从 `ElementInjector`层级找，再从`ModuleInjector`层级找，这些都是 Angular 框架底层提供的能力，其实已经超出了依赖注入本身的范畴，所以为什么很难把`StaticInjector`独立出去呢，因为很多功能和 Angular 的视图强绑定的。


## 防止重复导入 CoreModule

只有根模块`AppModule`才能导入`CoreModule`，如果一个惰性加载模块也导入了它， 该应用就会为服务生成多个实例，要想防止惰性加载模块重复导入`CoreModule`，可以添加如下的`CoreModule`构造函数。

```ts
// src/app/core/core.module.ts
constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
  if (parentModule) {
    throw new Error(
      'CoreModule is already loaded. Import it in the AppModule only');
  }
}
```

## 派生类注入服务

如果基础组件有依赖注入，必须要在派生类中重新提供和重新注入它们，并将它们通过构造函数传给基类。

原则：

- 让构造函数保持简单 - 构造函数应该只用来初始化变量，获取数据在`ngOnInit`中进行。
- 通过覆写排序函数达到自定义行为的目的。
- 尽量避免使用组件基类，如果需要特别注意生命周期函数。

![image.png](assets/images/di/advanced-03.png)
![image.png](assets/images/di/advanced-04.png)

## forwardRef 打破循环

这是一个很有意思的问题，本质上和 Angular 无关，应该是 JS 特性有关。

### Javascript 中的 Hoisting（变量提升）

我们简单通过下面三个示例了解一下 JS 中的变量提升

```js
console.log(num); // 打印 undefined
var num;
num = 6;
```

```js
console.log(square(5)); // 会打印出 25
/* ... */
function square(n) { return n*n }
```

```js
console.log(square); // 打印 undefined
console.log(square(5)); // 抛出异常 Uncaught TypeError: square is not a function
const square = function (n) {
  return n * n;
}
```

通过上述的示例可以得出一下结论：

- 变量只有声明被提升，不提升初始化。
- 函数可以在声明之前调用，函数的声明被提升。
- 函数和变量相比，会被优先提升。


那么 class 是 ES 2015 的新特性，它的行为和函数不一样，**class 不会被提升**。

因为提升会带来一些列问题，比如如下代码，是否还有其他原因暂时没有过多了解。

```ts
const Foo = class {};
class Bar extends Foo {}
// class 如果提升的话这段代码就会报错
```

### 组件注入 NameService

既然 class 不会提升变量，那么如果我在组件后面加一个服务，在 providers 中设置注入提供者就会报错：  **Class 'NameService' used before its declaration.**

```ts
@Component({
    selector: 'app-forward-ref',
    templateUrl: './forward-ref.component.html',
    styleUrls: ['./forward-ref.component.scss'],
    providers: [
        {
           provide: NameService,
           useClass: NameService
        }
    ]
})
export class ForwardRefComponent {}

@Injectable()
class NameService {
    name = 'why520crazy';
}
```

解决这个问题有2个办法：

- 第一就是把`NameService`移动到`ForwardRefComponent`组件前。
- 第二就是使用`provide: forwardRef(() => NameService)`。

`forwardRef`实现原理很简单，就是让`provide`存储一个闭包的函数，在定义式不调用，在注入的时候获取 Token 再调用闭包函数返回`NameService`的类型，此时 JS 已经完整执行过，`NameService`已经定义。


那么此处大家可以想一个有意思的问题，如果在`AClass`的装饰器`MyDecorator`传入参数`AClass`会和上面的结果一样，报   **Class 'AClass' used before its declaration. **  错误吗？

```ts
@MyDecorator(AClass)
class AClass {}

function MyDecorator(type: Function) {
    return function (target: any) {};
}
```

答案是: 不会

原因是: TypeScript 在转换装饰器的时候，回把装饰器函数放到类定义的后面。
