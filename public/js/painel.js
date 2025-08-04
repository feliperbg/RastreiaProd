//
  document.addEventListener("DOMContentLoaded", function () {
    const loginAutomatico = localStorage.getItem("loginAutomatico");
    if (loginAutomatico) {
      exibirMensagem("Login realizado com sucesso!", "sucesso");
      localStorage.removeItem("loginAutomatico");
    }
  });