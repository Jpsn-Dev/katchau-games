/*
 * PROJETO DE EXTENSAO EM DESENVOLVIMENTO DE SOFTWARE - UNINOVE
 * Empresa: KaTchau Games & Gear (loja virtual de consoles, jogos e perifericos)
 * Programa: Cadastro de produtos, estoque e reajuste de precos (console)
 * Disciplina: Algoritmos e Praticas de Programacao
 *
 * Grupo:
 *   ALUNO 1 - RA 000000000   (preencher)
 *   ALUNO 2 - RA 000000000   (preencher)
 *
 * Repositorio: https://github.com/Jpsn-Dev/katchau-games
 * Compilar: gcc main.c -o programa     Executar: ./programa
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

#define MAX_PRODUTOS 100
#define TAM_NOME 50
#define TAM_ENTRADA 100

// controla quando o usuario quer voltar ao menu principal
int voltarMenu = 0;

// controla quando nao existem mais entradas disponiveis
int fimEntrada = 0;

// aqui ficam guardadas as informacoes de cada produto
struct Produto {
    int codigo;
    char nome[TAM_NOME];
    float preco;
    int quantidade;
};

// le o que o usuario digitou e limpa o restante da linha
int lerLinha(char texto[], int tamanho) {
    if (fgets(texto, tamanho, stdin) == NULL) {
        fimEntrada = 1;
        return 0;
    }

    if (strchr(texto, '\n') == NULL && !feof(stdin)) {
        int c;
        while ((c = getchar()) != '\n' && c != EOF);
    }

    texto[strcspn(texto, "\n")] = '\0';

    return 1;
}

// verifica se o usuario digitou 0 sozinho para voltar
int lerLinhaVoltar(char texto[], int tamanho) {
    if (!lerLinha(texto, tamanho))
        return 0;

    if (strcmp(texto, "0") == 0) {
        voltarMenu = 1;
        return 0;
    }

    return 1;
}

// le um numero inteiro
int lerInt(int *valor) {
    char entrada[TAM_ENTRADA], extra;

    while (1) {
        if (!lerLinha(entrada, sizeof(entrada)))
            return 0;

        if (strlen(entrada) == 0) {
            printf("Digite uma opcao: ");
            continue;
        }

        if (sscanf(entrada, " %d %c", valor, &extra) == 1)
            return 1;

        printf("Entrada invalida! Digite novamente: ");
    }
}

// le um numero inteiro permitindo voltar com 0 sozinho
int lerIntVoltar(int *valor) {
    char entrada[TAM_ENTRADA], extra;

    while (1) {
        if (!lerLinhaVoltar(entrada, sizeof(entrada)))
            return 0;

        if (strlen(entrada) == 0) {
            printf("Digite um valor ou 0 para voltar: ");
            continue;
        }

        if (sscanf(entrada, " %d %c", valor, &extra) == 1)
            return 1;

        printf("Entrada invalida! Digite novamente ou 0 para voltar: ");
    }
}

// le um numero decimal permitindo virgula ou ponto
int lerFloatVoltar(float *valor) {
    char entrada[TAM_ENTRADA], extra;

    while (1) {
        if (!lerLinhaVoltar(entrada, sizeof(entrada)))
            return 0;

        if (strlen(entrada) == 0) {
            printf("Digite um valor ou 0 para voltar: ");
            continue;
        }

        // permite usar virgula ou ponto no preco
        for (int i = 0; entrada[i] != '\0'; i++) {
            if (entrada[i] == ',')
                entrada[i] = '.';
        }

        if (sscanf(entrada, " %f %c", valor, &extra) == 1)
            return 1;

        printf("Entrada invalida! Digite novamente ou 0 para voltar: ");
    }
}

// salva todos os produtos em um arquivo para nao perder os dados
void salvarProdutos(struct Produto produtos[], int total) {
    FILE *arquivo = fopen("produtos.txt", "w");

    if (arquivo == NULL) {
        printf("\nErro ao salvar os produtos!\n");
        return;
    }

    for (int i = 0; i < total; i++) {
        fprintf(arquivo, "%d|%s|%.2f|%d\n",
                produtos[i].codigo,
                produtos[i].nome,
                produtos[i].preco,
                produtos[i].quantidade);
    }

    fclose(arquivo);
}

// quando o programa inicia, carrega os produtos que ja estavam salvos
int carregarProdutos(struct Produto produtos[]) {
    FILE *arquivo = fopen("produtos.txt", "r");
    int total = 0;

    if (arquivo == NULL)
        return 0;

    while (total < MAX_PRODUTOS &&
           fscanf(arquivo, "%d|%49[^|]|%f|%d\n",
                  &produtos[total].codigo,
                  produtos[total].nome,
                  &produtos[total].preco,
                  &produtos[total].quantidade) == 4) {
        total++;
    }

    fclose(arquivo);
    return total;
}

// procura um produto usando o codigo dele
int buscarCodigo(struct Produto produtos[], int total, int codigo) {
    for (int i = 0; i < total; i++) {
        if (produtos[i].codigo == codigo)
            return i;
    }

    return -1;
}

// gera o menor codigo disponivel, comecando pelo 1000
int gerarCodigo(struct Produto produtos[], int total) {
    int codigo = 1000;

    // se o codigo ja estiver sendo usado, procura o proximo disponivel
    while (buscarCodigo(produtos, total, codigo) != -1)
        codigo++;

    return codigo;
}

// mostra todos os produtos que estao cadastrados
void listarProdutos(struct Produto produtos[], int total) {
    if (total == 0) {
        printf("\nNenhum produto cadastrado.\n");
        return;
    }

    printf("\n===== LISTA DE PRODUTOS =====\n");

    for (int i = 0; i < total; i++) {
        printf("\nProduto %d\n", i + 1);
        printf("Codigo: %d\n", produtos[i].codigo);
        printf("Nome: %s\n", produtos[i].nome);
        printf("Preco: R$ %.2f\n", produtos[i].preco);
        printf("Quantidade: %d unidades\n", produtos[i].quantidade);
    }
}

// faz o cadastro de um novo produto
void cadastrarProduto(struct Produto produtos[], int *total) {
    char nome[TAM_NOME];
    int quantidade;
    float preco;

    if (*total >= MAX_PRODUTOS) {
        printf("\nLimite de produtos atingido!\n");
        return;
    }

    printf("\n===== CADASTRO DE PRODUTO =====\n");
    printf("Digite 0 sozinho a qualquer momento para voltar.\n");

    printf("\nNome do produto: ");

    if (!lerLinhaVoltar(nome, sizeof(nome)))
        return;

    while (nome[0] == '\0') {
        printf("Nome vazio! Digite novamente: ");

        if (!lerLinhaVoltar(nome, sizeof(nome)))
            return;
    }

    printf("Quantidade: ");

    if (!lerIntVoltar(&quantidade))
        return;

    while (quantidade <= 0) {
        printf("Quantidade invalida! Digite novamente: ");

        if (!lerIntVoltar(&quantidade))
            return;
    }

    printf("Preco: R$ ");

    if (!lerFloatVoltar(&preco))
        return;

    while (preco <= 0) {
        printf("Preco invalido! Digite novamente: ");

        if (!lerFloatVoltar(&preco))
            return;
    }

    // guarda os dados digitados dentro do cadastro
    produtos[*total].codigo = gerarCodigo(produtos, *total);
    strcpy(produtos[*total].nome, nome);
    produtos[*total].quantidade = quantidade;
    produtos[*total].preco = preco;

    printf("\n===== PRODUTO CADASTRADO =====\n");
    printf("Codigo: %d\n", produtos[*total].codigo);
    printf("Nome: %s\n", produtos[*total].nome);
    printf("Quantidade: %d\n", produtos[*total].quantidade);
    printf("Preco: R$ %.2f\n", produtos[*total].preco);

    (*total)++;

    salvarProdutos(produtos, *total);

    printf("\nProduto cadastrado com sucesso!\n");
}

// exclui um produto usando o codigo dele
void excluirProduto(struct Produto produtos[], int *total) {
    int codigo, indice, confirmacao;

    if (*total == 0) {
        printf("\nNenhum produto cadastrado.\n");
        return;
    }

    printf("\n===== EXCLUIR PRODUTO =====\n");
    printf("Digite 0 sozinho para voltar.\n");
    printf("Codigo do produto: ");

    if (!lerIntVoltar(&codigo))
        return;

    indice = buscarCodigo(produtos, *total, codigo);

    if (indice == -1) {
        printf("\nProduto nao encontrado!\n");
        return;
    }

    printf("\nProduto: %s\n", produtos[indice].nome);
    printf("Preco: R$ %.2f\n", produtos[indice].preco);
    printf("Quantidade: %d\n", produtos[indice].quantidade);

    printf("\nConfirma exclusao? (1 - Sim / 0 - Nao): ");

    // aqui o zero continua significando nao
    if (!lerInt(&confirmacao))
        return;

    while (confirmacao != 0 && confirmacao != 1) {
        printf("Opcao invalida! Digite novamente: ");

        if (!lerInt(&confirmacao))
            return;
    }

    if (confirmacao == 0) {
        printf("\nExclusao cancelada.\n");
        return;
    }

    // remove o produto e organiza os que ficaram
    for (int i = indice; i < *total - 1; i++)
        produtos[i] = produtos[i + 1];

    (*total)--;

    salvarProdutos(produtos, *total);

    printf("\nProduto excluido com sucesso!\n");
}

// procura um produto pelo nome
void buscarProduto(struct Produto produtos[], int total) {
    char nome[TAM_NOME];

    if (total == 0) {
        printf("\nNenhum produto cadastrado para buscar.\n");
        return;
    }

    printf("\n===== BUSCAR PRODUTO =====\n");
    printf("Digite 0 sozinho para voltar.\n");
    printf("Nome do produto: ");

    if (!lerLinhaVoltar(nome, sizeof(nome)))
        return;

    while (nome[0] == '\0') {
        printf("Nome vazio! Digite novamente: ");

        if (!lerLinhaVoltar(nome, sizeof(nome)))
            return;
    }

    // compara o nome digitado com os produtos cadastrados
    for (int i = 0; i < total; i++) {
        if (strcmp(produtos[i].nome, nome) == 0) {
            printf("\nProduto encontrado!\n");
            printf("Codigo: %d\n", produtos[i].codigo);
            printf("Nome: %s\n", produtos[i].nome);
            printf("Preco: R$ %.2f\n", produtos[i].preco);
            printf("Quantidade: %d unidades\n",
                   produtos[i].quantidade);
            return;
        }
    }

    printf("\nProduto nao encontrado.\n");
}

// permite aumentar ou diminuir o preco de um produto
void reajustarPreco(struct Produto produtos[], int total) {
    int opcao, codigo, indice;
    float porcentagem;

    if (total == 0) {
        printf("\nNenhum produto cadastrado.\n");
        return;
    }

    while (1) {
        printf("\n===== REAJUSTE DE PRECO =====\n");
        printf("1 - Aumentar preco\n");
        printf("2 - Diminuir preco\n");
        printf("0 - Voltar\n");
        printf("Escolha uma opcao: ");

        if (!lerInt(&opcao))
            return;

        if (opcao == 0)
            return;

        if (opcao == 1 || opcao == 2)
            break;

        printf("\nOpcao invalida!\n");
    }

    printf("Codigo do produto: ");

    if (!lerIntVoltar(&codigo))
        return;

    indice = buscarCodigo(produtos, total, codigo);

    if (indice == -1) {
        printf("\nProduto nao encontrado!\n");
        return;
    }

    printf("Produto: %s\n", produtos[indice].nome);
    printf("Preco atual: R$ %.2f\n", produtos[indice].preco);
    printf("Porcentagem: ");

    if (!lerFloatVoltar(&porcentagem))
        return;

    while (porcentagem < 0 || (opcao == 2 && porcentagem > 100)) {
        printf("Porcentagem invalida! Digite novamente: ");

        if (!lerFloatVoltar(&porcentagem))
            return;
    }

    // faz o calculo de acordo com a opcao escolhida
    if (opcao == 1)
        produtos[indice].preco +=
            produtos[indice].preco * porcentagem / 100;
    else
        produtos[indice].preco -=
            produtos[indice].preco * porcentagem / 100;

    printf("\nPreco atualizado: R$ %.2f\n",
           produtos[indice].preco);

    salvarProdutos(produtos, total);
}

// menu onde ficam as opcoes de cadastro e exclusao
void menuProdutos(struct Produto produtos[], int *total) {
    int opcao;

    while (1) {
        printf("\n===== SOBRE PRODUTOS =====\n");
        printf("1 - Cadastrar produto\n");

        if (*total > 0)
            printf("2 - Excluir produto\n");

        printf("0 - Voltar\n");
        printf("Escolha uma opcao: ");

        if (!lerInt(&opcao))
            return;

        if (opcao == 1) {
            cadastrarProduto(produtos, total);
            return;
        }

        else if (opcao == 2 && *total > 0) {
            excluirProduto(produtos, total);
            return;
        }

        else if (opcao == 0) {
            return;
        }

        else {
            printf("\nOpcao invalida!\n");
        }
    }
}

// aqui comeca o programa e fica o menu principal
int main() {
    struct Produto produtos[MAX_PRODUTOS];

    // recupera os produtos salvos anteriormente
    int totalProdutos = carregarProdutos(produtos);
    int opcao;

    while (1) {
        voltarMenu = 0;

        printf("\n===== SISTEMA DE CADASTRO DE PRODUTOS =====\n");
        printf("1 - Sobre produtos\n");
        printf("2 - Listar produtos / reajustar preco\n");
        printf("3 - Buscar produto\n");
        printf("0 - Sair\n");

        // mantem o menu na tela caso a opcao seja invalida
        while (1) {
            printf("\nEscolha uma opcao: ");

            if (!lerInt(&opcao)) {
                if (voltarMenu) {
                    voltarMenu = 0;
                    break;
                }

                return 0;
            }

            if (opcao >= 0 && opcao <= 3)
                break;

            printf("\nOpcao invalida!\n");
        }

        if (voltarMenu) {
            printf("\nVoltando ao menu principal...\n");
            continue;
        }

        // cada numero chama uma parte diferente do programa
        switch (opcao) {
            case 1:
                menuProdutos(produtos, &totalProdutos);
                break;

            case 2:
                listarProdutos(produtos, totalProdutos);

                if (totalProdutos > 0)
                    reajustarPreco(produtos, totalProdutos);

                break;

            case 3:
                buscarProduto(produtos, totalProdutos);
                break;

            case 0:
                printf("\nEncerrando o sistema...\n");
                return 0;
        }

        // se acabarem as entradas, encerra sem mostrar outro menu
        if (fimEntrada)
            return 0;

        // se uma operacao foi interrompida com 0
        if (voltarMenu) {
            voltarMenu = 0;
            printf("\nVoltando ao menu principal...\n");
        }
    }

    return 0;
}
