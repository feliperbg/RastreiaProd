function errorHandler(err, req, res, next) {
    // Se o erro já tiver um status code, use-o. Senão, o padrão é 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;
    
    // Loga o erro no console para depuração (especialmente para erros 500)
    console.error(err);

    // Define o status da resposta
    res.status(statusCode);

    // Renderiza a página de erro
    res.render('error', {
        statusCode: statusCode,
        message: err.message || 'Ocorreu um erro inesperado no servidor.'
    });
}

module.exports = errorHandler;