---
title: 介绍
path: 'into'
order: 10
---

RxJS 是一个通过使用可观察序列组合异步和基于事件的程序的库。它提供了一些核心类型：Observable、卫星类型（Observer、Schedulers、Subjects）和一些操作符处理异步事件集合，这些操作符受数组（map、filter、reduce、every等）启发，允许将异步事件作为集合处理。
>可以把 RxJS 看作是事件的 Lodash。

ReactiveX 将观察者模式与迭代器模式以及函数式编程与集合相结合，以满足管理事件序列的理想方式的需要。
RxJS 中解决异步事件管理的基本概念是：
- Observable: 表示未来值或事件的可调用的集合。 
- Observer: 是一个回调的集合，它知道如何监听 Observable 对象传递的值。
- Subscription: 表示一个 Observable 的执行，主要用于取消执行。
- Operators: 是一些纯函数，支持函数式编程风格来处理具有 map、filter、concat、reduce 等操作的集合。
- Subject: 相当于 EventEmitter，也是将值或事件多播给多个观察者的唯一方法。
- Schedulers: 是控制并发性的集中调度器，允许我们在计算发生时进行协调，比如：setTimeout、requestAnimationFrame 或其他。

## 第一个例子
正常注册事件侦听器。

```
document.addEventListener('click', () => console.log('Clicked!'));
```

使用 RxJS 创建一个 Observable 替代。

```
import { fromEvent } from 'rxjs';
fromEvent(document, 'click').subscribe(() => console.log('Clicked!'));
```

## 纯函数
RxJS 的强大之处在于它能够使用纯函数生成值，这意味着你的代码不太容易出错。
通常你会创建一个不纯的函数，非纯函数会导致代码的其他部分可能会扰乱你的状态。

```
let count = 0;
document.addEventListener('click', () => console.log(`Clicked ${++count} times`));
```
使用 RxJS 可以隔离状态。

```
import { fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(scan(count => count + 1, 0))
  .subscribe(count => console.log(`Clicked ${count} times`));
```

`scan`操作符与数组的`reduce`类似。它接受2个参数，一个是回调函数，一个是初始值，回调函数的返回值将作为下次运行传入的参数，第一次执行回调函数的时候传入初始值。

## 流控制
RxJS 提供了一整套操作符，这些操作符可以帮助我们控制事件如何通过可观察对象流动。
下面是使用普通的 JavaScript 实现如何允许每秒最多单击一次：

```
let count = 0;
let rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
});
```

使用 RxJS 实现如下:
```
import { fromEvent } from 'rxjs';
import { throttleTime, scan } from 'rxjs/operators';
​
fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    scan(count => count + 1, 0)
  )
  .subscribe(count => console.log(`Clicked ${count} times`));
```

其他流控制操作符还有 `filter`、`delay`、`debounceTime`、`take`、`takeUntil`、`distinctUntilChanged` 等。

## 值转换
我们可以转换在 Observables 中传递的值。
下面是在纯 JavaScript 中为每次单击添加当前鼠标x位置：
```
let count = 0;
const rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', event => {
  if (Date.now() - lastClick >= rate) {
    count += event.clientX;
    console.log(count);
    lastClick = Date.now();
  }
});
```

使用 RxJS 实现如下:

```
import { fromEvent } from 'rxjs';
import { throttleTime, map, scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    map(event => event.clientX),
    scan((count, clientX) => count + clientX, 0)
  )
  .subscribe(count => console.log(count));
```

其他的类似操作符有：`pluck`, `pairwise`, `sample` 等。
