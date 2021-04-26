---
title: Scheduler - 调度器
order: 70
---

**什么是调度器？**调度器控制何时启动订阅和何时传递通知，它由三个部分组成：

- **调度器是一种数据结构**。它知道如何根据优先级或其他标准存储和排队任务。
- **调度器是一个执行上下文**。它表示任务在何时何地执行（例如立即执行或在另一个回调机制中执行，如 setTimeout 或 process.nextTick，或动画帧）。
- **调度器有一个（虚拟）时钟**。它通过调度器上的 getter 方法 `now()` 提供了 “time” 的概念，在特定调度器上调度的任务将只遵循该时钟指示的时间。

> 调度器允许你定义 Observable 在什么执行上下文中向其观察者发送通知。

在下面的示例中，我们采用通常的简单 Observable 同步地发出值 `1`、`2`、`3`，并使用操作符 `observeOn` 指定用于传递这些值的异步调度器。

```
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
}).pipe(
  observeOn(asyncScheduler)
);

console.log('just before subscribe');
observable.subscribe({
  next(x) {
    console.log('got value ' + x)
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
     console.log('done');
  }
});
console.log('just after subscribe');
```

执行结果如下：

```
just before subscribe
just after subscribe
got value 1
got value 2
got value 3
done
```

注意通知 `got value...` 在 `just after subscribe` 后才交付，这与我们目前看到的默认行为不同。这是因为 `observeOn(asyncScheduler)` 在 `new Observable` 和最终的观察者之间引入了一个代理观察者，让我们重命名一些标识符，以便在示例代码中明显区分：

```
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

var observable = new Observable((proxyObserver) => {
  proxyObserver.next(1);
  proxyObserver.next(2);
  proxyObserver.next(3);
  proxyObserver.complete();
}).pipe(
  observeOn(asyncScheduler)
);

var finalObserver = {
  next(x) {
    console.log('got value ' + x)
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
     console.log('done');
  }
};

console.log('just before subscribe');
observable.subscribe(finalObserver);
console.log('just after subscribe');
```

`observeOn(asyncScheduler)` 创建了 `proxyObserver`，它的 `next(val)` 函数大致如下：

```
const proxyObserver = {
  next(val) {
    asyncScheduler.schedule(
      (x) => finalObserver.next(x),
      0 /* delay */,
      val /* will be the x for the function above */
    );
  },

  // ...
}
```

异步调度器使用 `setTimeout` 或 `setInterval` 运行，即使给定的延迟为零。与往常一样，在 JavaScript 中，`setTimeout(fn, 0)` 在下一次事件循环中最早运行函数 `fn`。这就解释了为什么在 `just after subscribe` 发生之后 `got value 1` 被传递到 `finalObserver`。

调度器的 `schedule()` 方法接受一个 `delay` 参数，该参数表示相对于调度器自身内部时钟的时间量。调度器的时钟不需要与实际的时间有任何关系。像 `delay` 这样的时间操作符不是在实际时间上操作的，而是在调度器的时钟指定的时间上操作的。这在测试中特别有用，在测试中，虚拟时间调度器可以用来伪造挂钟时间，而实际上却是同步执行计划的任务。

## 调度器类型

异步调度器是 RxJS 提供的内置调度器之一，每一个调度器都可以通过 `Scheduler` 对象的静态属性来创建和返回。

| 调度器                    | 作用                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `null`                    | 通过不传递任何调度器，通知以同步和递归方式传递，将其用于固定时间操作或尾部递归操作。                                  |
| `queueScheduler`          | 当前事件帧中队列上的计划（蹦床调度器）。将其用于迭代操作。                                                            |
| `asapScheduler`           | 微任务队列上的调度，该队列与用于 Promises 的队列相同。基本上是在 current job 之后，但在 next job 之前。用于异步转换。 |
| `asyncScheduler`          | 调度工作使用 `setInterval`，将此用于基于时间的操作。                                                                  |
| `animationFrameScheduler` | 调度任务将在下一次浏览器内容重新绘制之前。可用于创建平滑的浏览器动画。                                                |

## 使用调度器

你可能已经不知不觉中在 RxJS 代码中使用了调度器，虽然没有指定使用的调度器的类型。这是因为所有处理并发的 Observable 操作符都提供可选的调度器参数，如果不提供调度器，RxJS 将使用最少并发性原则选择一个默认的调度器，这意味着选择引入最少并发量来满足操作符需求的调度器。例如，对于返回带有有限和少量消息的 Observable 的操作符，RxJS 不使用调度器，即 `null` 或 `undefined`。对于返回可能大量或无限多个消息的运算符，将使用队列调度器，对于使用计时器的运算符，使用异步调度器。

因为 RxJS 使用最少的并发调度器，所以如果想引入不同的调度器提高并发性能，可以选择不同的调度器。指定一个特定的调度器，你可以使用那些获取调度器的操作符方法，例如：`from([10, 20, 30], asyncScheduler)`。

**静态创建操作符通常使用调度器作为参数。**例如，`from(array, scheduler)` 允许指定调度器，从数组中转换每一个通知传输时使用。它通常是操作符的最后一个参数，以下静态创建操作符有调度器参数：

- `bindCallback`
- `bindNodeCallback`
- `combineLatest`
- `concat`
- `empty`
- `from`
- `fromPromise`
- `interval`
- `merge`
- `of`
- `range`
- `throw`
- `timer`

**使用 subscribeOn 来确定 subscribe() 调用将在什么上下文中发生。**默认情况下，对 Observable 的 `subscribe()` 调用将是同步且立即发生的。但是，可以使用实例操作符 `subscribeOn(scheduler)` 延迟或计划在给定的调度器上发生实际的订阅。

**使用 observeOn 来确定将在什么上下文中传递通知。**正如我们在上面的例子中看到的，实例操作符 `observeOn(scheduler)` 在源 Observable 和目标观察者之间引入了一个中介观察器，其中中介器使用给定的调度器调度对目标观察者的调用。

**实例操作符可以使用调度器作为参数。**

与时间相关的运算符，如 `bufferTime`, `debounceTime`, `delay`, `auditTime`, `sampleTime`, `throttleTime`, `timeInterval`, `timeout`, `timeoutWith`, `windowTime` 等都将调度器作为最后一个参数，默认情况下在使用 `asyncScheduler`。

其他以调度器为参数的实例运算符：`cache`, `combineLatest`, `concat`, `expand`, `merge`, `publishReplay`, `startWith`。

请注意，`cache` 和 `publishReplay `都接受调度器，因为它们使用 ReplaySubject。ReplaySubject 的构造函数将可选的调度器作为最后一个参数，因为 ReplaySubject 可能处理时间，这只在调度器的上下文中才有意义。默认情况下，ReplaySubject 使用队列调度器提供时钟。
