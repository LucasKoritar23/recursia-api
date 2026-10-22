import { criarAplicacao } from "./aplicacao.js";
import { banco } from "./configs/banco.js";

async function iniciarServidor() {
    const aplicacao = await criarAplicacao();

    try {
        // Verifica a conexao com o PostgreSQL
        await banco.query("SELECT 1");

        // Inicia o servidor HTTP
        await aplicacao.listen({
            port: 3000,
            host: "127.0.0.1"
        });
    } catch (erro) {
        aplicacao.log.error(erro);

        await aplicacao.close();
        await banco.end();

        process.exitCode = 1;
    }
}

void iniciarServidor();