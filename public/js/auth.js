/*
 * KaTchau — cadastro e login DEMONSTRATIVOS.
 *
 * Dois modos, escolhidos automaticamente (veja js/api.js):
 *  - servidor: a conta fica no banco de dados e a sessão é um cookie HttpOnly. O navegador
 *    só guarda o nome e o e-mail de quem está conectado (para o cabeçalho abrir sem piscar);
 *    a senha vai ao servidor por HTTPS e lá vira um hash.
 *  - local (sem API): as contas ficam somente neste navegador (localStorage) e nada é enviado.
 *    A senha nunca é guardada em texto puro: PBKDF2-SHA256, sal aleatório, 150 mil iterações.
 *    Isso exige um "contexto seguro": https://, http://localhost ou o arquivo aberto direto.
 */

const CHAVE_CONTAS = "katchau-users-v1";
const CHAVE_SESSAO = "katchau-session-v1";
const CHAVE_CACHE_SERVIDOR = "katchau-usuario-servidor-v1";
const ITERACOES_SENHA = 150000;
const SENHA_MINIMA = 8;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- utilidades de criptografia ---------- */

function paraBase64(bytes) {
  let texto = "";
  new Uint8Array(bytes).forEach(function (b) { texto += String.fromCharCode(b); });
  return btoa(texto);
}

function deBase64(texto) {
  return Uint8Array.from(atob(texto), function (c) { return c.charCodeAt(0); });
}

function criptografiaDisponivel() {
  return !!(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
}

async function derivarHash(senha, sal) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: ITERACOES_SENHA },
    material,
    256
  );
  return paraBase64(bits);
}

/** Comparação sem sair no primeiro caractere diferente. */
function iguaisEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

/* ---------- validação (reutilizada pelos formulários) ---------- */

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validarNome(nome) {
  const n = String(nome || "").trim().replace(/\s+/g, " ");
  if (n.length < 2) return "Informe seu nome.";
  if (n.length > 80) return "O nome pode ter no máximo 80 caracteres.";
  return "";
}

function validarEmail(email) {
  const e = normalizarEmail(email);
  if (!e) return "Informe seu e-mail.";
  if (e.length > 120 || !REGEX_EMAIL.test(e)) return "Informe um e-mail válido.";
  return "";
}

function validarSenha(senha) {
  if (!senha) return "Crie uma senha.";
  if (senha.length < SENHA_MINIMA) return "A senha precisa ter pelo menos " + SENHA_MINIMA + " caracteres.";
  if (senha.length > 128) return "A senha pode ter no máximo 128 caracteres.";
  return "";
}

/* ---------- armazenamento ---------- */

const auth = (function () {
  const ouvintes = [];
  let modo = null; // "servidor" | "local" | null (ainda verificando)
  const SEM_REDE = { ok: false, erro: "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo." };

  function lerCacheServidor() {
    try {
      const u = JSON.parse(window.localStorage.getItem(CHAVE_CACHE_SERVIDOR) || "null");
      return u && typeof u.nome === "string" && typeof u.email === "string" ? u : null;
    } catch (e) {
      return null;
    }
  }

  function gravarCacheServidor(usuario) {
    try {
      if (usuario) window.localStorage.setItem(CHAVE_CACHE_SERVIDOR, JSON.stringify({ nome: usuario.nome, email: usuario.email, criadoEm: usuario.criadoEm }));
      else window.localStorage.removeItem(CHAVE_CACHE_SERVIDOR);
    } catch (e) {
      /* sem armazenamento: o servidor continua sendo a fonte da verdade */
    }
  }

  function lerContas() {
    try {
      const lido = JSON.parse(window.localStorage.getItem(CHAVE_CONTAS) || "[]");
      if (!Array.isArray(lido)) return [];
      return lido.filter(function (c) {
        return c && typeof c.email === "string" && typeof c.nome === "string" && typeof c.sal === "string" && typeof c.hash === "string";
      });
    } catch (e) {
      return [];
    }
  }

  function gravarContas(contas) {
    window.localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
  }

  function lerSessao() {
    try {
      const sessao = JSON.parse(window.localStorage.getItem(CHAVE_SESSAO) || "null");
      return sessao && typeof sessao.email === "string" ? sessao.email : null;
    } catch (e) {
      return null;
    }
  }

  function avisar() {
    const atual = auth.usuario();
    ouvintes.forEach(function (fn) { fn(atual); });
  }

  window.addEventListener("storage", function (e) {
    if (e.key === CHAVE_SESSAO || e.key === CHAVE_CONTAS || e.key === CHAVE_CACHE_SERVIDOR) avisar();
  });

  const SEM_SUPORTE = {
    ok: false,
    erro: "Este navegador não permite criptografar a senha nesta página. Abra o site por um servidor local (como o Live Server) ou por HTTPS."
  };
  const SEM_ARMAZENAMENTO = { ok: false, erro: "Não foi possível salvar os dados neste navegador. Verifique se o armazenamento do site está liberado." };

  function usuarioLocal() {
    const email = lerSessao();
    if (!email) return null;
    const conta = lerContas().find(function (c) { return c.email === email; });
    return conta ? { nome: conta.nome, email: conta.email, criadoEm: conta.criadoEm } : null;
  }

  // Descobre o modo e, no modo servidor, confirma com o banco quem está conectado.
  const pronto = api.disponivel().then(async function (temServidor) {
    modo = temServidor ? "servidor" : "local";
    if (temServidor) {
      const r = await api.chamar("GET", "/api/sessao");
      if (r.ok && r.dados) gravarCacheServidor(r.dados.usuario);
    }
  }).catch(function () {
    modo = modo || "local";
  }).then(function () {
    avisar();
  });

  return {
    /** Resolve quando já se sabe o modo ("servidor" ou "local") e a sessão foi conferida. */
    pronto: pronto,

    modo: function () { return modo; },

    /** Chamado quando o servidor responde 401: a sessão acabou. */
    sessaoExpirou: function () {
      gravarCacheServidor(null);
      avisar();
    },

    /** Conta conectada ({ nome, email, criadoEm }) ou null. Nunca expõe senha nem hash. */
    usuario: function () {
      if (modo === "servidor") return lerCacheServidor();
      if (modo === "local") return usuarioLocal();
      return lerCacheServidor() || usuarioLocal(); // ainda verificando
    },

    assinar: function (fn) { ouvintes.push(fn); },

    cadastrar: async function (dados) {
      const nome = String(dados.nome || "").trim().replace(/\s+/g, " ");
      const email = normalizarEmail(dados.email);
      const senha = String(dados.senha || "");
      const erro = validarNome(nome) || validarEmail(email) || validarSenha(senha);
      if (erro) return { ok: false, erro: erro };
      await pronto;
      if (modo === "servidor") {
        const r = await api.chamar("POST", "/api/cadastro", { nome: nome, email: email, senha: senha });
        if (r.rede) return SEM_REDE;
        if (!r.ok) return { ok: false, erro: (r.dados && r.dados.erro) || "Não foi possível criar a conta agora." };
        gravarCacheServidor(r.dados.usuario);
        avisar();
        return { ok: true };
      }
      if (!criptografiaDisponivel()) return SEM_SUPORTE;

      const contas = lerContas();
      if (contas.some(function (c) { return c.email === email; })) {
        return { ok: false, erro: "Já existe uma conta com este e-mail. Use a aba Entrar." };
      }
      const sal = crypto.getRandomValues(new Uint8Array(16));
      const hash = await derivarHash(senha, sal);
      contas.push({ nome: nome, email: email, sal: paraBase64(sal), hash: hash, criadoEm: new Date().toISOString() });
      try {
        gravarContas(contas);
        window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ email: email }));
      } catch (e) {
        return SEM_ARMAZENAMENTO;
      }
      avisar();
      return { ok: true };
    },

    entrar: async function (dados) {
      const email = normalizarEmail(dados.email);
      const senha = String(dados.senha || "");
      if (validarEmail(email)) return { ok: false, erro: validarEmail(email) };
      if (!senha) return { ok: false, erro: "Informe sua senha." };
      await pronto;
      if (modo === "servidor") {
        const r = await api.chamar("POST", "/api/login", { email: email, senha: senha });
        if (r.rede) return SEM_REDE;
        if (!r.ok) return { ok: false, erro: (r.dados && r.dados.erro) || "Não foi possível entrar agora." };
        gravarCacheServidor(r.dados.usuario);
        avisar();
        return { ok: true };
      }
      if (!criptografiaDisponivel()) return SEM_SUPORTE;

      const conta = lerContas().find(function (c) { return c.email === email; });
      // Mensagem única para "e-mail inexistente" e "senha errada": não revela quais e-mails têm conta.
      const incorreto = { ok: false, erro: "E-mail ou senha incorretos." };
      if (!conta) {
        // Faz o mesmo trabalho de uma conta real para o tempo de resposta não denunciar o e-mail.
        await derivarHash(senha, crypto.getRandomValues(new Uint8Array(16)));
        return incorreto;
      }
      let hash;
      try {
        hash = await derivarHash(senha, deBase64(conta.sal));
      } catch (e) {
        return incorreto;
      }
      if (!iguaisEmTempoConstante(hash, conta.hash)) return incorreto;
      try {
        window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ email: conta.email }));
      } catch (e) {
        return SEM_ARMAZENAMENTO;
      }
      avisar();
      return { ok: true };
    },

    /** Troca o nome (só no modo servidor). */
    atualizarNome: async function (nome) {
      const erro = validarNome(nome);
      if (erro) return { ok: false, erro: erro };
      await pronto;
      if (modo !== "servidor") return { ok: false, erro: "Disponível apenas com o banco de dados ativo." };
      const r = await api.chamar("POST", "/api/perfil", { nome: String(nome).trim().replace(/\s+/g, " ") });
      if (r.rede) return SEM_REDE;
      if (r.status === 401) { gravarCacheServidor(null); avisar(); return { ok: false, erro: "Sua sessão expirou. Entre novamente." }; }
      if (!r.ok) return { ok: false, erro: (r.dados && r.dados.erro) || "Não foi possível salvar agora." };
      gravarCacheServidor(r.dados.usuario);
      avisar();
      return { ok: true };
    },

    /** Troca a senha (só no modo servidor); as outras sessões são encerradas pelo servidor. */
    alterarSenha: async function (atual, nova) {
      const erro = validarSenha(nova);
      if (erro) return { ok: false, erro: erro };
      if (!atual) return { ok: false, erro: "Informe sua senha atual." };
      await pronto;
      if (modo !== "servidor") return { ok: false, erro: "Disponível apenas com o banco de dados ativo." };
      const r = await api.chamar("POST", "/api/senha", { atual: atual, nova: nova });
      if (r.rede) return SEM_REDE;
      if (r.status === 401 && r.dados && /expirou|Entre/.test(r.dados.erro || "")) { gravarCacheServidor(null); avisar(); }
      if (!r.ok) return { ok: false, erro: (r.dados && r.dados.erro) || "Não foi possível alterar a senha agora." };
      return { ok: true };
    },

    sair: async function () {
      await pronto;
      if (modo === "servidor") await api.chamar("POST", "/api/logout", {});
      window.dispatchEvent(new Event("katchau:saiu"));
      gravarCacheServidor(null);
      try {
        window.localStorage.removeItem(CHAVE_SESSAO);
      } catch (e) {
        /* sem armazenamento: nada a remover */
      }
      avisar();
    }
  };
})();
