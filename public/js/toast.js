function exibirMensagem(texto, tipo) {
  const toastEl = document.getElementById('meuToast');
  const toastBody = document.getElementById('toast-body');
  if (!toastEl || !toastBody) {
      console.error('Elementos de toast não encontrados no DOM.');
      return;
  }
  
  toastBody.textContent = texto;
  
  // Remove classes antigas
  toastEl.classList.remove('text-bg-success', 'text-bg-danger');
  
  // Adiciona classe conforme o tipo
  if (tipo === "sucesso") {
      toastEl.classList.add('text-bg-success'); // verde
  } else {
      toastEl.classList.add('text-bg-danger'); // vermelho
  }
  
  // Cria o toast e mostra com autohide (desaparece após 3 segundos)
  const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 3000 // Tempo em milissegundos
  });
  
  toast.show();
}
