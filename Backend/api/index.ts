let app;
try {
  // Registra o tratador de caminhos do TypeScript em tempo de execução (resolve os @/)
  require("tsconfig-paths/register");

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  app = require("../src/server").default;
} catch (error: any) {
  console.error("🔥 ERRO FATAL NA INICIALIZACAO:", error);
  app = (req: any, res: any) => {
    res.status(500).json({
      error: "Initialization failed on Vercel",
      message: error.message,
      stack: error.stack
    });
  };
}
export default app;
