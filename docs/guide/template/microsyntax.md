---
title: 微语法
order: 1
---

<!-- # 揭秘 Angular 模板微语法 -->

微语法，又称模板微语法，是 Angular 框架中的一种**轻量级语言**，由 Angular 解释和使用。

微语法与 Angular 的**结构型指令**密切相关，它允许我们使用简洁、友好且易读的字符串来快速配置指令。这种微语法机制同样适用于自定义的结构型指令。

在深入讨论微语法之前，我们先来了解一下 Angular 指令（directive）的概念。

## 指令

在 Angular 中，指令被划分为**三种**，它们分别是：

- 组件型指令：带有模板的指令。这种指令类型是最常见的指令类型。
- 属性型指令：更改元素、组件或其他指令的外观或行为的指令。
- 结构型指令：通过添加和删除 DOM 元素来更改 DOM 布局。

> 你可能会困惑，为什么组件会是指令？事实上，所有组件皆为指令，组件派生自指令。从技术角度上来讲，组件就是一个自带模板的指令。

## 结构型指令

结构型指令的职责是负责 HTML 布局，它们具有塑造或重塑 DOM 结构的能力，比如添加、移除或维护这些 DOM 元素。

Angular 提供了一组内置的结构指令，例如 `NgIf`、`NgForOf`、`NgSwitchCase`、`NgComponentOutlet` 等。

## 星号前缀

在使用结构指令时，它们通常以星号 `*` 为前缀，例如 `*ngIf`。这种约定是 Angular 提供的一种速记形式，Angular 会将其解释并转换为完整形式的指令属性绑定；具体而言，Angular 会将结构指令前面的星号转换为包围宿主元素及其后代的 `<ng-template>`，例如：

```html
<div *ngIf="hero" class="name">{{ hero.name }}</div>
```

Angular 会将 `*` 翻译为 `<ng-template>`，然后将结构指令的绑定**展开**为完整的属性绑定，并将这些绑定**转移**到 `<ng-template>` 中去：

```html
<ng-template [ngIf]="hero">
  <div class="name">{{ hero.name }}</div>
</ng-template>
```

细心的你会发现，当结构型指令的微语法被解析并展开后，它们实际上是属性型指令的一种形式。但与普通属性型指令不同的是，它们是**附加**在 `<ng-template>` 上的，并且结构指令本身具备**操纵**这个 `<ng-template>` 的能力。

> 所有能够操纵其所**附在**的 `<ng-template>` 的指令都可以是结构型指令。

## 语法格式

这是从 Angular 文档上提供的微语法格式参考：

```html
*:prefix="( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )*"
```

看上去十分抽象，令人困惑，让我们来逐步简化它。

我们先删除一些无关紧要的符号（`:` 与 `'`），并将 `keyExp` 改写为全写 `keyExpression`，然后打开语法高亮：

![](assets/images/template/microsyntax-text.png)

看起来变得更清晰了，但仍然有些复杂。放心，我先来解释一些比较简单的白色符号，以便更好地理解：

- `()` 表示一对括号为一组；
- `?` 表示可选；
- `*` 表示可以出现零次或多次。
- `|` 表示或（OR）

接下来，我们可以去掉这些符号，减少视觉上的混乱；然后采用颜色对这些语法关键字进行分类，使相同类型的关键字具有相同的颜色。

![](assets/images/template/microsyntax-group.png)

让我们更进一步，消除这些文字标注，并改进样式：

![](assets/images/template/microsyntax-group-block.png)

看上去更清晰了！我们先来简单的认识一下这些关键字，稍后我们会更加深入地研究它们：

| 关键字          | 描述                            | 示例                                    |
| --------------- | ------------------------------- | --------------------------------------- |
| `prefix`        | 指令输入的前缀                  |                                         |
| `let`           | 用于声明模板输入变量            | `let item`、`let idx=index`、...        |
| `as`            | 与 `let` 基本相同，但语法不同   | `as item`、`index as idx`、...          |
| `expression`    | 标准的 Angular 表达式           | `1 > 0`、`[1, 2]`、`value \| pipe`、... |
| `keyExpression` | `key` + `expression` 的组合语法 | *ngFor="let item `of array`"            |
| `;`、`,`        | 可选的语句结束符、分隔符        |                                         |

## 语法解析

为了更快地学习，我们以大家熟悉的 `NgFor` 结构指令为例。在开始之前，我们先来快速查看一下 `NgFor` 结构指令的基本定义：

```ts
/* 简化版本 */
@Directive({
  selector: '[ngFor][ngForOf]'
})
class NgForOf<T> {
  @Input() ngForOf: T[];
  @Input() ngForTrackBy: TrackByFunction;
  template: TemplateRef<NgForOfContext<T>>;
}
```

我们注意到，实际上 `NgFor` 结构指令的准确名称为 `NgForOf`:

- 它的选择器被定义为 `[ngFor][ngForOf]`，也就是元素上必须**同时**拥有 `ngFor` 与 `ngForOf` 两个属性；
- 它**主要**接收两个指令输入，分别是 `ngForOf` 和 `ngForTrackBy`；
- 它还为它**所在**的 `<ng-template>` 提供了一个模板上下文，这个上下文的定义是：

```ts
/* 简化版本 */
interface NgForOfContext<T> {
  $implicit: T;
  ngForOf: T[];
  index: number;
  count: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
}
```

也就是说，`NgFor` 指令所在的 `<ng-template>` 上可以接收如下模板输入变量，这些变量均由 `NgFor` 指令来传递：

```html
<ng-template
  let-item="$implicit"
  let-array="ngForOf"
  let-idx="index"
  let-length="count"
  let-first="first"
  let-last="last"
  let-even="even"
  let-odd="odd">
</ng-template>
```

让我们忘掉微语法，只根据 `NgFor` 结构指令的定义，我们需要以这种方式来使用它：

```html
<ng-template ngFor [ngForOf]="heros" let-hero let-idx="index">
  <div>{{ hero.name }}</div>
</ng-template>
```

如果使用微语法，也就是更为常见的写法，它应该是这样的：

```html
<div *ngFor="let hero of heros; let idx=index">
  {{ hero.name }}
</div>
```

那么 Angular 究竟是如何将微语法翻译为普通写法的呢？让我们只关注微语法部分，并与语法参考规则进行对照：

![](assets/images/template/microsyntax-group-block.png)
![](assets/images/template/ngfor-of-let.png)

我们先来看一下 “`*ngFor`” 部分：

- 其中 `*` 便是之前我们介绍的星号前缀，Angular 会将它翻译为一个 `<ng-template>`。
- 而 `ngFor` 则是 `NgFor` 指令的输入的属性名前缀，也就是 `ngForOf` 和 `ngForTrackBy` 的共同前缀。

### let（红色）

接着是属性值部分，先来看一下 `let` 部分，也就是红色部分：

- `let hero`
- `let idx=index`

`let` 关键字用于声明模板输入变量，我们可以在模板中引用这个变量。在这个例子中，输入变量就是 `hero` 和 `idx`，微语法解析器会把`let hero` 和 `let idx` 翻译成 `<ng-template>` 上的模板输入变量：

| 微语法          | 原始写法                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `let hero`      | `<ng-template let-hero="$implicit">`（与 `<ng-template let-hero>` 等效） |
| `let idx=index` | `<ng-template let-idx="index">`                                          |

我们可以注意到，`let hero` 被翻译为了 `let-hero="$implicit"`，这说明如果不指定 `let` 的值，则会使用默认值 `$implicit`。

### keyExpression（紫色）

然后是紫色的 `of heros`，它是 `key` + `expression` 的组合语法。

前面已经介绍过，`expression` 是标准 Angular 表达式，那 `key` 是什么？我们这样来看一下：

- `key expression`
- `of heros`

显而易见，`heros` 是 `expression`，而 `of` 就是 `key`。那这个 `of` 是从哪里来的呢？回想一下前面我们提到的 `prefix` 前缀。

在这个例子中，前缀为 `ngFor`，那么 `prefix + key = prefixKey`，也就是 `ngFor + of = ngForOf`。而 `ngForOf` 正是 `NgFor` 指令的一个输入。

没错，Angular 就是这样来翻译 `keyExpression` 的。微语法解析器接收 `of`，把它的首字母大写（of -> Of），并且给它们加上指令的属性名（ngFor）前缀，最终生成的名字是 `ngForOf`！

理解这部分可能是微语法中最具挑战性的。一旦理解，你就基本掌握了微语法的要领。

让我们再来看一个例子：

有时候在使用 `*ngFor` 的时候，我们还会传递 `trackBy` 参数，用于提升列表渲染性能：

![](assets/images/template/ngfor-of-trackby.png)

可以注意到，`of hero` 和 `trackBy: trackFn` 都显示为紫色，这表明它们都是 `keyExpression`。不同的是，`trackBy: trackFn` 中包含了一个 `:` 符号。这个冒号是**可选**的，但通常为了提高可读性，我们会选择保留它。

来看看微语法解析器是如何解释它的：

```html
<ng-template ngFor let-hero [ngForOf]="heros" [ngForTrackBy]="trackFn">
```

与 `ngForOf` 一样，微语法解析器接收 `trackBy`，把它的首字母大写（trackBy -> TrackBy），并且给它们加上指令的属性名（ngFor）前缀，最终生成的名字是 `ngForTrackBy`。

并且 `keyExpression` 之间的顺序是不固定的，这意味着 `ngFor` 可以有更多写法：

```html
<div *ngFor="let hero; of: heros; trackBy: trackFn"></div>
<div *ngFor="let hero; trackBy: trackFn; of: heros"></div>
<div *ngFor="let hero trackBy trackFn of heros"></div>
```

以上几种写法都是等效的，它们都符合微语法的规则，只是在一些可选符号和书写顺序上有所不同。

### as（蓝色）

`as` 语法 与 `let` 语法在意思上基本相同，但语法稍有不同，我们来看一个例子：

![](assets/images/template/ngfor-of-as.png)

与 `let` 语法类似，微语法解析器会将 `index as idx` 翻译为 `<ng-template>` 上的一个模板输入变量：

```html
<ng-template ngFor let-hero [ngForOf]="heros" let-idx="index">
```

这很好理解，它的用法与 `let` 语法基本相同，但它还有一种高级用法。

这次我们使用 `NgIf` 结构指令来举例。同样的，我们先来看一下 `NgIf` 结构指令的基本定义：

```ts
/* 简化版本 */
@Directive({
  selector: '[ngIf]'
})
class NgIf<T> {
  @Input() ngIf: T;
  template: TemplateRef<NgIfContext<T>>;
}
```

通过 `NgIf` 指令的定义，我们可以得知：

- 它的选择器被定义为 `[ngIf]`
- 它**主要**接收一个名为 `ngIf` 的输入（与选择器同名）。
- 它还为它**所在**的 `<ng-template>` 提供了一个模板上下文，这个上下文的定义是：

```ts
/* 简化版本 */
interface NgIfContext<T> {
  $implicit: T;
  ngIf: T;
}
```

也就是说，`NgIf` 指令所在的 `<ng-template>` 上可以接收如下模板输入变量，这些变量均由 `NgIf` 指令来传递：

```html
<ng-template let-value="$implicit" let-value2="ngIf">
```

`NgIf` 结构指令的用法非常简单，我们直接来查看微语法部分：

![](assets/images/template/ngif.png)

橙色的 `1 > 0` 是一个 `expression`，也就是标准 Angular 表达式。

有时候我们在 `*ngIf` 中使用 `async` 管道时，通常还会搭配 `as` 关键字，将管道的输出结果**储存**为一个变量，以便在模板中复用它：

```html
<div *ngIf="(obs$ | async) as hero">{{ hero.name }}</div>
```

其实有没有管道都可以这样来使用 `as` 语法。我们把管道拿掉，只关注微语法部分，开启语法高亮：

![](assets/images/template/ngif-as.png)

我们可以发现，`hero` 与 `as alias` 是分开的，`hero` 只是一个 `expression`，并没有在本质上“将 `hero` 作为 `alias`”。尽管如此，在视觉上却呈现出一种“将 `hero` 作为 `alias`”的感觉，并且符合直觉。

那么究竟这里是将什么东西来作为 `alias` 呢？

事实上，这里的 `as alias` 是应用在 `prefix` 上的，也就是 `ngIf`，来看看微语法解析器是如何解释它的：

```html
<ng-template [ngIf]="hero" let-alias="ngIf">
```

现在我们可以了解到，当 `as` 前面不是一个模板输入变量时，微语法解析器会自动将 `prefix` 视作变量名。因此，这里的完整形式应该是这样的：

```html
<div *ngIf="hero; ngIf as alias">
```

通过指令定义可以得知，模板上除了有一个与选择器同名的 `ngIf` 变量，还有一个名为 `$implicit` 的隐式变量，我们可以使用 `let` 语法去取到它：

```html
<div *ngIf="hero; let alias">
```

我们还可以把 `ngIf` 前缀缩短为 `ng`，甚至更短。此时需要这样来使用：

```html
<div *ng="let alias1 if hero; let alias2=ngIf">
```

[查看在线示例](https://stackblitz.com/edit/stackblitz-starters-fvi7go?file=src%2Fmain.ts)

看起来与 `*ngFor` 的书写方式有些相似，但这种写法也是完全符合微语法的语法规则的。根据我们之前学到的知识，要理解它也是比较容易的：

![](assets/images/template/ng-if-let.png)

我们重点关注一下紫色的 `if hero`，它是一个 `keyExpression`。微语法解析器接收 `if`，把它的首字母大写（if -> If），并且给它们加上指令的属性名（ng）前缀，最终生成的名字是 `ngIf`。

<br>

> 🧠 **小测验**
>
> `ngFor` 也能把前缀缩短为 `ng` 来使用吗？如果可以，微语法应该怎么写？（答案在文末揭晓）

## 语法实战

通过实践是加深对微语法理解的极佳方式。尝试编写自己的自定义结构型指令，这样可以更直观地体验微语法的作用和用法。通过编写实际的 Angular 模板代码，你可以更深入地理解和熟悉微语法的工作原理和实际应用场景。

### *myVar

让我们创建一个 `*myVar` 结构指令，用于在模板中直接声明可复用的模板变量，我们期望可以像这样使用它：

```html
<div *myVar="123 * 5 as value">{{ value }}</div>
<div *myVar="hero.name; let name">{{ name }}</div>
<div *myVar="value | pipe as hero">{{ hero.name }}</div>
<div *myVar="value | pipe; let hero">{{ hero.name }}</div>
```

它的写法有些类似于 `*ngIf`，但是专门用于声明模板局部变量，不会支持条件渲染模板。

我们来简单分析一下这个指令：

- 首先它的选择器需要定义为 `[myVar]`；
- 它接收一个与选择器**同名**的 `myVar` 输入，并且为了能够复用它的值类型，我们还需要定义一个泛型 `T`；
- 通过注入 [`TemplateRef`](https://angular.io/api/core/TemplateRef) 对象，我们可以得到当前指令**所在**的 `<ng-template>` 的引用对象；
- 为了渲染 `<ng-template>`，我们需要使用 [`ViewContainerRef`](https://angular.io/api/core/ViewContainerRef)，通过注入直接得到它；
- 为了简单起见，我们这里不会去处理指令输入值发生变更的情况。
- 我们需要支持 `as hero` 与 `let hero` 语法：
  - `as hero` 全写为 `myVar as hero`；
  - `let hero` 全写为 `let hero=$implicit`
  这意味着我们需要提供一个模板上下文：`{ myVar, $implicit }`
- 不需要处理模板视图销毁的逻辑，因为它会随着指令的销毁而销毁。

> 为了改善开发体验，我们还会利用静态属性 `ngTemplateContextGuard` 来声明模板上下文的类型。它不属于当前讨论的主题范围，请自行参考[相关文档](https://angular.io/guide/structural-directives#making-in-template-type-requirements-more-specific-with-template-guards)获取更多信息。

直接来看最终的代码实现：

```ts
import { Directive, OnInit, Input, inject, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[myVar]'
})
export class MyVarDirective<T> implements OnInit {
  private template: TemplateRef<MyVarContext<T>> = inject(TemplateRef);
  private container = inject(ViewContainerRef);

  @Input() myVar!: T;

  ngOnInit() {
    // 创建上下文
    const context: MyVarContext<T> = {
      myVar: this.myVar,
      $implicit: this.myVar
    };
    // 渲染模板，并传入上下文
    this.container.createEmbeddedView(this.template, context);
  }

  // 可选的模板类型守卫，帮助模板编译器确定模板上下文类型
  static ngTemplateContextGuard<T>(
    dir: MyVarDirective<T>,
    ctx: unknown
  ): ctx is MyVarContext<T> {
    return true;
  }
}

/** TemplateRef 上下文接口 */
interface MyVarContext<T> {
  myVar: T;
  $implicit: T;
}
```

[查看在线示例](https://stackblitz.com/edit/stackblitz-starters-asstkc?file=src%2Fmain.ts)，Enjoy!

### *myInject

我们再来写一个 `*myInject` 结构指令，用于在模板使用依赖注入（DI）功能。我们希望能够像这样使用它：

```html
<button *myInject="MyService as service" (click)="service.action()">
  Tap me
</button>

<button *myInject="MyService as service; optional: true" (click)="service?.action()">
  Tap me
</button>

<button *myInject="MyService as service; host: true; skipSelf: true" (click)="service.action()">
  Tap me
</button>
```

我们来简单分析一下这个指令：

- 首先它的选择器需要定义为 `[myInject]`；
- 它**主要**接受一个与选择器**同名**的 `myInject` 输入，以及一系列注入选项输入（`host`、`optional` 等）。需要注意的是，为了使用微语法，这些输入的名称都需要有 `myInject` 前缀。
- 通过注入 `TemplateRef` 对象，我们可以得到当前指令所在的 `<ng-template>` 的引用对象；
- 为了渲染 `<ng-template>`，我们需要使用 `ViewContainerRef`，通过注入直接得到它；
- 为了简单起见，我们这里不会去处理指令输入值发生变更的情况。
- 为了支持 `as value` 语法（全写为 `myInject as value`），我们的模板上下文需要定义为 `{ myInject }`

来看看最终代码实现：

```ts
import { Directive, inject, Injector, Input, OnInit, ProviderToken, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[myInject]',
})
export class MyInjectDirective<T extends ProviderToken<any>> implements OnInit {
  private template = inject(TemplateRef);
  private container = inject(ViewContainerRef);
  private injector = inject(Injector);

  @Input() myInject!: T;
  @Input() myInjectDefault?: ProviderTokenValue<T>;
  @Input() myInjectHost?: boolean;
  @Input() myInjectSelf?: boolean;
  @Input() myInjectSkipSelf?: boolean;
  @Input() myInjectOptional?: boolean;

  ngOnInit() {
    // 创建上下文
    const context: MyInjectContext<T> = {
      myInject: this.injector.get(this.myInject, this.myInjectDefault, {
        host: this.myInjectHost,
        self: this.myInjectSelf,
        skipSelf: this.myInjectSkipSelf,
        optional: this.myInjectOptional,
      }),
    };
    // 渲染模板，并传入上下文
    this.container.createEmbeddedView(this.template, context);
  }

  // 可选的模板类型守卫，帮助模板编译器确定模板上下文类型
  static ngTemplateContextGuard<T extends ProviderToken<any>>(
    dir: MyInjectDirective<T>,
    ctx: unknown
  ): ctx is MyInjectContext<T> {
    return true;
  }
}

/** 用于提取 ProviderToken<V> 中的泛型 V 的类型 */
type ProviderTokenValue<T> = T extends ProviderToken<infer V> ? V : never;

/** TemplateRef 上下文接口 */
interface MyInjectContext<T extends ProviderToken<any>> {
  myInject: ProviderTokenValue<T>;
}
```

[查看在线示例](https://stackblitz.com/edit/stackblitz-starters-3fwbf7?file=src%2Fmain.ts)，Enjoy!

<br>

> 💡 **答案揭晓**
>
> `ngFor` 也**可以**把前缀缩短为 `ng` 来使用，写法如下：
>
> ```html
> <div *ng="let hero; forOf heros; for">
> ```

## Reference

- https://angular.io/guide/built-in-directives
- https://angular.io/guide/structural-directives
- https://angular.io/guide/template-reference-variables#template-input-variable
