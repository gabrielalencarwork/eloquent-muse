# Corrigir definitivamente a entrega do livro

## Objetivo
Garantir que toda compra aprovada libere o livro mesmo quando a notificação do Mercado Pago atrasar, falhar ou o navegador móvel não abrir o download como esperado.

## Implementação
- Centralizar a confirmação do pagamento em uma rotina segura que consulta o Mercado Pago e valida pedido, valor, moeda e status antes de liberar o PDF.
- Fazer a página final e o próprio download reconciliarem automaticamente pedidos ainda pendentes, sem depender exclusivamente do webhook.
- Tornar o webhook idempotente e resiliente: aceitar notificações válidas, evitar regressão de pedidos já aprovados e registrar corretamente a aprovação.
- Corrigir a entrega por e-mail para registrar sucesso/falha e permitir novas tentativas, em vez de considerar o envio concluído após a primeira falha.
- Melhorar o download em celulares e navegadores de e-mail: abrir no mesmo contexto, responder com cabeçalhos compatíveis e exibir uma página clara de recuperação quando necessário.
- Manter o arquivo privado e acessível somente por um pedido comprovadamente aprovado.

## Dados e regras
- Adicionar ao pedido campos de acompanhamento da entrega por e-mail e da última verificação do pagamento.
- Adicionar uma atualização atômica do contador de downloads para evitar perda de contagem em cliques simultâneos.
- Preservar os pedidos existentes e permitir que compras já aprovadas continuem usando seus links atuais.

## Validação
- Testar pedidos inexistentes, pendentes e aprovados.
- Simular webhook atrasado e confirmar que a página final e o download recuperam o status diretamente no Mercado Pago.
- Confirmar que o PDF atualizado é entregue integralmente em desktop e celular, sem página em branco.
- Verificar os pedidos aprovados sem download e validar o caminho de recuperação.
- Confirmar compilação e ausência de erros de execução.
