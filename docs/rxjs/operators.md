---
title: Operators - 操作符
order: 40
---

尽管 RxJS 的基础是 Observable（可观察对象），但其最有用地方在于它的操作符。操作符是让复杂的异步代码易于以声明式组合起来必不可少的部分。

## 什么是操作符?

操作符是**函数**，有两种操作符：

**管道操作符**是一种能用语句 `ObservableInstance.pipe(operator())` 把 Observables 管道化的操作符。管道操作符包括 [filter(...)](https://rxjs.dev/api/operators/filter)， 和 [mergeMap(...)](https://rxjs.dev/api/operators/mergeMap) 等。当我们调用时，操作符不会改变已经存在的 Observable 实例。相反，它们会返回一个新的 Observable，其订阅逻辑是基于第一个 Observable。

> 管道操作符是一种将某个 Observable 作为输入，并返回另一个 Observable 的函数。这是一个纯操作：作为输入的 Observable 保持不变。

一个管道操作符本质上是一个纯函数，它将某个 Observable 作为输入，并生成另一个 Observable 作为输出。订阅输出的 Observable 也将会订阅到输入的 Observable。

**创建操作符**是一种被作为独立函数调用的操作符，用来创建一个新的 Observable。例如： `of(1, 2, 3)` 创建了一个将会依次发出 1，2，3 的 Observable。创建操作符在稍后的部分会做更详细地讨论。

例如，被调用的操作符 [map](https://rxjs.dev/api/operators/map) 类似于同名的数组方法。就像`[1, 2, 3].map(x => x * x)` 将会生成`[1, 4, 9]` ，Observable 将会被创建如下：

```
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

map(x => x * x)(of(1, 2, 3)).subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
// value: 4
// value: 9
```

将会发出 `1`, `4`, `9`。另一个有用的操作符是 [first](https://rxjs.dev/api/operators/first):

```
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

first()(of(1, 2, 3)).subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
```

注意 `map` 逻辑上必须动态构造，因为必须为其提供映射功能。相比之下，`first` 可能是一个常量，但它仍然是动态构造的。通常，无论操作符是否需要传入参数，它们都能被构造出来。

## 管道化

管道操作符是函数，因此可以像普通函数那样使用：`op()(obs)` — 但实际中，往往许多操作符会嵌套在一起使用，立马就变得不可读了：`op4()(op3()(op2()(op1()(obs))))` 。因此，Observables 有一个叫做`.pipe()` 的方法 ，可以做到相同的事情 ，但更具有可读性：

```
obs.pipe(
  op1(),
  op2(),
  op3(),
  op3(),
)
```

从风格上讲，即使只有一个操作符，人们也不会用 `op()(obs)`；`obs.pipe(op())` 是普遍地首选写法。

## 创建操作符

**什么是创建操作符？**区别于管道操作符，创建操作符是用来创建具有某些常见预定义行为的 Observable， 或是通过组合其它 Observables 创建出新 Observables 的函数。

创建操作符的一个典型示例是 `interval` 函数。它以一个数字（不是 Observable）作为输入参数，产生一个 Observable 作为输出：

```
import { interval } from 'rxjs';

const observable = interval(1000 /* number of milliseconds */);
```

查看[所有的静态创建操作符列表](https://rxjs.dev/guide/operators#creation-operators)

## 高阶 Observables

通常情况下， Observables 会发出字符串和数字之类的普通值，但我们也经常需要处理 Observables 的 Observables，即所谓的高阶 Observables。例如，假设你有一个发出字符串的 Observables，这些字符串是你要查看的文件链接。代码如下：

```
const fileObservable = urlObservable.pipe(
   map(url => http.get(url)),
);
```

`http.get()` 为每个独立的链接返回一个 Observable（可能是字符串或字符串数组）。这就是 Observable 的 Observable，一个高阶 Observable。

但是如何处理高阶 Observable 呢？通常情况下，是通过扁平化：通过（以某种方式）将高阶 Observable 转换为普通 Observable。例如：

```
const fileObservable = urlObservable.pipe(
   map(url => http.get(url)),
   concatAll(),
);
```

[concatAll()](https://rxjs.dev/api/operators/concatAll) 操作符订阅从“外部”Observable （上例中 urlObservable）发出的每一个“内部” Observable（上例中 http.get() 返回的 Observable） ，并复制这个“内部”Observable 发出的所有值 ，直到这个“内部”Observable 完成，再复制下一个“内部”Observable。所有“内部”Observable 的值都以这种方式被串联，并返回到输出 Observable 中。其它有用的扁平化操作符（称为组合操作符）有：

- [mergeAll()](https://rxjs.dev/api/operators/mergeAll) 订阅每个发出的内部 Observable，并在 Observable 上值到达时（复制这个值，返回到输出 Observable 中），使这个值被发出。
- [switchAll()](https://rxjs.dev/api/operators/switchAll) 订阅第一个发出的内部 Observable，并在这个 Observable 上值到达时（复制这个值，返回到输出 Observable 中），使值被发出，但当下一个内部 Observable 发出时，取消订阅前一个，转而订阅新的内部 Observable。
- [exhaust()](https://rxjs.dev/api/operators/exhaust) 订阅第一个发出的内部 Observable，并在这个 Observable 上值到达时（复制这个值，返回到输出 Observable 中），使值被发出。同时会丢弃所有新到的内部 Observable，直到第一个内部 Observable 完成后，再等待下一个内部 Observable 发出。

就像很多数组库结合 [map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) 和 [flat()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) (或者 `flatten()`) 成单一的 [flatMap()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) ，所有 RxJS 的扁平操作符也都有等价的 map 方法 [concatMap()](https://rxjs.dev/api/operators/concatMap)， [mergeMap()](https://rxjs.dev/api/operators/mergeMap)， [switchMap()](https://rxjs.dev/api/operators/switchMap)， 和 [exhaustMap()](https://rxjs.dev/api/operators/exhaustMap)。

## 弹珠图

要解释操作符的工作方式，文字描述通常是不够用的。很多操作符都与时间有关，例如，他们可能以不同的方式延时，采样，节流，或者防抖发出的值。图表通常是一种更好的工具。弹珠图在视觉上表达了操作符如何工作，图上包括了输入的 Observable(s)，操作符及其参数，以及输出的 Observable。

> 在弹珠图中，时间向右流动，图像描述了随着 Observable 的执行，值（“弹珠”）是怎样被发出的。

弹珠图分析如下:

![marble-diagram-anatomy](/assets/images/marble-diagram-anatomy.svg)

RxJS 官方文档网站中，大量使用了弹珠图来说明操作符怎样工作。其他情况下也可能会用到弹珠图，例如在一个白板上，或者甚至是在我们的单元测试中（像 ASCII 码图）。

## 操作符分类

由于不同的用途，操作符可以被分类为：创建，转换，过滤，组合，多播，错误处理，工具等。在下面的列表中，你将找到按类别组织好的所有操作符。

完整的概述，见[参考页](https://rxjs.dev/api)。

### 创建操作符

- [ajax](https://rxjs.dev/api/ajax/ajax)
- [bindCallback](https://rxjs.dev/api/index/function/bindCallback)
- [bindNodeCallback](https://rxjs.dev/api/index/function/bindNodeCallback)
- [defer](https://rxjs.dev/api/index/function/defer)
- [empty](https://rxjs.dev/api/index/function/empty)
- [from](https://rxjs.dev/api/index/function/from)
- [fromEvent](https://rxjs.dev/api/index/function/fromEvent)
- [fromEventPattern](https://rxjs.dev/api/index/function/fromEventPattern)
- [generate](https://rxjs.dev/api/index/function/generate)
- [interval](https://rxjs.dev/api/index/function/interval)
- [of](https://rxjs.dev/api/index/function/of)
- [range](https://rxjs.dev/api/index/function/range)
- [throwError](https://rxjs.dev/api/index/function/throwError)
- [timer](https://rxjs.dev/api/index/function/timer)
- [iif](https://rxjs.dev/api/index/function/iif)

### 组合创建操作符

这些是 Observable 创建操作符，它们也具有组合功能 -- 发出多个源 Observable 的值。

- [combineLatest](https://rxjs.dev/api/index/function/combineLatest)
- [concat](https://rxjs.dev/api/index/function/concat)
- [forkJoin](https://rxjs.dev/api/index/function/forkJoin)
- [merge](https://rxjs.dev/api/index/function/merge)
- [partition](https://rxjs.dev/api/index/function/partition)
- [race](https://rxjs.dev/api/index/function/race)
- [zip](https://rxjs.dev/api/index/function/zip)

### 转换操作符

- [buffer](https://rxjs.dev/api/operators/buffer)
- [bufferCount](https://rxjs.dev/api/operators/bufferCount)
- [bufferTime](https://rxjs.dev/api/operators/bufferTime)
- [bufferToggle](https://rxjs.dev/api/operators/bufferToggle)
- [bufferWhen](https://rxjs.dev/api/operators/bufferWhen)
- [concatMap](https://rxjs.dev/api/operators/concatMap)
- [concatMapTo](https://rxjs.dev/api/operators/concatMapTo)
- [exhaust](https://rxjs.dev/api/operators/exhaust)
- [exhaustMap](https://rxjs.dev/api/operators/exhaustMap)
- [expand](https://rxjs.dev/api/operators/expand)
- [groupBy](https://rxjs.dev/api/operators/groupBy)
- [map](https://rxjs.dev/api/operators/map)
- [mapTo](https://rxjs.dev/api/operators/mapTo)
- [mergeMap](https://rxjs.dev/api/operators/mergeMap)
- [mergeMapTo](https://rxjs.dev/api/operators/mergeMapTo)
- [mergeScan](https://rxjs.dev/api/operators/mergeScan)
- [pairwise](https://rxjs.dev/api/operators/pairwise)
- [partition](https://rxjs.dev/api/operators/partition)
- [pluck](https://rxjs.dev/api/operators/pluck)
- [scan](https://rxjs.dev/api/operators/scan)
- [switchMap](https://rxjs.dev/api/operators/switchMap)
- [switchMapTo](https://rxjs.dev/api/operators/switchMapTo)
- [window](https://rxjs.dev/api/operators/window)
- [windowCount](https://rxjs.dev/api/operators/windowCount)
- [windowTime](https://rxjs.dev/api/operators/windowTime)
- [windowToggle](https://rxjs.dev/api/operators/windowToggle)
- [windowWhen](https://rxjs.dev/api/operators/windowWhen)

### 过滤操作符

- [audit](https://rxjs.dev/api/operators/audit)
- [auditTime](https://rxjs.dev/api/operators/auditTime)
- [debounce](https://rxjs.dev/api/operators/debounce)
- [debounceTime](https://rxjs.dev/api/operators/debounceTime)
- [distinct](https://rxjs.dev/api/operators/distinct)
- [distinctUntilChanged](https://rxjs.dev/api/operators/distinctUntilChanged)
- [distinctUntilKeyChanged](https://rxjs.dev/api/operators/distinctUntilKeyChanged)
- [elementAt](https://rxjs.dev/api/operators/elementAt)
- [filter](https://rxjs.dev/api/operators/filter)
- [first](https://rxjs.dev/api/operators/first)
- [ignoreElements](https://rxjs.dev/api/operators/ignoreElements)
- [last](https://rxjs.dev/api/operators/last)
- [sample](https://rxjs.dev/api/operators/sample)
- [sampleTime](https://rxjs.dev/api/operators/sampleTime)
- [single](https://rxjs.dev/api/operators/single)
- [skip](https://rxjs.dev/api/operators/skip)
- [skipLast](https://rxjs.dev/api/operators/skipLast)
- [skipUntil](https://rxjs.dev/api/operators/skipUntil)
- [skipWhile](https://rxjs.dev/api/operators/skipWhile)
- [take](https://rxjs.dev/api/operators/take)
- [takeLast](https://rxjs.dev/api/operators/takeLast)
- [takeUntil](https://rxjs.dev/api/operators/takeUntil)
- [takeWhile](https://rxjs.dev/api/operators/takeWhile)
- [throttle](https://rxjs.dev/api/operators/throttle)
- [throttleTime](https://rxjs.dev/api/operators/throttleTime)

### 组合操作符

另见上面的组合创建操作符部分。

- [combineAll](https://rxjs.dev/api/operators/combineAll)
- [concatAll](https://rxjs.dev/api/operators/concatAll)
- [exhaust](https://rxjs.dev/api/operators/exhaust)
- [mergeAll](https://rxjs.dev/api/operators/mergeAll)
- [startWith](https://rxjs.dev/api/operators/startWith)
- [withLatestFrom](https://rxjs.dev/api/operators/withLatestFrom)

### 多播操作符

- [multicast](https://rxjs.dev/api/operators/multicast)
- [publish](https://rxjs.dev/api/operators/publish)
- [publishBehavior](https://rxjs.dev/api/operators/publishBehavior)
- [publishLast](https://rxjs.dev/api/operators/publishLast)
- [publishReplay](https://rxjs.dev/api/operators/publishReplay)
- [share](https://rxjs.dev/api/operators/share)

### 错误处理操作符

- [catchError](https://rxjs.dev/api/operators/catchError)
- [retry](https://rxjs.dev/api/operators/retry)
- [retryWhen](https://rxjs.dev/api/operators/retryWhen)

### 工具操作符

- [tap](https://rxjs.dev/api/operators/tap)
- [delay](https://rxjs.dev/api/operators/delay)
- [delayWhen](https://rxjs.dev/api/operators/delayWhen)
- [dematerialize](https://rxjs.dev/api/operators/dematerialize)
- [materialize](https://rxjs.dev/api/operators/materialize)
- [observeOn](https://rxjs.dev/api/operators/observeOn)
- [subscribeOn](https://rxjs.dev/api/operators/subscribeOn)
- [timeInterval](https://rxjs.dev/api/operators/timeInterval)
- [timestamp](https://rxjs.dev/api/operators/timestamp)
- [timeout](https://rxjs.dev/api/operators/timeout)
- [timeoutWith](https://rxjs.dev/api/operators/timeoutWith)
- [toArray](https://rxjs.dev/api/operators/toArray)

### 条件和布尔操作符

- [defaultIfEmpty](https://rxjs.dev/api/operators/defaultIfEmpty)
- [every](https://rxjs.dev/api/operators/every)
- [find](https://rxjs.dev/api/operators/find)
- [findIndex](https://rxjs.dev/api/operators/findIndex)
- [isEmpty](https://rxjs.dev/api/operators/isEmpty)

### 数学和聚合操作符

- [count](https://rxjs.dev/api/operators/count)
- [max](https://rxjs.dev/api/operators/max)
- [min](https://rxjs.dev/api/operators/min)
- [reduce](https://rxjs.dev/api/operators/reduce)

## 创建自定义操作符

### 使用 pipe() 函数制作新的操作符

如果在你的代码中有个常用的操作符序列，请使用 `pipe()` 函数提取该序列到新的操作符中。即使这一序列不常见，将其变成单个操作符也会提高可读性。

例如，你可以制作一个将奇数值丢弃而将偶数值加倍的函数，如下所示：

```
import { pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

function discardOddDoubleEven() {
  return pipe(
    filter(v => ! (v % 2)),
    map(v => v + v),
  );
}
```

该 `pipe()` 函数与 Observable 的`.pipe()` 方法类似，但不相同。

### 从头开始创建新的操作符

它更复杂，但是如果你必须写一个不能由现有操作符组合出来的操作符（这种情况很少发生），则可以使用 Observable 构造函数从头开始编写操作符，如下所示：

```
import { Observable } from 'rxjs';

function delay(delayInMillis) {
  return (observable) => new Observable(observer => {
    // this function will called each time this
    // Observable is subscribed to.
    const allTimerIDs = new Set();
    const subscription = observable.subscribe({
      next(value) {
        const timerID = setTimeout(() => {
          observer.next(value);
          allTimerIDs.delete(timerID);
        }, delayInMillis);
        allTimerIDs.add(timerID);
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });
    // the return value is the teardown function,
    // which will be invoked when the new
    // Observable is unsubscribed from.
    return () => {
      subscription.unsubscribe();
      allTimerIDs.forEach(timerID => {
        clearTimeout(timerID);
      });
    }
  });
}
```

你必须注意：

1.当订阅输入 Observable 的时候，三种观察者函数都要实现：`next()`， `error()`，和 `complete()` 。

2.当 Observable 完成的时候，要实现一个有清除功能的“清场”函数（在此例中，通过取消订阅和清除所有未完成的定时器）。

3.从接收 Observable 构造函数的函数中返回该清场函数。

当然，这仅是示例；`delay()` 操作符[已经存在了](https://rxjs.dev/api/operators/delay)。
