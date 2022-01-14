---
title: 依赖注入简介
order: 2
---

在[概念](docs/di/concept)章节大致介绍了依赖注入是什么，为什么 Angular 会选择依赖注入，本章节主要从基本使用开始进一步了解 Angular 中的依赖注入。

## 基本使用

### 第一步: 创建可注入服务

通过`@angular/cli`提供的`ng generate service heroes/hero` (简写`ng g s heroes/hero`)命令可以快速的创建一个服务，创建后的服务代码如下：

```ts
// src/app/heroes/hero.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  constructor() { }
}
```
**HeroService** 通过`@Injectable()`装饰器标记为可以被注入的服务，`providedIn: 'root'`表示当前服务在 Root 注入器中提供（简单理解就是这个服务在整个应用所有地方都可以注入）并全局唯一实例。

### 第二步: 注入和使用服务
添加服务后，我们就可以在任何组件中通过构造函数注入**HeroService，** 通过 TS 的构造函数赋值属性的特性设置为公开，这样组件内和模板中都可以使用该服务端的函数和方法。

```ts
// src/app/heroes/hero-list.component
constructor(public heroService: HeroService)
```

简单的代码如下：

```ts
import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
    selector: 'app-hero-list',
    template: 'Heroes: {{heroes | json}}'
})
export class HeroListComponent implements OnInit {
    heroes!: Hero[];
    
    constructor(public heroService: HeroService) {}

    ngOnInit(): void {
        this.heroes = this.heroService.getHeroes();
    }
}
```

除了在组件中注入服务外，在 Angular 中还可以在服务中注入其他服务，当某个服务依赖于另一个服务时，遵循与注入组件相同的模式，比如：`HeroService`要依靠`Logger`服务来记录日志。

```ts
// src/app/heroes/hero.service.ts
import { Injectable } from '@angular/core';
import { HEROES } from './mock-heroes';
import { Logger } from '../logger.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {

  constructor(private logger: Logger) {  }

  getHeroes() {
    this.logger.log('Getting heroes ...');
    return HEROES;
  }
}
```

以上就是在 Angular 中使用依赖注入最简单的的两步，通过面向对象的 API 共享数据和业务逻辑，是不是觉得和简单和易读。

## Angular 依赖注入简介

在熟悉了基本使用后，下面简单介绍一下 Angular 依赖注入的几个基本的元素：

- **@Injectable()** 类装饰器，用来提供元数据，表示一个服务可以被注入的（在之前的版本中服务不加 @Injectable() 也是可以被注入的，后来 5.0 版本改成静态注入器后必须要标识才可以被注入，否则会报错）
- **注入器（Injector** 会创建依赖、维护一个容器来管理这些依赖，并尽可能复用它们，Angular 默认会创建多种注入器，使用者甚至感觉不到他的存在，但是理解注入器的底层逻辑后再看依赖注入就更简单了
- **@Inject()** 构造函数参数装饰器，表示要在组件/指令/管道/服务中注入一个服务
- **提供者 (Provider)** 是一个对象，用来告诉注入器应该如何获取或创建依赖值。

![image.png](assets/images/di/intro-01.png)

<alert>在基本使用的示例中注入服务没有出现`@Inject()`装饰器，这是 Angular DI 提供的简写，注入一个服务的全写如下所示，定义服务通常都是使用类，所以省略`@Inject(HeroService)`极大的简化了样板代码。</alert>

```ts
// src/app/heroes/hero-list.component
class HeroListComponent {
  constructor(@Inject(HeroService) private heroService: HeroService) {}
}
```
