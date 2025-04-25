document.addEventListener("DOMContentLoaded", function () {
    const btnLogout = document.getElementById("btnLogout");
    const nomeFuncionario = document.getElementById("nomeFuncionario");
    const userDataJSON = localStorage.getItem("userData");
    const fotoFuncionario = document.getElementById("user-image");
    fotoFuncionario.src = localStorage.getItem("userImage");
    if (userDataJSON) {
      const userData = JSON.parse(userDataJSON);
      nomeFuncionario.textContent = userData.nome || "Funcionário";
    } else {
      nomeFuncionario.textContent = "Funcionário";
    }
    

    btnLogout.addEventListener("click", function (event) {
      event.preventDefault();
      fazerLogout();
    });
  
    function fazerLogout() {
      fetch("/funcionario/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: localStorage.getItem("authToken") }),
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
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
          exibirMensagem("Logout bem-sucedido! Redirecionando...", "sucesso");
          window.location.href = "/";
        } else {
          exibirMensagem(dados.msg || "Credencial ou senha incorretos!", "erro");
        }
      })
      .catch(error => {
        exibirMensagem(`Erro ao fazer login: ${error.message}`, "erro");
      });
    }
    function exibirMensagem(texto, tipo) {
        const toastEl = document.getElementById('meuToast');
        const toastBody = document.getElementById('toast-body');
        toastBody.textContent = texto;
        // Remove classes antigas
        toastEl.classList.remove('text-bg-success', 'text-bg-danger');
        // Adiciona classe conforme o tipo
        if (tipo === "sucesso") {
          toastEl.classList.add('text-bg-success'); // verde
        } else {
          toastEl.classList.add('text-bg-danger'); // vermelho
        }
        // Cria o toast e mostra
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
            
  });
