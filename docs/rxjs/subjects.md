---
title: Subjects - 主题
order: 60
---


什么是Subject？在RxJS中， Subject是一种特殊的Observable 类型，它允许将值多播给多个观察者。普通的Observable是单播的（每一个订阅的观察者都拥有自己独立的执行环境），而Subject可以共享一个执行环境。


> Subject是一种可以多播给多个观察者的Observable。与EventEmitter类似：他们都维护着多个监听器的注册表。


每一个Subject都是一个可观察对象。对于一个Subject ，你可以订阅（`subscribe`）它，观察者将会正常接收到数据。从观察者的角度而言，它无法判断自己的执行环境是简单的Observable还是Subject。

在Subject的内部，并不会在被订阅（`subscribe`）后创建新的执行环境。它仅会把给定的观察者注册在观察者列表中。这和其他语言或库中的`addListener`机制类似。

每一个Subject也可以作为观察者。它是一个含有`next(v)`，`error(e)`和`complete()`的对象，要给Subject提供新值，只需要调用`next(theValue)`方法，它会将值多播给所有监听该Subject的观察者们。

下面的例子中，我们在Subject上注册了两个Observer，并且多路推送了一些数值：

```
import { Subject } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

subject.next(1);
subject.next(2);

// 输出:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
```

由于Subject是观察者，这也意味着你可以把它作为订阅（`subscribe`）任何可观察对象的参数，如下面例子所示：

```
import { Subject, from } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

const observable = from([1, 2, 3]);

observable.subscribe(subject); // 你可以传递Subject来订阅observable

// 输出:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```
通过上面的方法，我们基本上可以通过Subject将单播的Observable执行转换为多播。这说明了Subject是将任意的Observable执行共享给多个观察者唯一方法。

还有几种特殊的Subject类型，分别是BehaviorSubject，ReplaySubject，和 AsyncSubject。

# Multicasted Observables

一个`multicasted Observable` 是通过一个含有多个订阅者的Subject来实现的。而普通的`unicast Observable`仅将通知发送给单个观察者。

> 一个multicasted Observable在后台使用一个Subject来使多个Observer看到相同的Observable执行。

在后台，multicast是这样操作的：观察者订阅一个相关的Subject，Subject订阅一个Observable源。下面的示例与前面使用的`observable.subscribe(subject):`示例类似:
```
import { from, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

const source = from([1, 2, 3]);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));

// 通过`subject.subscribe({...})`订阅Subject的Observer:
multicasted.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});
multicasted.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

// 让Subject从数据源订阅开始生效:
multicasted.connect();
```

`multicast`方法返回一个类似于Observable的可观察对象,但是在其被订阅后，它会表现Subject的特性。`multicast`返回一个ConnectableObservable对象，拥有`connect()` 方法。

`connect()`方法非常重要，它决定Observable何时开始执行。因为`connect()`在后台调用`source.subscribe(subject)`之后，`connect()` 会返回一个Subscription，供调用者来取消订阅，从而终止共享的Observable的执行。


## Reference counting
通过`connect()`手动调用和处理Subscription很麻烦。通常，我们希望在有第一个Observer订阅后自动连接，当最后一个Observer取消订阅后自动断开连接。

我们来分析一下下面例子中subscription的过程：

1. 第一个Observer订阅multicasted Observable
2. multicasted observable连接
3. 向第一个Observer发送值为0的next通知
4. 第二个Observer订阅了多播的Observable
5. 向第一个Observer发送值为1的next通知
6. 向第二个Observer发送值为1的next通知
7. 第一个Observer取消了多播的Observable订阅
8. 向第二个Observer发送值为2的next通知
9. 第二个Observer取消了多播的Observable订阅
10. 取消对多路推送的Observable的连接

通过显式地调用connect()，代码如下：
```
import { interval, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

const source = interval(500);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));
let subscription1, subscription2, subscriptionConnect;

subscription1 = multicasted.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});
// 我们应该在这里调用`connect（）`，
// 因为 multicasted 的第一个订阅者对使用值感兴趣
subscriptionConnect = multicasted.connect();

setTimeout(() => {
  subscription2 = multicasted.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
}, 600);

setTimeout(() => {
  subscription1.unsubscribe();
}, 1200);

// 在此处应该取消共享的Observable执行,
// 因为在这之后“multicasted”就不再有订阅者了
setTimeout(() => {
  subscription2.unsubscribe();
  subscriptionConnect.unsubscribe(); // 取消订阅
}, 2000);
```

如果我们不想显式地调用connect()方法，我们可以使用ConnectableObservable的`refCount()`方法(reference counting)。它返回一个Observable来跟踪有多少个订阅者。当订阅者从0增加到1时,它会调用`connect()`方法。只有当订阅者从1变为0时，它才会完全取消订阅，终止进一步的执行。

> refCount 使得多播的Observable在被订阅后自动执行，在最后一个观察者取消订阅后，停止执行。

下面是示例：
```
import { interval, Subject } from 'rxjs';
import { multicast, refCount } from 'rxjs/operators';

const source = interval(500);
const subject = new Subject();
const refCounted = source.pipe(multicast(subject), refCount());
let subscription1, subscription2;

// 调用 `connect()`，因为它是`refCounted`的第一个订阅者
console.log('observerA subscribed');
subscription1 = refCounted.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});

setTimeout(() => {
  console.log('observerB subscribed');
  subscription2 = refCounted.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
}, 600);

setTimeout(() => {
  console.log('observerA unsubscribed');
  subscription1.unsubscribe();
}, 1200);

// 此处共享的Observable的执行将停止
// 因为在这之后`refCounted`将不再有订阅者
setTimeout(() => {
  console.log('observerB unsubscribed');
  subscription2.unsubscribe();
}, 2000);

// 输出:
// observerA subscribed
// observerA: 0
// observerB subscribed
// observerA: 1
// observerB: 1
// observerA unsubscribed
// observerB: 2
// observerB unsubscribed
```
只有ConnectableObservables拥有`refCount()`方法，调用后会返回一个`Observable`而不是新的ConnectableObservable。

## BehaviorSubject
`BehaviorSubject`是Subject的一个衍生类,具有“当前值”的概念。它保存向消费者发送的最新的值。当一个新的Observer订阅后，它都会立即从`BehaviorSubject`接收一个"当前值"。

> BehaviorSubjects非常适于表示“随时间推移的值”。举例来说，Subject表示生日，而BehaviorSubject表示人的年纪。（生日只是一天，一个人的岁数会保持到下一次生日之前。）

下面例子中，展示了用0初始化BehaviorSubject，当Observer订阅它时，0是第一个被推送的值。第二个Observer将会接收到2这个值，尽管它是在2被发送之后订阅的。
```
import { BehaviorSubject } from 'rxjs';
const subject = new BehaviorSubject(0); // 初始化0

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});

subject.next(1);
subject.next(2);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

subject.next(3);

// 输出:
// observerA: 0
// observerA: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

## ReplaySubject
`ReplaySubject`与`BehaviorSubject`类似，它也可以向新的订阅者推送旧数值，但它也可以记录Observable执行的一部分状态。

> 一个ReplaySubject可以记录Observable执行过程中推送的多个值，并向新的订阅者回放它们。

当创建一个`ReplaySubject`时，你可以指定回放值的数量：

```
import { ReplaySubject } from 'rxjs';
const subject = new ReplaySubject(3); // 回放数量：3
subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

subject.next(5);

// 输出:
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerB: 2
// observerB: 3
// observerB: 4
// observerA: 5
// observerB: 5
```
除了缓冲区大小以外，还可以指定一个以毫秒为单位的窗口时间，以确定记录的值可以使用多长时间。下面的例子中，我们把缓冲区的值设置为100，但是窗口时间参数仅为500毫秒。

```
import { ReplaySubject } from 'rxjs';
const subject = new ReplaySubject(100, 500 /* windowTime */);

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});

let i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => {
  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
}, 1000);

// 输出:
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerA: 5
// observerB: 3
// observerB: 4
// observerB: 5
// observerA: 6
// observerB: 6
// ...
```

## AsyncSubject
`AsyncSubject`是Subject的另外一个衍生类，Observable仅会在执行完成后，推送执行环境中的最后一个值。

```
import { AsyncSubject } from 'rxjs';
const subject = new AsyncSubject();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

subject.next(5);
subject.complete();

// 输出:
// observerA: 5
// observerB: 5
```
AsyncSubject 与[last()](https://rxjs.dev/api/operators/last) 操作符相似，等待`complete`推送执行过程的最后一个值。