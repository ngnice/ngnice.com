---
title: 原理图
order: 15
hidden: true
---

关于 Angular 原理图的介绍和如何使用可以直接看官方文档：https://angular.cn/guide/schematics

本文是 GitHub 仓储 [angular_devkit/schematics](https://github.com/angular/angular-cli/tree/master/packages/angular_devkit/schematics) 的中文翻译。

# 原理图
> 现代 Web 的一个脚手架库。

## 描述
原理图是转换现有文件系统的生成器。它可以创建文件、重构现有文件或移动文件。

原理图与其他生成器（如 Yeoman 或 Yarn Create）的区别在于，原理图纯粹是描述性的；原理图是没有副作用的，在所有内容都提交之前，不会对实际的文件系统应用任何更改。根据设计，原理图中没有副作用。


# 词汇表

| 术语 | 描述 |
|------|-------------|
| **Schematics** | 在现有文件系统上执行描述性代码而不产生副作用的生成器。|
| **Collection** | 原理图元数据列表。原理图可以在集合中按名称引用。|
| **Tool**       | 使用原理图库的代码。|
| **Tree**       | 用于更改的暂存区域，包含原始文件系统和要应用于该系统的更改列表。 |
| **Rule**       | 将 Action 应用于`Tree`的函数。它返回一个新的`Tree`，其中包含所有转换。 |
| **Source**     | 从空文件系统创建一个全新的`Tree`的函数。例如: 文件源可以从磁盘读取文件，并为每个文件创建 Create Action。
| **Action**     | 需要验证并提交到文件系统或`Tree`的原子操作。Action 由原理图创建。 |
| **Sink**       | 所有`Action`的最终结果。 |

# 工具
原理图是一个类库，它本身不执行，[reference CLI](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics_cli/bin/schematics.ts) 在这个仓储中可用，并且发布到 NPM [@angular-devkit/schematics-cli](https://www.npmjs.com/package/@angular-devkit/schematics-cli)。此档解释了库的用法和工具API，但不涉及工具实现本身。

工具负责以下任务：
1. 创建 Schematic Engine，并传入一个集合和原理图加载器。
1. 理解并遵循原理图元数据和集合之间的依赖关系。原理图可以引用依赖项，工具有责任遵循这些依赖项。reference CLI 使用 NPM 包的形式对集合起作用。
1. 创建 Options 对象。Options 可以是任何东西，但是 Schematics 可以指定一个遵守格式的 JSON Schema。例如: reference CLI 将参数解析为 JSON 对象，并使用 Schema 指定的格式对其进行验证。
1. Schematics 提供了一些 JSON Schema 格式，用于工具添加时的验证。可以验证paths、html selectors和 app names。请参考 CLI 了解如何添加这些内容。
1. 调用 Schematics 时会带上原始的 Tree。原始的 Tree 表示文件系统的初始状态。reference CLI 在当前牡目录使用原始 Tree。
1. 创建一个接收器(Sink)并将原理图的结果提交给接收器(Sink)。类库提供了许多接收器，例如`FileSystemSink`和`DryRunSink`。
1. 通过类库输出传播的所有日志，包括调试信息。

工具API由以下部分组成：

## 引擎(Engine)
`SchematicEngine`负责加载和构造`Collection`和`Schematics`。在创建引擎时，该工具提供一个`EngineHost`接口，`EngineHost`表示如何通过一个集合名称创建`CollectionDescription`，以及如何创建`SchematicDescription`


# 原理图 Schematics (Generators)
原理图是生成器，并且是 `Collection` 的一部分。


## 集合 (Collection)
集合通过一个`collection.json`文件定义的（在 reference CLI 中）。JSON 定义有如下属性：

| 属性名 | 类型 | 描述 |
|---|---|---|
| **name** | `string` | 集合的名称. |
| **version** | `string` | 无用的字段，表示版本. |

## 原理图 (Schematic)

# 操作符(Operators), 源(Sources) 和规则(Rules)
`Source` 是一个`Tree`的生成器；它创建一个新的入口 Root Tree，`Rule`是从`Tree`到另一颗`Tree`的转换。`Schematic`（在根目录下）是通常应用于文件系统的`Rule`。

## Operators
`FileOperator`将更改单个`FileEntry`并返回新的`FileEntry`, 结果遵循以下规则：

1. 如果返回的`FileEntry`为空，则`DeleteAction`将添加到操作列表中。
1. 如果路径已更改，则`RenameAction`将添加到 Action 列表中。
1. 如果内容发生更改，将在操作列表中添加`OverwriteAction`。

使用`FileOperator`创建文件是不可能的。

## 内置操作符(Operators)
原理图库默认提供了多个涵盖基本场景的`Operator`工厂：

| FileOperator | Description |
|---|---|
| `contentTemplate<T>(options: T)` | 应用内容模板（请参见模板章节） |
| `pathTemplate<T>(options: T)` |  应用路径模板 (请参见模板章节) |

## 内置源(Sources)
原理图库默认还提供多个`Source`工厂：

| Source | Description |
|---|---|
| `empty()` | 创建一个源并返回一个空 `Tree`。 |
| `source(tree: Tree)` | 创建一个源并返回一个通过参数传的`Tree`。 |
| `url(url: string)` | 从给定的URL加载文件列表，并返回一个文件`Tree`，这些`Tree`通过`CreateAction`应用于一个空的`Tree`。|
| `apply(source: Source, rules: Rule[])` | 对一个`Source`进行一系列 `Rule` 操作，返回一个新的`Source`。|

## 内置规则(Rules)
原理图库默认还提供多个`Rule`工厂：

| Rule | Description |
|---|---|
| `noop()` | 按原样返回输入的 `Tree`。 |
| `chain(rules: Rule[])` | 返回一个串联多个`Rule`的一个新 `Rule`。 |
| `forEach(op: FileOperator)` | 将运算符应用于输入`Tree`的每个文件，并返回`Rule`。 |
| `move(root: string)` | 将所有文件从输入移动到子目录。 |
| `merge(other: Tree)` | 将输入的`Tree`合并到另一个`Tree`。 |
| `contentTemplate<T>(options: T)` | 将内容模板（请参阅模板部分）应用于整个`Tree`。|
| `pathTemplate<T>(options: T)` | 将路径模板（请参见模板部分）应用于整个`Tree`。 |
| `template<T>(options: T)` | 将路径模板和内容模板（请参见模板部分）应用于整个`Tree`。|
| `filter(predicate: FilePredicate<boolean>)` |返回输入`Tree`，其中包含不传递`FilePredicate`的文件。|


# Templating
As referenced above, some functions are based upon a file templating system, which consists of path and content templating.

The system operates on placeholders defined inside files or their paths as loaded in the `Tree` and fills these in as defined in the following, using values passed into the `Rule` which applies the templating (i.e. `template<T>(options: T)`).

## Path Templating
| Placeholder | Description |
|---|---|
| __variable__ | Replaced with the value of `variable`. |
| __variable@function__ | Replaced with the result of the call `function(variable)`. Can be chained to the left (`__variable@function1@function2__ ` etc).  |

## Content Templating
| Placeholder | Description |
|---|---|
| <%= expression %> | Replaced with the result of the call of the given expression. This only supports direct expressions, no structural (for/if/...) JavaScript. |
| <%- expression %> | Same as above, but the value of the result will be escaped for HTML when inserted (i.e. replacing '<' with '&lt;') |
| <% inline code %> | Inserts the given code into the template structure, allowing to insert structural JavaScript. |
| <%# text %> | A comment, which gets entirely dropped. |


# Examples

## Simple
An example of a simple Schematics which creates a "hello world" file, using an option to determine its path:

```typescript
import {Tree} from '@angular-devkit/schematics';

export default function MySchematic(options: any) {
  return (tree: Tree) => {
    tree.create(options.path + '/hi', 'Hello world!');
    return tree;
  };
}
```

A few things from this example:

1. The function receives the list of options from the tooling.
1. It returns a [`Rule`](src/engine/interface.ts#L73), which is a transformation from a `Tree` to another `Tree`.

## Templating
A simplified example of a Schematics which creates a file containing a new Class, using an option to determine its name:

```typescript
// files/__name@dasherize__.ts

export class <%= classify(name) %> {
}
```

```typescript
// index.ts

import { strings } from '@angular-devkit/core';
import {
  Rule, SchematicContext, SchematicsException, Tree,
  apply, branchAndMerge, mergeWith, template, url,
} from '@angular-devkit/schematics';
import { Schema as ClassOptions } from './schema';

export default function (options: ClassOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException('Option (name) is required.');
    }

    const templateSource = apply(
      url('./files'),
      [
        template({
          ...strings,
          ...options,
        }),
      ]
    );

    return branchAndMerge(mergeWith(templateSource));
  };
}
```

Additional things from this example:
1. `strings` provides the used `dasherize` and `classify` functions, among others.
1. The files are on-disk in the same root directory as the `index.ts` and loaded into a `Tree`.
1. Then the `template` `Rule` fills in the specified templating placeholders. For this, it only knows about the variables and functions passed to it via the options-object.
1. Finally, the resulting `Tree`, containing the new file, is merged with the existing files of the project which the Schematic is run on.

# Future Work
Schematics is not done yet. Here's a list of things we are considering:

* Smart defaults for Options. Having a JavaScript function for default values based on other default values.
* Prompt for input options. This should only be prompted for the original schematics, dependencies to other schematics should not trigger another prompting.
* Tasks for running tooling-specific jobs before and after a schematics has been scaffolded. Such tasks can involve initialize git, or npm install. A specific list of tasks should be provided by the tool, with unsupported tasks generating an error.
