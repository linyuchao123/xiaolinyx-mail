# xiaolinyx.me 个人邮箱部署记录

本项目基于 [maillab/cloud-mail](https://github.com/maillab/cloud-mail)，导入的上游提交为 `ec7a2bb17c950576c38d7308128cac7696fea169`（MIT）。这里的管理员地址为 `admin@xiaolinyx.me`，网页入口为 `mail.xiaolinyx.me`。网站最终面向任何访客开放注册。

## 当前状态

- 源码已导入，域名已接入 Cloudflare；Resend 已确认 `xiaolinyx.me` 发信域名为 Verified（东京区域），三条 DKIM/SPF 验证记录已通过。Worker 已部署到 `https://mail.xiaolinyx.me`，Safari 已验证打开登录页；D1/KV 已初始化，正式 D1 中有 `admin@xiaolinyx.me` 管理员记录。管理员随机密码仅保存在本机 `mail-worker/.admin-credentials`，JWT 密钥仅保存在 Git 忽略的 `mail-worker/.dev.vars` 并注入 Worker Secret。
- 已在 Wrangler 配置域名和管理员地址。普通用户默认每天最多向 10 个收件人发信、最多拥有 3 个邮箱地址；使用 Resend 时，全站站外发信额外限制为每天 80 个收件人。
- 已将数据库初始化接口改为 `POST /api/init`，密钥通过 `X-Init-Secret` 请求头传送，避免把密钥放进浏览器历史和 URL 日志。
- 上游 GitHub Actions 部署模板会把 JWT 密钥写入普通变量，已移除。先从本机部署，密钥使用 Worker Secret 注入。
- 仓库是公开的。Cloudflare API Token、JWT_SECRET、Resend API Key 等只能放在 GitHub Secrets、Cloudflare Worker Secrets 或项目后台，不能提交到 Git。

## 推荐架构

Namecheap 持有域名；将域名的权威 DNS 改为 Cloudflare（无需转移注册商）。Cloudflare Email Routing 将 `@xiaolinyx.me` 的来信送到 Worker；Worker 使用 D1 保存邮件元数据、KV 保存设置，附件建议存 R2；网页端由同一个 Worker 提供。初期站外发信选择 Resend，代码优先读取 Worker Secret `RESEND_API_KEY`，也兼容后台按域名配置 API Key；Cloudflare Email Sending 可作为后续替代。Resend 免费计划当前限每天 100 封，全站代码先按 80 个收件人保守限流。

这个基座提供网页端邮箱，不提供原生 IMAP/POP3 收件服务。Outlook、Apple Mail、Thunderbird 等客户端不能直接把它当作完整邮箱账户添加。若以后必须支持这些客户端，需要另接邮件服务器或改用完整邮箱托管方案。

## 域名与 DNS

1. 在 Cloudflare 添加 `xiaolinyx.me`，按 Cloudflare 给出的两条 NS 记录到 Namecheap 的域名管理页替换 nameserver。保留 Namecheap 作为注册商。
2. 当前 MX 仍指向 Namecheap 的 5 条 `eforward*.registrar-servers.com` 转发服务。Cloudflare Catch-all 已设为发送到 `xiaolinyx-mail` Worker，但 Email Routing 仍未启用；启用接口报 `Non-Cloudflare MX records exist`。切换前先移除旧 MX，接着启用 Email Routing，让 Cloudflare 自动添加其 MX/SPF/DKIM；核查根域只有一条 SPF TXT。切换期间现有 Namecheap 转发将停止。
3. 在 Worker 配置自定义域名 `mail.xiaolinyx.me`。不要把邮箱 MX 指向这个网页域名。
4. 发信服务会给出 SPF、DKIM、DMARC 所需 DNS 记录；逐项按服务商的实际值添加，不要复制示例值。发信域验证通过后再测试外部收件箱。

## Cloudflare 资源与部署

1. D1 数据库 `xiaolinyx-mail` 和 KV Namespace `xiaolinyx-mail-kv` 已创建；若要长期保存较大附件，再创建 R2 Bucket。
2. `mail-worker/wrangler.toml` 已填入 `db`、`kv` 绑定；R2 仍为可选。域名、管理员和自定义域名已配置；不要在 `[vars]` 写入真实 `jwt_secret`。
3. Worker 已部署并已注入 `jwt_secret` Secret。后续代码更新从 `mail-worker` 目录执行 `pnpm exec wrangler deploy`。
4. 正式 D1/KV 已初始化。由于本机终端直连站点时 TLS 被重置，初始化是在隔离的本地 D1 中运行后通过 Wrangler 分批导入正式 D1，并把默认设置写入正式 KV。
5. 正式管理员账户已通过项目注册逻辑创建并迁移。账户为 `admin@xiaolinyx.me`，密码保存在 Git 忽略的 `mail-worker/.admin-credentials`（文件权限 600）；请在本机查看并登录网页端。访客不能抢注此地址。
6. 在 Cloudflare 创建 Turnstile 站点密钥与密钥；在网页管理设置中填入两者，注册验证选择“始终启用”，最后打开公开注册。没有配置 Turnstile 时，后端会拒绝开启公开注册。
7. 验证两个普通账号能够各自登录和收信，不能看见对方收件箱；普通账号默认每天最多发 10 封，最多添加 3 个地址。
8. 在 Resend 验证 `xiaolinyx.me` 发信域名，并用 `pnpm exec wrangler secret put RESEND_API_KEY` 输入 API Key。配置并验证发信服务，给外部 Gmail/Outlook 地址发测试信并回复，检查退信及 SPF/DKIM/DMARC 结果。未配置发信服务时，普通账号不能向外发件。
9. 注意 Resend 的可接受使用政策禁止垃圾邮件和未经请求的邮件。公开邮箱网站不能保证任意访客的任意对外邮件都符合其政策；对外开放前应设置滥用举报和停号流程，并与服务商确认这种用途。
10. 定期备份 D1 和附件存储；为 Cloudflare、Namecheap 和发信服务开启双重验证，并注意域名续费。

## 尚未完成

- Cloudflare Email Routing 尚未启用。Catch-all 已指向 Worker，但 5 条旧 Namecheap MX 与启用操作冲突；Wrangler OAuth 没有 DNS 记录权限，需在 Cloudflare DNS 中移除旧 MX 后再启用并验证自动生成的 Cloudflare MX/SPF/DKIM。
- Resend 域名已验证；尚需创建仅限 `xiaolinyx.me` 发信的 API Key，并存入 Worker Secret `RESEND_API_KEY`。不能把 Key 发到聊天或提交 Git。先核对 Resend 政策是否允许公开注册用户的普通邮件发件。
- 在 Cloudflare 创建 Turnstile，并在站点管理设置中配置 site key / secret key，选择始终验证，再开启公开注册；目前注册关闭。
- 管理员网页登录、真实收件、站外发件以及跨账号隔离仍需线上实测。附件读取已校验账号归属，不应给 R2 Bucket 开放公开域名。
- 当前仅有网页端，IMAP/POP3 需要额外架构。

参考：[Cloud Mail 部署文档](https://doc.skymail.ink/guide/command)、[Cloudflare Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/)、[Cloudflare Email Sending](https://developers.cloudflare.com/email-service/)、[Namecheap 域名管理](https://www.namecheap.com/support/knowledgebase/category/2137/domains/)。
