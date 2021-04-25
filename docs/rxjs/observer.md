---
title: Observer - 观察者
order: 30
---

什么是一个Observer? Observer是一个被Observable推送的值的消费者。Observers只是一系列回调，对应于Observable推送的next、error、complete三种类型的通知。下面的示例是一个经典的Observer的对象。

```
const observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};

```

想要使用Observer，需要为Observable的subscribe提供它自己。

```
observable.subscribe(observer);

```

> Observer只是具有三个回调的对象，一个对应于一个Observable可能推送的每种通知类型。

Observers在RxJs也可能只是部分观察者。如果你不提供任何一种回调，Observable的执行仍然将会正常执行，除了一些类型的通知将被忽略，因为它们在Observer

下面的示例是一个没有complete回调的Observer。

```
const observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
};

```
订阅Observable时，你也可以只提供回调作为参数，而不必附加到Observer对象，像这个示例一样。

```
observable.subscribe(x => console.log('Observer got a next value: ' + x));
```

在observable.subscribe内部，它将使用第一个回调参数作为下一个处理程序创建一个Observer对象。 所有三种回调类型都可以作为参数提供。

```
observable.subscribe(
  x => console.log('Observer got a next value: ' + x),
  err => console.error('Observer got an error: ' + err),
  () => console.log('Observer got a complete notification')
);
```
