import app from "./app.js";
import { bootstrap } from "./bootstrap.js";
import { container } from "@onbp/api/src/core/container/container.js";
import { CORE_SERVICES } from "@onbp/api/src/core/container/service.constants.js";
import type { IConfigManager } from "@onbp/api/src/core/config/config.interface.js";

async function startServer() {
  try {
    await bootstrap();

    const config = container.resolve<IConfigManager>(CORE_SERVICES.CONFIG);
    const port = config.get<number>("PORT", 3000);
    const host = config.get<string>("HOST", "0.0.0.0");

    app.listen(port, host, () => {
      console.log(`🚀 Server running on http://${host}:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
