document.addEventListener("DOMContentLoaded", function () {
  const btnLogin = document.getElementById("btnLogin");
  const txtCredencial = document.getElementById("txtCredencial");
  const passwordField = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const lembrarSenha = document.getElementById("lembrarSenha");
  const divResposta = document.getElementById("divResposta");
  const token = localStorage.getItem("authToken");
  const rememberPassword = JSON.parse(localStorage.getItem('rememberPassword'));
  const msg = localStorage.getItem("mensagemErro");
  if (msg) {
    exibirMensagem(msg, "erro");
    localStorage.removeItem("mensagemErro");
  }
  if (token && rememberPassword) {
    fetch("/verifica-login", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(dados => {
      if (dados.status) {
        // Token válido, redireciona para o painel
        window.location.href = "/painel";
      } else {
        // Token inválido, redireciona para a tela de login
        localStorage.clear();
        localStorage.setItem("mensagemErro", "Sessão expirada, faça login novamente!");
        window.location.href = "/";
      }
    })
    .catch(err => {
      // Se houver erro na requisição, redireciona para a tela de login
      localStorage.clear();
      localStorage.setItem("mensagemErro", "Sessão expirada, faça login novamente!");
      window.location.href = "/";
    });
  }else {
    document.body.style.display = "flex";
    // Se não houver token, continua com a lógica normal do login
    if (!btnLogin || !txtCredencial || !passwordField || !togglePassword || !lembrarSenha || !divResposta) {
      console.error("Erro: Elementos HTML não encontrados!");
      return;
    }

    // Adiciona o evento de clique ao botão de login
    btnLogin.addEventListener("click", function (event) {
      event.preventDefault();
      fazerLogin(lembrarSenha.checked);
    });

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
  }
  
  // Função para fazer login
  function fazerLogin(lembrarSenhaChecked) {
    const credencialFuncionario = txtCredencial.value.trim();
    const senhaFuncionario = passwordField.value.trim();
  
    if (!credencialFuncionario || !senhaFuncionario) {
      exibirMensagem("Preencha todos os campos!", "erro");
      return;
    }
  
    fetch("/funcionario/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Funcionario: { credencial: credencialFuncionario, senha: senhaFuncionario } })
    })
      .then(res => res.json())
      .then(dados => {
        if (dados.status) {
          if (lembrarSenhaChecked) {
            localStorage.setItem('rememberPassword', JSON.stringify(true));
          } else {
            localStorage.setItem('rememberPassword', JSON.stringify(false));
          }
          
          localStorage.setItem('userData', JSON.stringify(dados.funcionario));
          localStorage.setItem('authToken', dados.token);
          localStorage.setItem('userImage', dados.funcionario.imagem || "imagens/funcionario/default.png");
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