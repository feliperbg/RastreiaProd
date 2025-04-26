document.addEventListener("DOMContentLoaded", function () {
  const loginAutomatico = localStorage.getItem("loginAutomatico");

  if (loginAutomatico === "true") {
    // Exibe o Toast com a mensagem de login automático
    exibirMensagem("Login automático realizado com sucesso!", "sucesso");
    // Limpa o item após exibir o toast para não mostrar novamente
    localStorage.removeItem("loginAutomatico");
  }  
});
