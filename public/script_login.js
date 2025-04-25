document.addEventListener("DOMContentLoaded", function () {
  const btnLogin = document.getElementById("btnLogin");
  const txtCredencial = document.getElementById("txtCredencial");
  const passwordField = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const lembrarSenha = document.getElementById("lembrarSenha");
  const divResposta = document.getElementById("divResposta");

  if (!btnLogin || !txtCredencial || !passwordField || !togglePassword || !lembrarSenha || !divResposta) {
      console.error("Erro: Elementos HTML não encontrados!");
      return;
  }

  // Mostrar/ocultar senha
  togglePassword.addEventListener("click", function () {
    const icon = togglePassword.querySelector("i");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordField.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });

  // Verifica se há login salvo
  var loginSalvo;
  try {
    loginSalvo = JSON.parse(localStorage.getItem("loginSalvo"));
  } catch (e) {
    console.error("Erro ao ler loginSalvo:", e);
    localStorage.removeItem("loginSalvo");
  }

  if (loginSalvo) {
    txtCredencial.value = loginSalvo.credencial;
  }

  btnLogin.addEventListener("click", function (event) {
    event.preventDefault();
    fazerLogin(false);
  });

  function fazerLogin(automatico) {
    const credencialFuncionario = txtCredencial.value.trim();
    const senhaFuncionario = passwordField.value.trim();

    if (!credencialFuncionario || !senhaFuncionario) {
      exibirMensagem("Preencha todos os campos!", "erro");
      return;
    }
    fetch("/funcionario/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          Funcionario: {
            credencial: credencialFuncionario,
            senha: senhaFuncionario
          }
        }
    ),
    })
    .then(res => {
      if (!res.ok){
        throw new Error(exibirMensagem(`Erro na resposta do servidor: ${error.message}`, "erro"));
        
      }                                                                     
      return res.json();
    })
    .then(dados => {
      console.log("Dados do servidor:", dados);
      if (dados.status) {
        localStorage.setItem('userData', JSON.stringify(dados.funcionario));
        localStorage.setItem('authToken', dados.token);
        exibirMensagem("Login bem-sucedido! Redirecionando...", "sucesso");
        window.location.href = "/painel";
      } else {
        exibirMensagem(dados.msg || "Credencial ou senha incorretos!", "erro");
      }
    })
    .catch(error => {
      exibirMensagem(`Erro ao fazer login: ${error.message}`, "erro");
    });
  }

  function exibirMensagem(texto, tipo) {
    divResposta.innerText = texto;
    divResposta.style.padding = "10px";
    divResposta.style.marginTop = "10px";
    divResposta.style.borderRadius = "5px";
    divResposta.style.textAlign = "center";

    if (tipo === "sucesso") {
      divResposta.style.backgroundColor = "#d4edda";
      divResposta.style.color = "#155724";
    } else {
      divResposta.style.backgroundColor = "#f8d7da";
      divResposta.style.color = "#721c24";
    }

    setTimeout(() => {
      divResposta.innerText = "";
      divResposta.style = "";
    }, 3000);
  }
});