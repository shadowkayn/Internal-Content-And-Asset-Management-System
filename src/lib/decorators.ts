import LogModel from "@/models/log.model";
import { headers, cookies } from "next/headers";
import { verifyToken } from "@/lib/token";
// 根据 IP 获取位置（如：广东-深圳）， IP 归属地库：使用 geoip-lite
import geoip from "geoip-lite";

export function Audit(module: string, action: string, description: string) {
  /**
   * 创建一个装饰器函数
   * @param target - 目标对象，可以通过 target.constructor.name 自动获取类名
   * @param propertyKey - 被装饰的方法名，可以自动获取方法名
   * @param descriptor - 装饰器
   */
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    // 获取类名
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const descriptionStr = `${description} (执行方法: ${className}.${propertyKey})`;

      // 获取上下文信息(IP、Token)
      const headerList = await headers();
      // 处理 IP 格式
      const rawIp =
        headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
      // 处理本地 IPv6 情况
      const ip = rawIp === "::1" ? "127.0.0.1" : rawIp;

      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      // 查询地理位置
      let location = "未知";
      if (ip !== "127.0.0.1") {
        const geo = geoip.lookup(ip);
        if (geo) {
          // 拼接位置信息：国家 - 省份 - 城市
          location = `${geo.country}-${geo.region}-${geo.city}`;
        }
      }

      let operator: string = "未知用户";
      if (token) {
        const payload = await verifyToken(token);
        operator = (payload?.username as string) || "未知用户";
      }

      try {
        const result = await originalMethod.apply(this, args);

        await LogModel.create({
          module,
          action,
          description: descriptionStr,
          operator,
          ip,
          location,
          status: "success",
          duration: Date.now() - startTime,
          params: JSON.stringify(args), // 记录传入参数
        });

        return result;
      } catch (error: any) {
        // 记录失败日志
        await LogModel.create({
          module,
          action,
          description: descriptionStr,
          operator,
          ip,
          location,
          status: "fail",
          errorMsg: error.message,
          duration: Date.now() - startTime,
          params: JSON.stringify(args),
        });
        throw error;
      }
    };

    return descriptor;
  };
}
