/* Validação dos dados recebidos. Cada função devolve "" quando está tudo certo ou a mensagem de erro. */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
export const METODOS_PAGAMENTO = ["pix", "cartao", "boleto"];

export function limparTexto(valor) {
  return String(valor === undefined || valor === null ? "" : valor).trim().replace(/\s+/g, " ");
}

export function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function validarNome(nome) {
  const n = limparTexto(nome);
  if (n.length < 2) return "Informe seu nome.";
  if (n.length > 80) return "O nome pode ter no máximo 80 caracteres.";
  return "";
}

export function validarEmail(email) {
  const e = normalizarEmail(email);
  if (!e) return "Informe seu e-mail.";
  if (e.length > 120 || !REGEX_EMAIL.test(e)) return "Informe um e-mail válido.";
  return "";
}

export function validarSenha(senha) {
  if (typeof senha !== "string" || !senha) return "Crie uma senha.";
  if (senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (senha.length > 128) return "A senha pode ter no máximo 128 caracteres.";
  return "";
}

/** Devolve { endereco } normalizado ou { erro }. */
export function validarEndereco(bruto) {
  const e = bruto && typeof bruto === "object" ? bruto : {};
  const cep = String(e.cep || "").replace(/\D/g, "");
  const campo = {
    cep: cep.slice(0, 5) + "-" + cep.slice(5),
    logradouro: limparTexto(e.logradouro),
    numero: limparTexto(e.numero),
    complemento: limparTexto(e.complemento),
    bairro: limparTexto(e.bairro),
    cidade: limparTexto(e.cidade),
    uf: limparTexto(e.uf).toUpperCase()
  };
  if (cep.length !== 8) return { erro: "Informe um CEP com 8 números." };
  if (campo.logradouro.length < 3 || campo.logradouro.length > 120) return { erro: "Informe a rua ou avenida." };
  if (!campo.numero || campo.numero.length > 10) return { erro: "Informe o número (use S/N se não houver)." };
  if (campo.complemento.length > 60) return { erro: "O complemento pode ter no máximo 60 caracteres." };
  if (campo.bairro.length < 2 || campo.bairro.length > 60) return { erro: "Informe o bairro." };
  if (campo.cidade.length < 2 || campo.cidade.length > 60) return { erro: "Informe a cidade." };
  if (UFS.indexOf(campo.uf) === -1) return { erro: "Informe o estado com a sigla (ex.: SP)." };
  return { endereco: campo };
}

/** Junta itens repetidos e valida ids e quantidades. Devolve { itens } ou { erro }. */
export function validarItens(bruto) {
  if (!Array.isArray(bruto) || bruto.length === 0) return { erro: "O carrinho está vazio." };
  if (bruto.length > 60) return { erro: "Há itens demais no pedido." };
  const mapa = new Map();
  for (const item of bruto) {
    const id = Number(item && item.id);
    const qtd = Number(item && item.qty);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(qtd) || qtd < 1 || qtd > 99) return { erro: "Item inválido no carrinho." };
    mapa.set(id, Math.min(99, (mapa.get(id) || 0) + qtd));
  }
  return { itens: Array.from(mapa, function (par) { return { id: par[0], qtd: par[1] }; }) };
}
