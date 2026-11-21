/*
 * KaTchau — atendimento: cópia do e-mail e formulário demonstrativo.
 * Nenhuma mensagem ou dado é enviado ou armazenado.
 */

(function () {
  const formulario = document.getElementById("form-contato");
  const aviso = document.getElementById("form-enviado");
  if (formulario) {
    formulario.addEventListener("submit", function (e) {
      e.preventDefault();
      formulario.reset();
      aviso.hidden = false;
    });
  }

  const botao = document.getElementById("copiar-email");
  if (!botao) return;
  let timer = null;

  botao.addEventListener("click", function () {
    const copiar = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(EMAIL_CONTATO)
      : Promise.reject(new Error("clipboard indisponível"));
    copiar.then(
      function () {
        botao.innerHTML = icone("check");
        toast.sucesso("E-mail copiado");
        clearTimeout(timer);
        timer = setTimeout(function () { botao.innerHTML = icone("copy"); }, 2000);
      },
      function () {
        toast("Não foi possível copiar", { descricao: EMAIL_CONTATO });
      }
    );
  });
})();
