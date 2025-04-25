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

  // Verifica se há login salvo
  let loginSalvo = null;
  try {
    loginSalvo = JSON.parse(localStorage.getItem("userData"));
    if (loginSalvo) {
      console.log("Login salvo encontrado:", loginSalvo);
      const token = localStorage.getItem("authToken");
      if (!token) return;
      fetch("/verifica-login", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(dados => {
          if (dados.status) {
            console.log("Usuário ainda autenticado:", loginSalvo.nome, loginSalvo.credencial);
            window.location.href = "/painel";
          } else {
            console.log("Token inválido, fazer login normal.");
          }
        })
        .catch(err => {
          console.error("Erro ao verificar login automático:", err);
        });
    } else {
      console.log("Nenhum login salvo encontrado.");
    }
  } catch (e) {
    console.error("Erro ao ler userData:", e);
    localStorage.removeItem("userData");
  }

  function fazerLogin() {
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
        return res.json();
      })
      .then(dados =>{
        if (dados.status) {
          if (lembrarSenha) {
            localStorage.setItem('userData', JSON.stringify(dados.funcionario));
          }
          localStorage.setItem('authToken', dados.token);
          localStorage.setItem('userImage', dados.funcionario.imagem || "https://cdn-icons-png.flaticon.com/512/149/149071.png");
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