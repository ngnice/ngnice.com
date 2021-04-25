---
title: Subscription - 订阅
order: 50
---

什么是一个Subscription？Subscription是一个代表可清理资源的对象，通常是一个Observable的执行。Subscription有一个重要的方法`unsubscribe`，它不需要任何参数，只是处理Subscription拥有的资源。在之前的RxJS版本，Subscription被称为‘可清理对象’。

```
import { interval } from 'rxjs';

const observable = interval(1000);
const subscription = observable.subscribe(x => console.log(x));
// Later:
// This cancels the ongoing Observable execution which
// was started by calling subscribe with an Observer.
subscription.unsubscribe();
```
> 一个Subscription实际上有一个`unsubscribe()`方法去释放资源或取消Observable的执行。

Subscriptions也可以放到一起，因此一个Subscription的`unsubscribe()`调用可以取消订阅多个Subscriptions。你可以添加一个Subscription到另一个。

```
import { interval } from 'rxjs';

const observable1 = interval(400);
const observable2 = interval(300);

const subscription = observable1.subscribe(x => console.log('first: ' + x));
const childSubscription = observable2.subscribe(x => console.log('second: ' + x));

subscription.add(childSubscription);

setTimeout(() => {
  // Unsubscribes BOTH subscription and childSubscription
  subscription.unsubscribe();
}, 1000);
```

当执行时，我们可以看见以下输出；
```
second: 0
first: 0
second: 1
first: 1
second: 2
```
Subscriptions也有一个`remove(otherSubscription)`方法，以便于撤销添加子Subscription。

