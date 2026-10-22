import { criarAplicacao } from "./aplicacao.js";
import { banco } from "./configs/banco.js";

/**
 * Inicializa o processo HTTP da API.
 *
 * Primeiro cria a aplicação, depois verifica a conectividade com PostgreSQL
 * usando uma consulta simples. O servidor só começa a escutar após essa
 * verificação; em caso de falha, fecha Fastify e o pool antes de definir um
 * código de saída de erro.
 *
 * @returns Promise concluída quando o servidor é iniciado ou encerrado após erro.
 */
async function iniciarServidor() {
    const aplicacao = await criarAplicacao();

    try {
        // `await` impede que a API seja anunciada como disponível sem banco.
        await banco.query("SELECT 1");

        // O host local restringe o acesso ao processo à máquina local.
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
