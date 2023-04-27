## ⁉️ Code Question
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 介绍

基于AI的代码库问答系统。

## 部署
1. 拉取代码
    ```bash
    git clone https://github.com/linkxzhou/code-question.git
    ```

2. 保存您的OPENAI_API_KEY到指定的文件
    ```bash
    echo YOUR_OPENAI_API_KEY > openai_api_key.txt
    ```

3. 配置文件
```json
{
    "name": "{GITHUB_PROJECT}", // 如果是本地仓库，可以命名，如果是github仓库，可以填写git地址
    "exampleQueries": ["问题XXX?"], // 一些样例问题
    "local": true // 本地仓库，将代码放到repository文件夹中
}
```

> 详细可以看[./data/diffusers/metadata.json](./data/diffusers/metadata.json)的例子。

4. 启动容器.
    ```
    docker-compose up
    ```

## 构建
1. 拉取仓库，使用`yarn`安装依赖
2. 运行`yarn lerna run build`
3. 切换目录`./packages/code-question`
4. 拷贝`.env.sample`到`.env.local`, 然后设置`OPENAI_API_KEY`
5. 运行`yarn dev`后可以再网页端访问

## 感谢

非常感谢 [quick-question](https://github.com/TabbyML/quick-question) 做出的贡献，CodeQuestion 从这个项目分支出来的。
