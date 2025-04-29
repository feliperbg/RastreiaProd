document.addEventListener("DOMContentLoaded", function () {
  const loginAutomatico = localStorage.getItem("loginAutomatico");

  if (loginAutomatico === "true") {
    exibirMensagem("Login automático realizado com sucesso!", "sucesso");
    localStorage.removeItem("loginAutomatico");
  }

  // --- Verificar permissões para mostrar ou remover o menu Funcionários
  const userDataJSON = localStorage.getItem("userData");
  if (userDataJSON) {
    try {
      const authData = JSON.parse(userDataJSON);
      // Verifica se existe o campo permissoes e se inclui "Administrador"
      if (!authData.permissoes || !authData.permissoes.includes("administrador")) {
        const menuFuncionarios = document.getElementById("menu-funcionarios");
        if (menuFuncionarios) {
          menuFuncionarios.remove(); // Remove o <li> do DOM
        }
      }
    } catch (e) {   
      console.error("Erro ao ler authData:", e);
    }
  }
});
