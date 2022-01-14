---
title: 依赖注入概念
order: 1
---

依赖注入是前端开发者(包括 Angular 开发者)一道很难迈过去的坎，依赖注入到底是什么？为什么要依赖注入？Angular 的依赖注入怎么有那么多概念，看了官方文档一遍后感觉是懂了，但是过一段时间发现又不懂了，这是前端开发者普遍遇到的问题。

<alert>[Angular 官方文档](https://angular.cn/guide/dependency-injection) 关于依赖注入介绍的很挺详细，但是组织的语言过于官方，不易理解，其次就是文档太过分散，没有把依赖注入聚合在一起，有些核心的概念可能在示例中出现了解读，你很难在一个地方找到所有依赖注入的讲解，本系列教程尝试使用一种新的方式和大家说一下依赖注入，大部分内容都来自官方文档。</alert>

## 控制反转和依赖注入

一提起依赖注入，大家就会和控制反转联系在一起，我在看过很多文章之后发现知乎上的一个回答 [Spring IoC有什么好处呢？](https://www.zhihu.com/question/23277575) 介绍的特别详细和易懂，大家不了解的可以阅读一下，简单总结一下就是：

<alert>软件只有到达了一定的复杂度才会需要各种设计原则和模式，那么依赖倒置原则（Dependency Inversion Principle ）就是为了解决软件模块之间的耦合性提出的一种思想，让大型软件变的可维护，高层模块不应该依赖低层模块，两者都应该依赖其抽象，抽象不应该依赖细节，细节应该依赖抽象。那么控制反转（Inversion of Control） 就是依赖倒置原则的一种代码设计思路，具体采用的方法就是所谓的依赖注入（Dependency Injection），通过依赖注入实现控制权的反转，除了依赖注入外，还有可以通过模板方法模式实现控制反转，那么所谓依赖注入，就是把底层类作为参数传入上层类，实现上层类对下层类的"控制"。</alert>

![image.png](assets/images/di/concept-02.png)

以下是一个通过构造函数实现注入的示例代码，那么除了构造函数注入外，还会有 setter 注入和接口注入。

```ts
class Logger {
    log(message: string) {}
}
class HeroesService {
    constructor(logger: Logger) {}
}

const logger = new Logger();
const heroesService = new HeroesService(logger);
```

通过上述示例发现，`HeroesService`不直接创建`Logger`类的实例，统一在外层创建后通过构造函数参数传递给   `HeroesService`，如果应用的类成千上万，那么实例化类的工作就会变得相当繁琐，会有一大推样板代码，为了管理创建依赖工作，一般会使用 **控制反转容器(IoC Container) ** 进行管理。只需要通过如下一行代码即可实现`HeroesService`的创建， `IocContainer`会通过`HeroesService`的构造函数寻找依赖，找到`Logger`并实例化。

```ts
const heroesService = IocContainer.get(HeroesService);
```

如果类很多，依赖层级比较深，那么`IocContainer`会帮我们统一管理依赖，`IocContainer`其实也叫注入器`Injector` , 说的其实就是一回事，Angular 框架中叫`Injector`。

![image.png](assets/images/di/concept-01.png)

关于控制反转和依赖注入更多参考：

[Inversion of Control vs Dependency Injection](https://stackoverflow.com/questions/6550700/inversion-of-control-vs-dependency-injection)  

[Wikipedia Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)  


**依赖注入的优势：**

- 更容易维护
- 协同合作
- 方便单元测试
- 松耦合
- 减少了样板代（Ioc容器/注入器维护管理依赖）
- 扩展应用程序变得更加容易


**依赖注入的缺点：**

- 学习起来有点复杂
- 阅读代码变得抽象
- 依赖注入框架是通过反射或动态编程实现，导致IDE对“查找引用”，“显示调用层次结构”和安全重构变得困难
- 编译时错误被推送到运行时


## Angular 为什么会有依赖注入？

前面我已经说过，只有程序到达一定的复杂度，才会需要各种设计模式和原则等工程化方法提升程序的可维护性，那么 Angular.js 起初是为了解决谷歌内部复杂中大型的前端应用，同时是一批 Java 程序打造的，所以首次在前端中大胆引入了依赖注入，那么 Angular 是基于 Angular.js 打造的新一代前端框架，所以延续了依赖注入特性，并改善了层级注入器，同时采用了更优雅的 TypeScript 装饰器提供 API 形式。


## 服务和依赖注入的关系

Angular 为了解决数据共享和逻辑复用问题，引入了服务的概念，服务简单理解就是一个带有特性功能的类，Angular 提倡把与视图无关的逻辑抽取到服务中，这样可以让组件类更加精简、高效，组件的工作只管用户体验，把业务逻辑相关功能（比如：从服务器获取数据，验证用户输入或直接往控制台中写日志等）委托给各种服务，最后通过 Angular 的依赖注入，这些带有特定功能的服务类可以被任何组件注入并使用。

**Angular 依赖注入：**  连接服务的桥梁，在需要的地方（组件/指令/其他服务）通过构造函数注入依赖的服务，依赖注入 + 服务的组合造就了使用 Angular 可以轻松组织和管理复杂应用。



## 其他框架 React 和 Vue 有依赖注入吗？

可以说有，也可以说没有，React 为了解决全局数据的共享问题，提供了 Context，创建好 Context 后需要在上层组件通过   `<MyContext.Provider value={/* 某个值 */}>`提供依赖值（这个依赖值可以是纯数据对象，也可以带有逻辑），然后在任何的子组件中通过`<MyContext.Consumer>`进行消费（Vue 中也有类似的`provide`和`inject`），其实这些都可以狭隘的理解成最简单的依赖注入，只不过 Context 只解决了数据共享的问题，虽然也可以作为逻辑复用，但是官方不推荐，React 官方先后推出 Mixin、高阶组件、Render Props 以及最新的 Hooks 用来解决逻辑复用问题。

```ts
<MyContext.Consumer>
  {value => /* 基于 context 值进行渲染*/}
</MyContext.Consumer>
```

那么回到 Angular 框架来说，Angular 的服务 + 依赖注入完美解决了数据共享和逻辑复用问题，服务本质上和 React Hooks 没有太多的区别，只是 API 形态不一样，一个是通过函数形式一个是通过类+依赖注入，因为这两个框架的底层机制和思想不一样，导致了 API 表现形式的不同，但是最终都是在解决数据共享和逻辑复用的问题。

