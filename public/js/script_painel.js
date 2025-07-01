document.addEventListener("DOMContentLoaded", function () {
  const loginAutomatico = localStorage.getItem("loginAutomatico");

  if (loginAutomatico === "true") {
    exibirMensagem("Login automático realizado com sucesso!", "sucesso");
    localStorage.removeItem("loginAutomatico");
  }

  
});
