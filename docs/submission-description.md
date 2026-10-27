# NeoOrg 提交页简要说明

## 中文正文

NeoOrg 是面向未来办公的人与多 Agent 群聊协作工作台。用户可创建群聊，从交付、产品、内容、设计和质量五个岗位中选择 2–5 位 Agent，并通过 @ 发起讨论或提出目标。每个实质性目标由一位负责人持续跟进，按需请求群内成员贡献，再由独立成员评审，形成有负责人、可追踪、可复核的文本交付。系统通过 Vertex AI 调用 Gemini，完成目标理解、内容生成与评审；使用 Firestore 持久化群聊消息、岗位身份、目标、交付结果及恢复检查点；使用 Cloud Run 部署 Web 与 API。云端以服务账号访问模型和数据库，浏览器不接触模型凭证。当前原型未使用 Firebase Hosting 或 Firebase Authentication。

## English description

NeoOrg is a human-and-AI group workspace for the future of work. Users choose 2–5 persistent AI teammates across Delivery, Product, Content, Design and Quality, set a goal, and collaborate through @mentions. Each substantial outcome has one accountable owner, optional contributions from room members, and an independent review of the resulting text delivery against its acceptance criteria. Gemini, accessed through Vertex AI, supports goal understanding, content generation and review. Firestore persists room messages, job profiles, goals, deliveries and recovery checkpoints. Cloud Run hosts both the web app and API. A server-side service account controls model and database access; model credentials are not exposed to the browser. The prototype does not use Firebase Hosting or Firebase Authentication.

## 提交链接

- 作品名称：NeoOrg
- 已部署原型：评审链接单独提供给赛事方，不在公开仓库展示。
- GitHub 代码库：https://github.com/wuyi4514/FishMarket
- 技术说明：https://github.com/wuyi4514/FishMarket/blob/main/docs/technical-overview.md

## 填写说明

- 中文正文与英文正文二选一，分别可直接复制到项目简介或简要说明字段；链接按提交页对应字段单独填写。字数上限以实际页面提示为准。
- 展示名称使用 NeoOrg。仓库和云端 URL 中的 FishMarket 是保留的工程标识，不是另一套提交作品。
- 实际技术链路为 Gemini／Vertex AI、Cloud Run 和 Cloud Firestore。未接入 Firebase Hosting 或 Firebase Authentication，也未连接浏览、邮件等外部业务工具。
- 本文件仅准备填报文字和链接，未填写提交页面、未上传材料、未执行最终提交。PPT 和视频不在本轮工作范围内。
