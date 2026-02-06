This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Internal Content & Asset Management System 内容与资源运营后台


## Getting Started

First, run the development server:
<br>

`node v >= 20.9.0`

```bash
pnpm dev
```

viewer（查看者）：

❌ 不能创建文章
❌ 不能修改文章
❌ 不能审核文章
✅ 只能查看已发布的文章
editor（编辑者）：

✅ 可以创建文章（自动进入 pending 状态）
✅ 可以修改自己的文章
✅ 可以审核别人的文章
✅ 可以查看所有文章
admin（管理员）：

✅ 可以创建文章（可以选择任何状态）
✅ 可以修改所有文章
✅ 可以审核所有文章
✅ 可以查看所有文章

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
