const Funcionarios = require("../model/FuncionariosTabela");

const btnLogin = document.getElementById("btnLogin");
const txtCredencial = document.getElementById("txtEmail");
const txtSenha = document.getElementById("txtSenha");
const divResposta = document.getElementById("divResposta");
const passwordField = document.getElementById("password");
const togglePassword = document.querySelector(".password-toggle-icon i");

// Alternar visibilidade da senha
togglePassword.addEventListener("click", function () {
  if (passwordField.type === "password") {
    passwordField.type = "text";
    togglePassword.classList.remove("fa-eye");
    togglePassword.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    togglePassword.classList.remove("fa-eye-slash");
    togglePassword.classList.add("fa-eye");
  }
});

// Ação do botão de login
btnLogin.onclick = function (event) {
  event.preventDefault(); // Evita o comportamento padrão do botão
  fazerLogin();
};

// Função de login
function fazerLogin() {
  const credencial = txtCredencial.value.trim();
  const senha = txtSenha.value.trim();
  const dados = {
    Funcionarios: {
      credencial: credencial,
      senha: senha,
    },
  };

  const uri = "/login";
  fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  })
    .then((resposta_backEnd) => {
      if (!resposta_backEnd.ok) {
        throw new Error("Erro na resposta do servidor");
      }
      return resposta_backEnd.json();
    })
    .then((dados_resposta) => {
      processarResultados(dados_resposta);
    })
    .catch((error) => {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: error.message,
      });
    });
}

// Processar resultados do login
function processarResultados(dados) {
  if (dados.status) {
    Swal.fire({
      icon: "success",
      title: "Sucesso",
      text: "Login feito com sucesso!",
      showCancelButton: true,
      confirmButtonText: "Ok",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem("dados", JSON.stringify(dados));
        window.location.href = "index.html";
      }
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Atenção",
      text: "Credencial ou senha incorretos!",
    });
  }
}
