# napcat-protobuf-runtime
此库是`@protobuf-ts/runtime`再封装方案
## 用途
CodeGen/Proto3文件 的方案处理PB 具有 不适合频繁变动 也不与代码混合的效果 美观度也不高的问题

pb-ts runtime/pb-js runtime 各种库类型提取困难 基于runtime编写困难 pbjs代码不适合打包器 代码美观度不高的问题

既然这样 那么有没有一款既美观 类型提取方便 能和代码写一起 操作简单 语法多样 的封装库呢?