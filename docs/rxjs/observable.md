---
title: Observable - 可观察的
path: 'observable'
order: 20
---

Observables 是多个值延迟推送的集合，它们将填补下表中缺失的位置：

|               | SINGLE 单值                                                                                             | MULTIPLE 多值                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Pull - 拉** | [Function](https://developer.mozilla.org/en-US/docs/Glossary/Function)                                  | [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **Push - 推** | [Promise](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise) | [Observable](https://rxjs-dev.firebaseapp.com/class/es6/Observable.js~Observable.html)            |

**示例**：下面是一个 Observable，它在订阅时立即（同步）推送值 `1`、`2`、`3`，并且值 `4 `在订阅调用之后一秒后发出并完成：

```
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});
```

要调用 Observable 并查看这些值，我们需要订阅它：

```
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

console.log('just before subscribe');
observable.subscribe({
  next(x) { console.log('got value ' + x); },
  error(err) { console.error('something wrong occurred: ' + err); },
  complete() { console.log('done'); }
});
console.log('just after subscribe');
```

在控制台的执行结果：

```
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
```

## Pull 和 Push

_Pull_ 和 _Push_ 是描述数据生产者如何与数据消费者通信的两种不同的协议。

**什么是 Pull ？**在拉式系统中，消费者决定何时从数据生产者接收数据，生产者自己并不知道数据何时将被交付给消费者。

每个 JavaScript 函数都是一个拉式系统，函数是数据的生产者，调用函数的代码通过从调用中“拉出”一个返回值来消耗数据。

ES2015 引入了[生成器函数和迭代器](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)（`function*`），这是另一种拉式系统，调用代码 `iterator.next()` 是消费者，从迭代器（生产者）中“拉出”多个值。

|               | PRODUCER 生产者                | CONSUMER 消费者                  |
| ------------- | ------------------------------ | -------------------------------- |
| **Pull - 拉** | **被动：**在请求时生成数据     | **主动：**决定何时请求数据       |
| **Push - 推** | **主动：**以自己的速度生成数据 | **被动：**对接收到的数据作出反应 |

**什么是 Push？**在推送系统中，生产者决定何时向消费者发送数据，消费者不知道何时会收到这些数据。

Promises 是当今 JavaScript 中最常见的推送系统类型，Promise（生产者）向已注册的回调（消费者）传递已解析的值，但与函数不同的是，Promise 负责精确地确定何时将该值“推送”到回调。

RxJS 引入了 Observables，一个新的 JavaScript 推送系统，可观察对象是多个值的生产者，将它们“推”给观察者（消费者）。

- 一个 **Function** 是一个延迟的计算过程，它在调用时同步地返回单个值。
- 一个 **Generator** 是一个延迟的计算，它在迭代时同步返回零到（可能）无穷多个值。
- 一个 **Promise** 是一种可能（或不可能）最终返回单个值的计算。
- 一个 **Observable** 是一个延迟的计算，它可以从被调用的时间起同步或异步地返回零到（可能）无穷多个值。

## Observables 概括为函数

与流行的说法相反，Observables 既不像事件发送者，也不像多个值的 Promise，在某些情况下，Observables 可能会像 EventEmitters 一样工作，即当它们使用 RxJS Subjects 进行多播时，但通常它们不会像 EventEmitters 那样工作。

> Observables 类似于没有参数的函数，但将其泛化为允许多个值。

考虑以下代码：

```
function foo() {
  console.log('Hello');
  return 42;
}

const x = foo.call(); // same as foo()
console.log(x);
const y = foo.call(); // same as foo()
console.log(y);
```

我们期望在控制台看到：

```
"Hello"
42
"Hello"
42
```

您可以在上面写下相同的行为，但是使用 Observables：

```
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
});

foo.subscribe(x => {
  console.log(x);
});
foo.subscribe(y => {
  console.log(y);
});
```

控制台输出是相同的

```
"Hello"
42
"Hello"
42
```

因为函数和 Observables 都是惰性计算，如果不调用函数，`console.log('Hello')` 将不会发生，对于 Observables，如果不“调用”它（使用 `subscribe`），则 `console.log('Hello')` 也不会发生的。另外，“调用”或“订阅”是一个独立的操作：两个函数调用会触发两个独立的副作用，两个 Observable 的订阅也会触发两个独立的副作用。与 EventEmitters 不同的是，不管订阅者是否存在，EventEmitters 都会共享副作用并开始执行，而 Observables 没有共享的执行，并且是惰性的。

> 订阅 Observable 类似于调用函数。

有些人声称 Observables 是异步的，这是不正确的，如果用日志包裹函数调用，如下所示：

```
console.log('before');
console.log(foo.call());
console.log('after');
```

输出如下：

```
"before"
"Hello"
42
"after"
```

这与 Observables 的行为是一样的：

```
console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

输出如下：

```
"before"
"Hello"
42
"after"
```

这证明了 `foo` 的订阅是完全同步的，就像函数一样。

> Observables 能够同步或异步地传递值。

Observables 和函数的区别是什么？**随着时间的推移，Observables 可以“返回”多个值，**而函数则不能，你不能这样做：

```
function foo() {
  console.log('Hello');
  return 42;
  return 100; // dead code. will never happen
}
```

函数只能返回一个值，然而，Observables 可以做到：

```
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100); // "return" another value
  subscriber.next(200); // "return" yet another
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

同步输出如下：

```
"before"
"Hello"
42
100
200
"after"
```

但也可以异步“返回”值：

```
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100);
  subscriber.next(200);
  setTimeout(() => {
    subscriber.next(300); // happens asynchronously
  }, 1000);
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

输出如下：

```
"before"
"Hello"
42
100
200
"after"
300
```

结论：

- `func.call()` 表示*“同步给我一个值”*
- `observable.subscribe()` 的意思是*“给我任何数量的值，无论是同步的还是异步的”*

## 一个 Observable 的解剖

使用 `new Observable` 或创建操作符**创建**一个 Observable，使用 `Observer` **订阅**，**执行**向 Observer 发送 `next`/`error`/`complete` 通知，并且它们的执行可以被**释放**，这四方面都是在一个 `Observable` 实例中编码的，但是其中一些方面与其他类型相关，比如观察者和订阅。

核心 Observable 问题：

- **创建** Observables
- **订阅** Observable
- **执行** Observables
- **释放** Observables 执行

### 创建 Observables

`Observable` 构造函数接受一个参数：`subscribe` 函数。

下面的示例创建一个 Observable，以便每秒向订阅者发送字符串`“hi”`。

```
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  const id = setInterval(() => {
    subscriber.next('hi')
  }, 1000);
});
```

> 可以用 new Observable 创建 Observable，但是通常 Observables 是使用创建函数创建的，比如 of、from、interval 等。

在上面的例子中，`subscribe` 函数是描述 Observable 的最重要部分，让我们看看订阅意味着什么。

### 订阅 Observables

Observable 对象 `observable` 在示例中是可以被订阅的，如下：

```
observable.subscribe(x => console.log(x));
```

`observable.subscribe` 和 `new Observable(function subscribe(subscriber) {...})` 中的 `subscribe` 名称一样并不是巧合，在库中，它们是不同的，但为了方便理解，你可以在概念上认为它们是相等的。

这展示了如何订阅调用与同一个 Observable 的多个观察者之间不共享的，当调用 `observable.subscribe` 传递一个订阅者，`Observable(function subscribe(subscriber) {...})` 中的函数 `subscribe` 将针对给定的订阅者运行。每次调用 `observable.subscribe` 触发它自己的独立设置给订阅者。

> 订阅 Observable 类似于调用函数，提供数据将被传递到的回调。

这与事件处理 APIs（如 `addEventListener`/`removeEventListener`）截然不同，`observable.subscribe`，则给定的观察者没有被注册为 Observable 的侦听器，Observable 甚至不维护附加观察者的列表。

订阅调用只是一种启动“可观察执行”并将值或事件传递给该执行的观察者的方法。

### 执行 Observables

`new Observable(function subscribe(subscriber) {...})` 的代码内部表示一个“可观察的执行”（Observable execution），这是一种只对订阅的每个观察者进行的延迟计算，随着时间的推移，执行会产生多个值，可以是同步的，也可以是异步的。

可观察的执行可以提供三种类型的值：

- “Next”通知：发送一个值，如数字、字符串、对象等。
- “Error”通知：发送 JavaScript 错误或异常。
- “Complete”通知：不会发送值，已经完成。

“Next”通知是最重要和最常见的类型：它们表示正在传递给订阅者的实际数据。“Error”和“Complete”通知在 Observable 的执行过程中可能只发生一次，并且只能有其中之一。

这些约束最好用所谓的“Observable 语法”或“契约”来表达，这是一个正则表达式：

```
next*(error|complete)?
```

> 在一个 Observable 的执行中，Next 通知可以传递零到无限个通知，如果传递了一个错误或完成的通知，那么之后就不能再传递其他通知了。

下面是一个 Observable 执行的示例，它传递三个 Next 通知，然后完成：

```
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});
```

Observables 严格遵守 Observable 契约，因此以下代码不会发送 Next 通知 `4`：

```
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // Is not delivered because it would violate the contract
});
```

最好用 `try`/`catch` 块将任何代码包装在 `subscribe` 中，如果捕获到异常，这些代码将发出错误通知：

```
const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // delivers an error if it caught one
  }
});
```

### 释放 Observable 执行

因为 Observable 的执行可能是无限的，并且观察者希望在有限时间内中止执行是很常见的，所以我们需要一个 API 来取消执行。由于每次执行只对一个观察者独占，一旦观察者完成接收值，它就必须有一种方法来停止执行，以避免浪费计算能力或内存资源。

当 `observable.subscribe` 调用时，观察者将附加到新创建的 Observable 执行，此调用还返回一个对象，即订阅 `Subscription`:

```
const subscription = observable.subscribe(x => console.log(x));
```

订阅 Subscription 表示正在进行的执行，并且有一个允许取消该执行的最小 API，在这里阅读有关[订阅类型](https://rxjs-dev.firebaseapp.com/guide/subscription)的更多信息，调用 `subscription.unsubscribe()` 可以取消正在进行的执行：

```
import { from } from 'rxjs';

const observable = from([10, 20, 30]);
const subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

> 当你订阅时，你将获得一个 Subscription，它表示正在进行的执行，可以调用 unsubscribe() 取消执行。

当我们使用 `create()` 创建 Observable 时，每个 Observable 必须定义如何释放该执行的资源，可以通过从函数 `subscribe()` 中返回自定义的 `unsubscribe` 函数来完成此操作。

例如，这是我们使用 `setInterval` 清除间隔执行的方法：

```
const observable = new Observable(function subscribe(subscriber) {
  // Keep track of the interval resource
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  // Provide a way of canceling and disposing the interval resource
  return function unsubscribe() {
    clearInterval(intervalId);
  };
});
```

就像 `observable.subscribe` 看起来和 `new Observable(function subscribe() {...}` 像之外，我们从 `subscribe` 返回的 `unsubscribe` 在概念上等于 `subscription.unsubscribe`, 事实上，如果我们去掉围绕这些概念的 ReactiveX 类型，我们只剩下相当简单的 JavaScript:

```
function subscribe(subscriber) {
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  return function unsubscribe() {
    clearInterval(intervalId);
  };
}

const unsubscribe = subscribe({next: (x) => console.log(x)});

// Later:
unsubscribe(); // dispose the resources
```

我们之所以使用诸如 Observable、Observer 和 Subscription 这样的 Rx 类型是为了获得安全性（比如 Observable 契约）和与操作符的可组合性。
