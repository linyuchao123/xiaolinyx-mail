# xiaolinyx.me 个人邮箱部署记录

本项目基于 [maillab/cloud-mail](https://github.com/maillab/cloud-mail)，导入的上游提交为 `ec7a2bb17c950576c38d7308128cac7696fea169`（MIT）。这里的管理员地址为 `admin@xiaolinyx.me`，网页入口为 `mail.xiaolinyx.me`。网站最终面向任何访客开放注册。

## 当前状态

- 源码已导入，域名已接入 Cloudflare；尚未绑定 D1/KV 或部署 Worker。
- 已在 Wrangler 配置域名和管理员地址。普通用户默认每天最多向 10 个收件人发信、最多拥有 3 个邮箱地址；使用 Resend 时，全站站外发信额外限制为每天 80 个收件人。
- 已将数据库初始化接口改为 `POST /api/init`，密钥通过 `X-Init-Secret` 请求头传送，避免把密钥放进浏览器历史和 URL 日志。
- GitHub Actions 暂时只允许手动触发。配置好资源和 Secrets 后再运行。
- 仓库是公开的。Cloudflare API Token、JWT_SECRET、Resend API Key 等只能放在 GitHub Secrets、Cloudflare Worker Secrets 或项目后台，不能提交到 Git。

## 推荐架构

Namecheap 持有域名；将域名的权威 DNS 改为 Cloudflare（无需转移注册商）。Cloudflare Email Routing 将 `@xiaolinyx.me` 的来信送到 Worker；Worker 使用 D1 保存邮件元数据、KV 保存设置，附件建议存 R2；网页端由同一个 Worker 提供。初期站外发信选择 Resend，现有代码已支持按域名配置 API Key；Cloudflare Email Sending 可作为后续替代。Resend 免费计划当前限每天 100 封，全站代码先按 80 个收件人保守限流。

这个基座提供网页端邮箱，不提供原生 IMAP/POP3 收件服务。Outlook、Apple Mail、Thunderbird 等客户端不能直接把它当作完整邮箱账户添加。若以后必须支持这些客户端，需要另接邮件服务器或改用完整邮箱托管方案。

## 域名与 DNS

1. 在 Cloudflare 添加 `xiaolinyx.me`，按 Cloudflare 给出的两条 NS 记录到 Namecheap 的域名管理页替换 nameserver。保留 Namecheap 作为注册商。
2. 当前 MX 指向 Namecheap 的 eforward 转发服务。先部署并验证 Worker，再在 Cloudflare Email Routing 为 `xiaolinyx.me` 启用收件，将收件规则指向本项目的 Worker；届时替换旧 MX/SPF。
3. 在 Worker 配置自定义域名 `mail.xiaolinyx.me`。不要把邮箱 MX 指向这个网页域名。
4. 发信服务会给出 SPF、DKIM、DMARC 所需 DNS 记录；逐项按服务商的实际值添加，不要复制示例值。发信域验证通过后再测试外部收件箱。

## Cloudflare 资源与部署

1. 创建 D1 数据库、KV Namespace；若要长期保存附件，创建 R2 Bucket。记录各自 ID 和名称。
2. 在 `mail-worker/wrangler.toml` 填入 `db`、`kv`、可选的 `r2` 绑定。域名、管理员和自定义域名已配置；不要在 `[vars]` 写入真实 `jwt_secret`。
3. 安装依赖并从 `mail-worker` 目录执行 `pnpm run deploy`。部署后用 `pnpm exec wrangler secret put jwt_secret` 安全录入一串高强度随机值。
4. 初始化数据库：向 `https://mail.xiaolinyx.me/api/init` 发送 POST，请求头 `X-Init-Secret` 填入刚设置的密钥。不要把真实密钥写在命令行参数或仓库。
5. 运行 `python3 scripts/bootstrap-admin.py`，交互式输入初始化密钥和新管理员密码。管理员地址必须由此方式创建，访客不能抢注。然后登录网页端。
6. 在 Cloudflare 创建 Turnstile 站点密钥与密钥；在网页管理设置中填入两者，注册验证选择“始终启用”，最后打开公开注册。没有配置 Turnstile 时，后端会拒绝开启公开注册。
7. 验证两个普通账号能够各自登录和收信，不能看见对方收件箱；普通账号默认每天最多发 10 封，最多添加 3 个地址。
8. 配置并验证发信服务，给外部 Gmail/Outlook 地址发测试信并回复，检查退信及 SPF/DKIM/DMARC 结果。未配置发信服务时，普通账号不能向外发件。
9. 注意 Resend 的可接受使用政策禁止垃圾邮件和未经请求的邮件。公开邮箱网站不能保证任意访客的任意对外邮件都符合其政策；对外开放前应设置滥用举报和停号流程，并与服务商确认这种用途。
10. 定期备份 D1 和附件存储；为 Cloudflare、Namecheap 和发信服务开启双重验证，并注意域名续费。

## 部署前待办

- 本机 Wrangler 尚未登录 Cloudflare。浏览器 OAuth 页面申请了过宽的账户权限，已取消；优先由你在 Cloudflare 创建限定到本项目资源的 API Token，再通过本机 `CLOUDFLARE_API_TOKEN` 临时使用，不要把 Token 发到聊天或写入仓库。
- 创建 D1、KV，并决定是否启用 R2。
- 已选择 Resend。需要你开通账号、验证 `xiaolinyx.me` 域名，并配置 API Key；先核对其可接受使用政策是否允许向公开注册用户提供普通邮件发件服务。
- 附件读取现在按登录账号校验归属；不要为 R2 Bucket 开放公开域名。正式开放前仍需做跨账号隔离验证。
- 当前只开发网页端；若以后需要 IMAP/POP3，需另行扩展架构。

参考：[Cloud Mail 部署文档](https://doc.skymail.ink/guide/command)、[Cloudflare Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/)、[Cloudflare Email Sending](https://developers.cloudflare.com/email-service/)、[Namecheap 域名管理](https://www.namecheap.com/support/knowledgebase/category/2137/domains/)。
